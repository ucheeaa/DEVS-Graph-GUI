
# DEVS-Graph GUI

A graphical tool for the modelling, simulation, validation, and experimentation of Discrete-Event System Specification (DEVS) models.

---

## Repository

https://github.com/ucheeaa/DEVS-Graph-GUI

---

## Table of Contents

1. Overview  
2. Main Features  
3. System Requirements  
4. Installation and Setup  
5. Running the System  
6. GUI Overview  
7. Standard Modelling Workflow  
8. Experiment Workflow  
9. Oracle Validation  
10. File Operations  
11. Interaction Features  
12. Help  
13. Troubleshooting  

---

## 1. Overview

The DEVS-Graph GUI is a low-code modelling environment.

You can:

- Create atomic models  
- Create coupled models  
- Define behaviour  
- Run simulations  
- Design experiments (MUT + EF)  
- Validate results  

Important:

All DEVSMap generation, C++ generation, and execution happen **in the backend automatically**.  
The user only interacts with the GUI.

---

## 2. Main Features

- Drag-and-drop modelling  
- Atomic and coupled model creation  
- State and transition definition  
- Simulation execution  
- Experiment design (MUT + EF)  
- Oracle validation  
- XML save/load  
- PNG export  
- Output panel  

---

## 3. System Requirements

Install:

- Git  
- Python 3.9+  
- Browser (Chrome recommended)  
- g++ (C++ compiler)

Install dependencies:

pip install flask flask-cors

---

## 4. Installation and Setup

Clone repo:

git clone https://github.com/ucheeaa/DEVS-Graph-GUI.git
cd DEVS-Graph-GUI

Create your own branch:

git checkout -b your_name_branch

---

## 5. Running the System

Run:

python start_all.py

Open:

http://localhost:5500/index.html

---

## 6. GUI Overview

Left Panel:
- Model palette

Canvas:
- Build models

Right Panel:
- Properties tab
- Experiment tab

Bottom Panel:
- Logs
- CSV output
- Validation

---

## 7. Standard Modelling Workflow

1. Drag atomic model  
2. Configure:
   - Name  
   - Ports  
   - State variables  
   - Transitions  
   - Output  
   - Time advance  

3. Create coupled model  
4. Define couplings  
5. Run simulation  

Backend automatically:
- Generates DEVSMap  
- Generates C++  
- Compiles and runs  

6. View output in bottom panel  

---

## 8. Experiment Workflow

1. Ensure models exist  
2. Open Experiment tab  
3. Select MUT  
4. Select EF  
5. Set initial states  
6. Define CPIC / POCC  
7. Run experiment  
8. View output  

---

## 9. Oracle Validation

Install:

pip install flask flask-cors

Steps:

1. Run simulation  
2. Upload CSV  
3. Set tolerance  
4. Run validation  

Results:
- PASS  
- FAIL  
- NOT TESTED  

---

## 10. File Operations

- New graph  
- Save XML  
- Load XML  
- Export PNG  

---

## 11. Interaction Features

Toolbar:
- Copy / Paste  
- Undo / Redo  
- Delete  
- Zoom  

Right-click:
- Model actions  

---

## 12. Help

Inside GUI → Help button:

- About  
- User Manual  

---

## 13. Troubleshooting

Flask error:

ModuleNotFoundError: No module named ‘flask_cors’

Fix:

pip install flask flask-cors

---

Common Issues:

- Ensure model name is filled  
- Use different model name and ID  
- Fill all required fields  
- Ensure couplings are valid  
- Ensure simulation time is numeric  

---

Tips:

- Use descriptive names  
- Follow example models (e.g., counter / step counter)  
- Check output panel after running  
- You can also inspect outputs from your branch/files  

---
