export class ConversionManager {

    constructor(graph) {
        this.graph = graph;
    }

    // For previewing the JSON in the console
    previewGraphJSON() {
        const encoder = new mxCodec();
        const node = encoder.encode(this.graph.getModel());
        const xml = mxUtils.getPrettyXml(node);
        console.log(xml);
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