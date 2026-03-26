#include <iostream>
#include <fstream>
#include <filesystem>
#include <string>
#include <optional>
#include <vector>

#include "parse_output.hpp"
#include "read_logs.hpp"

namespace fs = std::filesystem;

// --------------------------------------------------
// find_expected_states_file
// --------------------------------------------------
std::optional<fs::path> find_expected_states_file() {
    const std::vector<fs::path> candidates = {
        fs::current_path() / "expected_DEVS_states.csv",
        fs::current_path() / "oracle" / "expected_DEVS_states.csv"
    };

    for (const auto& p : candidates) {
        if (fs::exists(p)) {
            return p;
        }
    }

    return std::nullopt;
}

// ==================================================
// UPDATED CLI VERSION 
// ==================================================
void read_logs() {

    SigmaTolerance sigmaTol;
    sigmaTol.absolute = 1e-6;
    sigmaTol.accept_inf = true;

    int choice = 0;

    std::cout << "Select sigma fault tolerance:\n";
    std::cout << "1) 0%\n";
    std::cout << "2) 5%\n";
    std::cout << "3) 10%\n";
    std::cout << "4) 20%\n";
    std::cout << "> ";

    std::cin >> choice;

    switch (choice) {
        case 1: sigmaTol.relative = 0.0;  break;
        case 2: sigmaTol.relative = 0.05; break;
        case 3: sigmaTol.relative = 0.10; break;
        case 4: sigmaTol.relative = 0.20; break;
        default:
            std::cerr << "Invalid selection. Defaulting to 10%.\n";
            sigmaTol.relative = 0.10;
            break;
    }

    std::cout << "Using sigma fault tolerance: "
              << (sigmaTol.relative * 100) << "%\n\n";

    // -----------------------------
    // Mode selection
    // -----------------------------
    int mode = 0;

    std::cout << "Select validation mode:\n";
    std::cout << "1) Single file\n";
    std::cout << "2) Folder\n";
    std::cout << "> ";

    std::cin >> mode;

    std::string folderPath;
    std::string singleFilePath;

    if (mode == 1) {
        std::cout << "Enter full path to CSV file:\n> ";
        std::cin >> singleFilePath;
    } else if (mode == 2) {
        std::cout << "Enter folder path:\n> ";
        std::cin >> folderPath;
    } else {
        std::cout << "Invalid selection. Defaulting to folder.\n";
        folderPath = "simulation_results";
        mode = 2;
    }

    // -----------------------------
    // Load expected DB
    // -----------------------------
    auto expectedPath = find_expected_states_file();

    if (!expectedPath) {
        std::cerr << "ERROR: Could not locate expected_states file.\n";
        return;
    }

    std::cout << "Loaded expected states from: "
              << expectedPath->string() << "\n";

    auto expectedDatabase = loadExpectedDatabase(expectedPath->string());

    if (expectedDatabase.empty()) {
        std::cerr << "ERROR: Expected database is empty or missing.\n";
        return;
    }

    try {

        // -----------------------------
        // SINGLE FILE MODE
        // -----------------------------
        if (mode == 1) {

            if (!fs::exists(singleFilePath)) {
                std::cerr << "File not found: "
                          << singleFilePath << std::endl;
                return;
            }

            std::cout << "Parsing "
                      << fs::path(singleFilePath).filename().string()
                      << "...\n";

            std::string result =
                parseFile(singleFilePath, expectedDatabase, sigmaTol);

            std::cout << fs::path(singleFilePath).filename().string()
                      << ": " << result << std::endl;
        }

        // -----------------------------
        // FOLDER MODE
        // -----------------------------
        else {

            if (!fs::exists(folderPath)) {
                std::cerr << "Folder not found: "
                          << folderPath << std::endl;
                return;
            }

            for (const auto& entry : fs::directory_iterator(folderPath)) {

                if (entry.path().extension() == ".csv") {

                    std::string filename = entry.path().string();

                    std::cout << "Parsing "
                              << entry.path().filename().string()
                              << "...\n";

                    std::string result =
                        parseFile(filename, expectedDatabase, sigmaTol);

                    std::cout << entry.path().filename().string()
                              << ": " << result << std::endl;
                }
            }
        }

        // -----------------------------
        // NOT TESTED FILES
        // -----------------------------
        if (!not_tested_files.empty()) {
            std::cout << "\n=====================================\n";
            std::cout << "FILES NOT TESTED (missing expected states)\n";
            std::cout << "=====================================\n";

            for (const auto& f : not_tested_files) {
                std::cout << " - " << f << "\n";
            }

            std::cout << std::endl;
        }

    } catch (const std::exception& e) {
        std::cerr << "Error: " << e.what() << std::endl;
    }
}

