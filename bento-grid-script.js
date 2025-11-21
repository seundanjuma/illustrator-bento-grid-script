#target illustrator
// This script creates a "Bento Grid" with cells that can span multiple rows/columns
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
    
    // Get the artboard dimensions
    var artboardRect = artboard.artboardRect;
    var artboardWidth = artboardRect[2] - artboardRect[0];
    var artboardHeight = artboardRect[1] - artboardRect[3];
    
    // Dialog for user input
    var rowsInput = prompt("Enter the number of Rows:", "4");
    if (rowsInput === null) {
        doc.rulerUnits = originalRulerUnits;
        return;
    }
    
    var colsInput = prompt("Enter the number of Columns:", "3");
    if (colsInput === null) {
        doc.rulerUnits = originalRulerUnits;
        return;
    }
    
    var gutterInput = prompt("Enter the Gutter (Gap) Size (in pixels):", "16");
    if (gutterInput === null) {
        doc.rulerUnits = originalRulerUnits;
        return;
    }
    
    var marginInput = prompt("Enter the Margin around the grid (in pixels):", "32");
    if (marginInput === null) {
        doc.rulerUnits = originalRulerUnits;
        return;
    }
    
    var cornerRadiusInput = prompt("Enter the Corner Radius (in pixels):", "12");
    if (cornerRadiusInput === null) {
        doc.rulerUnits = originalRulerUnits;
        return;
    }
    
    var cellCountInput = prompt("How many cells do you want?", "7");
    if (cellCountInput === null) {
        doc.rulerUnits = originalRulerUnits;
        return;
    }
    
    var rows = parseInt(rowsInput, 10);
    var cols = parseInt(colsInput, 10);
    var gutterSize = parseFloat(gutterInput);
    var margin = parseFloat(marginInput);
    var cornerRadius = parseFloat(cornerRadiusInput);
    var cellCount = parseInt(cellCountInput, 10);
    
    // Validate inputs
    if (isNaN(rows) || rows < 1 || isNaN(cols) || cols < 1 || 
        isNaN(gutterSize) || isNaN(margin) || margin < 0 || 
        isNaN(cornerRadius) || cornerRadius < 0 || isNaN(cellCount) || cellCount < 1) {
        alert("Invalid input. Please enter valid numbers.");
        doc.rulerUnits = originalRulerUnits;
        return;
    }
    
    // --- Grid Calculation ---
    var availableWidth = artboardWidth - (2 * margin);
    var availableHeight = artboardHeight - (2 * margin);
    
    var totalGutterWidth = gutterSize * (cols - 1);
    var totalGutterHeight = gutterSize * (rows - 1);
    
    var totalCellAreaWidth = availableWidth - totalGutterWidth;
    var totalCellAreaHeight = availableHeight - totalGutterHeight;
    
    var cellWidth = totalCellAreaWidth / cols;
    var cellHeight = totalCellAreaHeight / rows;
    
    if (cellWidth <= 0 || cellHeight <= 0) {
        alert("Error: Grid doesn't fit. Reduce margins, gutters, rows, or columns.");
        doc.rulerUnits = originalRulerUnits;
        return;
    }
    
    var startX = artboardRect[0] + margin;
    var startY = artboardRect[1] - margin;
    
    // --- Define Bento Grid Layout ---
    // Each cell defined as: {row, col, rowSpan, colSpan}
    var cells = [];
    
    // Simple algorithm: create cells with varied spans
    var cellIndex = 0;
    var gridOccupied = []; // Track which grid positions are occupied
    
    // Initialize grid tracking
    for (var r = 0; r < rows; r++) {
        gridOccupied[r] = [];
        for (var c = 0; c < cols; c++) {
            gridOccupied[r][c] = false;
        }
    }
    
    // Place cells with varied spans
    for (var r = 0; r < rows && cellIndex < cellCount; r++) {
        for (var c = 0; c < cols && cellIndex < cellCount; c++) {
            if (gridOccupied[r][c]) continue;
            
            // Randomly decide span (with some logic)
            var colSpan = 1;
            var rowSpan = 1;
            
            // Every 3rd or 4th cell gets a wider span
            if ((cellIndex + 1) % 3 === 0 || (cellIndex + 1) % 4 === 0) {
                if (c + 1 < cols && !gridOccupied[r][c + 1]) {
                    colSpan = 2;
                }
            }
            
            // Some cells get taller
            if ((cellIndex + 1) % 5 === 0) {
                if (r + 1 < rows && !gridOccupied[r + 1][c]) {
                    rowSpan = 2;
                }
            }
            
            // Verify the span fits
            var spanFits = true;
            for (var sr = r; sr < r + rowSpan && sr < rows; sr++) {
                for (var sc = c; sc < c + colSpan && sc < cols; sc++) {
                    if (gridOccupied[sr][sc]) {
                        spanFits = false;
                        break;
                    }
                }
                if (!spanFits) break;
            }
            
            // If span doesn't fit, use 1x1
            if (!spanFits) {
                colSpan = 1;
                rowSpan = 1;
            }
            
            // Mark grid as occupied
            for (var sr = r; sr < r + rowSpan; sr++) {
                for (var sc = c; sc < c + colSpan; sc++) {
                    gridOccupied[sr][sc] = true;
                }
            }
            
            cells.push({
                row: r,
                col: c,
                rowSpan: rowSpan,
                colSpan: colSpan
            });
            
            cellIndex++;
        }
    }
    
    // --- Drawing the Grid ---
    var gridGroup = doc.layers[0].groupItems.add();
    gridGroup.name = "Bento Grid (" + cols + "×" + rows + ")";
    
    var cellColor = new RGBColor();
    cellColor.red = 245;
    cellColor.green = 245;
    cellColor.blue = 245;
    
    // Draw each cell
    for (var i = 0; i < cells.length; i++) {
        var cell = cells[i];
        
        var xPos = startX + cell.col * (cellWidth + gutterSize);
        var yPos = startY - cell.row * (cellHeight + gutterSize);
        
        var width = cell.colSpan * cellWidth + (cell.colSpan - 1) * gutterSize;
        var height = cell.rowSpan * cellHeight + (cell.rowSpan - 1) * gutterSize;
        
        // Create rounded rectangle
        var rect = doc.layers[0].pathItems.roundedRectangle(
            yPos,
            xPos,
            width,
            height,
            cornerRadius,
            cornerRadius
        );
        
        rect.filled = true;
        rect.fillColor = cellColor;
        rect.stroked = true;
        
        var strokeColor = new RGBColor();
        strokeColor.red = 226;
        strokeColor.green = 232;
        strokeColor.blue = 240;
        rect.strokeColor = strokeColor;
        rect.strokeWidth = 2;
        
        rect.move(gridGroup, ElementPlacement.PLACEATEND);
    }
    
    gridGroup.selected = true;
    app.redraw();
    
    doc.rulerUnits = originalRulerUnits;
    
    alert("Successfully created a Bento Grid with " + cells.length + " cells!");
}

// Run the main function
try {
    app.executeMenuCommand("fitall");
    createBentoGrid();
} catch (e) {
    alert("An error occurred: " + e.message);
}