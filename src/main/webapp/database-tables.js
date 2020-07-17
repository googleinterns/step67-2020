let tablesList = [];

//Boolean to ensure data only shows after first click
var showing = Boolean(false)

function showDatabase() {
  if (!showing){
    showing = true;
    const search = window.location.search;
    const queryString = '/data-from-db' + search;
    document.getElementById("tables").innerText = 'Loading...';

    tablesList = [];
 
    fetch(queryString)
    .then(response => response.json())
    .then((data) => { 
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
}

function mainLoad(){
  login();
  showReason();
}

function login() {
  fetch("/login").then(response => response.json()).then((user) => {
    document.getElementById("user").innerText = user;
    var currentUser = user;
    if (currentUser[0] == "Stranger"){
        //window.location.assign("https://accounts.google.com/signin/v2/identifier?");
        return;
    }

    var usersWithAccess = ["jiaxinz@google.com","gagomez@google.com",/*"test@example.com",*/"hilakey@google.com","sasymer@google.com","williamdc@google.com"];
    console.log(currentUser[0]);
    console.log("current user");
    for (var i =0; i < usersWithAccess.length; i++){
        if (currentUser[0] == usersWithAccess[i]){
            return;
        }
    }
    //TODO: Make sure this url is for the deployed version
    //window.location.assign("https://8080-25c0ac2a-87ce-4126-a0a0-8231fedddb09.us-central1.cloudshell.dev/denied.html");
    // window.location.assign("https://play-user-data-beetle.uc.r.appspot.com/denied.html");
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
  let tableIndex = 0;
  for (tableIndex in tablesList) {
    const tableObj = tablesList[tableIndex];
    tableObj.remove();
    tableObj.renderTable();
  }
}


//Note: this method will show the reason assuming the reason is the last thing in the querystring
function showReason() {
  var startIndex = 0;
  var reason = "";
  const search = window.location.search;
  for (var i = search.length-1; i > 0; i--) {
    if (search.charAt(i) == '=') {
       startIndex = i;
       break;
    } else if (search.charAt(i) == '&') {
        break;
    }
  }
  reason = search.substring(startIndex+1,search.length);
  var finalReason="";
  for(var i = 0; i <reason.length; i++) {
      if (reason.charAt(i) == "+") {
         finalReason += " ";
      } else {
          finalReason += reason.charAt(i);
      }
  }
  document.getElementById("justification").innerText = "Justification: " + finalReason;
}