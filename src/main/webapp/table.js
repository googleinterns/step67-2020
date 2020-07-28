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
    this.rowsPerPage = 10;
    this.maxPageNumber = 0;
    this.changeRowsPerPage = this.changeRowsPerPage.bind(this);
    this.nextPage = this.nextPage.bind(this);
    this.previousPage = this.previousPage.bind(this);
    this.goToPage = this.goToPage.bind(this);
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
      document.getElementById("button-div-" + this.name).display = "none";
    }
  }

  rerender() {
    this.remove();
    const table = document.getElementById("table_" + this.name);
    const thisTableDiv = document.getElementById("table-div-" + this.name);

    if (this.isEmpty) {
      const isEmptyMessage = document.createElement("p");
      isEmptyMessage.innerText = "No rows in table with applied filters.";
      thisTableDiv.appendChild(isEmptyMessage);
    } else {
      table.appendChild(this.makeTableHeaders());
      document.getElementById("button-div-" + this.name).display = "";
      const pageInfoString = this.createTableRows(table);
      this.updatePageInformation(pageInfoString);
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
    const pageInfoString = "Displaying rows " + rowToStart + " to " + rowToEnd + " of " + this.dataTable.length;
    return pageInfoString;
  }

  renderTable() {
    const thisTableDiv = document.createElement("div");
    thisTableDiv.id = "table-div-" + this.name;
    const table = document.createElement("table");
    table.setAttribute("id", "table_" + this.name);
    table.appendChild(this.makeTableHeaders());
    const pageInfoString = this.createTableRows(table);

    let tablesDiv = document.getElementById("tables");
    this.addHeader(thisTableDiv);
    thisTableDiv.appendChild(table);
    this.addNextAndPreviousButtons(thisTableDiv, pageInfoString);

    tablesDiv.appendChild(thisTableDiv);
  }

  // Add header with table name
  addHeader(thisTableDiv) {
    const header = document.createElement("h2");
    header.setAttribute("id", "header_" + this.name);
    header.class = "tableHeader";
    header.innerText = this.name;
    thisTableDiv.appendChild(header);
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

  addNextAndPreviousButtons(thisTableDiv, pageInfoString) {
    const buttonDiv = document.createElement("div");
    buttonDiv.id = "button-div-" + this.name;
    const nextButton = document.createElement("button");
    const prevButton = document.createElement("button");
    const pageInfoStringElement = document.createElement("p");
    pageInfoStringElement.id = "row-string-" + this.name;
    pageInfoStringElement.innerHTML = pageInfoString;

    nextButton.innerHTML = "Next";
    nextButton.id = "next-button-" + this.name;
    const id = this.id;
    nextButton.onclick = function() { nextPage(id); }
  
    prevButton.innerHTML = "Previous";
    prevButton.id = "prev-button-" + this.name;
    prevButton.onclick = function() { previousPage(id); }
    buttonDiv.appendChild(prevButton);
    this.addPageNumberButtons(buttonDiv);
    buttonDiv.appendChild(nextButton);
    buttonDiv.appendChild(pageInfoStringElement);

    thisTableDiv.appendChild(buttonDiv);
  }

  //TODO - make sure to re-render buttons once search is applied
  addPageNumberButtons(buttonDiv) {
    const numRows = this.dataTable.length;
    const maxPageNumber = Math.floor(numRows / 10);
    this.maxPageNumber = maxPageNumber;
    let count = 0;
    while (count <= maxPageNumber) {
      const pageNumButton = document.createElement("button");
      pageNumButton.innerHTML = count;
      pageNumButton.id = count + "-" + this.name;
      const id = this.id;
      const goToPage = count;
      pageNumButton.onclick = function() { switchPages(id, goToPage); }
      buttonDiv.appendChild(pageNumButton);
      count++;
    }
  }

  addSelectNumRowsElement() {
    // implement this later
  }

  updatePageInformation(pageInfoString) {
    const pageInfoStringElement = document.getElementById("row-string-" + this.name);
    pageInfoStringElement.innerHTML = pageInfoString;
  }

  goToPage(pageNumber) {
    console.log('here')
    console.log(pageNumber)
    if (pageNumber <= this.maxPageNumber) {
      this.page = pageNumber;
      this.rerender();
    }
  }

  nextPage() {
    //change to filtered rows, not dataTable
    const numRows = this.dataTable.length;
    if (numRows > (this.page + 1) * 10) {
      this.page = this.page + 1;
      this.rerender();
    }
  }

  previousPage() {
    if (this.page > 0) {
      this.page = this.page - 1;
      this.rerender();
    }
  }

  changeRowsPerPage(newValue) {
    this.rowsPerPage = newValue;
    this.rerender();
  }
}
