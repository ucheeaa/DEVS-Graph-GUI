import json
import subprocess
import re


def build_cadmium(code):
    print("BUILD_CADMIUM(CODE):")
    dict = json.loads(code)
    print("TYPE = " + str(type(dict)))
    print(dict)

    code_directory = "./Cadmium_Builder/cadmium_project/main/"

    for key, value in dict.items():
        if key == "main.cpp":
            file_name = key
        else:
            file_name = "include/" + key

        # Open the file in write mode and write some text
        with open(code_directory + file_name, "w") as file:
            file.write(value)

    command = "source build_sim.sh && ./bin/Executable1"  # 'env' lists environment variables

    result = subprocess.run(command, cwd="./Cadmium_Builder/cadmium_project", shell=True, capture_output=True, text=True, executable="/bin/bash")

    output = result.stdout

    # remove colours from the output
    regex = re.compile(r'\x1B\[[0-?]*[ -/]*[@-~]')
    output = regex.sub('', output)

    # # remove the output lines related to compilation and building
    prefixes = ["--", "[", "Compilation"]
    output = "\n".join(
        line for line in output.splitlines()
        if not any(line.startswith(p) for p in prefixes)
    )
    
    print("Output:\n", output)
    print("Errors:\n", result.stderr)

    return "sep=;\n" + output

