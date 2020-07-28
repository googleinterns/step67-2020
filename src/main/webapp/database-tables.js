let tablesList = [];

//Boolean to ensure data only shows after first click
var showing = Boolean(false);

function showDatabase() {
  if (!showing){
    showing = true;
    const search = window.location.search;
    var searchParams = new URLSearchParams(search);
    if (!(searchParams.has("user_id") && searchParams.has("device_id"))) {
      return;
    }

    const queryString = '/data-from-db' + search;
    document.getElementById("tables").innerText = 'Loading...';
<<<<<<< HEAD

    tablesList = [];
 
=======
    document.getElementById("sql").innerText = 'Queries loading...';

    tablesList = [];
  
>>>>>>> 4ae5deda0bc0ce3c7e659368173abccb0cf98ca2
    fetch(queryString)
    .then(response => response.json())
    .then((data) => { 
      document.getElementById("tables").innerText = '';
<<<<<<< HEAD
      
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
=======
      document.getElementById("sql").innerText = '';
      
      let id = 0;
      for (tableIndex in data) {
        const tableData = data[tableIndex];
        const name = tableData.name;
        const isEmpty = tableData.isEmpty;

        const colSchemas = tableData.columnSchemas;
        updateSqlOnPage(tableData.sql);
        //TODO: sql showing up x2 for some reason, figure this out

        const dataTable = tableData.dataTable;
        let tableObj = new Table(dataTable, name, colSchemas, id, isEmpty);

        tableObj.fetchTable();
        tablesList.push(tableObj);
        id++;
      }
    });
  }
}

function updateSqlOnPage(sql) {
  console.log('here');
  const sqlDiv = document.getElementById("sql");
  const newSql = document.createElement("p");
  newSql.innerText = sql;
  sqlDiv.appendChild(newSql);
>>>>>>> 4ae5deda0bc0ce3c7e659368173abccb0cf98ca2
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
<<<<<<< HEAD
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

=======
    if (currentUser == "deny"){
      window.location.assign("/denied.html");
    }
    else if (currentUser == "Stranger") {
      //This link first takes you to Google sign in and then continues back to splash page when signed in
      window.location.assign("https://accounts.google.com/ServiceLogin?service=ah&passive=true&continue=https://uc.appengine.google.com/_ah/conflogin%3Fcontinue%3Dhttps://play-user-data-beetle.uc.r.appspot.com/splash.html");
    }
  });
}

>>>>>>> 4ae5deda0bc0ce3c7e659368173abccb0cf98ca2
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

<<<<<<< HEAD

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
=======
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
>>>>>>> 4ae5deda0bc0ce3c7e659368173abccb0cf98ca2
}