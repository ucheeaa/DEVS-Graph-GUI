# DEVS-Graph GUI

A graphical tool for the modelling, simulation, validation, and experimentation of Discrete-Event System Specification (DEVS) models.

This system allows users to visually create atomic and coupled DEVS models, define their behavior, run simulations, design experiments using a Model Under Test (MUT) and Experimental Frame (EF), and validate simulation outputs using an integrated oracle.

## Repository

[DEVS-Graph-GUI](https://github.com/ucheeaa/DEVS-Graph-GUI)

---

## Table of Contents

- [1. Overview](#1-overview)
- [2. Main Features](#2-main-features)
- [3. System Requirements](#3-system-requirements)
- [4. Installation and Setup](#4-installation-and-setup)
- [5. Running the System](#5-running-the-system)
- [6. GUI Overview](#6-gui-overview)
- [7. Standard Modelling and Simulation Workflow](#7-standard-modelling-and-simulation-workflow)
- [8. Experiment Design Workflow](#8-experiment-design-workflow)
- [9. Oracle Validation Workflow](#9-oracle-validation-workflow)
- [10. File Operations](#10-file-operations)
- [11. Interaction Features](#11-interaction-features)
- [12. Help and Documentation](#12-help-and-documentation)
- [13. Troubleshooting](#13-troubleshooting)
- [14. Project Structure](#14-project-structure)

---

## 1. Overview

The DEVS-Graph GUI is a low-code modelling environment for DEVS-based systems.

It supports two main workflows:

### 1. Standard Modelling and Simulation
- Create atomic and coupled models
- Define model properties
- Run simulation
- View simulation output

### 2. Experiment Design Workflow
- Select Model Under Test (MUT)
- Select Experimental Frame (EF)
- Configure experiment
- Run experiment
- View output

The system automatically performs the following in the backend:
- DEVSMap generation
- Cadmium C++ code generation
- Compilation and simulation execution

The user does **not** directly perform these backend generation steps through the GUI. Instead, the user interacts with the graphical interface and triggers simulation or experiment execution, while the backend handles the required processing automatically.

---

## 2. Main Features

- Graphical atomic model creation
- Graphical coupled model creation
- State variable definition
- Internal and external transition function definition
- Output function and time advance function definition
- Drag-and-drop modelling
- Model coupling support
- Standard simulation execution
- Experiment design using MUT and EF
- Oracle-based validation
- XML save/load support
- PNG export support
- Keyboard shortcuts and context menus
- Simulation output panel
- Backend-driven DEVSMap and Cadmium code generation

---

## 3. System Requirements

Ensure the following are installed on your system:

- Git
- Python 3.9 or newer
- A modern web browser (Chrome, Edge, or Firefox recommended)
- A C++ compiler such as `g++`
- Python packages:
  - `flask`
  - `flask-cors`

Install the required Python packages with:

```bash
pip install flask flask-cors

## 4. Installation and Setup

### Clone the Repository

~~~bash
git clone https://github.com/ucheeaa/DEVS-Graph-GUI.git
cd DEVS-Graph-GUI
~~~

### Install Python Dependencies

~~~bash
pip install flask flask-cors
~~~

Verify Python:

~~~bash
python --version
~~~

---

## 5. Running the System

From the root directory:

~~~bash
python start_all.py
~~~

This starts:
- Backend server
- Parser
- Cadmium execution pipeline
- Oracle validation server

Open the GUI:

~~~text
http://localhost:5500/index.html
~~~

---

## 6. GUI Overview

### Left Panel
- Model palette (drag and drop models)

### Canvas
- Workspace for building DEVS models

### Right Panel
- Properties tab (model configuration)
- Experiment tab (experiment setup)

### Bottom Panel
- Simulation logs
- CSV outputs
- Validation results

---

## 7. Standard Modelling and Simulation Workflow

### Step 1: Add Model
- Drag atomic model from palette

### Step 2: Configure Properties
- Name
- Ports
- State variables
- Transition functions
- Output function
- Time advance

### Step 3: Create Coupled Model
- Select models
- Click **Couple Models**

### Step 4: Define Couplings
- Internal (IC)
- External Input (EIC)
- External Output (EOC)

### Step 5: Set Simulation Time
- Default used if not specified

### Step 6: Run Simulation

Click run → backend automatically:
- Generates DEVSMap
- Generates C++ code
- Compiles and runs

### Step 7: View Output
- Displayed in bottom panel

---

## 8. Experiment Design Workflow

### Step 1: Ensure Models Exist
- Models must already be on canvas

### Step 2: Open Experiment Tab

### Step 3: Select MUT
- Model Under Test

### Step 4: Select EF
- Experimental Frame

### Step 5: Configure Initial States

### Step 6: Define Couplings
- CPIC / POCC

### Step 7: Generate Experiment

### Step 8: Run Experiment

### Step 9: View Output

---

## 9. Oracle Validation Workflow

### Install Dependency

~~~bash
pip install flask flask-cors
~~~

### Run System

~~~bash
python start_all.py
~~~

### Steps
1. Run simulation / experiment  
2. Open validation in GUI  
3. Upload CSV output  
4. Set tolerance  
5. Run validation  

### Results
- PASS
- FAIL
- NOT TESTED

---

## 10. File Operations

Supported:
- New graph
- Save XML
- Load XML
- Export PNG
- View outputs

---

## 11. Interaction Features

### Toolbar
- Copy / Paste / Cut
- Undo / Redo
- Delete / Delete All
- Zoom controls

### Right-click Menu
- Model-specific actions

### Shortcuts
- Keyboard supported

---

## 12. Help and Documentation

Click **Help** in GUI:
- About section
- User Manual (Google Docs version)

---

## 13. Troubleshooting

### Flask Error

~~~text
ModuleNotFoundError: No module named 'flask_cors'
~~~

Fix:

~~~bash
pip install flask flask-cors
~~~

---

### GUI Not Loading
- Ensure `start_all.py` is running  
- Check port 5500  
- Disable firewall if needed  

---

### Simulation Not Running
- Check state definitions  
- Verify couplings  
- Ensure simulation time is valid  
