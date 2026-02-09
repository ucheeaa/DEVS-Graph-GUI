import json
import subprocess
import re
import platform
from pathlib import Path


def build_cadmium(code):
    """
    Build and run the Cadmium simulation.
    Works on Windows (via WSL), Linux, and macOS.
    """

    files_dict = json.loads(code)

    BASE_DIR = Path(__file__).resolve().parent / "cadmium_project"
    main_dir = BASE_DIR / "main"
    include_dir = main_dir / "include"

    print("BASE_DIR =", BASE_DIR)
    print("main_dir =", main_dir)
    print("include_dir =", include_dir)

    # -----------------------------
    # CLEAN OLD FILES
    # -----------------------------

    # Delete main.cpp
    main_cpp = main_dir / "main.cpp"
    if main_cpp.exists():
        print("Deleting:", main_cpp)
        main_cpp.unlink()
    else:
        print("main.cpp not found")

    # Delete all .hpp files inside main/include recursively
    if include_dir.exists():
        for file in include_dir.rglob("*.hpp"):
            try:
                print("Deleting:", file)
                file.unlink()
            except Exception as e:
                print("Failed to delete:", file, e)
    else:
        print("include_dir does not exist")

    # -----------------------------
    # WRITE NEW FILES
    # -----------------------------
    for key, value in files_dict.items():
        if key == "main.cpp":
            file_path = main_dir / key
        else:
            file_path = include_dir / key

        file_path.parent.mkdir(parents=True, exist_ok=True)

        with open(file_path, "w", encoding="utf-8") as f:
            f.write(value)

        print("Wrote file:", file_path)

    # -----------------------------
    # Build and run commands
    # -----------------------------
    build_cmd = "source build_sim.sh"
    run_cmd = "./bin/Executable1"
    full_cmd = f"{build_cmd} && {run_cmd}"

    system = platform.system()

    if system == "Windows":
        result = subprocess.run(
            ["wsl", "bash", "-c", full_cmd],
            cwd=BASE_DIR,
            capture_output=True,
            text=True
        )
    else:
        result = subprocess.run(
            full_cmd,
            cwd=BASE_DIR,
            shell=True,
            capture_output=True,
            text=True
        )

    output = result.stdout
    errors = result.stderr

    # -----------------------------
    # Clean output
    # -----------------------------
    regex = re.compile(r'\x1B\[[0-?]*[ -/]*[@-~]')
    output = regex.sub('', output)

    prefixes = ["--", "[", "Compilation"]
    output = "\n".join(
        line for line in output.splitlines()
        if not any(line.startswith(p) for p in prefixes)
    )

    print("Output:\n", output)
    print("Errors:\n", errors)

    return "sep=;\n" + output
