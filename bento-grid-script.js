#target illustrator
// This script creates a "Bento Grid" with rounded rectangles that can overlap
// Uses pixels as units and includes margin around the entire grid

function createBentoGrid() {
    // Check if Illustrator is running and a document is open
    if (app.documents.length === 0) {
        alert("Please open an Adobe Illustrator document before running this script.");
        return;
    }
    
    var doc = app.activeDocument;
    
    // Set document units to pixels
    var originalRulerUnits = doc.rulerUnits;
    doc.rulerUnits = RulerUnits.Pixels;
    
    // Check if there are any artboards
    if (doc.artboards.length === 0) {
        alert("No artboards found in the document.");
        doc.rulerUnits = originalRulerUnits;
        return;
    }
    
    var activeArtboardIndex = doc.artboards.getActiveArtboardIndex();
    var artboard = doc.artboards[activeArtboardIndex];
    
    // Get the artboard dimensions (ArtboardRect: [left, top, right, bottom])
    var artboardRect = artboard.artboardRect;
    var artboardWidth = artboardRect[2] - artboardRect[0];
    var artboardHeight = artboardRect[1] - artboardRect[3];
    
    // Dialog for user input
    var rowsInput = prompt("Enter the number of Rows:", "3");
    if (rowsInput === null) {
        doc.rulerUnits = originalRulerUnits;
        return;
    }
    
    var colsInput = prompt("Enter the number of Columns:", "3");
    if (colsInput === null) {
        doc.rulerUnits = originalRulerUnits;
        return;
    }
    
    var gutterInput = prompt("Enter the Gutter (Gap) Size (in pixels):", "12");
    if (gutterInput === null) {
        doc.rulerUnits = originalRulerUnits;
        return;
    }
    
    var marginInput = prompt("Enter the Margin around the grid (in pixels):", "24");
    if (marginInput === null) {
        doc.rulerUnits = originalRulerUnits;
        return;
    }
    
    var cornerRadiusInput = prompt("Enter the Corner Radius for rounded rectangles (in pixels):", "16");
    if (cornerRadiusInput === null) {
        doc.rulerUnits = originalRulerUnits;
        return;
    }
    
    var overlapInput = prompt("Enter the Overlap amount (in pixels, negative for gap):", "-6");
    if (overlapInput === null) {
        doc.rulerUnits = originalRulerUnits;
        return;
    }
    
    var rows = parseInt(rowsInput, 10);
    var cols = parseInt(colsInput, 10);
    var gutterSize = parseFloat(gutterInput);
    var margin = parseFloat(marginInput);
    var cornerRadius = parseFloat(cornerRadiusInput);
    var overlap = parseFloat(overlapInput);
    
    // Validate inputs
    if (isNaN(rows) || rows < 1 || isNaN(cols) || cols < 1 || 
        isNaN(gutterSize) || isNaN(margin) || margin < 0 || 
        isNaN(cornerRadius) || cornerRadius < 0 || isNaN(overlap)) {
        alert("Invalid input. Please enter valid numbers.");
        doc.rulerUnits = originalRulerUnits;
        return;
    }
    
    // --- Calculation ---
    // Available space after margins
    var availableWidth = artboardWidth - (2 * margin);
    var availableHeight = artboardHeight - (2 * margin);
    
    // Effective gutter size (gutter + overlap adjustment)
    var effectiveGutter = gutterSize + overlap;
    
    // Total space taken up by gutters
    var totalGutterWidth = effectiveGutter * (cols - 1);
    var totalGutterHeight = effectiveGutter * (rows - 1);
    
    // Total space available for cells
    var totalCellAreaWidth = availableWidth - totalGutterWidth;
    var totalCellAreaHeight = availableHeight - totalGutterHeight;
    
    // Individual cell dimensions
    var cellWidth = totalCellAreaWidth / cols;
    var cellHeight = totalCellAreaHeight / rows;
    
    // Check if cells have valid dimensions
    if (cellWidth <= 0 || cellHeight <= 0) {
        alert("Error: Grid doesn't fit. Reduce margins, gutters, rows, or columns.");
        doc.rulerUnits = originalRulerUnits;
        return;
    }
    
    // --- Preview Dialog ---
    var previewMsg = "PREVIEW:\n\n";
    previewMsg += "Artboard: " + Math.round(artboardWidth) + "×" + Math.round(artboardHeight) + "px\n";
    previewMsg += "Grid: " + rows + " rows × " + cols + " columns\n";
    previewMsg += "Margin: " + margin + "px\n";
    previewMsg += "Gutter: " + gutterSize + "px\n";
    previewMsg += "Overlap: " + overlap + "px\n";
    previewMsg += "Corner Radius: " + cornerRadius + "px\n\n";
    previewMsg += "Each cell: " + Math.round(cellWidth) + "×" + Math.round(cellHeight) + "px\n\n";
    previewMsg += "Create this grid?";
    
    if (!confirm(previewMsg)) {
        doc.rulerUnits = originalRulerUnits;
        return;
    }
    
    // --- Drawing the Grid ---
    // Create a new group item to hold all the grid cells
    var gridGroup = doc.layers[0].groupItems.add();
    gridGroup.name = "Bento Grid (" + cols + "×" + rows + ")";
    
    // Set up basic cell appearance
    var cellColor = new RGBColor();
    cellColor.red = 230;
    cellColor.green = 230;
    cellColor.blue = 240;
    
    // Store the grid's top-left corner (accounting for margin)
    var startX = artboardRect[0] + margin;
    var startY = artboardRect[1] - margin;
    
    // Draw grid cells
    for (var r = 0; r < rows; r++) {
        for (var c = 0; c < cols; c++) {
            // Calculate position of the top-left corner of the current cell
            var xPos = startX + c * (cellWidth + effectiveGutter);
            var yPos = startY - r * (cellHeight + effectiveGutter);
            
            // Create rounded rectangle
            var rect = gridGroup.pathItems.roundedRectangle(
                yPos,          // top
                xPos,          // left
                cellWidth,     // width
                cellHeight,    // height
                cornerRadius,  // horizontal corner radius
                cornerRadius   // vertical corner radius
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
    
    // Restore original ruler units
    doc.rulerUnits = originalRulerUnits;
    
    // Success Message
    alert("Successfully created a " + rows + "×" + cols + " Bento Grid!");
}

// Run the main function
try {
    app.executeMenuCommand("fitall");
    createBentoGrid();
} catch (e) {
    alert("An error occurred: " + e.message);
}