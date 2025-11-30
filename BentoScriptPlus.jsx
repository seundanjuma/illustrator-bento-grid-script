#target illustrator
// Bento Grid Generator for Adobe Illustrator
// Created by @mrkazuda (x.com/mrkazuda)

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
    
    function encodeSettings(rows, cols, spacing, margin, patternSeed) {
        var combined = (rows << 24) | (cols << 20) | (spacing << 18) | (margin << 8) | (patternSeed & 0xFF);
        return combined.toString(16).toUpperCase();
    }
    
    function decodeSettings(hexCode) {
        var combined = parseInt(hexCode, 16);
        return {
            rows: (combined >> 24) & 0xFF,
            cols: (combined >> 20) & 0x0F,
            spacing: (combined >> 18) & 0x03,
            margin: (combined >> 8) & 0x3FF,
            patternSeed: combined & 0xFF
        };
    }
    
    var dialog = new Window("dialog", "Bento Grid Settings");
    dialog.alignChildren = "fill";
    
    var seedGroup = dialog.add("panel", undefined, "Seed (Optional)");
    seedGroup.alignChildren = "left";
    seedGroup.margins = 15;
    
    var seedInputGroup = seedGroup.add("group");
    seedInputGroup.add("statictext", undefined, "Import Seed:");
    var seedInput = seedInputGroup.add("edittext", undefined, "");
    seedInput.characters = 15;
    seedGroup.add("statictext", undefined, "Leave blank for random layout");
    
    var applyBtn = seedGroup.add("button", undefined, "Apply Seed");
    applyBtn.enabled = false;
    
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
    
    seedInput.onChange = function() {
        var inputText = seedInput.text.replace(/\s/g, "");
        applyBtn.enabled = inputText.length > 0;
    };
    
    applyBtn.onClick = function() {
        var hexCode = seedInput.text.replace(/\s/g, "");
        if (hexCode.length === 0) return;
        
        try {
            var settings = decodeSettings(hexCode);
            
            if (settings.rows > 0 && settings.rows <= 20 && 
                settings.cols > 0 && settings.cols <= 20 && 
                settings.margin >= 0 && settings.margin <= 200) {
                
                rowsInput.text = settings.rows.toString();
                colsInput.text = settings.cols.toString();
                marginInput.text = settings.margin.toString();
                
                spacingRadio1.value = (settings.spacing === 1);
                spacingRadio2.value = (settings.spacing === 2);
                spacingRadio3.value = (settings.spacing === 3);
                
                if (!spacingRadio1.value && !spacingRadio2.value && !spacingRadio3.value) {
                    spacingRadio2.value = true;
                }
            }
        } catch (e) {
            alert("Invalid seed code. Please check and try again.");
        }
    };
    
    if (dialog.show() === 2) {
        doc.rulerUnits = originalRulerUnits;
        return;
    }
    
    var gutterPercentage;
    var spacingCode;
    if (spacingRadio1.value) {
        gutterPercentage = 2.5;
        spacingCode = 1;
    } else if (spacingRadio3.value) {
        gutterPercentage = 7.5;
        spacingCode = 3;
    } else {
        gutterPercentage = 5;
        spacingCode = 2;
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
    
    var importedSeed = seedInput.text.replace(/\s/g, "");
    var patternSeed;
    
    if (importedSeed !== "" && importedSeed.length > 0) {
        try {
            var decodedSettings = decodeSettings(importedSeed);
            patternSeed = decodedSettings.patternSeed;
        } catch (e) {
            patternSeed = Math.floor(Math.random() * 256);
        }
    } else {
        patternSeed = Math.floor(Math.random() * 256);
    }
    
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
    
    var seedHistory = [patternSeed];
    var historyIndex = 0;
    var currentLayout = generateLayout(patternSeed);
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
        
        var prevBtn = btnGroup.add("button", undefined, "Previous");
        prevBtn.preferredSize = [100, 35];
        prevBtn.enabled = historyIndex > 0;
        
        var nextBtn = btnGroup.add("button", undefined, "Next");
        nextBtn.preferredSize = [100, 35];
        
        var regenBtn = btnGroup.add("button", undefined, "Regenerate");
        regenBtn.preferredSize = [100, 35];
        
        var exportBtn = btnGroup.add("button", undefined, "Export Seed");
        exportBtn.preferredSize = [100, 35];
        
        var useBtn = btnGroup.add("button", undefined, "Use This Layout");
        useBtn.preferredSize = [130, 35];
        
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
        
        prevBtn.onClick = function() {
            action = 4;
            previewDialog.close();
        };
        
        exportBtn.onClick = function() {
            action = 5;
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
            
            if (historyIndex < seedHistory.length - 1) {
                historyIndex++;
                patternSeed = seedHistory[historyIndex];
            } else {
                patternSeed = (patternSeed + 17) % 256;
                historyIndex++;
                seedHistory[historyIndex] = patternSeed;
            }
            
            currentLayout = generateLayout(patternSeed);
            currentPreview = drawGrid(currentLayout);
            app.redraw();
        } else if (action === 3) {
            currentPreview.remove();
            patternSeed = Math.floor(Math.random() * 256);
            historyIndex++;
            seedHistory[historyIndex] = patternSeed;
            seedHistory.length = historyIndex + 1;
            currentLayout = generateLayout(patternSeed);
            currentPreview = drawGrid(currentLayout);
            app.redraw();
        } else if (action === 4) {
            currentPreview.remove();
            historyIndex--;
            patternSeed = seedHistory[historyIndex];
            currentLayout = generateLayout(patternSeed);
            currentPreview = drawGrid(currentLayout);
            app.redraw();
        } else if (action === 5) {
            var fullSeed = encodeSettings(rows, cols, spacingCode, margin, patternSeed);
            
            var seedDialog = new Window("dialog", "Export Seed");
            seedDialog.alignChildren = "center";
            seedDialog.margins = 20;
            
            seedDialog.add("statictext", undefined, "Current Layout Seed:");
            
            var seedText = seedDialog.add("edittext", undefined, fullSeed);
            seedText.characters = 20;
            seedText.active = true;
            
            seedDialog.add("statictext", undefined, "Copy this code to recreate this exact layout later.");
            seedDialog.add("statictext", undefined, "This seed contains all grid settings and the layout pattern.");
            
            var okBtn = seedDialog.add("button", undefined, "OK", {name: "ok"});
            
            seedDialog.show();
        }
    }
    
    app.redraw();
    doc.rulerUnits = originalRulerUnits;
    
    var fullSeed = encodeSettings(rows, cols, spacingCode, margin, patternSeed);
    
    var summary = "Successfully created a Bento Grid!\n\n" +
                  "Cells: " + currentLayout.length + "\n" +
                  "Gutter: " + gutterSize + "px (" + gutterPercentage + "%)\n" +
                  "Corner Radius: " + cornerRadius + "px\n" +
                  "Grid: " + cols + " x " + rows + "\n" +
                  "Seed: " + fullSeed;
    
    alert(summary);
}

try {
    createBentoGrid();
} catch (e) {
    alert("An error occurred: " + e.message);
}