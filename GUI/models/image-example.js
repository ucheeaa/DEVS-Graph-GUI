const imageExampleItems = [


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