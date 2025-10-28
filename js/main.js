import { helloWorld } from './development.js'; // delete later

import { copySelectedCells } from './graph-utils.js';

import { ConversionManager } from './conversions.js';
import { shortcuts } from './shortcuts.js';


function resizeGraph(graph, container) {
    // Changes container size
    const width = container.clientWidth;
    const height = container.clientHeight;

    // console.log(`Graph container size: ${width}px x ${height}px`);

    // Informs mxGraph
    // Would update scrollbars, rubberbands, view validation and background 
    graph.sizeDidChange();
}


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
    ///////// Graphing Utils
    /////////////////////////////////////////////////////////////////////////////
    // function copySelectedCells() {
    //     const selected = graph.getSelectionCells();
    //     if (selected.length === 0) {
    //         alert('Please select a cell to copy.');
    //         return;
    //     }
    //     mxClipboard.copy(graph);
    // }

    function pasteClipboardCells() {
        graph.getModel().beginUpdate(); // ensures undo works
        try {
            mxClipboard.paste(graph);
        } finally {
            graph.getModel().endUpdate();
        }
    }

    function undoAction() {
        if (undoManager.canUndo()) {
            undoManager.undo();
        }
    }

    function redoAction() {
        if (undoManager.canRedo()) {
            undoManager.redo();
        }
    }

    function duplicateSelectedCells() {
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

    function cutSelectedCells() {
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

    function deleteSelectedCells() {
        const selected = graph.getSelectionCells();
        if (!selected.length) return alert('Select cells to delete');

        graph.getModel().beginUpdate();
        try {
            graph.removeCells(selected);
        } finally {
            graph.getModel().endUpdate();
        }
    }

    function deleteAllCells() {
        const confirmed = confirm("Are you sure you want to delete all elements?");

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

    function selectAllCells() {
        // Get all cells (vertices + edges)
        const allCells = graph.getChildCells(graph.getDefaultParent(), true, true);

        if (allCells.length === 0) {
            alert('No cells to select.');
            return;
        }

        // Set selection
        graph.setSelectionCells(allCells);
    }

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



    // TODO
    function moveSelectedCells(x, y) {

    }

    function moveLeft() {
        moveSelectedCells(-10, 0);
    }

    function moveRight() {
        moveSelectedCells(10, 0);
    }





    /////////////////////////////////////////////////////////////////////////////
    ///////// JSON Utils
    /////////////////////////////////////////////////////////////////////////////


    // User saving JSON as a file for later
    function saveGraphJSON(filename) {
        // TODO
    }

    // User loading a Graph from the JSON graph representation
    function importGraphJSON(file) {
        // TODO
    }

    /////////////////////////////////////////////////////////////////////////////
    ///////// ToolBar Setup
    /////////////////////////////////////////////////////////////////////////////

    // mxToolbar Setup
    const toolbarContainer = document.getElementById('toolbar');
    const toolbar = new mxToolbar(toolbarContainer);

    toolbar.enabled = false; // no dragging items from toolbar

    // toolbar.addItem('*New', null, placeholderFunction);
    // toolbar.addItem('*Save', null, placeholderFunction);
    // toolbar.addItem('*Load', null, placeholderFunction);

    toolbar.addItem('Copy', null, () => copySelectedCells(graph)); // Text label, icon, function
    toolbar.addItem('Paste', null, pasteClipboardCells);
    toolbar.addItem('Undo', null, undoAction);
    toolbar.addItem('Redo', null, redoAction);
    toolbar.addItem('Duplicate', null, duplicateSelectedCells);
    toolbar.addItem('Cut', null, cutSelectedCells);
    toolbar.addItem('Delete', null, deleteSelectedCells);
    toolbar.addItem('Select All', null, selectAllCells);
    toolbar.addItem('Delete All', null, deleteAllCells);
    toolbar.addItem('Group', null, groupCells);
    toolbar.addItem('Ungroup', null, ungroupCells);



    // toolbar.addItem('*Lock', null, () => alert("Not yet implemented"));

    // For Footer...RHS
    // toolbar.addItem('*Zoom In', null, placeholderFunction);
    // toolbar.addItem('*Zoom Out', null, placeholderFunction);
    // toolbar.addItem('*Reset Zoom', null, placeholderFunction);


    // toolbar.addItem('', null, placeholderFunction);



    // Setting up shortcuts
    // Allows user to focus on graph (required for keyHandler)



    // Right-click context menu setup
    mxEvent.disableContextMenu(container);



    graph.popupMenuHandler.factoryMethod = function (menu, cell, evt) {
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
                menu.addItem('Cut', null, cutSelectedCells);
                menu.addItem('Copy', null, () => copySelectedCells(graph));
                menu.addItem('Duplicate', null, duplicateSelectedCells);
                menu.addItem('Delete', null, deleteSelectedCells);
            }
            else if (graph.getModel().isEdge(cell)) {
                // Menu for edges
                menu.addItem('Delete', null, deleteSelectedCells);
            }
        } else {
            // Menu for empty space
            menu.addItem('Paste', null, pasteClipboardCells);
            menu.addItem('Select All', null, selectAllCells);
            menu.addItem('Delete All', null, deleteAllCells);
        }
    };



    /////////////////////////////////////////////////////////////////////////////
    ///////// Footer Setup
    /////////////////////////////////////////////////////////////////////////////

    const conversionManager = new ConversionManager(graph);

    document.getElementById("previewJSONGraphBtn").addEventListener("click", () => conversionManager.previewGraphJSON());
    document.getElementById("previewDEVSMapBtn").addEventListener("click", () => conversionManager.previewDEVSMap());
    document.getElementById("previewCodeBtn").addEventListener("click", () => conversionManager.previewCadmiumCode());
    document.getElementById("previewTraceBtn").addEventListener("click", () => conversionManager.previewTrace());



    // Resize functionality when the user changes the size/shape of the window
    window.addEventListener('resize', () => resizeGraph(graph, container));

    // Initial resize after the application is loaded
    resizeGraph(graph, container);

    


    // Get parent for new cells
    //const parent = graph.getDefaultParent();
    helloWorld(graph);



    /////////////////////////////////////////////////////////////////////////////
    ///////// Drag and drop setup
    /////////////////////////////////////////////////////////////////////////////

    // Handle dropping shapes from the palette
    graphContainer.addEventListener('dragover', e => e.preventDefault());

    graphContainer.addEventListener('drop', e => {
        e.preventDefault();
        const item = JSON.parse(e.dataTransfer.getData('shape'));
        const pt = graph.getPointForEvent(e);

        graph.getModel().beginUpdate();
        try {
            let cell;
            if (item.type === 'rectangle' || item.type === 'ellipse') {
                cell = graph.insertVertex(graph.getDefaultParent(), null, item.label, pt.x, pt.y, item.width, item.height, item.type);
            } else if (item.type === 'image') {
                cell = graph.insertVertex(graph.getDefaultParent(), null, '', pt.x, pt.y, item.width, item.height, 'shape=image;image=' + item.src);
            } else if (item.type === 'svg') {
                cell = graph.insertVertex(graph.getDefaultParent(), null, '', pt.x, pt.y, 50, 50, 'shape=rectangle;fillColor=white;strokeColor=black');
                cell.value = item.svg;
            }
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

                const pt = graph.getPointForEvent(evt);
                let newCell;
                if (itemData.style.shape === 'image') {
                    newCell = new mxCell('', new mxGeometry(0, 0, itemData.width * graphScaleFactor, itemData.height * graphScaleFactor), `shape=image;image=${itemData.style.src}`);
                } else {
                    newCell = new mxCell(itemData.label, new mxGeometry(0, 0, itemData.width * graphScaleFactor, itemData.height * graphScaleFactor), styleObjectToString(itemData.style));
                }
                newCell.vertex = true;

                // label is the text displayed on the icon
                newCell.value = itemData.label;

                // userObject to hold the JSON data
                newCell.userObject = itemData.userObject;

                // For experimental frames only (temp implementation)
                newCell.isExperimentalFrame = itemData.isExperimentalFrame;

                // centre at mousedrop
                newCell.geometry.x = pt.x - newCell.geometry.width / 2;
                newCell.geometry.y = pt.y - newCell.geometry.height / 2;

                graph.getModel().beginUpdate();
                try { graph.addCell(newCell); }
                finally { graph.getModel().endUpdate(); }

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

    fillPalette('generalCategory');

    const dropdown = document.getElementById('category-select');
    dropdown.addEventListener('change', e => {
        // console.log(e.target.value);
        fillPalette(e.target.value)
    });

    ////








    /////////////////////////////////////////////////////////////////////////////
    ///////// Keyboard Shortcuts setup
    /////////////////////////////////////////////////////////////////////////////

    const keyHandler = new mxKeyHandler(graph);

    // Map functName strings to actual functions
    const functionMap = {
        deleteSelectedCells,
        deleteAllCells,
        selectAllCells,
        copySelectedCells: () => copySelectedCells(graph),
        pasteClipboardCells,
        undoAction,
        redoAction,
        duplicateSelectedCells,
        cutSelectedCells,
        // moveLeft,
        // moveRight,
        // moveUp,
        // moveDown
    };

    // Bind all shortcuts
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
        alert(shortcutHelpText); // TODO replace with nicer looking modal
    }

    document.getElementById('shortcutsBtn').addEventListener('click', showShortcutHelp);







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

        const userObject = selected[0].userObject || [];

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
