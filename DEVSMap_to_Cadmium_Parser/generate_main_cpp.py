# TODO top of the file comments

from .generate_simple_statements import *


def generate_main_cpp(top_model_name, simulation_time):
    '''
    Creates the main.hpp file in directory, and generates the Cadmium C++ code 
    within that file that will allow for execution of the simulation.

    Args:
        top_model_name (str):   The name of the top model, which is used to start the simulation.
        simulation_time (str):  The number of seconds the simulation will run for.
    '''
    type_of_logger = 'STDOUTLogger'
    #type_of_logger = 'CSVLogger'

    # with open(output_filepath, 'w') as file:
    #     file.write(write_main_cpp_top_of_file_for_simulation(top_model_name))
    #     file.write('extern "C" {\n\n')
    #     file.write('\t int main() {\n')
    #     file.write(initialize_simulated_model(top_model_name))
    #     file.write(initialize_root_coordinator())
    #     file.write(set_logger(type_of_logger))
    #     file.write(run_simulation(simulation_time))
    #     file.write(final_return_statement())
    #     file.write('\t}\n}')
    # file.close()
    file_name = "main.cpp"
    file_content = write_main_cpp_top_of_file_for_simulation(top_model_name)
    file_content += 'extern "C" {\n\n'
    file_content += '\t int main() {\n'
    file_content += initialize_simulated_model(top_model_name)
    file_content += initialize_root_coordinator()
    file_content += set_logger(type_of_logger)
    file_content += run_simulation(simulation_time)
    file_content += final_return_statement()
    file_content += '\t}\n}'
    
    return {file_name: file_content}



def include_loggers():
    '''
    Returns the C++ statement to include Cadmium's STDout and CSV loggers.
    '''
    return '#ifndef NO_LOGGING\n\t#include "cadmium/simulation/logger/stdout.hpp"\n\t#include "cadmium/simulation/logger/csv.hpp"\n#endif\n\n'


def include_root_coordinator():
    '''
    Returns the C++ statement to include Cadmium's simulated-time Root Coordinator.
    '''
    return '#include "cadmium/simulation/root_coordinator.hpp"\n'


def write_main_cpp_top_of_file_for_simulation(top_model_name):
    '''
    Returns the C++ statements common to all main files for simulation.

    Args:
        top_model_name (str):   The name of the top model.
    '''
    return include_root_coordinator() + include_limits() + include_model(top_model_name) + include_loggers() + cadmium_namespace()
    
    
def initialize_simulated_model(top_model_name):
    '''
    Returns the C++ statement to initialize the top model in Cadmium.

    Args:
        top_model_name (str):   The name of the top model.
    '''
    return '\t\tstd::shared_ptr<' + top_model_name + '> model = std::make_shared<' + top_model_name + '>("' + top_model_name + '");\n\n'


def initialize_root_coordinator():
    '''
    Returns the C++ statement to initialize Cadmium's simulated-time Root Coordinator.
    '''
    return '\t\tauto rootCoordinator = cadmium::RootCoordinator(model);\n\n'
    

def set_logger(type_of_logger):
    '''
    Return the C++ code that sets the Cadmium Logger.

    Args:
        type_of_logger (str):   The type of logger being used. Possible values are 
                                'STDOUTLogger' and 'CSVLogger'.  
    '''
    initialization_string = '\t\t#ifndef NO_LOGGING\n'
    
    initialization_string += '\t\t\t'
    if type_of_logger != 'STDOUTLogger':
        initialization_string += '//'
    initialization_string += 'rootCoordinator.setLogger<cadmium::STDOUTLogger>(";");\n'
    
    initialization_string += '\t\t\t'
    if type_of_logger != 'CSVLogger':
        initialization_string += '//' 
    initialization_string += 'rootCoordinator.setLogger<cadmium::CSVLogger>("logfile.csv", ";");\n'
    
    initialization_string += '\t\t#endif\n\n'
    
    return initialization_string


def run_simulation(simulation_time):
    '''
    Return the C++ code for Cadmium that starts the root coordinator, simulates for 
    simulation_time seconds, and stops the root coordinator.

    Args:
        simulation_time (str):   The number of seconds the simulation will run for.
    '''
    simulation_code = '\t\trootCoordinator.start();\n\n'
    simulation_code += '\t\trootCoordinator.simulate(' + simulation_time + ');\n\n'
    simulation_code += '\t\trootCoordinator.stop();\n\n'
    return simulation_code


def final_return_statement():
    '''
    Returns the C++ statement to return 0 in the main function and end the 
    execution of Cadmium.
    '''
    return '\t\treturn 0;\n'


