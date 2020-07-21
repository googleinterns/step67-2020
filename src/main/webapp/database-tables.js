//Boolean to ensure data only shows after first click
var showing = Boolean(false)

function showDatabase() {
  if (!showing){
    showing = true;
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

        // add data
        makeRows(tableData.dataTable, table);
        dataArea.appendChild(table);
      }
    });
  }
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
  login();
  showReason();
  showFiltersPanel();
}

function login() {
  fetch("/login").then(response => response.json()).then((user) => {
    document.getElementById("user").innerText = user;
    var currentUser = user;
    if (currentUser == "deny"){
        window.location.assign("/denied.html");
    }
    else if (currentUser[0] == "<") {
        window.location.assign("/login");
    }
  });
}

function showReason() {
  const params = new URLSearchParams(window.location.search);
  var reason = params.get('reason');
  document.getElementById("justification").innerText = "Justification: " + reason;
}