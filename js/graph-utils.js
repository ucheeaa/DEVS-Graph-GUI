export function copySelectedCells(graph) {
    const selected = graph.getSelectionCells();
    if (selected.length === 0) {
        alert('Please select a cell to copy.');
        return;
    }
    mxClipboard.copy(graph);
}

export function pasteClipboardCells(graph) {
    graph.getModel().beginUpdate();
    try {
        mxClipboard.paste(graph);
    } finally {
        graph.getModel().endUpdate();
    }
}

export function undoAction(undoManager) {
    if (undoManager.canUndo()) {
        undoManager.undo();
    }
}

export function redoAction(undoManager) {
    if (undoManager.canRedo()) {
        undoManager.redo();
    }
}

export function duplicateSelectedCells(graph) {
    const selected = graph.getSelectionCells();
    if (!selected.length) return alert('Select a cell to duplicate');

    graph.getModel().beginUpdate();
    try {
        // Copy current selection to clipboard
        mxClipboard.copy(graph);
        // Paste the copied cells
        const pastedCells = mxClipboard.paste(graph);
        // Select the newly pasted cells
        graph.setSelectionCells(pastedCells);
    } finally {
        graph.getModel().endUpdate();
    }
}

export function cutSelectedCells(graph) {
    const selected = graph.getSelectionCells();
    if (!selected.length) return alert('Select a cell to cut');

    graph.getModel().beginUpdate();
    try {
        // Copy first
        mxClipboard.copy(graph);
        // Then remove
        graph.removeCells(selected);
    } finally {
        graph.getModel().endUpdate();
    }
}

export function deleteSelectedCells(graph) {
    const selected = graph.getSelectionCells();
    if (!selected.length) return alert('Select cells to delete');

    graph.getModel().beginUpdate();
    try {
        graph.removeCells(selected);
    } finally {
        graph.getModel().endUpdate();
    }
}

export function deleteAllCells(graph, message = "Are you sure you want to delete all elements?") {
    const confirmed = confirm(message);

    if (confirmed) {
        graph.getModel().beginUpdate();
        try {
            // Get all cells in the graph
            const allCells = graph.getChildCells(graph.getDefaultParent(), true, true);

            if (allCells.length === 0) return; // nothing to delete

            // Remove all cells (vertices + edges)
            graph.removeCells(allCells);
        } finally {
            graph.getModel().endUpdate();
        }
    }
}

export function selectAllCells(graph) {
    // Get all cells (vertices + edges)
    const allCells = graph.getChildCells(graph.getDefaultParent(), true, true);

    if (allCells.length === 0) {
        alert('No cells to select.');
        return;
    }

    // Set selection
    graph.setSelectionCells(allCells);
}


export function exportGraphImage(graph) {
    alert("Not yet implemented");
}
