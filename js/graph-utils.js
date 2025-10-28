export function copySelectedCells(graph) {
    const selected = graph.getSelectionCells();
    if (selected.length === 0) {
        alert('Please select a cell to copy.');
        return;
    }
    mxClipboard.copy(graph);
}