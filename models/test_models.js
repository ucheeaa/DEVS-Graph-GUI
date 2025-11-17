const generalItems = [
  {
    label: 'State',
    userObject: {
      elementType: "state",
      stateVariables: [
        {
          name: "type",
          type: "string",
          defaultValue: "state"
        },
        {
          name: "custom",
          type: "string",
          defaultValue: "example"
        }
      ]
    },
    width: 75,
    height: 75,
    style: DEFAULT_STYLES.state
  },



  {
    label: 'Counter',
    userObject: {
      elementType: "coupledModel",
    },
    width: 120,
    height: 60,
    style: DEFAULT_STYLES.coupledModel
  },



  {
    label: 'Counter(Atomic)',
    userObject: {
      elementType: "atomicModel",
      stateVariables: [
        {
          name: "Counting Frequency (seconds)",
          type: "int",
          defaultValue: 3
        },
        {
          name: "Initial Count",
          type: "int",
          defaultValue: 0
        },
        {
          name: "Counting Direction",
          type: "dropdown:Up/Down",
          defaultValue: "Up"
        },
        {
          name: "Count Increment",
          type: "int",
          defaultValue: 1
        },
        {
          name: "Minimum Count",
          type: "int",
          defaultValue: 0
        },
        {
          name: "Maximum Count",
          type: "int",
          defaultValue: 100
        }
      ]
    },
    width: 120,
    height: 60,
    style: DEFAULT_STYLES.atomicModel
  },


  {
    label: 'Integer \nGenerator',
    userObject: {
      elementType: "atomicModel",
      stateVariables: [
        {
          name: "Output Frequency",
          type: "double",
          defaultValue: 5.0
        },
        {
          name: "Minimum Value",
          type: "int",
          defaultValue: 0
        },
        {
          name: "Maximum Value",
          type: "int",
          defaultValue: 10
        }
      ]
    },
    width: 120,
    height: 60,
    style: DEFAULT_STYLES.atomicModel
  },


  {
    label: 'Boolean \nGenerator',
    userObject: {
      elementType: "atomicModel",
      stateVariables: [
        {
          name: "Output Frequency",
          type: "double",
          defaultValue: 5.0
        },
        {
          name: "Initial Value",
          type: "bool",
          defaultValue: "true"
        },
        {
          name: "Output Generation",
          type: "dropdown:Random/Alternating",
          defaultValue: "Random"
        }
      ]
    },
    width: 120,
    height: 60,
    style: DEFAULT_STYLES.atomicModel
  },


  {
    label: '',
    userObject: {
      elementType: "atomicModel", // state, atomicModel, coupledModel, experimentalFrame
      stateVariables: [
        {
          name: "Green Duration (seconds)",
          type: "int",
          defaultValue: 10
        },
        {
          name: "Yellow Duration (seconds)",
          type: "int",
          defaultValue: 3
        },
        {
          name: "Red Duration (seconds)",
          type: "int",
          defaultValue: 13
        }
      ]
    },
    width: 80,
    height: 80,
    style: {
      shape: 'image',
      src: './images/traffic_light.png',  // image path stays in style
      fontSize: 16,
    }
  },


];


