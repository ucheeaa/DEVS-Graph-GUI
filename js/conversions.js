export class ConversionManager {


    constructor(graph) {
        this.graph = graph;
    }


    // For previewing the JSON in the console
    getGraphXML() {
        const encoder = new mxCodec();
        const node = encoder.encode(this.graph.getModel());
        const xml = mxUtils.getPrettyXml(node);
        return xml;
    }


    previewGraphXML() {
        console.log(this.getGraphXML());
    }


    saveGraphXML() {
        // application/octet-stream prevents XML preview in some browsers
        const blob = new Blob([this.getGraphXML()], { type: 'application/octet-stream' });

        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = "graph.xml"; // default filename
        link.click();

        URL.revokeObjectURL(link.href);
    }


    loadGraphXML() {
        // Prompt user to select file
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.xml'; // restrict to XML files

        // Listen for the file selection
        input.addEventListener('change', (event) => {
            const file = event.target.files[0];
            if (!file) return;

            // Read XML file as a text file
            const reader = new FileReader();
            reader.onload = (e) => {
                const xmlText = e.target.result;

                try {
                    // Parse XML to the DOM
                    const parser = new DOMParser();
                    const xmlDoc = parser.parseFromString(xmlText, 'text/xml');

                    // Convert to mxGraph model
                    const decoder = new mxCodec(xmlDoc);
                    this.graph.getModel().beginUpdate();
                    try {
                        decoder.decode(xmlDoc.documentElement, this.graph.getModel());
                    } finally {
                        this.graph.getModel().endUpdate(); // triggers redraw
                    }

                    console.log('Graph loaded successfully.');
                } catch (err) {
                    console.error('Failed to load graph: ', err);
                }
            };
            reader.readAsText(file);
        });
        input.click();
    }


    getUserObjects() {
        // Encode graph to XML
        const encoder = new mxCodec();
        const node = encoder.encode(this.graph.getModel());
        const xmlText = mxUtils.getPrettyXml(node);

        // Parse XML
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(xmlText, "text/xml");

        // Recursive XML → JS converter
        function parseXmlNode(xmlNode) {
            if (!xmlNode) return null;

            if (xmlNode.tagName === "Object") {
                const obj = {};

                // Copy attributes in order
                for (let i = 0; i < xmlNode.attributes.length; i++) {
                    const attr = xmlNode.attributes[i];
                    if (attr.name !== "as") obj[attr.name] = attr.value;
                }

                // Add children in order
                for (let i = 0; i < xmlNode.children.length; i++) {
                    const child = xmlNode.children[i];
                    const key = child.getAttribute("as") || child.tagName;
                    const value = parseXmlNode(child);
                    obj[key] = value; // no array needed since no duplicate keys
                }

                return obj;
            }

            if (xmlNode.tagName === "Array") {
                const arr = [];
                for (let i = 0; i < xmlNode.children.length; i++) {
                    const child = xmlNode.children[i];
                    if (child.tagName === "add") {
                        arr.push(child.getAttribute("value"));
                    } else {
                        arr.push(parseXmlNode(child));
                    }
                }
                return arr;
            }

            if (xmlNode.tagName === "add") {
                return xmlNode.getAttribute("value");
            }

            return null;
        }

        // Find all userObjects
        const userObjectNodes = xmlDoc.querySelectorAll('Object[as="userObject"]');
        const userObjects = Array.from(userObjectNodes).map(node => parseXmlNode(node));

        // Return plain JS objects
        return userObjects;
    }


    previewUserObjects() {
        const userObjects = this.getUserObjects();

        console.log(JSON.stringify(userObjects, null, 2));
    }


    getTopModel() {
        const model = this.graph.getModel();
        const root = model.getRoot();
        const topLevelCoupled = [];

        // Recursive function to traverse the graph
        function traverse(cell) {
            if (!cell) return;

            // Check if the cell is a coupled model
            if (cell.isCoupledModel()) {
                // Only add if parent is not a coupled model
                if (!cell.parent || !cell.parent.isCoupledModel()) {
                    topLevelCoupled.push(cell);
                }
            }

            // Recurse on children
            const childCount = model.getChildCount(cell);
            for (let i = 0; i < childCount; i++) {
                traverse(model.getChildAt(cell, i));
            }
        }

        traverse(root);

        if (topLevelCoupled.length === 0) {
            console.error("No top-level coupled model found.");
            return undefined;
        } else if (topLevelCoupled.length > 1) {
            console.error(
                `Multiple top-level coupled models found: ${topLevelCoupled
                    .map(c => c.userObject?.unique_id)
                    .join(", ")}`
            );
            return undefined;
        }

        // Exactly one top model → return its unique_id
        return topLevelCoupled[0].userObject?.unique_id;
    }



    getSimulationTime() {
        let inputValue = parseFloat(document.getElementById("previewNumberInput").value);
        if (isNaN(inputValue)) {
            console.log("Number input is empty or invalid.");
            inputValue = 50.0; // Use 50 as default during development if not invalid/unspecified
        }
        // console.log("Generating DEVSMap with simulation time:", inputValue);

        return inputValue;
    }


    previewDEVSMap() {
        // Get required values for generating DEVSMap
        let time_span = this.getSimulationTime();
        console.log("time_span = " + time_span);

        let top_model_id = this.getTopModel();
        console.log("top_model_id = " + top_model_id);

        // Additional values may need to be added/obtained here as the functionality is extended

        // Then we will process the JSON to convert it to legal DEVSMap
        const userObjects = this.getUserObjects();

        let DEVSMap = {};

        DEVSMap[top_model_id + '_experiment.json'] = {
            'model_under_test': {
                'model': top_model_id + '_coupled.json',
                'initial_state': top_model_id + '_init_state.json',
                'parameters': ''
            },
            'experimental_frame': {},
            'cpic': {},
            'pocc': {},
            'time_span': time_span
        }


        // TODO a function here to build up the entire hierarchy based on the graph


        DEVSMap[top_model_id + '_init_state.json'] = {
            'init_states': {
                top_model_id: {}
            }
        }


        for (let i = 0; i < userObjects.length; i++) {
            if (userObjects[i].elementType === "atomicModel") {
                console.log("atomic");

                let modelName = userObjects[i].model_name.toLowerCase();

                // Values for model_atomic.json
                DEVSMap[modelName + '_atomic.json'] = {
                    ['' + modelName]: userObjects[i].json.model,
                    'include_sets': [userObjects[i].include_sets],
                    'parameters': userObjects[i].parameters
                }

                // console.log(DEVSMap[modelName + '_atomic.json']);

                // iterate through state variables
                Object.entries(DEVSMap[modelName + '_atomic.json'][modelName]['s']).forEach(([key, value]) => {
                    console.log(key, value);

                    // TODO Store data for init_state file
                    console.log(modelName);
                    console.log(key);
                    console.log(value['init_state']);

                    // Then update the format to match DEVSMap {name: type}
                    DEVSMap[modelName + '_atomic.json'][modelName]['s'][key] = value['data_type'];

                });

                // Update s values from {name: {data_type: type, init_state: value}}


                // Values for init_states.json

            } else if (userObjects[i].elementType === "coupledModel") {
                console.log("coupled");

                let coupledModelName = userObjects[i].model_name.toLowerCase();

                DEVSMap[coupledModelName + '_coupled.json'] = {
                    ['' + coupledModelName]: userObjects[i].json.model,
                    'include_sets': [userObjects[i].include_sets],
                };


                

            } else {
                console.log("Invalid elementType: " + userObjects[i].elementType);
            }





            console.log(userObjects[i]);
        }


        console.log(DEVSMap);
    }








    previewCadmiumCode() {
        alert("Preview Cadmium Code: Not implemented yet");
    }

    previewTrace() {
        alert("Preview Trace: Not implemented yet");
    }


}