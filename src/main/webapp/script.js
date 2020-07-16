function getDatabases(){
  fetch("/databases").then(response => response.json()).then((list) => {
    let dropdown = document.getElementById('list-databases');
    dropdown.options.remove(0);
    let defaultOption = document.createElement('option');
    defaultOption.text = 'Select a Database';

    dropdown.add(defaultOption);
    dropdown.selectedIndex = 0;

    let option;
    
    for (let index in list) {
      option = document.createElement('option');
      option.text = list[index];
      option.value = list[index];
      if(list[index] != null){
        dropdown.add(option);
      } 
    }
  });
}

function submitDatabaseForm() { 
  document.getElementById("database-select-form").submit();
}

//Get database and selected tables from query string and /tables-from-db
function getDatabaseAndTable(){
    const tablesUrl = '/tables-from-db';
    const search = window.location.search;
    const queryString = tablesUrl + search;
    var startIndex = 0;
    var databaseString= "";
    
    for (var i = 0; i<search.length; i++){
        if (search.charAt(i) == '='){
            startIndex = i;
        } else if (search.charAt(i) == '&'){
            break;
        } else{
            databaseString += search.charAt(i);
        }
    }

    databaseString = databaseString.substring(startIndex);
    fetch(queryString)
    .then(response => response.json())
    .then((list) => { 
        const dbText = document.createElement('p');
        dbText.innerText = "Database: " + databaseString;
        const tableText = document.createElement('p');
        tableText.innerText = "List of selected tables:  ";
        const databaseTable = document.getElementById('DB-T');
        databaseTable.appendChild(dbText);
        databaseTable.appendChild(tableText);

        for (let index = 0; index < list.length; index++) {
            databaseTable.appendChild(
            createListElement(list[index]));
        }
    });
}

function submitDatabaseForm() {
  document.getElementById("database-select-form").submit();
}
 
// Get and create list of tables in the selected database
function getTablesList() {
  const tablesUrl = '/tables-from-db';
  const search = window.location.search;
  if (!search.includes("list-databases")) {
    return;
  }
  const queryString = tablesUrl + search;
  fetch(queryString)
  .then(response => response.json())
  .then((list) => { 
    const tableListSpace = document.getElementById('table-list');
 
    // No tables in this database
    if (list.length == 0) {
      const errorMessage = document.createElement('p');
      errorMessage.setAttribute("id", "instruction");
      errorMessage.innerText = "This database has no tables.";
      tableListSpace.appendChild(errorMessage);
      return;
    }
    
    createForm(tableListSpace);
    addSpace();
    addTableSelectInstr();
    createSelectElement();
    for (let index = 0; index < list.length; index++) {
      addTableOption(list[index]);
    }
    addSpace();
    addReasonInput();
    createSubmit();
  });
}

// Add spacing for formatting
function addSpace() {
  const spaceDiv = document.createElement("div");
  spaceDiv.setAttribute("id", "space");
  document.getElementById("table-form").appendChild(spaceDiv);
}

// Add instructions for table selection
function addTableSelectInstr() {
  const instruction = document.createElement("p");
  instruction.setAttribute("id", "instruction");
  instruction.innerText = "Press CTRL to select multiple."
  document.getElementById("table-form").appendChild(instruction);
}
 
// Create element for table selection
function createSelectElement() {
  const select = document.createElement("SELECT");
  select.setAttribute("id", "table-select");
  select.setAttribute("name", "table-select");
  select.setAttribute("required", "true");
  document.getElementById("table-form").appendChild(select);
  document.getElementById("table-select").multiple = true;
}
 
function createForm(tableListSpace) {
  const form = document.createElement("form");
  form.setAttribute("id", "table-form");
  form.setAttribute("action", "/main-page.html" + window.location.search);
  form.setAttribute("method", "GET");
 
  const databaseInput = addDatabaseToQueryString();
  form.appendChild(databaseInput);
 
  tableListSpace.appendChild(form);
}
 
// Add hidden form input to send database name on form submit
function addDatabaseToQueryString() {
  const searchString = window.location.search;
  const index = searchString.indexOf("=");
  const database = searchString.substring(index + 1);
  const databaseInput = document.createElement("input");
  databaseInput.setAttribute("type", "hidden");
  databaseInput.setAttribute("value", database);
  databaseInput.setAttribute("name", "list-databases");
  return databaseInput;
}

function addReasonInput() {
  const reason = document.createElement("input");
  reason.setAttribute("type", "text");
  reason.setAttribute("name", "reason");
  reason.setAttribute("placeholder", "Enter reason for use.");
  reason.setAttribute("required", "true");  
  document.getElementById("table-form").appendChild(reason);
}
 
function createSubmit() {
  const submit = document.createElement("input");
  submit.setAttribute("type", "submit");
  document.getElementById("table-form").appendChild(submit);
}
 
function addTableOption(text) {
  const option = document.createElement("option");
  option.setAttribute("value", text);
  option.appendChild(document.createTextNode(text));
  document.getElementById("table-select").appendChild(option);
}
 
function onLoad() {
  getDatabases();
  getTablesList();
  login();
}

function createListElement(text) {
  const liElement = document.createElement('li');
  liElement.innerText = text;
  return liElement;
}

function login(){
  // fetch("/login").then(response => response.json()).then((user) => {
  //   document.getElementById("user").innerText = user;
  // });
}