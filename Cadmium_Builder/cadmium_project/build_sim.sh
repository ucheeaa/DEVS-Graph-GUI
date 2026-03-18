#!/usr/bin/env bash
set -e #if any command fails, the script will exit immediately

if [ -d "build" ]; then rm -Rf build; fi
mkdir -p build
cd build || exit 1
rm -rf *
cmake ..
make
cd ..
echo "Compilation done. Executable in the bin folder"