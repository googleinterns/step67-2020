/* Class representing Table, used for sorting and rendering.*/
//TODO: Check which additional functions need to be bound in constructor
class Table {
  constructor(dataTable, name, colSchemas, id, isEmpty) {
    this.name = name;
    this.colSchemas = colSchemas;
    this.id = id;
    this.isEmpty = isEmpty;
    this.dataTable = new Array(dataTable.length); // Number rows
    this.sortDirections = new Array(colSchemas.length); // Number cols
    this.makeTableWithTypes(dataTable);
    this.setTable = this.setTable.bind(this);

    this.page = 0;
  }

  getName() {
    return this.name;
  }

  getDataTable() {
    return this.dataTable;
  }

  getDataType(colIndex) {
    const colSchema = this.colSchemas[colIndex];
    return colSchema.schemaType;
  }

  // Initialize table with actual column types
  makeTableWithTypes(dataTable) {
    let rowIndex = 0;
    for (rowIndex in dataTable) {
      const row = dataTable[rowIndex];
      this.dataTable[rowIndex] = new Array(row.length);
  
      let col;
      for (col in row) {
        const cell = row[col];
        const type = this.getDataType(col);
        if (cell == "NULL") {
          this.dataTable[rowIndex][col] = "";
        } else {
          if (type == "INT64") {
            const cellToInt = parseInt(cell);
            this.dataTable[rowIndex][col] = cellToInt;
          } else {
            this.dataTable[rowIndex][col] = cell;
          }
        }
      }
    }
  }

  fetchTable() {
    if (document.getElementById("table_" + this.name) != null) {
      this.rerender();
    } else {
      this.renderTable();
    }
  }

  // 0 is ascending, 1 is descending -- start everything ascending
  initSortDirectionsArray() {
    let index = 0;
    for (index in this.colSchemas.length) {
      this.sortDirections[index] = 0;
    }
  }

  flipSortDirection(index) {
    let currentDirection = this.sortDirections[index];
    if (currentDirection == 0) {
      this.sortDirections[index] = 1;
    } else {
      this.sortDirections[index] = 0;
    }
  }

  getSortDirection(index) {
    return this.sortDirections[index];
  }

  sortRows() {
    const newRows = this.rows.slice();
    newRows.sort();
    this.setRows(newRows);
  }

  setTable(dataTable) {
    this.dataTable = dataTable;
  }

  remove() {
    if (document.getElementById("table_" + this.name) != null) {
      document.getElementById("table_" + this.name).innerText = "";
    }
    if (document.getElementById("button-div-" + this.name) != null) {
      document.getElementById("button-div-" + this.name).remove();
    }
  }

  rerender() {
    this.remove();
    const table = document.getElementById("table_" + this.name);

    if (this.isEmpty) {
      const isEmptyMessage = document.createElement("p");
      isEmptyMessage.innerText = "No rows in table with applied filters.";
      table.appendChild(isEmptyMessage);
    } else {
      table.appendChild(this.makeTableHeaders());
      const rowsString = this.createTableRows(table);
      let tablesDiv = document.getElementById("tables");
      this.addNextAndPreviousButtons(tablesDiv, rowsString);
    }
  }

  createTableRows(table) {
    //TODO: change dataTable to millennia's filtered rows
    let index;
    const rowToStart = this.page * 10; 
    const rowToEnd = Math.min(rowToStart + 10, this.dataTable.length);
    for (index = rowToStart; index < rowToEnd; index++) {
      const row = this.dataTable[index];
      const rowElement = document.createElement("tr");
  
      let rowIndex;
      for (rowIndex in row) {
        const dataPoint = row[rowIndex];
        const dataPointElement = document.createElement("td");
        dataPointElement.innerText = dataPoint;
        rowElement.appendChild(dataPointElement);
      }
      table.appendChild(rowElement);
    }
    const rowsString = "Displaying rows " + rowToStart + " to " + rowToEnd + " of " + this.dataTable.length;
    return rowsString;
  }

  renderTable() {
    const table = document.createElement("table");
    table.setAttribute("id", "table_" + this.name);
    table.appendChild(this.makeTableHeaders());
    const rowString = this.createTableRows(table);

    let tablesDiv = document.getElementById("tables");
    this.addHeader(tablesDiv);
    tablesDiv.appendChild(table);
    this.addNextAndPreviousButtons(tablesDiv, rowString);
  }

  // Add header with table name
  addHeader(tablesDiv) {
    const header = document.createElement("h2");
    header.setAttribute("id", "header_" + this.name);
    header.class = "tableHeader";
    header.innerText = this.name;
    tablesDiv.appendChild(header);
  }

  addColumnHeader(colName, index) {
    const columnHeader = document.createElement("th");
    columnHeader.setAttribute("id", "colheader_" + colName + this.name);
    const id = this.id;
    columnHeader.onclick = function() {sort(index, id)};
    columnHeader.innerText = colName;
    return columnHeader;
  }

  // Create column name labels for table
  makeTableHeaders() {
    const columnNamesRow = document.createElement("tr");
  
    let index;
    for (index in this.colSchemas) {
      const colSchema = this.colSchemas[index];
      const columnTitle = this.addColumnHeader(colSchema.columnName, index);
      columnNamesRow.appendChild(columnTitle);
    }
    return columnNamesRow;
  }

  addNextAndPreviousButtons(tablesDiv, rowString) {
    const buttonDiv = document.createElement("div");
    buttonDiv.id = "button-div-" + this.name;
    const nextButton = document.createElement("button");
    const prevButton = document.createElement("button");
    const rowStringElement = document.createElement("p");
    rowStringElement.innerHTML = rowString;

    nextButton.innerHTML = "Next";
    nextButton.id = "next-button-" + this.name;
    const id = this.id;
    nextButton.onclick = function() { nextPage(id); }
  
    prevButton.innerHTML = "Previous";
    prevButton.id = "prev-button-" + this.name;
    prevButton.onclick = function() { previousPage(id); }
    buttonDiv.appendChild(prevButton);
    buttonDiv.appendChild(nextButton);
    buttonDiv.appendChild(rowStringElement);

    tablesDiv.appendChild(buttonDiv);
  }

  nextPage() {
    //check to make sure enough rows for another page
      //change to filtered rows, not dataTable
    const numRows = this.dataTable.length;
    if (numRows > (this.page + 1) * 10) {
      this.page = this.page + 1;
      this.rerender();
    }
    console.log(this.page);
    //re render
  }

  previousPage() {
    if (this.page > 0) {
      this.page = this.page - 1;
      this.rerender();
    }
    console.log(this.page);
    //re render
  }
}
