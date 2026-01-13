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



  // {
  //   label: 'Counter',
  //   userObject: {
  //     elementType: "coupledModel",
  //   },
  //   width: 120,
  //   height: 60,
  //   style: DEFAULT_STYLES.coupledModel
  // },


  {
    label: 'counter_system',
    userObject: {
      elementType: 'coupledModel',
      model_name: 'counter_system',
      unique_id: 'counter_system',
      json: {
        model: {
          x: {},
          y: {
            count: 'int'
          },
          components: {},
          eic: [],
          eoc: [
            {
              port_from: 'count_out',
              port_to: 'count',
              component_from: 'counter_model'
            }
          ],
          ic: [
            {
              port_from: 'bool_out',
              port_to: 'direction_in',
              component_to: 'counter_model',
              component_from: 'direction_generator'
            },
            {
              port_from: 'int_out',
              port_to: 'increment_in',
              component_to: 'counter_model',
              component_from: 'increment_generator'
            }
          ]
        },
        include_sets: ["default_sets.json"],
      },
    },
    width: 120,
    height: 60,
    style: DEFAULT_STYLES.coupledModel
  },


  {
    label: 'Counter_Model : Counter',
    userObject: {
      elementType: 'atomicModel',
      model_name: 'Counter',
      unique_id: 'Counter_Model',
      json: {
        model: {
          x: {
            increment_in: 'int',
            direction_in: 'bool'
          },
          y: {
            count_out: 'int'
          },
          s: {
            sigma: { data_type: 'double', init_state: 'inf' },
            count: { data_type: 'int', init_state: '0' },
            increment: { data_type: 'int', init_state: '1' },
            countUp: { data_type: 'bool', init_state: 'true' },
          },
          delta_int: {
            "countUp == true": {
              "count": "count + increment",
              "sigma": "inf"
            },
            "countUp == false": {
              "count": "count - increment",
              "sigma": "inf"
            },
            "otherwise": {}
          },
          delta_ext: {
            "increment_in.bagSize() != 0 && direction_in.bagSize() == 0": {
              "increment": "increment_in.bag(-1)",
              "sigma": "0.1"
            },
            "direction_in.bagSize() != 0 && increment_in.bagSize() == 0": {
              "countUp": "direction_in.bag(-1)",
              "sigma": "0.1"
            },
            "otherwise": {
              "increment": "increment_in.bag(-1)",
              "countUp": "direction_in.bag(-1)",
              "sigma": "0.1"
            }
          },
          delta_con: {},
          lambda: {
            "otherwise": {
              "count_out": "count"
            }
          },
          ta: { "otherwise": "sigma" }
        },
        include_sets: ["default_sets.json"],
        parameters: {}
      },
    },
    width: 120,
    height: 60,
    style: DEFAULT_STYLES.atomicModel
  },


  {
    label: 'Increment_Generator : Integer_Generator',
    userObject: {
      elementType: 'atomicModel',
      model_name: 'Integer_Generator',
      unique_id: 'Increment_Generator',
      json: {
        model: {
          x: {},
          y: {
            int_out: 'int',
          },
          s: {
            sigma: { data_type: 'double', init_state: '3.0' },
            nextInt: { data_type: 'int', init_state: '1' },
          },
          delta_int: {
            "otherwise": {
              "nextInt": "rand() % 5 + 1"
            }
          },
          delta_ext: {
            "otherwise": {}
          },
          delta_con: {},
          lambda: {
            "otherwise": {
              "int_out": "nextInt"
            }
          },
          ta: {
            "otherwise": "sigma"
          }
        },
        include_sets: ["default_sets.json"],
        parameters: {}
      },
    },
    width: 120,
    height: 60,
    style: DEFAULT_STYLES.atomicModel
  },


  {
    label: 'Direction_Generator : Boolean_Generator',
    userObject: {
      elementType: 'atomicModel',
      model_name: 'Boolean_Generator',
      unique_id: 'Direction_Generator',
      json: {
        model: {
          x: {},
          y: {
            bool_out: 'bool',
          },
          s: {
            sigma: { data_type: 'double', init_state: '13.0' },
            nextBool: { data_type: 'bool', init_state: 'false' },
          },
          delta_int: {
            "otherwise": {
              "nextBool": "!nextBool"
            }
          },
          delta_ext: { "otherwise": {} },
          delta_con: {},
          lambda: {
            "otherwise": {
              "bool_out": "nextBool"
            }
          },
          ta: { "otherwise": "sigma" }
        },
        include_sets: ["default_sets.json"],
        parameters: {}
      },
    },
    width: 120,
    height: 60,
    style: DEFAULT_STYLES.atomicModel
  },


  {
    label: 'testAtomic',
    userObject: {
      elementType: 'atomicModel',
      model_name: 'name',
      unique_id: 'id',
      json: {
        model: {
          x: {},
          y: {},
          s: {},
          delta_int: {},
          delta_ext: {},
          delta_con: {},
          lambda: {},
          ta: {}
        },
        include_sets: ["default_sets.json"],
        parameters: {}
      },
    },
    width: 120,
    height: 60,
    style: DEFAULT_STYLES.atomicModel
  },


  {
    label: 'testCoupled',
    userObject: {
      elementType: 'coupledModel',
      model_name: 'name',
      unique_id: 'id',
      json: {
        model: {
          x: {},
          y: {},
          components: {},
          eic: [],
          eoc: [],
          ic: []
        },
        include_sets: ["default_sets.json"],
      },
    },
    width: 120,
    height: 60,
    style: DEFAULT_STYLES.coupledModel
  },


  {
    label: '',
    userObject: {
      elementType: 'atomicModel', // state, atomicModel, coupledModel, experimentalFrame
      stateVariables: [
        {
          name: 'Green Duration (seconds)',
          type: 'int',
          defaultValue: 10
        },
        {
          name: 'Yellow Duration (seconds)',
          type: 'int',
          defaultValue: 3
        },
        {
          name: 'Red Duration (seconds)',
          type: 'int',
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


