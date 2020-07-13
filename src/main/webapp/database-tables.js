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
            const colsArray = tableData.columns;
            table.appendChild(makeTableHeaders(colsArray));
        
            // add data
            makeRows(tableData.rows, table, colsArray);
            dataArea.appendChild(table);
        }
    });
  }
}
 
// Create column name labels for table
function makeTableHeaders(colsArray) {
  const columnNamesRow = document.createElement("tr");
 
  let index;
  for (index in colsArray) {
    const columnTitle = addColumnHeader(colsArray[index]);
    columnNamesRow.appendChild(columnTitle);
  }
  return columnNamesRow;
}
 
function makeRows(rows, table, colsArray) {
  for (index in rows) {
    const row = rows[index].row;
    const rowElement = document.createElement("tr");
 
    for (colIndex in colsArray) {
      const colName = colsArray[colIndex];
      const dataPoint = row[colName];
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
