let tablesList = [];

//Boolean to ensure data only shows after first click
var showing = Boolean(false);

function showDatabase() {
  if (!showing) {
    showing = true;
    const search = window.location.search;
    const queryString = '/data-from-db' + search;
    document.getElementById("tables").innerText = 'Loading...';

    tablesList = [];
  
    fetch(queryString)
    .then(response => response.json())
    .then((data) => { 
      document.getElementById("tables").innerText = '';
      document.getElementById("sql").innerText = '';
      
      let id = 0;
      for (tableIndex in data) {
        const tableData = data[tableIndex];
        const name = tableData.name;
        const colSchemas = tableData.columnSchemas;
        updateSqlOnPage(tableData.sql);

        const dataTable = tableData.dataTable;
        let tableObj = new Table(dataTable, name, colSchemas, id);

        tableObj.fetchTable();
        tablesList.push(tableObj);
        id++;
      }
    });
  }
}

function updateSqlOnPage(sql) {
  const sqlDiv = document.getElementById("sql");
  const newSql = document.createElement("p");
  newSql.innerText = sql;
  sqlDiv.appendChild(newSql);
}

function mainLoad(){
  showDatabase();
  login();
}

function login() {
  fetch("/login").then(response => response.json()).then((user) => {
    document.getElementById("user").innerText = user;
  });
}

function sort(index, id) {
  let table = tablesList[id];
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
  //TODO: add rerender method that removes rows and headers of the table but keeps the div
  let tableIndex = 0;
  for (tableIndex in tablesList) {
    const tableObj = tablesList[tableIndex];
    tableObj.remove();
    tableObj.renderTable();
  }
}

