#target illustrator
// This script creates a "Bento Grid" with cells that can span multiple rows/columns
// Uses design principles for optimal spacing and corner radius

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
    
    // --- Step 1: Spacing Style ---
    var spacingInput = prompt(
        "Choose spacing style:\n\n" +
        "1 - Tight (2-3% gutter)\n" +
        "2 - Comfortable (4-6% gutter) [RECOMMENDED]\n" +
        "3 - Spacious (7-8% gutter)",
        "2"
    );
    
    if (spacingInput === null) {
        doc.rulerUnits = originalRulerUnits;
        return;
    }
    
    var spacingStyle = parseInt(spacingInput, 10);
    var gutterPercentage;
    
    switch (spacingStyle) {
        case 1:
            gutterPercentage = 2.5; // Tight: 2.5%
            break;
        case 3:
            gutterPercentage = 7.5; // Spacious: 7.5%
            break;
        default:
            gutterPercentage = 5; // Comfortable: 5%
    }
    
    // --- Step 2: Grid Configuration ---
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
    
    var marginInput = prompt("Enter the Margin around the grid (in pixels):", "32");
    if (marginInput === null) {
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
    var margin = parseFloat(marginInput);
    var cellCount = parseInt(cellCountInput, 10);
    
    // Validate inputs
    if (isNaN(rows) || rows < 1 || isNaN(cols) || cols < 1 || 
        isNaN(margin) || margin < 0 || isNaN(cellCount) || cellCount < 1) {
        alert("Invalid input. Please enter valid numbers.");
        doc.rulerUnits = originalRulerUnits;
        return;
    }
    
    // --- Grid Calculation ---
    var availableWidth = artboardWidth - (2 * margin);
    var availableHeight = artboardHeight - (2 * margin);
    
    // Calculate base cell dimensions (without gutters first)
    var baseCellWidth = availableWidth / cols;
    var baseCellHeight = availableHeight / rows;
    
    // Calculate gutter based on smallest cell dimension and percentage
    var smallestDimension = Math.min(baseCellWidth, baseCellHeight);
    var gutterSize = Math.ceil(smallestDimension * (gutterPercentage / 100));
    
    // Recalculate with gutters
    var totalGutterWidth = gutterSize * (cols - 1);
    var totalGutterHeight = gutterSize * (rows - 1);
    
    var totalCellAreaWidth = availableWidth - totalGutterWidth;
    var totalCellAreaHeight = availableHeight - totalGutterHeight;
    
    var cellWidth = totalCellAreaWidth / cols;
    var cellHeight = totalCellAreaHeight / rows;
    
    if (cellWidth <= 0 || cellHeight <= 0) {
        alert("Error: Grid doesn't fit. Reduce margins, rows, or columns.");
        doc.rulerUnits = originalRulerUnits;
        return;
    }
    
    var startX = artboardRect[0] + margin;
    var startY = artboardRect[1] - margin;
    
    // --- Define Bento Grid Layout ---
    var cells = [];
    var gridOccupied = [];
    
    // Initialize grid tracking
    for (var r = 0; r < rows; r++) {
        gridOccupied[r] = [];
        for (var c = 0; c < cols; c++) {
            gridOccupied[r][c] = false;
        }
    }
    
    // Place cells with varied spans
    var cellIndex = 0;
    for (var r = 0; r < rows && cellIndex < cellCount; r++) {
        for (var c = 0; c < cols && cellIndex < cellCount; c++) {
            if (gridOccupied[r][c]) continue;
            
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
    
    var strokeColor = new RGBColor();
    strokeColor.red = 226;
    strokeColor.green = 232;
    strokeColor.blue = 240;
    
    // Draw each cell
    for (var i = 0; i < cells.length; i++) {
        var cell = cells[i];
        
        var xPos = startX + cell.col * (cellWidth + gutterSize);
        var yPos = startY - cell.row * (cellHeight + gutterSize);
        
        var width = cell.colSpan * cellWidth + (cell.colSpan - 1) * gutterSize;
        var height = cell.rowSpan * cellHeight + (cell.rowSpan - 1) * gutterSize;
        
        // iOS/Apple formula for corner radius: √(width × height) / 10, rounded up
        var cornerRadius = Math.ceil(Math.sqrt(width * height) / 10);
        
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
        rect.strokeColor = strokeColor;
        rect.strokeWidth = 2;
        
        rect.move(gridGroup, ElementPlacement.PLACEATEND);
    }
    
    gridGroup.selected = true;
    app.redraw();
    
    doc.rulerUnits = originalRulerUnits;
    
    var summary = "Successfully created a Bento Grid!\n\n" +
                  "Cells: " + cells.length + "\n" +
                  "Gutter: " + gutterSize + "px (" + gutterPercentage + "%)\n" +
                  "Grid: " + cols + "×" + rows;
    
    alert(summary);
}

// Run the main function
try {
    app.executeMenuCommand("fitall");
    createBentoGrid();
} catch (e) {
    alert("An error occurred: " + e.message);
}