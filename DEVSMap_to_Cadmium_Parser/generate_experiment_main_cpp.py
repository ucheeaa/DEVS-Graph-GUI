from .generate_simple_statements import *

def generate_experiment_main_cpp(mut_model_name, ef_model_name, cpic, pocc, simulation_time):
    """
    Generates main.cpp for experiment execution.
    """

    file_name = "main.cpp"

    content = ""

    # includes
    content += "#include <limits>\n"
    content += '#include "cadmium/simulation/root_coordinator.hpp"\n'
    content += '#include "cadmium/simulation/logger/csv.hpp"\n'
    content += '#include "cadmium/modeling/devs/coupled.hpp"\n\n'

    content += f'#include "include/{mut_model_name}.hpp"\n'
    content += f'#include "include/{ef_model_name}.hpp"\n\n'

    content += "using namespace cadmium;\n\n"

    # experiment struct
    content += "struct experiment : public Coupled {\n\n"

    content += '\texperiment(const std::string& id) : Coupled(id) {\n'

    content += f'\t\tauto mut = addComponent<{mut_model_name}>("MUT");\n'
    content += f'\t\tauto ef = addComponent<{ef_model_name}>("EF");\n\n'

    # CPIC couplings (EF → MUT)
    for coupling in cpic:
        port_from = coupling["port_from"]
        port_to = coupling["port_to"]

        content += f'\t\taddCoupling(ef->{port_from}, mut->{port_to});\n'

    content += "\n"

    # POCC couplings (MUT → EF)
    for coupling in pocc:
        port_from = coupling["port_from"]
        port_to = coupling["port_to"]

        content += f'\t\taddCoupling(mut->{port_from}, ef->{port_to});\n'

    content += "\t}\n"
    content += "};\n\n"

    # main
    content += "int main() {\n\n"

    content += '\tauto model = std::make_shared<experiment>("model");\n\n'

    content += "\tauto rootCoordinator = cadmium::RootCoordinator(model);\n"
    content += '\trootCoordinator.setLogger<CSVLogger>("experiment_log.csv", ";");\n\n'

    content += "\trootCoordinator.start();\n"
    content += f"\trootCoordinator.simulate({float(simulation_time):.1f});\n"
    content += "\trootCoordinator.stop();\n\n"

    content += "\treturn 0;\n"
    content += "}\n"

    return {file_name: content}