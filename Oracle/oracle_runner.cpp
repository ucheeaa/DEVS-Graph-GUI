#include <iostream>
#include <string>
#include "read_logs.hpp"

int main(int argc, char* argv[]) {

    if (argc < 4) {
        std::cerr << "Usage:\n";
        std::cerr << "  oracle_runner <tolerance> <mode> <path>\n";
        std::cerr << "Example:\n";
        std::cerr << "  oracle_runner 0.1 folder simulation_results\n";
        return 1;
    }

    double tolerance = std::stod(argv[1]);
    std::string mode = argv[2];
    std::string path = argv[3];

    run_validation(tolerance, mode, path, std::cout);

    return 0;
}