// ==================================================
// GUI VERSION (unchanged)
// ==================================================
void read_logs(double relativeTol, std::ostream& out) {

    SigmaTolerance sigmaTol;
    sigmaTol.absolute = 1e-6;
    sigmaTol.accept_inf = true;
    sigmaTol.relative = relativeTol;

    out << "Using sigma fault tolerance: "
        << (sigmaTol.relative * 100) << "%\n\n";

    auto expectedPath = find_expected_states_file();

    if (!expectedPath) {
        out << "ERROR: Could not locate expected_states file.\n";
        return;
    }

    out << "Loaded expected states from: "
        << expectedPath->string() << "\n\n";

    auto expectedDatabase = loadExpectedDatabase(expectedPath->string());

    if (expectedDatabase.empty()) {
        out << "ERROR: Expected database is empty or missing.\n";
        return;
    }

    std::string folderPath = "simulation_results";

    try {
        if (!fs::exists(folderPath)) {
            out << "Folder not found: " << folderPath << "\n";
            return;
        }

        for (const auto& entry : fs::directory_iterator(folderPath)) {
            if (entry.path().extension() == ".csv") {

                std::string filename = entry.path().string();

                out << "Parsing "
                    << entry.path().filename().string()
                    << "...\n";

                std::string result =
                    parseFile(filename, expectedDatabase, sigmaTol);

                out << entry.path().filename().string()
                    << ": " << result << "\n\n";
            }
        }

        if (!not_tested_files.empty()) {
            out << "\n=====================================\n";
            out << "FILES NOT TESTED (missing expected states)\n";
            out << "=====================================\n";

            for (const auto& f : not_tested_files) {
                out << " - " << f << "\n";
            }

            out << "\n";
        }

    } catch (const std::exception& e) {
        out << "Error: " << e.what() << "\n";
    }

    
}
void run_validation(double relativeTol,
                    const std::string& mode,
                    const std::string& path,
                    std::ostream& out) {

    SigmaTolerance sigmaTol;
    sigmaTol.absolute = 1e-6;
    sigmaTol.accept_inf = true;
    sigmaTol.relative = relativeTol;

    out << "Using sigma fault tolerance: "
        << (sigmaTol.relative * 100) << "%\n\n";

    auto expectedPath = find_expected_states_file();

    if (!expectedPath) {
        out << "ERROR: Could not locate expected_states file.\n";
        return;
    }

    out << "Loaded expected states from: "
        << expectedPath->string() << "\n\n";

    auto expectedDatabase = loadExpectedDatabase(expectedPath->string());

    if (expectedDatabase.empty()) {
        out << "ERROR: Expected database is empty or missing.\n";
        return;
    }

    try {

        // -----------------------------
        // SINGLE FILE
        // -----------------------------
        if (mode == "file") {

            if (!fs::exists(path)) {
                out << "File not found: " << path << "\n";
                return;
            }

            out << "Parsing "
                << fs::path(path).filename().string()
                << "...\n";

            std::string result =
                parseFile(path, expectedDatabase, sigmaTol);

            out << fs::path(path).filename().string()
                << ": " << result << "\n";
        }

        // -----------------------------
        // FOLDER
        // -----------------------------
        else if (mode == "folder") {

            if (!fs::exists(path)) {
                out << "Folder not found: " << path << "\n";
                return;
            }

            for (const auto& entry : fs::directory_iterator(path)) {

                if (entry.path().extension() == ".csv") {

                    std::string filename = entry.path().string();

                    out << "Parsing "
                        << entry.path().filename().string()
                        << "...\n";

                    std::string result =
                        parseFile(filename, expectedDatabase, sigmaTol);

                    out << entry.path().filename().string()
                        << ": " << result << "\n\n";
                }
            }
        }

        else {
            out << "Invalid mode. Use 'file' or 'folder'\n";
            return;
        }

        if (!not_tested_files.empty()) {
            out << "\n=====================================\n";
            out << "FILES NOT TESTED (missing expected states)\n";
            out << "=====================================\n";

            for (const auto& f : not_tested_files) {
                out << " - " << f << "\n";
            }

            out << "\n";
        }

    } catch (const std::exception& e) {
        out << "Error: " << e.what() << "\n";
    }
}