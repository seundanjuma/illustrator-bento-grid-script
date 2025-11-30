function createBentoGrid() {
  // Check if Illustrator is running and a document is open
  if (app.documents.length === 0) {
    alert(
      "Please open an Adobe Illustrator document before running this script."
    );
    return;
  }

  var doc = app.activeDocument;

  // Set document units to pixels
  var originalRulerUnits = doc.rulerUnits;
  doc.rulerUnits = RulerUnits.Pixels;

  // Check if a rectangle is selected
  if (doc.selection.length === 0) {
    alert(
      "Please select a rectangle first.\n\nThe script will use this rectangle as the container for your Bento Grid."
    );
    doc.rulerUnits = originalRulerUnits;
    return;
  }

  var selectedItem = doc.selection[0];

  // Check if selected item is a path item (rectangle)
  if (selectedItem.typename !== "PathItem") {
    alert(
      "Please select a rectangle shape.\n\nThe selected object must be a rectangle path."
    );
    doc.rulerUnits = originalRulerUnits;
    return;
  }

  // Get the bounds of the selected rectangle [left, top, right, bottom]
  var bounds = selectedItem.geometricBounds;
  var containerWidth = bounds[2] - bounds[0];
  var containerHeight = bounds[1] - bounds[3];
  var startX = bounds[0];
  var startY = bounds[1];

  // Store reference to container layer
  var containerLayer = selectedItem.layer;

  // --- Create Dialog Window ---
  var dialog = new Window("dialog", "Bento Grid Settings");
  dialog.alignChildren = "fill";

  // Spacing Style Group
  var spacingGroup = dialog.add("panel", undefined, "Spacing Style");
  spacingGroup.alignChildren = "left";
  spacingGroup.margins = 15;

  var spacingRadio1 = spacingGroup.add(
    "radiobutton",
    undefined,
    "Tight (2-3% gutter)"
  );
  var spacingRadio2 = spacingGroup.add(
    "radiobutton",
    undefined,
    "Comfortable (4-6% gutter) [RECOMMENDED]"
  );
  var spacingRadio3 = spacingGroup.add(
    "radiobutton",
    undefined,
    "Spacious (7-8% gutter)"
  );
  spacingRadio2.value = true; // Default to Comfortable

  // Grid Configuration Group
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

  var cellsGroup = gridGroup.add("group");
  cellsGroup.add("statictext", undefined, "Number of Cells:");
  var cellsInput = cellsGroup.add("edittext", undefined, "7");
  cellsInput.characters = 5;

  var marginGroup = gridGroup.add("group");
  marginGroup.add("statictext", undefined, "Margin (px):");
  var marginInput = marginGroup.add("edittext", undefined, "32");
  marginInput.characters = 5;

  // Buttons
  var buttonGroup = dialog.add("group");
  buttonGroup.alignment = "center";
  var okButton = buttonGroup.add("button", undefined, "Create Grid", {
    name: "ok",
  });
  var cancelButton = buttonGroup.add("button", undefined, "Cancel", {
    name: "cancel",
  });

  // Show dialog
  if (dialog.show() === 2) {
    // Cancel
    doc.rulerUnits = originalRulerUnits;
    return;
  }

  // Get values from dialog
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
  var cellCount = parseInt(cellsInput.text, 10);
  var margin = parseFloat(marginInput.text);

  // Validate inputs
  if (
    isNaN(rows) ||
    rows < 1 ||
    isNaN(cols) ||
    cols < 1 ||
    isNaN(margin) ||
    margin < 0 ||
    isNaN(cellCount) ||
    cellCount < 1
  ) {
    alert("Invalid input. Please enter valid numbers.");
    doc.rulerUnits = originalRulerUnits;
    return;
  }

  // --- Grid Calculation ---
  var availableWidth = containerWidth - 2 * margin;
  var availableHeight = containerHeight - 2 * margin;

  // Calculate base cell dimensions
  var baseCellWidth = availableWidth / cols;
  var baseCellHeight = availableHeight / rows;

  // Calculate gutter based on smallest cell dimension
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

  // Calculate consistent corner radius based on smallest 1x1 cell
  // iOS/Apple formula: √(width × height) / 10, rounded up
  var cornerRadius = Math.ceil(Math.sqrt(cellWidth * cellHeight) / 10);

  // Adjust start position for margin
  startX = startX + margin;
  startY = startY - margin;

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
        colSpan: colSpan,
      });

      cellIndex++;
    }
  }

  // --- Drawing the Grid ---
  var gridGroup = containerLayer.groupItems.add();
  gridGroup.name = "Bento Grid (" + cols + "×" + rows + ")";

  var cellColor = new RGBColor();
  cellColor.red = 245;
  cellColor.green = 245;
  cellColor.blue = 245;

  var strokeColor = new RGBColor();
  strokeColor.red = 226;
  strokeColor.green = 232;
  strokeColor.blue = 240;

  // Draw each cell with consistent corner radius
  for (var i = 0; i < cells.length; i++) {
    var cell = cells[i];

    var xPos = startX + cell.col * (cellWidth + gutterSize);
    var yPos = startY - cell.row * (cellHeight + gutterSize);

    var width = cell.colSpan * cellWidth + (cell.colSpan - 1) * gutterSize;
    var height = cell.rowSpan * cellHeight + (cell.rowSpan - 1) * gutterSize;

    // Use consistent corner radius for all cells
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

  // Delete the original container rectangle
  selectedItem.remove();

  // Select the new grid
  gridGroup.selected = true;
  app.redraw();

  doc.rulerUnits = originalRulerUnits;

  var summary =
    "Successfully created a Bento Grid!\n\n" +
    "Cells: " +
    cells.length +
    "\n" +
    "Gutter: " +
    gutterSize +
    "px (" +
    gutterPercentage +
    "%)\n" +
    "Corner Radius: " +
    cornerRadius +
    "px\n" +
    "Grid: " +
    cols +
    "×" +
    rows;

  alert(summary);
}

// Run the main function
try {
  createBentoGrid();
} catch (e) {
  alert("An error occurred: " + e.message);
}
