#include "parse_output.hpp"

#include <iostream>
#include <fstream>
#include <sstream>
#include <regex>
#include <cmath>

std::vector<std::string> not_tested_files;

// ------------------------------------------------------
// loadExpectedDatabase
// ------------------------------------------------------

ExpectedDatabase loadExpectedDatabase(const std::string& path)
{
    ExpectedDatabase db;

    std::ifstream file(path);
    if (!file.is_open()) {
        std::cerr << "ERROR: Cannot open " << path << "\n";
        return db;
    }

    std::string line;
    std::string currentFile;

    std::regex kvPattern(R"((\w+):\s*([A-Za-z0-9_\-\.]+))");

    while (std::getline(file, line))
    {
        if (line.empty()) continue;

        // detect file section
        if (line.find(".csv") != std::string::npos)
        {
            currentFile = line.substr(0, line.find(":"));
            continue;
        }

        std::map<std::string,std::string> state;

        auto begin = std::sregex_iterator(line.begin(), line.end(), kvPattern);
        auto end   = std::sregex_iterator();

        for (auto it = begin; it != end; ++it)
        {
            state[(*it)[1]] = (*it)[2];
        }

        if (!currentFile.empty())
            db[currentFile].push_back(state);
    }

    return db;
}

// ------------------------------------------------------
// parseFile
// ------------------------------------------------------

std::string parseFile(
    const std::string& filename,
    const ExpectedDatabase& expected,
    const SigmaTolerance& sigmaTol
)
{
    std::ifstream file(filename);

    if (!file.is_open()) {
        std::cerr << filename << ": FAILED (cannot open)\n";
        return "FAIL";
    }

    std::string fileOnly =
        filename.substr(filename.find_last_of("/\\") + 1);

    //std::cout << "\nParsing " << fileOnly << "...\n";

    std::vector<ParsedEntry> actualEntries;

    std::regex kvPattern(R"((\w+):\s*([A-Za-z0-9_\-\.]+))");

    std::string line;

    while (std::getline(file, line))
    {
        std::stringstream ss(line);

        std::vector<std::string> tokens;
        std::string token;

        while (std::getline(ss, token, ';'))
            tokens.push_back(token);

        if (tokens.size() < 5) continue;

        const std::string& model = tokens[2];
        const std::string& data  = tokens[4];

        if (data.find("{") == std::string::npos) continue;

        ParsedEntry entry;
        entry.model = model;

        auto begin = std::sregex_iterator(data.begin(), data.end(), kvPattern);
        auto end   = std::sregex_iterator();

        for (auto it = begin; it != end; ++it)
        {
            std::string key = (*it)[1];
            std::string val = (*it)[2];

            if (key == "sigma")
                entry.sigma = val;
            else
                entry.fields[key] = val;
        }

        // remove duplicate consecutive states
        if (!actualEntries.empty())
        {
            const auto& last = actualEntries.back();
            if (last.sigma == entry.sigma &&
                last.fields == entry.fields)
                continue;
        }

        if (fileOnly == "counterOut.csv" && model != "counter_model")
            continue;

        actualEntries.push_back(entry);
    }

    // --------------------------------------------------
    // NOT TESTED
    // --------------------------------------------------

    auto it = expected.find(fileOnly);

    if (it == expected.end())
    {
        std::cerr << fileOnly
                  << ": NOT TESTED (no expected state reference)\n";

        not_tested_files.push_back(fileOnly);
        return "NOT TESTED";
    }

    const auto& expectedStates = it->second;

    // --------------------------------------------------
    // COUNT CHECK
    // --------------------------------------------------

    if (expectedStates.size() != actualEntries.size())
    {
        std::cerr << fileOnly
                  << ": COUNT FAIL — expected "
                  << expectedStates.size()
                  << " states, actual "
                  << actualEntries.size()
                  << " states\n";

        return "FAIL";
    }

    // --------------------------------------------------
    // VALIDATION
    // --------------------------------------------------

    bool matchOK = true;

    for (size_t i = 0; i < expectedStates.size(); ++i)
    {
        const auto& exp = expectedStates[i];
        const auto& act = actualEntries[i];

        const std::string& modelName = act.model;

        for (const auto& [key, expectedVal] : exp)
        {
            // ------------------ SIGMA ------------------
            if (key == "sigma")
            {
                bool sigmaOK = true;

                if (expectedVal == "inf")
                {
                    sigmaOK = sigmaTol.accept_inf;
                }
                else
                {
                    try {
                        double e = std::stod(expectedVal);
                        double a = std::stod(act.sigma);

                        double d = std::abs(a - e);

                        sigmaOK =
                            d <= std::abs(e)*sigmaTol.relative ||
                            d <= sigmaTol.absolute;
                    }
                    catch (...) {
                        sigmaOK = false;
                    }
                }

                if (!sigmaOK)
                {
                    std::cerr << modelName
                              << ": SIGMA FAIL at index " << i
                              << " expected=" << expectedVal
                              << " actual=" << act.sigma
                              << "\n";

                    matchOK = false;
                }
            }

            // ------------------ STATE ------------------
            else
            {
                auto it2 = act.fields.find(key);

                if (it2 == act.fields.end() ||
                    it2->second != expectedVal)
                {
                    std::cerr << modelName
                              << ": STATE FAIL at index " << i
                              << " key=" << key
                              << " expected=" << expectedVal
                              << " actual="
                              << (it2 == act.fields.end() ? "MISSING" : it2->second)
                              << "\n";

                    matchOK = false;
                }
            }
        }
    }

    if (matchOK) {
    std::cout << fileOnly << ": PASS\n";
    return "PASS";
    }
    return "FAIL";
}
