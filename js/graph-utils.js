export function copySelectedCells(graph) {
    const selected = graph.getSelectionCells();
    if (selected.length === 0) {
        alert('Please select a cell to copy.');
        return;
    }
    mxClipboard.copy(graph);
}

export function pasteClipboardCells(graph, pasteLocation = null) {
    // Paste location will be provided when pasting via right-click
    // Otherwise null when pasting via menu button or keyboard shortcuts
    graph.getModel().beginUpdate();
    try {
        // Paste
        const pastedCells = mxClipboard.paste(graph);

        // Move to paste location when applicable
        if (pasteLocation && pastedCells && pastedCells.length > 0) {
            const geometry = graph.getCellGeometry(pastedCells[0]);
            const dx = pasteLocation.x - (geometry?.x || 0);
            const dy = pasteLocation.y - (geometry?.y || 0);

            graph.moveCells(pastedCells, dx, dy);
        }
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


export function exportGraphImage(graph, format = "png", imgFilename="DEVS_Graph") {
    const filename = `${imgFilename}.${format}`;

    if (!graph) return console.warn("[Export] Graph is undefined.");
    if (!window.html2canvas) return console.error("[Export] html2canvas not loaded");

    const validFormats = ["png", "jpg"];
    if (!validFormats.includes(format)) {
        console.warn(`[Export] Invalid format "${format}", defaulting to "png".`);
        format = "png";
    }

    const container = graph.container;
    const tempImages = [];
    const hiddenElements = [];
    const mimeType = format === "png" ? "image/png" : "image/jpeg";

    try {
        // Overlay <img> elements for all custom image cells
        const imageCells = graph.getChildVertices(graph.getDefaultParent())
            .filter(cell => {
                const s = graph.getCellStyle(cell);
                return s.shape === 'image' && (s.image || s.src);
            });

        imageCells.forEach(cell => {
            const style = graph.getCellStyle(cell);
            const imageUrl = style.image || style.src;
            const geo = graph.getCellGeometry(cell);
            if (!geo) return;

            // Hide default mxGraph icon by setting visibility of its DOM node
            const cellNode = graph.view.getState(cell)?.shape?.node;
            if (cellNode) {
                cellNode.style.visibility = "hidden";
                hiddenElements.push(cellNode);
            }

            // Create temporary img overlay
            const img = document.createElement("img");
            img.src = imageUrl;

            img.onload = () => {
                const aspectRatio = img.naturalWidth / img.naturalHeight;
                let width = geo.width * graph.view.scale;
                let height = geo.height * graph.view.scale;

                if (width / height > aspectRatio) {
                    width = height * aspectRatio;
                } else {
                    height = width / aspectRatio;
                }

                img.style.width = width + "px";
                img.style.height = height + "px";
                img.style.left = (geo.x * graph.view.scale + graph.view.translate.x) + "px";
                img.style.top = (geo.y * graph.view.scale + graph.view.translate.y) + "px";
                img.style.position = "absolute";
                img.style.pointerEvents = "none";

                container.appendChild(img);
                tempImages.push(img);

                // Only export when all images are loaded
                if (tempImages.length === imageCells.length) {
                    html2canvas(container, { useCORS: true, allowTaint: true, imageTimeout: 2000 })
                        .then(canvas => {
                            canvas.toBlob(blob => {
                                if (!blob) return console.error("[Export] Failed to create blob from canvas");
                                const url = URL.createObjectURL(blob);
                                const link = document.createElement("a");
                                link.href = url;
                                link.download = filename;
                                document.body.appendChild(link);
                                link.click();
                                document.body.removeChild(link);
                                console.log("[Export] screenshot downloaded successfully");
                            }, mimeType, 0.95);
                        }).catch(err => console.error("[Export] html2canvas failed:", err))
                        .finally(() => {
                            // Restore default mxGraph icons
                            hiddenElements.forEach(el => el.style.visibility = "");
                            // Remove temporary images
                            tempImages.forEach(i => container.removeChild(i));
                        });
                }
            };

            img.onerror = () => {
                console.warn("[Export] Failed to load image:", imageUrl);
            };
        });

        // Fallback: if no custom images, export immediately
        if (imageCells.length === 0) {
            html2canvas(container, { useCORS: true, allowTaint: true, imageTimeout: 2000 })
                .then(canvas => {
                    canvas.toBlob(blob => {
                        if (!blob) return console.error("[Export] Failed to create blob from canvas");
                        const url = URL.createObjectURL(blob);
                        const link = document.createElement("a");
                        link.href = url;
                        link.download = "graph.png";
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                        console.log("[Export] PNG screenshot downloaded successfully");
                    });
                }).catch(err => console.error("[Export] html2canvas failed:", err));
        }

    } catch (err) {
        console.error("[Export] Unexpected error:", err);
    }
}

