// shortcuts.js

// function names must be strings
// Otherwise we have to deal with importing the functions
// shortcuts.js
export const shortcuts = [
    {
        keyCode: 67, // C
        text: 'Ctrl+C',
        description: 'Copy selected cells',
        modifier: 'ctrl',
        functName: 'copySelectedCells'
    },
    {
        keyCode: 86, // V
        text: 'Ctrl+V',
        description: 'Paste cells from clipboard',
        modifier: 'ctrl',
        functName: 'pasteClipboardCells'
    },
    {
        keyCode: 90, // Z
        text: 'Ctrl+Z',
        description: 'Undo last action',
        modifier: 'ctrl',
        functName: 'undoAction'
    },
    {
        keyCode: 89, // Y
        text: 'Ctrl+Y',
        description: 'Redo last undone action',
        modifier: 'ctrl',
        functName: 'redoAction'
    },
    {
        keyCode: 68, // D
        text: 'Ctrl+D',
        description: 'Duplicate selected cells',
        modifier: 'ctrl',
        functName: 'duplicateSelectedCells'
    },
    {
        keyCode: 88, // X
        text: 'Ctrl+X',
        description: 'Cut selected cells',
        modifier: 'ctrl',
        functName: 'cutSelectedCells'
    },
    {
        keyCode: 46, // Delete
        text: 'Delete',
        description: 'Delete selected cells',
        modifier: null,
        functName: 'deleteSelectedCells'
    },
    {
        keyCode: 65, // A
        text: 'Ctrl+A',
        description: 'Select all cells',
        modifier: 'ctrl',
        functName: 'selectAllCells'
    },
    {
        keyCode: 46, // Delete
        text: 'Ctrl+Shift+Delete',
        description: 'Delete all cells in the graph',
        modifier: 'ctrlShift',
        functName: 'deleteAllCells'
    },
    // {
    //     keyCode: 37, // Left Arrow
    //     text: 'Left Arrow',
    //     description: 'Move selected cells left',
    //     modifier: null,
    //     functName: 'moveLeft'
    // },
    // {
    //     keyCode: 39, // Right Arrow
    //     text: 'Right Arrow',
    //     description: 'Move selected cells right',
    //     modifier: null,
    //     functName: 'moveRight'
    // },
    // {
    //     keyCode: 38, // Up Arrow
    //     text: 'Up Arrow',
    //     description: 'Move selected cells up',
    //     modifier: null,
    //     functName: 'moveUp'
    // },
    // {
    //     keyCode: 40, // Down Arrow
    //     text: 'Down Arrow',
    //     description: 'Move selected cells down',
    //     modifier: null,
    //     functName: 'moveDown'
    // }
];

