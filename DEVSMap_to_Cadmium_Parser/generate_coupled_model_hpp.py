# TODO module comments

from .generate_simple_statements import generate_file_definition, cadmium_namespace


def generate_coupled_models(directory_cpp_code, data):
    '''
    Loops through all coupled models and generates the .hpp file for each one.

    Args:
        directory_cpp_code (str):   The output directory to place the .hpp files.
        data (dict):                The DEVSMap json data that has been sorted into a dictionary.
    '''
    number_of_coupled_models = len(data['coupled_models'])
    code = []
    for i in range(number_of_coupled_models):
        coupled_model_name = list(data['coupled_models'][i].keys())[0]
        coupled_model = data['coupled_models'][i][coupled_model_name]
        code.append(generate_coupled_model(directory_cpp_code, coupled_model_name, coupled_model))
    return code



def generate_coupled_model(directory, coupled_model_name, coupled_model):
    '''
    Creates a .hpp file in directory, and generates the C++ code for the coupled model within that file.

    Args:
        directory (str):            The output directory to place the .hpp file.
        coupled_model_name (str):   The name of the coupled model, which will also be the name of the .hpp file.
        coupled_model (dict):       The DEVSMap data of the coupled model to generate the C++ code from.
    '''
    # output_filepath = directory + coupled_model_name + '.hpp'
    # with open(output_filepath, 'w') as file:
    #     file.write(generate_file_definition(coupled_model_name))
    #     file.write(include_cadmium_coupled())
    #     file.write(include_component_models(coupled_model))
    #     file.write(cadmium_namespace())
    #     file.write(generate_coupled_model_struct(coupled_model_name, coupled_model))
    #     file.write('#endif')
    # file.close()  
    file_name = coupled_model_name + ".hpp" # may need to add "include/" at the beginning depending on the implementation
    file_content = generate_file_definition(coupled_model_name)
    file_content += include_cadmium_coupled()
    file_content += include_component_models(coupled_model)
    file_content += cadmium_namespace()
    file_content += generate_coupled_model_struct(coupled_model_name, coupled_model)
    file_content += '#endif'
    return {file_name: file_content}

    
    
def include_cadmium_coupled():
    '''
    Returns the C++ statement to include Cadmium's C++ definition of a coupled model.
    '''
    return '#include "cadmium/modeling/devs/coupled.hpp"\n'


def get_components(coupled_model):
    '''
    Returns the component data of model. This corresponds to all of the atomic models 
    that are directly encapsulated by this coupled model.

    Args:
        coupled_model (dict):   The coupled model that is currently being generated.
    '''
    return coupled_model['components']


def include_component_models(coupled_model):
    '''
    Returns the C++ include statements for all atomic models that are directly encapsulated
    by coupled_model.

    Args:
        coupled_model (dict):   The coupled model that is currently being generated.
    '''
    include_files = get_components(coupled_model)
    include_statements = ""
    for file_name in include_files:
        include_statements += '#include "' + file_name + '.hpp"\n'
    include_statements += '\n'
    return include_statements


def generate_coupled_model_struct(model_name, model):
    '''
    Returns the C++ struct for a coupled model in Cadmium. The struct contains component declarations 
    and internal coupling between the coupled model's atomic models.

    Args:
        model_name (str):   The name of the coupled model being generated.
        model (dict):       The data of the coupled model being generated.
    '''
    constructor = ''
    
    # struct header
    constructor += 'struct ' + model_name + ' : public Coupled {\n\n'
    constructor += '\t' + model_name + '(const std::string& id) : Coupled(id) {\n'

    # addComponent statements
    components = get_components(model)
    component_statements = ''
    for model_name, model_id in components.items():
        component_statements += '\t\tauto ' + model_id + ' = addComponent<' + model_name + '>("' + model_id + '");\n'
    constructor += component_statements + '\n'
        
    #addCoupling statements
    coupling_statements = ''
    for coupling in model['ic']:
        coupling_statements += '\t\taddCoupling(' + coupling['component_from'] + '->' + coupling['port_from'] + ', ' + coupling['component_to'] + '->' + coupling['port_to'] + ');\n'
    constructor += coupling_statements
    
    # close struct
    constructor += '\t}\n};\n\n'
    
    return constructor
