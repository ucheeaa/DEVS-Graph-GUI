import { helloWorld } from './development.js'; // delete later

import { copySelectedCells, pasteClipboardCells, undoAction, redoAction, duplicateSelectedCells, cutSelectedCells, deleteSelectedCells, deleteAllCells, selectAllCells } from './graph-utils.js';

import { exportGraphImage } from './image-utils.js';

import { ConversionManager } from './conversions.js';
import { shortcuts } from './shortcuts.js';


function main(container) {
    // Check browser compatibility
    if (!mxClient.isBrowserSupported()) {
        mxUtils.error('Browser is not supported!', 200, false);
        return;
    }

    // Create the graph inside the container
    const graph = new mxGraph(container);

    // These for sure
    graph.setPanning(true);
    graph.setConnectable(true);
    graph.setCellsMovable(true);
    graph.setCellsSelectable(true);

    // May want to change these later
    graph.setGridEnabled(false);            // snapping to grid
    graph.setAllowDanglingEdges(true);     // whether edges must be connected on both ends


    // Graph selection via mouse dragging
    new mxRubberband(graph);


    /////////////////////////////////////////////////////////////////////////////
    ///////// Undo & Redo
    /////////////////////////////////////////////////////////////////////////////
    const undoManager = new mxUndoManager();
    // Listen to model and view changes
    const undoHandler = function (sender, evt) {
        undoManager.undoableEditHappened(evt.getProperty('edit'));
    };
    graph.getModel().addListener(mxEvent.UNDO, undoHandler);
    graph.getView().addListener(mxEvent.UNDO, undoHandler);


    /////////////////////////////////////////////////////////////////////////////
    ///////// Mouse Wheel Zoom
    /////////////////////////////////////////////////////////////////////////////
    mxEvent.addMouseWheelListener(function (evt, up) {
        if (up) {
            graph.zoomIn();
        } else {
            graph.zoomOut();
        }
        evt.preventDefault();
    });


    /////////////////////////////////////////////////////////////////////////////
    ///////// Graphing Utils
    /////////////////////////////////////////////////////////////////////////////

    function groupCells() {
        if (!graph || !graph.getSelectionCells) return;

        const cells = graph.getSelectionCells();
        if (!cells || cells.length < 2) {
            alert("Select at least two cells to group.");
            return;
        }

        const padding = 20; // space around the cells

        graph.getModel().beginUpdate();
        try {
            // Create the group
            const group = graph.groupCells(null, 0, cells);

            // Style the group
            group.setStyle('rounded=1;arcSize=20;fillColor=#f0f0f0;strokeColor=#888;strokeWidth=2;');
            group.setConnectable(false);

            // Adjust geometry to add padding
            const geo = graph.getCellGeometry(group);
            if (geo) {
                geo.x -= padding;
                geo.y -= padding;
                geo.width += padding * 2;
                geo.height += padding * 2;
                graph.getModel().setGeometry(group, geo);
            }

            // Move child cells inward by the padding so they're centered visually
            const childCount = graph.model.getChildCount(group);
            for (let i = 0; i < childCount; i++) {
                const child = graph.model.getChildAt(group, i);
                const childGeo = graph.getCellGeometry(child);
                if (childGeo) {
                    const clone = childGeo.clone();
                    clone.x += padding;
                    clone.y += padding;
                    graph.getModel().setGeometry(child, clone);
                }
            }

        } finally {
            graph.getModel().endUpdate();
        }

        graph.refresh();
    }


    function groupAsCoupledModel(graph) {
        let selectedCells = graph.getSelectionCells();

        // Keep only real mxCells that are vertices
        selectedCells = selectedCells.filter(
            c => c instanceof mxCell && graph.getModel().isVertex(c)
        );

        if (selectedCells.length < 2) {
            alert("Select at least two cells to group");
            return;
        }

        graph.getModel().beginUpdate();
        try {
            const border = 20;

            // Group them
            const group = graph.groupCells(null, border, selectedCells);

            // Make the group rectangle visible and style it
            group.setStyle('shape=rectangle;fillColor=#FFEB3B;strokeColor=#FBC02D;rounded=1;');

            // Visible label for the group
            group.value = "Enter a name for this coupled model";

            // Attach DEVS metadata
            group.userObject = {
                elementType: "coupledModel",
                stateVariables: [
                    { name: "Child Count", type: "int", defaultValue: selectedCells.length }
                ]
            };

            // Move the group on top of children, making the coupled model visible
            const model = graph.getModel();
            const parent = model.getParent(group);
            if (parent) {
                const index = model.getChildCount(parent) - 1;
                model.add(parent, group, index);
            }

            // Collapse group automatically so only the coupled model is shown
            graph.foldCells(true, false, [group]);

            // Set the geometry of the group to determine the size of the group when collapsed
            const groupGeo = graph.getCellGeometry(group);
            if (groupGeo) {
                groupGeo.width = 200;   // desired width
                groupGeo.height = 100;  // desired height
                graph.getModel().setGeometry(group, groupGeo);
            }

            // Select the group
            graph.setSelectionCell(group);

        } finally {
            graph.getModel().endUpdate();
        }

        graph.refresh();
    }


    function ungroupCells() {
        if (!graph || !graph.getSelectionCells) return;

        const cells = graph.getSelectionCells();
        if (!cells || cells.length === 0) {
            alert("Select a group to ungroup.");
            return;
        }

        graph.getModel().beginUpdate();
        try {
            graph.ungroupCells(cells);
        } finally {
            graph.getModel().endUpdate();
        }

        graph.refresh();
    }


    function getSelectedCellUserObject() {
        const selected = graph.getSelectionCells();

        if (selected.length === 0) {
            alert('Please select a cell.');
            return null;
        }

        if (selected.length > 1) {
            alert('Please select only one cell.');
            return null;
        }

        // Full structured object is now in userObject
        const userObject = selected[0].userObject;
        console.log(userObject);
        return userObject || null;
    }


    function moveCells(x, y) {
        const MOVE_INCREMENT = 10; // pixels per move
        const cells = graph.getSelectionCells();

        if (cells.length > 0) {
            graph.getModel().beginUpdate();
            try {
                cells.forEach(cell => {
                    // Geometry object for a cell contains:  x, y, height, width
                    const geometry = graph.getCellGeometry(cell);
                    if (geometry != null) {
                        // Erratic behaviour occurs if we don't use a new geometry object
                        const newGeometry = geometry.clone();
                        newGeometry.x += x * MOVE_INCREMENT;
                        newGeometry.y += y * MOVE_INCREMENT;
                        graph.getModel().setGeometry(cell, newGeometry);
                    }
                });
            } finally {
                graph.getModel().endUpdate();
            }
        }
    }


    /////////////////////////////////////////////////////////////////////////////
    ///////// MenuBar and Footer Setup
    /////////////////////////////////////////////////////////////////////////////

    const conversionManager = new ConversionManager(graph);

    const CONFIRM_NEW_GRAPH_MESSAGE = "Are you sure you would like to start a new graph? This will delete the current graph.";

    document.getElementById('newBtn').addEventListener('click', () => deleteAllCells(graph, CONFIRM_NEW_GRAPH_MESSAGE));
    document.getElementById('loadBtn').addEventListener('click', () => conversionManager.loadGraphXML());
    document.getElementById('saveBtn').addEventListener('click', () => conversionManager.saveGraphXML());

    document.getElementById('screenshotPngBtn').addEventListener('click', () => exportGraphImage(graph, "png"));
    document.getElementById('screenshotJpgBtn').addEventListener('click', () => exportGraphImage(graph, "jpg"));

    document.getElementById("previewGraphXMLBtn").addEventListener("click", () => conversionManager.previewGraphXML());
    document.getElementById("previewDEVSMapBtn").addEventListener("click", () => conversionManager.previewDEVSMap());
    document.getElementById("previewCodeBtn").addEventListener("click", () => conversionManager.previewCadmiumCode());
    document.getElementById("previewTraceBtn").addEventListener("click", () => conversionManager.previewTrace());


    /////////////////////////////////////////////////////////////////////////////
    ///////// ToolBar Setup
    /////////////////////////////////////////////////////////////////////////////

    // mxToolbar Setup
    const toolbarContainer = document.getElementById('toolbar');
    const toolbar = new mxToolbar(toolbarContainer);

    toolbar.enabled = false; // no dragging items from toolbar

    // May add New/Save/Load once button text replaced with icons
    // toolbar.addItem('New', null, () => deleteAllCells(graph, CONFIRM_NEW_GRAPH_MESSAGE));
    // toolbar.addItem('Save', null, () => conversionManager.saveGraphXML());
    // toolbar.addItem('Load', null, () => conversionManager.loadGraphXML());
    toolbar.addItem('Copy', null, () => copySelectedCells(graph)); // Text label, icon, function
    toolbar.addItem('Paste', null, () => pasteClipboardCells(graph));
    toolbar.addItem('Undo', null, () => undoAction(undoManager));
    toolbar.addItem('Redo', null, () => redoAction(undoManager));
    toolbar.addItem('Duplicate', null, () => duplicateSelectedCells(graph));
    toolbar.addItem('Cut', null, () => cutSelectedCells(graph));
    toolbar.addItem('Delete', null, () => deleteSelectedCells(graph));
    toolbar.addItem('Select All', null, () => selectAllCells(graph));
    toolbar.addItem('Delete All', null, () => deleteAllCells(graph));
    toolbar.addItem('Group', null, groupCells);
    toolbar.addItem('Ungroup', null, ungroupCells);
    // toolbar.addItem('Lock', null, () => alert("Not yet implemented")); // May/may not be implemented
    toolbar.addItem('Zoom In', null, () => graph.zoomIn());
    toolbar.addItem('Zoom Out', null, () => graph.zoomOut());
    toolbar.addItem('Reset Zoom', null, () => graph.zoomActual());
    toolbar.addItem('Zoom to Fit', null, () => graph.fit(25));
    toolbar.addItem('Test Couple', null, () => groupAsCoupledModel(graph));



    /////////////////////////////////////////////////////////////////////////////
    ///////// Right-click Context Menu Setup
    /////////////////////////////////////////////////////////////////////////////

    // Setting up shortcuts
    // Allows user to focus on graph (required for keyHandler)
    mxEvent.disableContextMenu(container);

    graph.popupMenuHandler.factoryMethod = function (menu, cell, evt) {
        const rightClickCoords = graph.getPointForEvent(evt);
        // TODO add menu for grouped elements

        if (cell) {
            if (graph.getModel().isVertex(cell)) {
                // Menu for vertices
                if (cell.isExperimentalFrame) {
                    menu.addItem('func1', null, func1);
                    menu.addItem('func2', null, func2);
                    menu.addItem('func3', null, func3);
                    menu.addItem('func4', null, func4);
                    menu.addItem('func5', null, func5);
                    menu.addItem('func6', null, func6);
                }
                menu.addItem('Group', null, groupCells);
                menu.addItem('Cut', null, () => cutSelectedCells(graph));
                menu.addItem('Copy', null, () => copySelectedCells(graph));
                menu.addItem('Duplicate', null, () => duplicateSelectedCells(graph));
                menu.addItem('Delete', null, () => deleteSelectedCells(graph));
            }
            else if (graph.getModel().isEdge(cell)) {
                // Menu for edges
                menu.addItem('Delete', null, () => deleteSelectedCells(graph));
            }
        } else {
            // Menu for empty space
            menu.addItem('Paste', null, () => pasteClipboardCells(graph, rightClickCoords));
            menu.addItem('Select All', null, () => selectAllCells(graph));
            menu.addItem('Delete All', null, () => deleteAllCells(graph));
        }
    };


    // Resize functionality when the user changes the size/shape of the window
    window.addEventListener('resize', () => graph.sizeDidChange);

    // Initial resize after the application is loaded
    graph.sizeDidChange();

    // For now we populate a hello world, later can populate with traffic light
    helloWorld(graph);



    /////////////////////////////////////////////////////////////////////////////
    ///////// Drag and drop setup
    /////////////////////////////////////////////////////////////////////////////

    let lastDropX = null;
    let lastDropY = null;
    const DROP_OFFSET = 10; // pixels to offset each new drop

    // Handle dropping shapes from the palette
    graphContainer.addEventListener('dragover', e => e.preventDefault());

    graphContainer.addEventListener('drop', e => {
        e.preventDefault();
        const item = JSON.parse(e.dataTransfer.getData('shape'));
        const pt = graph.getPointForEvent(e);

        graph.getModel().beginUpdate();
        try {
            // Create a proper mxCell from the palette item definition
            const newCell = createMxCellFromItem(item);

            // Position cell centered at the drop point
            newCell.geometry.x = pt.x - (newCell.geometry.width / 2);
            newCell.geometry.y = pt.y - (newCell.geometry.height / 2);

            // Add to default parent
            graph.addCell(newCell, graph.getDefaultParent());

            // Optionally select the newly dropped cell
            graph.setSelectionCell(newCell);

            // Reset last drop stack because user manually positioned
            lastDropX = null;
            lastDropY = null;
        } finally {
            graph.getModel().endUpdate();
        }
    });




    /////////////////////////////////////////////////////////////////////////////
    ///////// Left palette setup
    /////////////////////////////////////////////////////////////////////////////

    const shapesDiv = document.getElementById('palette-shapes');
    // Scale factors
    const paletteScaleFactor = 0.75; // Preview in palette
    const graphScaleFactor = 1.0; // Actual graph shape size

    function createPaletteItem(itemData) {
        const item = document.createElement('div');
        item.className = 'palette-item';

        const canvasDiv = document.createElement('div');
        canvasDiv.className = 'palette-canvas';
        canvasDiv.style.width = itemData.width * paletteScaleFactor + 'px';
        canvasDiv.style.height = itemData.height * paletteScaleFactor + 'px';
        item.appendChild(canvasDiv);

        // Mini graph preview
        const miniGraph = new mxGraph(canvasDiv);
        miniGraph.setEnabled(false);
        miniGraph.container.style.background = 'none';
        miniGraph.container.style.border = 'none';
        miniGraph.view.scale = paletteScaleFactor;

        miniGraph.getModel().beginUpdate();
        try {
            let cell;
            if (itemData.style.shape === 'image') {
                // src comes from style, not userObject
                cell = new mxCell('', new mxGeometry(0, 0, itemData.width, itemData.height), `shape=image;image=${itemData.style.src}`);
            } else {
                cell = new mxCell(itemData.label, new mxGeometry(0, 0, itemData.width, itemData.height), styleObjectToString(itemData.style));
            }

            cell.vertex = true;

            // Label for display
            cell.value = itemData.label;

            // userObject to hold the JSON data
            cell.userObject = itemData.userObject;

            // For experimental frames only (temp implementation)
            cell.isExperimentalFrame = itemData.isExperimentalFrame;

            // centre in mini graph
            cell.geometry.x = (itemData.width * paletteScaleFactor - itemData.width * paletteScaleFactor) / 2 / paletteScaleFactor;
            cell.geometry.y = (itemData.height * paletteScaleFactor - itemData.height * paletteScaleFactor) / 2 / paletteScaleFactor;

            miniGraph.addCell(cell);
        } finally {
            miniGraph.getModel().endUpdate();
        }

        // Drag-and-drop logic (ghost div)
        canvasDiv.addEventListener('mousedown', e => {
            e.preventDefault();
            const ghost = canvasDiv.cloneNode(true);
            ghost.classList.add('drag-ghost');
            ghost.style.width = canvasDiv.style.width;
            ghost.style.height = canvasDiv.style.height;
            document.body.appendChild(ghost);

            const offsetX = canvasDiv.offsetWidth / 2;
            const offsetY = canvasDiv.offsetHeight / 2;

            function moveGhost(evt) {
                ghost.style.left = (evt.clientX - offsetX) + 'px';
                ghost.style.top = (evt.clientY - offsetY) + 'px';
            }
            moveGhost(e);

            function mouseMoveHandler(evt) { moveGhost(evt); }

            function mouseUpHandler(evt) {
                document.body.removeChild(ghost);
                document.removeEventListener('mousemove', mouseMoveHandler);
                document.removeEventListener('mouseup', mouseUpHandler);

                // Get graph container bounds
                const rect = graph.container.getBoundingClientRect();
                const isInsideGraph =
                    evt.clientX >= rect.left &&
                    evt.clientX <= rect.right &&
                    evt.clientY >= rect.top &&
                    evt.clientY <= rect.bottom;

                let pt;

                if (isInsideGraph) {
                    // Use mouse location for drops inside the graph
                    pt = graph.getPointForEvent(evt);
                    // Reset lastDropX/Y because the user manually positioned this one
                    lastDropX = null;
                    lastDropY = null;
                } else {
                    // Use center + offset for drops outside the graph
                    const container = graph.container;
                    const view = graph.getView();
                    const scale = view.scale;
                    const translate = view.translate;

                    pt = {
                        x: container.clientWidth / 2 / scale - translate.x,
                        y: container.clientHeight / 2 / scale - translate.y
                    };

                    // Apply stack offset if previous drop exists
                    if (lastDropX !== null && lastDropY !== null) {
                        pt.x = lastDropX + DROP_OFFSET;
                        pt.y = lastDropY + DROP_OFFSET;
                    }

                    // Save this as last drop position
                    lastDropX = pt.x;
                    lastDropY = pt.y;
                }

                // Create new cell at pt
                let newCell;
                if (itemData.style.shape === 'image') {
                    newCell = new mxCell('', new mxGeometry(0, 0, itemData.width * graphScaleFactor, itemData.height * graphScaleFactor), `shape=image;image=${itemData.style.src}`);
                } else {
                    newCell = new mxCell(itemData.label, new mxGeometry(0, 0, itemData.width * graphScaleFactor, itemData.height * graphScaleFactor), styleObjectToString(itemData.style));
                }
                newCell.vertex = true;
                newCell.value = itemData.label;
                newCell.userObject = itemData.userObject;
                newCell.isExperimentalFrame = itemData.isExperimentalFrame;

                newCell.geometry.x = pt.x - newCell.geometry.width / 2;
                newCell.geometry.y = pt.y - newCell.geometry.height / 2;

                graph.getModel().beginUpdate();
                try {
                    graph.addCell(newCell);
                } finally {
                    graph.getModel().endUpdate();
                }
                graph.clearSelection();
                window.getSelection().removeAllRanges();
            }
            document.addEventListener('mousemove', mouseMoveHandler);
            document.addEventListener('mouseup', mouseUpHandler);
        });

        return item;
    }

    const allPalettes = {
        generalCategory: generalItems,
        aviationCategory: aviationItems,
        natureCategory: natureItems,
        networkCategory: networkItems,
        experimentalFramesCategory: experimentalFrames
    };

    function fillPalette(categoryName) {
        shapesDiv.innerHTML = '';
        const category = allPalettes[categoryName] || [];
        category.forEach(data => shapesDiv.appendChild(createPaletteItem(data)));
    }

    function styleObjectToString(obj) {
        return Object.entries(obj).map(([k, v]) => `${k}=${v}`).join(';');
    }

    function createMxCellFromItem(item) {
        // Geometry: x,y will be set later by caller
        const geo = new mxGeometry(0, 0, item.width || 80, item.height || 40);

        // Build style string
        let styleStr = '';
        if (item.style) {
            // For image shapes ensure mxGraph expects "image=..." not "src=..."
            if (item.style.shape === 'image' && (item.style.image || item.style.src)) {
                const src = item.style.image || item.style.src;
                styleStr = `shape=image;image=${src}`;
            } else {
                // Reuse your existing converter if available
                styleStr = typeof styleObjectToString === 'function'
                    ? styleObjectToString(item.style)
                    : Object.entries(item.style || {}).map(([k, v]) => `${k}=${v}`).join(';');
            }
        }

        // Use label as the display value (if present)
        const value = item.label || '';

        const cell = new mxCell(value, geo, styleStr);
        cell.setVertex(true);

        // Keep your metadata on userObject (not the cell.value which is label)
        cell.userObject = item.userObject || null;

        return cell;
    }

    fillPalette('generalCategory');

    const dropdown = document.getElementById('category-select');
    dropdown.addEventListener('change', e => {
        // console.log(e.target.value);
        fillPalette(e.target.value)
    });


    graph.addListener(mxEvent.CELLS_MOVED, function (sender, evt) {
        lastDropX = null;
        lastDropY = null;
    });


    /////////////////////////////////////////////////////////////////////////////
    ///////// Keyboard Shortcuts setup
    /////////////////////////////////////////////////////////////////////////////

    const keyHandler = new mxKeyHandler(graph);

    // Map functName strings to actual functions
    const functionMap = {
        deleteSelectedCells: () => deleteSelectedCells(graph),
        deleteAllCells: () => deleteAllCells(graph),
        selectAllCells: () => selectAllCells(graph),
        copySelectedCells: () => copySelectedCells(graph),
        pasteClipboardCells: () => pasteClipboardCells(graph),
        undoAction: () => undoAction(undoManager),
        redoAction: () => redoAction(undoManager),
        duplicateSelectedCells: () => duplicateSelectedCells(graph),
        cutSelectedCells: () => cutSelectedCells(graph),
        zoomIn: () => graph.zoomIn(),
        zoomOut: () => graph.zoomOut(),
        zoomReset: () => graph.zoomActual(),
        zoomFit: () => graph.fit(25)
        // moveLeft,
        // moveRight,
        // moveUp,
        // moveDown
    };

    // Binds the functions in functionMap to the specified shortcuts in shortcut.js
    shortcuts.forEach(sc => {
        const fn = functionMap[sc.functName];
        if (!fn) return console.warn(`Function ${sc.functName} not found`);

        const callback = evt => { fn(); evt.preventDefault(); };

        switch (sc.modifier) {
            case 'ctrl': keyHandler.bindControlKey(sc.keyCode, callback); break;
            case 'shift': keyHandler.bindShiftKey(sc.keyCode, callback); break;
            case 'ctrlShift': keyHandler.bindControlShiftKey(sc.keyCode, callback); break;
            default: keyHandler.bindKey(sc.keyCode, callback);
        }
    });

    // Function to generate the shortcut help text
    function showShortcutHelp() {
        const shortcutHelpText = shortcuts.map(sc => `${sc.text}: ${sc.description}`).join('\n');
        //console.log(shortcutHelpText);
        alert(shortcutHelpText); // TODO replace with nicer looking modal or HTMLDialogElement
    }

    document.getElementById('shortcutsBtn').addEventListener('click', showShortcutHelp);

    keyHandler.bindKey(37, function () { moveCells(-1, 0); }); // Left arrow
    keyHandler.bindKey(38, function () { moveCells(0, -1); }); // Up arrow
    keyHandler.bindKey(39, function () { moveCells(1, 0); });  // Right arrow
    keyHandler.bindKey(40, function () { moveCells(0, 1); });  // Down arrow


    /////////////////////////////////////////////////////////////////////////////
    ///////// Right palette setup
    /////////////////////////////////////////////////////////////////////////////


    function populateRightPalette() {
        const selected = graph.getSelectionCells();

        // Clear existing content
        propertiesContent.innerHTML = '';

        // Case 1: no cell or multiple cells selected
        if (selected.length !== 1) {
            propertiesContent.innerHTML = '<em>Select a single cell to edit properties</em>';
            return;
        }

        const userObject = selected[0].userObject?.stateVariables || [];

        // Case 2: single cell selected but no properties
        if (!Array.isArray(userObject) || userObject.length === 0) {
            propertiesContent.innerHTML = '<em>This cell has no editable properties</em>';
            return;
        }

        // Case 3: populate properties
        userObject.forEach((prop, index) => {
            const propDiv = document.createElement('div');
            propDiv.className = 'property-item';

            const label = document.createElement('label');
            label.textContent = prop.name;

            let input;

            // Handle different types
            if (prop.type === "int" || prop.type === "double") {
                input = document.createElement('input');
                input.type = 'number';
                input.value = prop.defaultValue;
            } else if (prop.type === "bool") {
                input = document.createElement('select');
                ["true", "false"].forEach(opt => {
                    const option = document.createElement('option');
                    option.value = opt;
                    option.textContent = opt;
                    input.appendChild(option);
                });
                input.value = prop.defaultValue ? "true" : "false";
            } else if (prop.type.startsWith("dropdown:")) {
                input = document.createElement('select');
                const options = prop.type.split(":")[1].split("/");
                options.forEach(opt => {
                    const option = document.createElement('option');
                    option.value = opt;
                    option.textContent = opt;
                    input.appendChild(option);
                });
                input.value = prop.defaultValue;
            } else {
                input = document.createElement('input');
                input.type = 'text';
                input.value = prop.defaultValue;
            }

            // Update userObject when input changes
            input.addEventListener('change', (e) => {
                if (prop.type === "int") {
                    prop.defaultValue = parseInt(e.target.value) || 0;
                } else if (prop.type === "double") {
                    prop.defaultValue = parseFloat(e.target.value) || 0.0;
                } else if (prop.type === "bool") {
                    prop.defaultValue = e.target.value === "true";
                } else if (prop.type.startsWith("dropdown:")) {
                    prop.defaultValue = e.target.value;
                } else {
                    prop.defaultValue = e.target.value;
                }

                selected[0].userObject[index] = prop;
                graph.refresh();
            });

            propDiv.appendChild(label);
            propDiv.appendChild(input);
            propertiesContent.appendChild(propDiv);
        });

    }

    graph.getSelectionModel().addListener(mxEvent.CHANGE, () => {
        populateRightPalette();
    });

    populateRightPalette();

    return graph;
}

// Wait for DOM to be ready before initializing
document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('graphContainer');
    const graph = main(container); // Return the graph from main
});
