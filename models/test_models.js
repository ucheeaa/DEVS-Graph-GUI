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
            sigma: { dataType: 'double', init_state: 'inf' },
            count: { dataType: 'int', init_state: '0' },
            increment: { dataType: 'int', init_state: '1' },
            countUp: { dataType: 'bool', init_state: 'true' },
          },
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
            sigma: { dataType: 'double', init_state: '3.0' },
            nextInt: { dataType: 'int', init_state: '1' },
          },
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
            sigma: { dataType: 'double', init_state: '13.0' },
            nextBool: { dataType: 'bool', init_state: 'false' },
          },
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


