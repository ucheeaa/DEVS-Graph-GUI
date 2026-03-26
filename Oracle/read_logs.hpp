#ifndef READ_LOGS_HPP
#define READ_LOGS_HPP

#include <ostream>

void read_logs();

// GUI version
void read_logs(double relativeTol, std::ostream& out);
void run_validation(double tolerance,
                    const std::string& mode,
                    const std::string& path,
                    std::ostream& out);
#endif