from .generate_simple_statements import *

def generate_experiment_main_cpp(mut_uid, ef_uid, cpic, pocc, simulation_time):
    """
    Generates main.cpp for experiment execution.

    IMPORTANT:
    Coupled model headers and coupled model class names are both generated
    using the UNIQUE ID (uid), not the model_name.
    """

    file_name = "main.cpp"
    content = ""

    # includes
    content += "#include <limits>\n"
    content += '#include "cadmium/simulation/root_coordinator.hpp"\n'
    content += '#include "cadmium/simulation/logger/csv.hpp"\n'
    content += '#include "cadmium/modeling/devs/coupled.hpp"\n\n'

    # use UID for header filenames
    content += f'#include "include/{mut_uid}.hpp"\n'
    content += f'#include "include/{ef_uid}.hpp"\n\n'

    content += "using namespace cadmium;\n\n"

    # experiment struct
    content += "struct experiment : public Coupled {\n\n"
    content += '\texperiment(const std::string& id) : Coupled(id) {\n'

    # use UID for coupled class names too
    content += f'\t\tauto mutModel = addComponent<{mut_uid}>("MUT");\n'
    content += f'\t\tauto efModel = addComponent<{ef_uid}>("EF");\n\n'

    # CPIC couplings (EF → MUT)
    for coupling in cpic:
        port_from = coupling["port_from"]
        port_to = coupling["port_to"]
        content += f'\t\taddCoupling(efModel->{port_from}, mutModel->{port_to});\n'

    content += "\n"

    # POCC couplings (MUT → EF)
    for coupling in pocc:
        port_from = coupling["port_from"]
        port_to = coupling["port_to"]
        content += f'\t\taddCoupling(mutModel->{port_from}, efModel->{port_to});\n'

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