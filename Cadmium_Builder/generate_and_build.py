import json
import subprocess
import re
import os
import platform

def build_cadmium(code):
    """
    Build and run the Cadmium simulation.
    Works on Windows (via WSL), Linux, and macOS.
    """

    # Parse JSON input
    files_dict = json.loads(code)
    print("TYPE =", type(files_dict))
    print(files_dict)

    # Base directories
    BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "cadmium_project"))
    main_dir = os.path.join(BASE_DIR, "main")

    # Write all C++ files
    for key, value in files_dict.items():
        if key == "main.cpp":
            file_path = os.path.join(main_dir, key)
        else:
            file_path = os.path.join(main_dir, "include", key)

        os.makedirs(os.path.dirname(file_path), exist_ok=True)
        with open(file_path, "w") as f:
            f.write(value)

    # Build and run commands
    build_cmd = "source build_sim.sh"
    run_cmd = "./bin/Executable1"

    system = platform.system()

    if system == "Windows":
        # Run via WSL
        full_cmd = f"{build_cmd} && {run_cmd}"
        result = subprocess.run(
            ["wsl", "bash", "-c", full_cmd],
            cwd=BASE_DIR,
            capture_output=True,
            text=True
        )
    else:
        # Linux / macOS
        full_cmd = f"{build_cmd} && {run_cmd}"
        result = subprocess.run(
            full_cmd,
            cwd=BASE_DIR,
            shell=True,
            capture_output=True,
            text=True
        )

    # Clean output
    output = result.stdout
    errors = result.stderr

    regex = re.compile(r'\x1B\[[0-?]*[ -/]*[@-~]')
    output = regex.sub('', output)

    prefixes = ["--", "[", "Compilation"]
    output = "\n".join(
        line for line in output.splitlines()
        if not any(line.startswith(p) for p in prefixes)
    )

    # Log
    print("Output:\n", output)
    print("Errors:\n", errors)

    return "sep=;\n" + output