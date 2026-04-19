# DEVS-Graph GUI

A graphical tool for the modelling, simulation, validation, and experimentation of Discrete-Event System Specification (DEVS) models.

This system allows users to visually create atomic and coupled DEVS models, generate DEVSMap representations, automatically translate them into Cadmium-compatible C++ code, run simulations, design experiments using a Model Under Test (MUT) and Experimental Frame (EF), and validate simulation outputs using an integrated oracle.

---

## Repository

**Repository:** https://github.com/ucheeaa/DEVS-Graph-GUI

---

# Table of Contents

- [1. Overview](#1-overview)
- [2. Main Features](#2-main-features)
- [3. System Requirements](#3-system-requirements)
- [4. Installation and Setup](#4-installation-and-setup)
- [5. Running the System](#5-running-the-system)
- [6. GUI Overview](#6-gui-overview)
- [7. Standard Modelling and Simulation Workflow](#7-standard-modelling-and-simulation-workflow)
- [8. Experiment Design Workflow](#8-experiment-design-workflow)
- [9. Oracle Validation Workflow](#9-oracle-validation-workflow)
- [10. File Saving, Loading, and Exporting](#10-file-saving-loading-and-exporting)
- [11. Toolbar and Interaction Features](#11-toolbar-and-interaction-features)
- [12. Help Menu and User Manual Access](#12-help-menu-and-user-manual-access)
- [13. Expected Validation State Files](#13-expected-validation-state-files)
- [14. Troubleshooting](#14-troubleshooting)
- [15. Project Structure](#15-project-structure)

---

# 1. Overview

The DEVS-Graph GUI is a low-code modelling environment for DEVS-based systems. It supports the full workflow from graphical model creation to backend simulation and validation.

The tool supports two main workflows:

1. **Standard modelling and simulation workflow**
   - Create atomic and coupled models
   - Generate DEVSMap
   - Generate Cadmium C++ code
   - Run simulation
   - View simulation output

2. **Experiment design workflow**
   - Select a Model Under Test (MUT)
   - Select an Experimental Frame (EF)
   - Define experiment couplings and initial states
   - Generate experiment JSON
   - Run experiment simulation
   - View experiment output

The tool also includes an **oracle validation workflow** for comparing simulation outputs against expected state data.

---

# 2. Main Features

The system supports the following major features:

- Visual creation of atomic models
- Visual creation of coupled models
- Definition of:
  - input ports
  - output ports
  - state variables
  - internal transition functions
  - external transition functions
  - output functions
  - time advance functions
- Coupling of DEVS models
- Automatic generation of DEVSMap JSON
- Automatic generation of Cadmium-compatible C++ code
- Automatic compilation and simulation execution
- Simulation output display in the GUI
- Experiment design using MUT and EF
- Oracle-based validation of simulation output
- XML save/load support
- PNG export support
- Keyboard shortcuts
- Context menu support
- Bottom-panel simulation output display
- About dialog and Help menu access

---

# 3. System Requirements

Before running the project, ensure the following are installed:

- **Git**
- **Python 3.9 or newer**
- **g++ / C++ compiler**
- **A modern web browser**
  - Chrome recommended
  - Edge supported
  - Firefox supported

For oracle validation support, also install:

- **Flask**
- **flask-cors**

---

# 4. Installation and Setup

## 4.1 Clone the Repository

Open a terminal and run:

```bash
git clone https://github.com/ucheeaa/DEVS-Graph-GUI.git
cd DEVS-Graph-GUI
