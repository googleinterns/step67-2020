let tablesList = [];

//Boolean to ensure data only shows after first click
function showDatabase() {
    showing = true;
    const search = window.location.search;
    var searchParams = new URLSearchParams(search);
    if (!searchParams.has("UserId") && !searchParams.has("DeviceId")) {
      document.getElementById("idAlert").classList.remove("invisible");
      showing = false;
      return;
    }
    if (searchParams.get("UserId") == "" && searchParams.get("DeviceId") == "") {
      document.getElementById("idAlert").classList.remove("invisible");
      showing = false;
      return;
    }

    const queryString = '/data-from-db' + search;
    document.getElementById("tables").innerText = 'Data tables loading...';
    document.getElementById("sql").innerText = 'Queries loading...';

    tablesList = [];
  
    fetch(queryString)
    .then(response => response.json())
    .then((data) => { 
      document.getElementById("tables").innerText = '';
      document.getElementById("sql").innerText = '';

      if (data.length == 0) {
        document.getElementById("tables").innerText = 'No tables found. UserID/DeviceID may be invalid.';
      }
      
      let id = 0;
      let tableIndex;
      for (tableIndex = 0; tableIndex < data.length; tableIndex++) {
        const tableData = data[tableIndex];
        const name = tableData.name;
        const isEmpty = tableData.isEmpty;
        const colSchemas = tableData.columnSchemas;
        var finalDataTable = tableData;
    
        for (var i =0; i<colSchemas.length; i++) {
            if (colSchemas[i].columnName.endsWith('Millis')){
                var finalDataTable = dataConversionMillis(i,finalDataTable);
            } else if (colSchemas[i].columnName == "Genre") {
                var finalDataTable = dataConversionGenreEnum(i,finalDataTable);
            } else if (colSchemas[i].columnName.endsWith('Proto')) {
                var finalDataTable = dataConversionProto(i,finalDataTable);
            }
        }
        updateSqlOnPage(tableData.sql);
        
        var dataTable = finalDataTable.dataTable;
        let tableObj = new Table(dataTable, name, colSchemas, id, isEmpty);

        tableObj.fetchTable();
        tablesList.push(tableObj);
        id++;

      }
    });
    // Only hide filter panel 
    if (!filtersHidden()) {
        showFiltersPanel();
    }
}

//method that applies the user's input from the search bar and filters the tables to display only the rows that
//contain the user input
function applySearch(){
  //loop through tableslist
  let index = 0;
  for(index in tablesList){
    let table = tablesList[index];
    table.getFilteredRows();
  }
}


function updateSqlOnPage(sql) {
  const sqlDiv = document.getElementById("sql");
  const newSql = document.createElement("p");
  newSql.innerText = sql;
  sqlDiv.appendChild(newSql);
}

function login() {
  fetch("/login").then(response => response.json()).then((user) => {
    document.getElementById("user").innerText = user;
    var currentUser = user;
    if (currentUser == "deny"){
      window.location.assign("/denied.html");
    }
    else if (currentUser == "Stranger") {
      //This link first takes you to Google sign in and then continues back to splash page when signed in
      window.location.assign("https://accounts.google.com/ServiceLogin?service=ah&passive=true&continue=https://uc.appengine.google.com/_ah/conflogin%3Fcontinue%3Dhttps://play-user-data-beetle.uc.r.appspot.com/index.html");
    }
  });
}

//TODO: Pass another paramater to combine data conversion functions 
function dataConversionMillis(column,tableData){
    tableData.columnSchemas[column].schemaType = "TIMESTAMP";
    for (var index=0; index<tableData.dataTable.length; index++) {
      var time = parseInt(tableData.dataTable[index][column]);
      var date = new Date(time); 
      date.setHours(date.getHours() - 2); //Convert from default Central Time to PST
      tableData.dataTable[index][column] = date.toISOString();
    } 
    return tableData;
}

