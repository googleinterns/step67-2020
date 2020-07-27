let tablesList = [];

//Boolean to ensure data only shows after first click
var showing = Boolean(false);

function showDatabase() {
  if (!showing){
    showing = true;
    const search = window.location.search;
    var searchParams = new URLSearchParams(search);

    //TODO: add this back in once millennia's code is merged
    // if (!(searchParams.has("user_id") && searchParams.has("device_id"))) {
    //   return;
    // }

    const queryString = '/data-from-db' + search;
    document.getElementById("tables").innerText = 'Loading...';
    document.getElementById("sql").innerText = 'Queries loading...';

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
        const isEmpty = tableData.isEmpty;

        const colSchemas = tableData.columnSchemas;
        updateSqlOnPage(tableData.sql);

        const dataTable = tableData.dataTable;
        let tableObj = new Table(dataTable, name, colSchemas, id, isEmpty);

        tableObj.fetchTable();
        tablesList.push(tableObj);
        id++;
      }
    });
  }
}

function createIsEmptyElement(dataArea) {
  const element = document.createElement("p");
  element.innerText = "No rows in table with applied filters.";
  dataArea.appendChild(element);
}

function updateSqlOnPage(sql) {
  const sqlDiv = document.getElementById("sql");
  const newSql = document.createElement("p");
  newSql.innerText = sql;
  sqlDiv.appendChild(newSql);
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
    var first = currentUser.split(" ");
    if (currentUser == "deny"){
      window.location.assign("/denied.html");
    }
    else if (currentUser == "Stranger") {
      //This link first takes you to Google sign in and then continues back to splash page when signed in
      window.location.assign("https://accounts.google.com/ServiceLogin?service=ah&passive=true&continue=https://uc.appengine.google.com/_ah/conflogin%3Fcontinue%3Dhttps://play-user-data-beetle.uc.r.appspot.com/splash.html");
    }
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
  table.remove();
  table.rerender();
}

function showReason() {
  const params = new URLSearchParams(window.location.search);
  var reason = params.get('reason');
  document.getElementById("justification").innerText = "Justification: " + reason;
}
