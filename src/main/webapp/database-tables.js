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
      const colsArray = tableData.columns;
      table.appendChild(makeTableHeaders(colsArray, name));

      const schemas = tableData.schemas;
      table.appendChild(makeColumnTypes(schemas));
 
      // add data
      makeRows(tableData.dataTable, table);
      dataArea.appendChild(table);
    }
  });
}

function makeColumnTypes(schemas) {
  const columnTypesRow = document.createElement("tr");

  let index;
  for (index in schemas) {
    const schemaType = schemas[index].schemaType;
    const columnTypeHeader = document.createElement("th");
    columnTypeHeader.innerText = schemaType;
    columnTypesRow.appendChild(columnTypeHeader);
  }
  return columnTypesRow;
}
 
// Create column name labels for table
function makeTableHeaders(colsArray, name) {
  const columnNamesRow = document.createElement("tr");
 
  let index;
  for (index in colsArray) {
    const columnTitle = addColumnHeader(colsArray[index], name, index);
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
 
function addColumnHeader(colName, tableName, index) {
  const columnHeader = document.createElement("th");
  columnHeader.setAttribute("onclick", "sort(" + index + ", '" + tableName + "')");
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
  table.setAttribute("id", "" + name);
  return table;
}
