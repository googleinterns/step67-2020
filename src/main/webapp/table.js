
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
    this.updateCurrentPageButton = this.updateCurrentPageButton.bind(this);
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

  //Clears out table and related buttons
  remove() {
    if (document.getElementById("table_" + this.name) != null) {
      document.getElementById("table_" + this.name).innerText = "";
    }
    if (document.getElementById("button-div-" + this.name) != null) {
      document.getElementById("button-div-" + this.name).style.display = "none";
    }
  }

  rerender() {
    this.remove();
    const table = document.getElementById("table_" + this.name);

    if (this.isEmpty) {
      table.innerText = "No rows in table with applied filters.";
    } else {
      table.appendChild(this.makeTableHeaders());
      document.getElementById("button-div-" + this.name).style.display = "";
      const pageInfoString = this.createTableRows(table);
      this.updatePageInformation(pageInfoString);
    }
  }

  createTableRows(table) {
    //TODO: change dataTable to millennia's filtered rows
    let index;
    const rowToStart = this.page * this.rowsPerPage; 
    const rowToEnd = Math.min(rowToStart + this.rowsPerPage, this.dataTable.length);
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

  //filters data by user input on the search bar
  getFilteredRows(){
    var searchBarInput = document.getElementById('search-bar').value;
    console.log(searchBarInput);
    
    let filteredRowsList = [];

    let index;
    for(index in this.dataTable){
      const row = this.dataTable[index];

      let rowIndex;
      for(rowIndex in row){
    
        let rowData = row[rowIndex];
        
        if(rowData === null || rowData === ""){
            console.log("No data exists for this row");
        }else{
            //console.log(rowData + " datatype = " + typeof rowData);
            rowData = rowData.toString(); //converting data type to string for comparison
            if(rowData.indexOf(searchBarInput) > -1){
              //push the row into array
              console.log(rowData + " contains: " + searchBarInput);
              filteredRowsList.push(row); 
            }
        }
      }
    }
    console.log("filtered rows list : " + filteredRowsList);
    return filteredRowsList;
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
    this.addPaginationButtons(thisTableDiv, pageInfoString);

    tablesDiv.appendChild(thisTableDiv);

    if (this.isEmpty) {
      this.rerender();
    }
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

  addPaginationButtons(thisTableDiv, pageInfoString) {
    const buttonDiv = document.createElement("div");
    buttonDiv.id = "button-div-" + this.name;

    const nextButton = document.createElement("button");
    nextButton.innerHTML = "Next";
    nextButton.id = "next-button-" + this.name;
    nextButton.onclick = () => this.nextPage(); 

    const prevButton = document.createElement("button");
    prevButton.innerHTML = "Previous";
    prevButton.id = "prev-button-" + this.name;
    prevButton.onclick = () => this.previousPage();

    const pageInfoStringElement = document.createElement("p");
    pageInfoStringElement.id = "row-string-" + this.name;
    pageInfoStringElement.innerHTML = pageInfoString;

    const pageNumberSpan = document.createElement("span");
    pageNumberSpan.id = "pagenumbers-" + this.name;
    this.addPageNumberButtons(pageNumberSpan);

    buttonDiv.appendChild(prevButton);
    buttonDiv.appendChild(pageNumberSpan);
    buttonDiv.appendChild(nextButton);
    buttonDiv.appendChild(this.makeSelectNumRowsElement());
    buttonDiv.appendChild(pageInfoStringElement);

    thisTableDiv.appendChild(buttonDiv);
  }

  //TODO - make sure to re-render buttons once search is applied
  addPageNumberButtons(pageNumberSpan) {
    const numRows = this.dataTable.length;
    const maxPageNumber = Math.floor(numRows / this.rowsPerPage);
    this.maxPageNumber = maxPageNumber;

    let count = 0;
    while (count <= maxPageNumber) {
      const pageNumButton = document.createElement("button");
      pageNumButton.innerHTML = count;
      pageNumButton.id = count + "-" + this.name;
      const newPage = count;
      pageNumButton.onclick = () => this.goToPage(newPage);
      pageNumberSpan.appendChild(pageNumButton);
      count++;
    }
    this.updateCurrentPageButton();
  }

  //Make select element, allowing user to choose number of rows per page
  makeSelectNumRowsElement() {
    const select = document.createElement("select");
    select.id = "rows-per-page-" + this.id;
    const id = this.id;
    select.onchange = function() { changeNumRowsPerPage(id); }
    
    let option;
    for (option = 5; option < 21; option += 5) {
      const optionElement = document.createElement("option");
      optionElement.value = option;
      optionElement.innerHTML = "" + option;
      if (option == 10) {
        optionElement.selected = "selected";
      }
      select.appendChild(optionElement);
    }
    return select;
  }

  /* Update button and page number information */ 
  updatePageInformation(pageInfoString) {
    const pageInfoStringElement = document.getElementById("row-string-" + this.name);
    pageInfoStringElement.innerHTML = pageInfoString;

    //also update number buttons
    const pageNumbersElement = document.getElementById("pagenumbers-" + this.name);
    pageNumbersElement.innerText = "";
    this.addPageNumberButtons(pageNumbersElement);
  }

  // Highlights page button currently on
  updateCurrentPageButton() {
    if (document.getElementById(this.page + "-" + this.name) != null) {
      const currentPageButton = document.getElementById(this.page + "-" + this.name);
      currentPageButton.style.backgroundColor = "lightyellow";
    }
  }

  // Reset page button to default color when user changes pages
  resetButtonColor() {
    if (document.getElementById(this.page + "-" + this.name) != null) {
      const currentPageButton = document.getElementById(this.page + "-" + this.name);
      currentPageButton.style.backgroundColor = "";
    }
  }

  goToPage(pageNumber) {
    if (pageNumber <= this.maxPageNumber) {
      this.resetButtonColor();
      this.page = pageNumber;
      this.rerender();
      this.updateCurrentPageButton();
    }
  }

  nextPage() {
    //TODO: change to filtered rows, not dataTable
    const numRows = this.dataTable.length;
    if (numRows > (this.page + 1) * this.rowsPerPage) {
      this.resetButtonColor();
      this.page = this.page + 1;
      this.rerender();
      this.updateCurrentPageButton();
    }
  }

  previousPage() {
    if (this.page > 0) {
      this.resetButtonColor();
      this.page = this.page - 1;
      this.rerender();
      this.updateCurrentPageButton();
    }
  }

  changeRowsPerPage(newValue) {
    this.rowsPerPage = newValue;
    this.rerender();
  }
}
