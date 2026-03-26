#ifndef PARSE_OUTPUT_HPP
#define PARSE_OUTPUT_HPP

#include <string>
#include <vector>
#include <map>

// ----------------------------------
// Parsed entry 
// ----------------------------------
struct ParsedEntry {
    std::string model;
    std::string sigma;
    std::map<std::string,std::string> fields;
};

// ----------------------------------
// Sigma tolerance
// ----------------------------------
struct SigmaTolerance {
    double relative;
    double absolute;
    bool accept_inf;
};

// ----------------------------------
// Expected DB (new)
// ----------------------------------
using ExpectedDatabase =
    std::map<std::string,
    std::vector<std::map<std::string,std::string>>>;

// ----------------------------------
// Functions
// ----------------------------------
ExpectedDatabase loadExpectedDatabase(const std::string& path);

std::string parseFile(
    const std::string& filename,
    const ExpectedDatabase& expected,
    const SigmaTolerance& sigmaTol
);

extern std::vector<std::string> not_tested_files;

#endif