function showDatabase() {
  const search = window.location.search;
  const queryString = '/data-from-db' + search;
  document.getElementById("tables").innerText = 'Loading...';

  tablesList = [];
 
  fetch(queryString)
  .then(response => response.json())
  .then((data) => { 
    const dataArea = document.getElementById("data");
    
    let count = 0;
    for (tableIndex in data) {
      const tableData = data[tableIndex];
 
      // Make header for table (show name)
      const name = tableData.name;
 
      // Make table itself, add headers for column names
      const colSchemas = tableData.columnSchemas;

      const dataTable = tableData.dataTable;
      let tableObj = new Table(dataTable, name, colSchemas, count);
      document.getElementById("tables").innerText = '';

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
  // fetch("/login").then(response => response.json()).then((user) => {
  //   document.getElementById("user").innerText = user;
  // });
}






class Table {
  constructor(dataTable, name, colSchemas, id) {
    this.dataTable = dataTable;
    this.name = name;
    this.colSchemas = colSchemas;
    this.id = id;
    this.typeTable = new Array(dataTable.length);
    this.makeTypeTable();
    this.setDataTable = this.setDataTable.bind(this);
  }

  // make table with actual types
  // TODO rename variables make more clear
  makeTypeTable() {
    let rowIndex = 0;
    for (rowIndex in this.dataTable) {
      const row = this.dataTable[rowIndex];
      this.typeTable[rowIndex] = new Array(row.length);
  
      let col;
      for (col in row) {
        const cell = row[col];
        const type = this.getDataType(col);
        if (cell == "NULL") {
          this.typeTable[rowIndex][col] = "";
        } else {
          if (type == "INT64") {
            const cellToInt = parseInt(cell);
            this.typeTable[rowIndex][col] = cellToInt;
          } else {
            this.typeTable[rowIndex][col] = cell;
          }
        }
      }
    }
  }

  fetchTable() {
    setTimeout(function() {
      this.renderTable();
    }.bind(this), 1000);
  }

  sortRows() {
    const newRows = this.rows.slice();
    newRows.sort();
    this.setRows(newRows);
  }

  setDataTable(typeTable) {
    this.typeTable = typeTable;
    this.renderTable();
  }

  setTable(typeTable) {
    this.typeTable = typeTable;
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
    for (index in this.typeTable) {
      const row = this.typeTable[index];
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
    const id = this.id;
    columnHeader.onclick = function() {sort(index, id)};
    columnHeader.innerText = colName;
    return columnHeader;
  }

  getName() {
    return this.name;
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

  getDataTable() {
    return this.typeTable;
  }

  getDataType(colIndex) {
    const colSchema = this.colSchemas[colIndex];
    return colSchema.schemaType;
  }
}

function sort(index, id) {
  let table = tablesList[id];
  const name = table.getName();
  const tableElement = document.getElementById("table_" + name);
  tableElement.innerText = "";
  const headerElement = document.getElementById("header_" + name);
  headerElement.innerText = "";

  let dataTable = table.getDataTable();
  const dataType = table.getDataType(index);
  console.log(dataType)

  if (dataType == "INT64") {
    dataTable.sort(function(a,b){return a[index] - b[index];});
  } else {
    dataTable.sort(function(a,b){return a[index].localeCompare(b[index]);});
  }

  table.setTable(dataTable);

  //need to empty and rerender
  let tableIndex = 0;
  for (tableIndex in tablesList) {
    const tableObj = tablesList[tableIndex];
    tableObj.remove();
    tableObj.renderTable();
  }
  
}

let tablesList = [];