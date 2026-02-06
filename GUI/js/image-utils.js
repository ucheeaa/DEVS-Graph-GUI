export function exportGraphImage(graph, format = "png", imgFilename="DEVS_Graph") {
    const filename = `${imgFilename}.${format}`;

    if (!graph) return console.warn("[Export] Graph is undefined.");
    if (!window.html2canvas) return console.error("[Export] html2canvas not loaded");

    const validFormats = ["png", "jpg"];
    if (!validFormats.includes(format)) {
        console.warn(`[Export] Invalid format "${format}", defaulting to "png".`);
        format = "png";
    }

    // Clear selected cells so they don't appear selected on the image
    graph.clearSelection();

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