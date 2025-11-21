#target illustrator
// This script creates a responsive "Bento Grid" (a grid of uniformly sized, spaced rectangles)
// that fills the bounds of the active Artboard in Adobe Illustrator.

function createBentoGrid() {
    // Check if Illustrator is running and a document is open
    if (app.documents.length === 0) {
        alert("Please open an Adobe Illustrator document before running this script.");
        return;
    }
    
    var doc = app.activeDocument;
    
    // Check if there are any artboards
    if (doc.artboards.length === 0) {
        alert("No artboards found in the document.");
        return;
    }
    
    var activeArtboardIndex = doc.artboards.getActiveArtboardIndex();
    var artboard = doc.artboards[activeArtboardIndex];
    
    // Get the artboard dimensions (ArtboardRect: [left, top, right, bottom])
    var artboardRect = artboard.artboardRect;
    var artboardWidth = artboardRect[2] - artboardRect[0];
    var artboardHeight = artboardRect[1] - artboardRect[3];
    
    // Dialog for user input
    var rowsInput = prompt("Enter the number of Rows:", "4");
    if (rowsInput === null) return; // User cancelled
    
    var colsInput = prompt("Enter the number of Columns:", "4");
    if (colsInput === null) return; // User cancelled
    
    var gutterInput = prompt("Enter the Gutter (Gap) Size (in pts):", "10");
    if (gutterInput === null) return; // User cancelled
    
    var rows = parseInt(rowsInput, 10);
    var cols = parseInt(colsInput, 10);
    var gutterSize = parseFloat(gutterInput);
    
    // Validate inputs
    if (isNaN(rows) || rows < 1 || isNaN(cols) || cols < 1 || isNaN(gutterSize) || gutterSize < 0) {
        alert("Invalid input. Please enter valid positive numbers for Rows, Columns, and a non-negative number for Gutter Size.");
        return;
    }
    
    // --- Calculation ---
    // Total space taken up by gutters
    var totalGutterWidth = gutterSize * (cols - 1);
    var totalGutterHeight = gutterSize * (rows - 1);
    
    // Check if gutters are too large for the artboard
    if (totalGutterWidth >= artboardWidth || totalGutterHeight >= artboardHeight) {
        alert("Error: Gutter size is too large for the given number of rows and columns. The grid cannot fit on the artboard.");
        return;
    }
    
    // Total space available for cells
    var totalCellAreaWidth = artboardWidth - totalGutterWidth;
    var totalCellAreaHeight = artboardHeight - totalGutterHeight;
    
    // Individual cell dimensions (uniform size)
    var cellWidth = totalCellAreaWidth / cols;
    var cellHeight = totalCellAreaHeight / rows;
    
    // Check if cells have valid dimensions
    if (cellWidth <= 0 || cellHeight <= 0) {
        alert("Error: Calculated cell dimensions are invalid. Please adjust your grid parameters.");
        return;
    }
    
    // --- Drawing the Grid ---
    // Create a new group item to hold all the grid cells
    var gridGroup = doc.layers[0].groupItems.add();
    gridGroup.name = "Bento Grid (" + cols + "x" + rows + ")";
    
    // Set up basic cell appearance
    var cellColor = new RGBColor();
    cellColor.red = 230;
    cellColor.green = 230;
    cellColor.blue = 240;
    
    // Store the Artboard's top-left corner
    var startX = artboardRect[0];
    var startY = artboardRect[1];
    
    // Draw grid cells
    for (var r = 0; r < rows; r++) {
        for (var c = 0; c < cols; c++) {
            // Calculate position of the top-left corner of the current cell
            var xPos = startX + c * (cellWidth + gutterSize);
            var yPos = startY - r * (cellHeight + gutterSize);
            
            // Create the rectangle
            var rect = gridGroup.pathItems.rectangle(
                yPos,          // top
                xPos,          // left
                cellWidth,     // width
                cellHeight     // height
            );
            
            // Apply styling
            rect.filled = true;
            rect.fillColor = cellColor;
            rect.stroked = false;
        }
    }
    
    // Select the newly created group
    gridGroup.selected = true;
    app.redraw();
    
    // Success Message
    alert("Successfully created a " + rows + "x" + cols + " Bento Grid with " + gutterSize + "pt gutters!");
}

// Run the main function
try {
    app.executeMenuCommand("fitall"); // Fit artboard to screen for better visual context
    createBentoGrid();
} catch (e) {
    alert("An error occurred: " + e.message);
}