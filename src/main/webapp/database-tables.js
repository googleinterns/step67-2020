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
  console.log("main");
  login();
  showReason();
}

function login() {
  fetch("/login").then(response => response.json()).then((user) => {
    document.getElementById("user").innerText = user;
    var currentUser = user;
    if (currentUser[0] == "Stranger"){
        window.location.assign("https://accounts.google.com/signin/v2/identifier?");
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
    window.location.assign("https://8080-25c0ac2a-87ce-4126-a0a0-8231fedddb09.us-central1.cloudshell.dev/denied.html");
    // window.location.assign("https://play-user-data-beetle.uc.r.appspot.com/denied.html");
  });
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