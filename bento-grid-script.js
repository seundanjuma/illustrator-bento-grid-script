#target illustrator

function createBentoGrid() {
    if (app.documents.length === 0) {
        alert("Please open an Adobe Illustrator document before running this script.");
        return;
    }
    
    var doc = app.activeDocument;
    var originalRulerUnits = doc.rulerUnits;
    doc.rulerUnits = RulerUnits.Pixels;
    
    if (doc.selection.length === 0) {
        alert("Please select a rectangle first.\n\nThe script will use this rectangle as the container for your Bento Grid.");
        doc.rulerUnits = originalRulerUnits;
        return;
    }
    
    var selectedItem = doc.selection[0];
    
    if (selectedItem.typename !== "PathItem") {
        alert("Please select a rectangle shape.\n\nThe selected object must be a rectangle path.");
        doc.rulerUnits = originalRulerUnits;
        return;
    }
    
    var bounds = selectedItem.geometricBounds;
    var containerWidth = bounds[2] - bounds[0];
    var containerHeight = bounds[1] - bounds[3];
    var startX = bounds[0];
    var startY = bounds[1];
    var containerLayer = selectedItem.layer;
    
    var dialog = new Window("dialog", "Bento Grid Settings");
    dialog.alignChildren = "fill";
    
    var spacingGroup = dialog.add("panel", undefined, "Spacing Style");
    spacingGroup.alignChildren = "left";
    spacingGroup.margins = 15;
    
    var spacingRadio1 = spacingGroup.add("radiobutton", undefined, "Tight (2-3% gutter)");
    var spacingRadio2 = spacingGroup.add("radiobutton", undefined, "Comfortable (4-6% gutter) [RECOMMENDED]");
    var spacingRadio3 = spacingGroup.add("radiobutton", undefined, "Spacious (7-8% gutter)");
    spacingRadio2.value = true;
    
    var gridGroup = dialog.add("panel", undefined, "Grid Configuration");
    gridGroup.alignChildren = "left";
    gridGroup.margins = 15;
    
    var rowsGroup = gridGroup.add("group");
    rowsGroup.add("statictext", undefined, "Rows:");
    var rowsInput = rowsGroup.add("edittext", undefined, "4");
    rowsInput.characters = 5;
    
    var colsGroup = gridGroup.add("group");
    colsGroup.add("statictext", undefined, "Columns:");
    var colsInput = colsGroup.add("edittext", undefined, "3");
    colsInput.characters = 5;
    
    var marginGroup = gridGroup.add("group");
    marginGroup.add("statictext", undefined, "Margin (px):");
    var marginInput = marginGroup.add("edittext", undefined, "32");
    marginInput.characters = 5;
    
    var buttonGroup = dialog.add("group");
    buttonGroup.alignment = "center";
    var okButton = buttonGroup.add("button", undefined, "Continue to Preview", {name: "ok"});
    var cancelButton = buttonGroup.add("button", undefined, "Cancel", {name: "cancel"});
    
    if (dialog.show() === 2) {
        doc.rulerUnits = originalRulerUnits;
        return;
    }
    
    var gutterPercentage;
    if (spacingRadio1.value) {
        gutterPercentage = 2.5;
    } else if (spacingRadio3.value) {
        gutterPercentage = 7.5;
    } else {
        gutterPercentage = 5;
    }
    
    var rows = parseInt(rowsInput.text, 10);
    var cols = parseInt(colsInput.text, 10);
    var margin = parseFloat(marginInput.text);
    
    if (isNaN(rows) || rows < 1 || isNaN(cols) || cols < 1 || isNaN(margin) || margin < 0) {
        alert("Invalid input. Please enter valid numbers.");
        doc.rulerUnits = originalRulerUnits;
        return;
    }
    
    var availableWidth = containerWidth - (2 * margin);
    var availableHeight = containerHeight - (2 * margin);
    
    var baseCellWidth = availableWidth / cols;
    var baseCellHeight = availableHeight / rows;
    
    var smallestDimension = Math.min(baseCellWidth, baseCellHeight);
    var gutterSize = Math.ceil(smallestDimension * (gutterPercentage / 100));
    
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
    
    var cornerRadius = Math.ceil(Math.sqrt(cellWidth * cellHeight) / 10);
    var gridStartX = startX + margin;
    var gridStartY = startY - margin;
    
    function generateLayout(seed) {
        var cells = [];
        var gridOccupied = [];
        
        for (var r = 0; r < rows; r++) {
            gridOccupied[r] = [];
            for (var c = 0; c < cols; c++) {
                gridOccupied[r][c] = false;
            }
        }
        
        var cellIndex = 0;
        
        for (var r = 0; r < rows; r++) {
            for (var c = 0; c < cols; c++) {
                if (gridOccupied[r][c]) continue;
                
                var colSpan = 1;
                var rowSpan = 1;
                
                var canSpanRight = (c + 1 < cols) && !gridOccupied[r][c + 1];
                var canSpanDown = (r + 1 < rows) && !gridOccupied[r + 1][c];
                
                var randVal = (seed + cellIndex * 13) % 100;
                
                if (canSpanRight && randVal < 40) {
                    var canSpan2Cols = true;
                    for (var checkRow = r; checkRow < r + 1; checkRow++) {
                        if (gridOccupied[checkRow][c + 1]) {
                            canSpan2Cols = false;
                            break;
                        }
                    }
                    if (canSpan2Cols) colSpan = 2;
                }
                
                if (canSpanDown && randVal > 60 && randVal < 80) {
                    var canSpan2Rows = true;
                    for (var checkCol = c; checkCol < c + colSpan; checkCol++) {
                        if (checkCol < cols && gridOccupied[r + 1][checkCol]) {
                            canSpan2Rows = false;
                            break;
                        }
                    }
                    if (canSpan2Rows) rowSpan = 2;
                }
                
                var spanAvailable = true;
                for (var sr = r; sr < r + rowSpan && sr < rows; sr++) {
                    for (var sc = c; sc < c + colSpan && sc < cols; sc++) {
                        if (gridOccupied[sr][sc]) {
                            spanAvailable = false;
                            break;
                        }
                    }
                    if (!spanAvailable) break;
                }
                
                if (!spanAvailable && colSpan > 1) {
                    colSpan = 1;
                    rowSpan = 1;
                    spanAvailable = true;
                }
                
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
        
        return cells;
    }
    
    function drawGrid(cells) {
        var gridGroup = containerLayer.groupItems.add();
        gridGroup.name = "Bento Grid Preview";
        
        var cellColor = new RGBColor();
        cellColor.red = 245;
        cellColor.green = 245;
        cellColor.blue = 245;
        
        var strokeColor = new RGBColor();
        strokeColor.red = 226;
        strokeColor.green = 232;
        strokeColor.blue = 240;
        
        for (var i = 0; i < cells.length; i++) {
            var cell = cells[i];
            
            var xPos = gridStartX + cell.col * (cellWidth + gutterSize);
            var yPos = gridStartY - cell.row * (cellHeight + gutterSize);
            
            var width = cell.colSpan * cellWidth + (cell.colSpan - 1) * gutterSize;
            var height = cell.rowSpan * cellHeight + (cell.rowSpan - 1) * gutterSize;
            
            var rect = containerLayer.pathItems.roundedRectangle(
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
        
        return gridGroup;
    }
    
    var currentSeed = Math.floor(Math.random() * 1000);
    var currentLayout = generateLayout(currentSeed);
    var currentPreview = drawGrid(currentLayout);
    app.redraw();
    
    var keepGoing = true;
    
    while (keepGoing) {
        var previewDialog = new Window("dialog", "Preview Layout");
        previewDialog.alignChildren = "center";
        previewDialog.margins = 20;
        
        previewDialog.add("statictext", undefined, "Preview is now showing on your artboard.");
        previewDialog.add("statictext", undefined, "Choose an action:");
        
        var btnGroup = previewDialog.add("group");
        btnGroup.orientation = "row";
        btnGroup.spacing = 10;
        
        var useBtn = btnGroup.add("button", undefined, "Use This Layout");
        useBtn.preferredSize = [130, 35];
        
        var nextBtn = btnGroup.add("button", undefined, "Show Next");
        nextBtn.preferredSize = [130, 35];
        
        var regenBtn = btnGroup.add("button", undefined, "Regenerate");
        regenBtn.preferredSize = [130, 35];
        
        var cancelBtn = previewDialog.add("button", undefined, "Cancel", {name: "cancel"});
        
        var action = 0;
        
        useBtn.onClick = function() {
            action = 1;
            previewDialog.close();
        };
        
        nextBtn.onClick = function() {
            action = 2;
            previewDialog.close();
        };
        
        regenBtn.onClick = function() {
            action = 3;
            previewDialog.close();
        };
        
        var result = previewDialog.show();
        
        if (result === 2 || action === 0) {
            currentPreview.remove();
            doc.rulerUnits = originalRulerUnits;
            return;
        }
        
        if (action === 1) {
            currentPreview.name = "Bento Grid (" + cols + "×" + rows + ")";
            selectedItem.remove();
            currentPreview.selected = true;
            keepGoing = false;
        } else if (action === 2) {
            currentPreview.remove();
            currentSeed += 17;
            currentLayout = generateLayout(currentSeed);
            currentPreview = drawGrid(currentLayout);
            app.redraw();
        } else if (action === 3) {
            currentPreview.remove();
            currentSeed = Math.floor(Math.random() * 1000);
            currentLayout = generateLayout(currentSeed);
            currentPreview = drawGrid(currentLayout);
            app.redraw();
        }
    }
    
    app.redraw();
    doc.rulerUnits = originalRulerUnits;
    
    var summary = "Successfully created a Bento Grid!\n\n" +
                  "Cells: " + currentLayout.length + "\n" +
                  "Gutter: " + gutterSize + "px (" + gutterPercentage + "%)\n" +
                  "Corner Radius: " + cornerRadius + "px\n" +
                  "Grid: " + cols + "×" + rows;
    
    alert(summary);
}

try {
    createBentoGrid();
} catch (e) {
    alert("An error occurred: " + e.message);
}