function dataConversionGenreEnum(column,tableData){
    tableData.columnSchemas[column].schemaType = "STRING";
    for (var index=0; index<tableData.dataTable.length; index++) {
      var number = parseInt(tableData.dataTable[index][column]);
      switch(number) {
        case 1:
            tableData.dataTable[index][column] = "Rock";
            break;
        case 2:
            tableData.dataTable[index][column] = "Jazz";
            break;
        case 3:
            tableData.dataTable[index][column] = "Classical";
            break;
        case 4:
            tableData.dataTable[index][column] = "Pop";
            break;
        default:
           tableData.dataTable[index][column] = "Unspecified";
      }
    }
    return tableData;
}

function dataConversionProto(column,tableData) {
    //TODO: work on clicking the { to open and close
    for (var i = 0; i<tableData.dataTable.length; i++) {
      var json = tableData.dataTable[i][column];
      var newString = "";
      var tab = Boolean(false);

      for (var j = 0; j<json.length; j++) {
          if (json[j] == ',' ) {
              newString += (Boolean(tab) ? (json[j] + "\n\t") : (json[j] + "\n"));
          } else if (j !=0 && (json[j] == '{' || json[j] =='[')) {
                newString += json[j] + "\n\t";
                tab = true;
          } else if (json[j] == '}' || json[j] == ']'){
            tab = false;
            newString += json[j];
          } else {
              newString += json[j];
          }
      }
    tableData.dataTable[i][column] = newString;
    } 
    return tableData;
}

function sort(index, id) {
  let table = tablesList[id];
  let dataTable = table.getFilteredRows();
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
  table.setFilteredRows(dataTable);
  table.rerender();

  //Add arrow indicating direction of sort
  let columnHeader = document.getElementById("colheader_" + index + table.getName());
  const arrow = document.createElement("i");
  arrow.classList.add("arrow");
  columnHeader.appendChild(arrow);
  if (sortDirection == 0) {
    arrow.classList.add("up");
  } else {
    arrow.classList.add("down");
  }
}

function showReason() {
  const params = new URLSearchParams(window.location.search);
  var reason = params.get('reason');
  document.getElementById("justification").innerText = "Justification: " + reason;
}

function changeNumRowsPerPage(id) {
  let table = tablesList[id];
  const selectElement = document.getElementById("rows-per-page-" + id);
  table.changeRowsPerPage(Number(selectElement.value));
}

function audit() {
  // Create invisible form to send the data
  var form = document.createElement("form"); 
  form.setAttribute("type", "hidden");
  form.setAttribute("id","form");
  form.setAttribute("method", "post"); 
  form.setAttribute("action", "/reason"); 

  // Create account element
  var account = document.createElement("input"); 
  account.setAttribute("type", "hidden");
  account.setAttribute("name", "account");
  var userVal = document.getElementById("user").innerText;
  account.setAttribute("value", userVal); 

  const params = new URLSearchParams(window.location.search);
  var tableSelect = params.getAll('table-select');

  // Create tables accessed  element
  var queryInput = document.createElement("input"); 
  queryInput.setAttribute("type", "hidden");
  queryInput.setAttribute("name", "query"); 
  queryInput.setAttribute("value", tableSelect);

  // Create reason element
  var reason = params.get('reason');
  var reasonInput = document.createElement("input"); 
  reasonInput.setAttribute("type", "hidden");
  reasonInput.setAttribute("name", "reason"); 
  reasonInput.setAttribute("value", reason);
      
  // Create queryString element
  var queryString = window.location.search;
  var queryStringInput = document.createElement("input"); 
  queryStringInput.setAttribute("type", "hidden");
  queryStringInput.setAttribute("name", "queryString"); 
  queryStringInput.setAttribute("value", queryString);

  // Append everything to form then page
  form.appendChild(account);  
  form.appendChild(queryInput);  
  form.appendChild(queryStringInput);
  form.appendChild(reasonInput);
  document.body.appendChild(form); 
  document.getElementById("form").submit();
}