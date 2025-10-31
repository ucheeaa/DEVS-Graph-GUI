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
        alert("Preview DEVSMap: Not implemented yet");
    }

    previewCadmiumCode() {
        alert("Preview Cadmium Code: Not implemented yet");
    }

    previewTrace() {
        alert("Preview Trace: Not implemented yet");
    }


}