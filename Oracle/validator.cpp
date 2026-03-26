#include "validator.hpp"
#include <fstream>
#include <regex>
#include <string>
#include <iostream>

bool validateCsvFormat(const std::string& filename) {
    std::ifstream file(filename);
    if (!file.is_open()) return false;

    std::string line;

    // strict {sigma: X,state: Y} format
    std::regex fullFormat(
        R"(\{sigma:\s*(inf|[0-9]+(\.[0-9]+)?)\s*,state:\s*[A-Z_]+\})"
    );

    while (std::getline(file, line)) {
        // only validate lines that SHOULD contain this object
        if (line.find("Stabalize") != std::string::npos &&
            line.find("state:")    != std::string::npos)
        {
            if (!std::regex_search(line, fullFormat)) {
                return false;   
            }
        }
    }

    return true; 
}
