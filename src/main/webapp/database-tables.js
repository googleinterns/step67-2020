function showDatabase() {
  const search = window.location.search;
  const queryString = '/data-from-db' + search;
 
  fetch(queryString)
  .then(response => response.json())
  .then((data) => { 
    const dataArea = document.getElementById("data");
    
    for (tableIndex in data) {
      const tableData = data[tableIndex];
 
      // Make header for table (show name)
      const name = tableData.name;
      createTableName(name, dataArea);
 
      // Make table itself, add headers for column names
      const table = createTable(name);
      const colSchemas = tableData.columnSchemas;
      table.appendChild(makeTableHeaders(colSchemas));

      const dataTable = tableData.dataTable;
      let tableObj = new Table(dataTable);
      tableObj.fetchTable();
      tablesList.push(tableObj);
 
      // add data
      makeRows(tableData.dataTable, table);
      dataArea.appendChild(table);
    }
  });
}
 
// Create column name labels for table
function makeTableHeaders(colSchemas) {
  const columnNamesRow = document.createElement("tr");
 
  let index;
  for (index in colSchemas) {
    const colSchema = colSchemas[index];
    const columnTitle = addColumnHeader(colSchema.columnName);
    columnNamesRow.appendChild(columnTitle);
  }
  return columnNamesRow;
}
 
function makeRows(rows, table) {
  for (index in rows) {
    const row = rows[index];
    const rowElement = document.createElement("tr");
 
    for (rowIndex in row) {
      const dataPoint = row[rowIndex];
      const dataPointElement = document.createElement("td");
      dataPointElement.innerText = dataPoint;
      rowElement.appendChild(dataPointElement);
    }
 
    table.appendChild(rowElement);
  }
}
 
function addColumnHeader(colName) {
  const columnHeader = document.createElement("th");
  columnHeader.innerText = colName;
  return columnHeader;
}
 
function createTableName(name, dataArea) {
  const header = document.createElement("h2");
  header.innerText = name;
  dataArea.appendChild(header);
}
 
function createTable(name) {
  const table = document.createElement("table");
  table.setAttribute("id", "table_" + name);
  return table;
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
  constructor(dataTable) {
    this.dataTable = dataTable;
    this.setDataTable = this.setDataTable.bind(this);
  }

  fetchTable() {
    this.renderLoadingMessage();
    setTimeout(function() {
      this.renderTable();
    }.bind(this), 1000);
  }

  sortRows() {
    const newRows = this.rows.slice();
    newRows.sort();
    this.setRows(newRows);
  }

  setDataTable(dataTable) {
    this.dataTable = dataTable;
    this.renderTable();
  }

  renderLoadingMessage() {
    document.getElementById("tables").innerText = 'Loading...';
  }

  renderTable() {
    const table = document.createElement("table");

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
    tablesDiv.innerText = '';
    tablesDiv.appendChild(table);
  }
}

//let table = new Table();
//will have to make an object that stores multiple tables?

let tablesList = [];