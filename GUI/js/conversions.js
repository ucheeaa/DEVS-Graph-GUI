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


    getInitStates() {
        const topModelId = this.getTopModel();
        const userObjects = this.getUserObjects();

        const result = {};
        result[topModelId.toLowerCase()] = {};

        // 1. Find top level coupled model
        const topModelObj = userObjects.find(
            u => u.elementType === "coupledModel" &&
                u.unique_id === topModelId
        );

        if (!topModelObj) {
            console.error("Top model not found:", topModelId);
            return result;
        }

        const componentsMap = topModelObj.json.model.components;
        // componentsMap = { "Counter": "Counter_Model", ... }

        // 2. Iterate each component
        for (const [modelName, uniqueId] of Object.entries(componentsMap)) {

            // Find corresponding atomic model by unique_id
            const atomic = userObjects.find(
                u => u.elementType === "atomicModel" && u.unique_id === uniqueId
            );

            if (!atomic) {
                console.warn("No atomic model found for unique_id:", uniqueId);
                continue;
            }

            const stateVars = atomic.json.model.s; // contains sigma, count, etc.

            // Build cleaned state dict
            const cleanedState = {};
            for (const [stateName, stateObj] of Object.entries(stateVars)) {
                cleanedState[stateName] = stateObj.init_state;
            }

            // Add to result under the unique_id (lowercased)
            result[topModelId.toLowerCase()][uniqueId.toLowerCase()] = cleanedState;
        }

        return result;
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


    getDEVSMap() {
        // Get required values for generating DEVSMap
        let time_span = this.getSimulationTime();
        console.log("time_span = " + time_span);

        let top_model_id = this.getTopModel();
        console.log("top_model_id = " + top_model_id);

        // Additional values may need to be added/obtained here as the functionality is extended

        // Then we will process the JSON to convert it to legal DEVSMap
        const userObjects = this.getUserObjects();

        let DEVSMap = {};

        // Create a simple experiment.json (no experimental frames yet)
        DEVSMap[top_model_id + '_experiment.json'] = {
            'model_under_test': {
                'model': top_model_id + '_coupled.json',
                'initial_state': top_model_id + '_init_state.json',
                'parameters': ''
            },
            'experimental_frame': {},
            'cpic': {},
            'pocc': {},
            'time_span': String(time_span)
        }

        // Create init_states.json
        DEVSMap[top_model_id + '_init_state.json'] = {
            'init_states': this.getInitStates()
        }

        // Create all of the XYZ_atomic.json
        for (let i = 0; i < userObjects.length; i++) {
            if (userObjects[i].elementType === "atomicModel") {
                console.log("atomic");

                let modelName = userObjects[i].model_name.toLowerCase();

                DEVSMap[modelName + '_atomic.json'] = {
                    ['' + modelName]: userObjects[i].json.model,
                    'include_sets': [userObjects[i].include_sets],
                    'parameters': userObjects[i].parameters
                }

                // iterate through state variables
                Object.entries(DEVSMap[modelName + '_atomic.json'][modelName]['s']).forEach(([key, value]) => {

                    // Then update the format to match DEVSMap {name: type}
                    DEVSMap[modelName + '_atomic.json'][modelName]['s'][key] = value['data_type'];

                });

                // include sets
                DEVSMap[modelName + '_atomic.json']['include_sets'] = userObjects[i].json.include_sets;

                // parameters
                DEVSMap[modelName + '_atomic.json']['parameters'] = userObjects[i].json.parameters;


            } else if (userObjects[i].elementType === "coupledModel") {
                console.log("coupled");

                // Create all of the XYZ_coupled.json
                let coupledModelName = userObjects[i].model_name.toLowerCase();

                DEVSMap[coupledModelName + '_coupled.json'] = {
                    ['' + coupledModelName]: userObjects[i].json.model,
                    'include_sets': userObjects[i].json.include_sets,
                };

            } else {
                console.log("Invalid elementType: " + userObjects[i].elementType);
            }

            console.log(userObjects[i]);
        }
        return DEVSMap;
    }


    previewDEVSMap() {
        console.log(this.getDEVSMap());
    }


    previewCadmiumCode() {
        alert("Preview Cadmium Code: Not implemented yet");
    }


    previewTrace() {
        alert("Preview Trace: Not implemented yet");
    }


    async viewTrace() {
        const log_DEVSMap = true;
        const log_code = true;
        const log_csv = true;

        const DEVSMap = this.getDEVSMap();

        if (log_DEVSMap) {
            console.log("DEVSMap:", DEVSMap);
        }

        // HTTP Calls 
        const codeResult = await this.generateCode(DEVSMap, log_code);

        const csvResult = await this.generateCSV(codeResult, log_csv);

    }


    async generateCodeOLD(DEVSMap, log_code = true) {
        const url_code = "https://devssim.carleton.ca/generate-code";

        try {
            const response = await fetch(url_code, {
                method: "POST",
                headers: { "Content-Type": "application/json", },
                body: JSON.stringify(DEVSMap)
            });

            const contentType = response.headers.get("content-type");
            let data;

            if (contentType && contentType.includes("application/json")) {
                data = await response.json();
            } else {
                data = await response.text();
            }

            if (log_code) {
                console.log("Server response:", data);
            }

            return data;

        } catch (error) {
            if (log_code) {
                console.error("Error generating code:", error);
            }
        }
    }


    async generateCode(DEVSMap, log_code = true) {

        try {
            const response = await fetch("http://localhost:8000/parse", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(DEVSMap)
            });

            const data = await response.json();

            if (log_code) {
                console.log("Response from parser:", data);
            }

            return data;  // optional: in case you want to use it elsewhere

        } catch (error) {
            console.error("Error sending data to parser:", error);
        }
    }


    async generateCSV(CODE, log_csv = true) {

        try {
            const response = await fetch("http://localhost:8001/simulation-output", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(CODE)
            });

            const data = await response.json();

            if (log_csv) {
                console.log("Response from Cadmium Builder:", data);
            }

            return data;  // optional: in case you want to use it elsewhere

        } catch (error) {
            console.error("Error sending data to Cadmium Builder:", error);
        }

    }


    // TODO change the name of this to generateSimulationOutput
    async generateCSVOLD(codeData, log_csv = true) {
        const url_csv = "https://devssim.carleton.ca/generate-csv";

        try {
            const response = await fetch(url_csv, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(codeData)
            });

            const contentType = response.headers.get("content-type");
            let data;

            if (contentType && contentType.includes("application/json")) {
                data = await response.json();   // parse JSON response
            } else {
                data = await response.text();   // parse plain text
            }

            if (log_csv) {
                console.log("CSV generation response:", data);
            }

            return data;

        } catch (error) {
            if (log_csv) {
                console.error("Error generating CSV:", error);
            }
        }
    }


}