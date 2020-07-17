let tablesList = [];

function showDatabase() {
  const search = window.location.search;
  const queryString = '/data-from-db' + search;
  document.getElementById("tables").innerText = 'Loading...';

  tablesList = [];
 
  fetch(queryString)
  .then(response => response.json())
  .then((data) => { 
    const dataArea = document.getElementById("data");
    document.getElementById("tables").innerText = '';
    
    let count = 0;
    for (tableIndex in data) {
      const tableData = data[tableIndex];
      const name = tableData.name;
      const colSchemas = tableData.columnSchemas;

      const dataTable = tableData.dataTable;
      let tableObj = new Table(dataTable, name, colSchemas, count);

      tableObj.fetchTable();
      tablesList.push(tableObj);
      count++;
    }
  });
}

function mainLoad(){
  showDatabase();
  login();
}

function login(){
  fetch("/login").then(response => response.json()).then((user) => {
    document.getElementById("user").innerText = user;
  });
}

function sort(index, id) {
  let table = tablesList[id];
  const name = table.getName();
  let dataTable = table.getDataTable();
  const dataType = table.getDataType(index);
  let sortDirection = table.getSortDirection(index);

  if (dataType == "INT64") {
    if (sortDirection == 0) {
      dataTable.sort(function(a,b){return a[index] - b[index];});
    } else {
      dataTable.sort(function(a,b){return b[index] - a[index];});
    }
  } else {
    if (sortDirection == 0) {
      dataTable.sort(function(a,b){return a[index].localeCompare(b[index]);});
    } else {
      dataTable.sort(function(a,b){return b[index].localeCompare(a[index]);});
    }
  }

  table.flipSortDirection(index);
  table.setTable(dataTable);

  //need to empty and rerender
  let tableIndex = 0;
  for (tableIndex in tablesList) {
    const tableObj = tablesList[tableIndex];
    tableObj.remove();
    tableObj.renderTable();
  }
}

class Table {
  constructor(dataTable, name, colSchemas, id) {
    this.name = name;
    this.colSchemas = colSchemas;
    this.id = id;
    this.dataTable = new Array(dataTable.length); // Number rows
    this.sortDirections = new Array(colSchemas.length); // Number cols
    this.makeTableWithTypes(dataTable);
    this.setTable = this.setTable.bind(this);
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
    setTimeout(function() {
      this.renderTable();
    }.bind(this), 0);
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
    document.getElementById("table_" + this.name).remove();
    document.getElementById("header_" + this.name).remove();
  }

  renderTable() {
    const table = document.createElement("table");
    table.setAttribute("id", "table_" + this.name);

    table.appendChild(this.makeTableHeaders());

    let index;
    for (index in this.dataTable) {
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

    let tablesDiv = document.getElementById("tables");
    this.addHeader(tablesDiv);
    tablesDiv.appendChild(table);
  }

  addHeader(tablesDiv) {
    const header = document.createElement("h2");
    header.setAttribute("id", "header_" + this.name);
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
}