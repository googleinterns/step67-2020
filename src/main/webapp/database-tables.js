function audit() {
        // document.getElementById('redirect').innerHTML = '<form style="display:none;" method="POST" action="./reason"></form>';
        // document.getElementById('btn').click();

    // Create invisible form to send the data
    var form = document.createElement("form"); 
    form.setAttribute("method", "post"); 
    form.setAttribute("action", "/reason"); 
  
    // Create an input element for account 
    var account = document.createElement("input"); 
    account.setAttribute("type", "text"); 
    account.setAttribute("name", "account");
    var userVal = document.getElementById("user").innerText;
    account.setAttribute("value", userVal); 
  

    const search = window.location.search;
    const queryString = '/data-from-db' + search;
   
    const params = new URLSearchParams(window.location.search);
    var tableSelect = params.getAll('table-select');
     // Create an input element for tables accessed 
     var DOB = document.createElement("input"); 
     DOB.setAttribute("type", "text"); 
     DOB.setAttribute("name", "query"); 
     DOB.setAttribute("value", tableSelect);

     console.log(tableSelect);


     // Create an input element for reason 
     
     var reason = params.get('reason');
     


     var reasonInput = document.createElement("input"); 
     reasonInput.setAttribute("type", "text"); 
     reasonInput.setAttribute("name", "reason"); 
     reasonInput.setAttribute("value", reason);

     // create a submit button 
                var s = document.createElement("input"); 
                s.setAttribute("type", "submit"); 
                s.setAttribute("value", "Submit"); 
                  
                // Append the account input to the form 
                form.appendChild(account);  
                  
                // Append the DOB to the form 
                form.appendChild(DOB);  

                form.appendChild(reasonInput);
                  
                // Append the submit button to the form 
                form.appendChild(s);  
  
                document.body.appendChild(form); 
}

//Boolean to ensure data only shows after first click
var showing = Boolean(false)

function showDatabase() {
  if (!showing) { 
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
  showDatabase();
  login();
}

function login() {
  fetch("/login").then(response => response.json()).then((user) => {
    document.getElementById("user").innerText = user;
  });
}