const aviationItems = [


    {
        label: 'handle_waypoint_1 : handle_waypoint',
        userObject: {
            elementType: 'atomicModel',
            model_name: 'handle_waypoint',
            unique_id: 'handle_waypoint_1',
            json: {
                model: {
                    x: {
                        i_pilot_takeover: 'bool',
                        i_start_mission: 'int',
                        i_waypoint: 'string'
                    },
                    y: {
                        o_fcc_waypoint_update: 'string',
                    },
                    s: {
                        sigma: { data_type: "double", init_state: "inf" },
                        current_state: { data_type: "string", init_state: '"IDLE"' },
                    },
                    delta_int: {
                        'current_state == "UPDATE_FCC"': {
                            "current_state": '"WAIT_FOR_WAYPOINT"',
                            "sigma": "inf"
                        },
                        "otherwise": {}
                    },
                    delta_ext: { "otherwise": {} },
                    delta_con: {},
                    lambda: {
                        "otherwise": {
                            "colour_out": "colour"
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


];