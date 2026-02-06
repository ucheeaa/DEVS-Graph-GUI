// This file contains functions that will be deleted after the graphing functionality is completed
export function helloWorld(graph) {
    // TEMP for early development
    const parent = graph.getDefaultParent();

    // Add cells to the model
    graph.getModel().beginUpdate();
    try {
        const v1 = graph.insertVertex(parent, null, 'Hello,', 20, 20, 80, 30);
        const v2 = graph.insertVertex(parent, null, 'World!', 200, 150, 80, 30);
        graph.insertEdge(parent, null, '', v1, v2);
    } finally {
        graph.getModel().endUpdate();
    }
}