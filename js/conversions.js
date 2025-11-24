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



    previewDEVSMap() {
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

    // Log plain JS objects
    console.log(JSON.stringify(userObjects, null, 2));
}













    previewCadmiumCode() {
        alert("Preview Cadmium Code: Not implemented yet");
    }

    previewTrace() {
        alert("Preview Trace: Not implemented yet");
    }


}