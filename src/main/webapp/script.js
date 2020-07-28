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
  let database = document.getElementById("list-databases").value;
  if (database != "Select a Database") {
    getTablesList(database);
  }
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
 
// Get and create list of tables in the selected database
function getTablesList(dbName) {
  const tablesUrl = '/tables-from-db';
  const search = "?list-databases=" + dbName;

  const tableListSpace = document.getElementById('table-list');
  tableListSpace.innerText = "Loading...";
  
  const queryString = tablesUrl + search;
  fetch(queryString)
  .then(response => response.json())
  .then((tableList) => { 
    tableListSpace.innerText = "";

    // No tables in this database
    if (tableList.length == 0) {
      const errorMessage = document.createElement('p');
      errorMessage.setAttribute("id", "instruction");
      errorMessage.innerText = "This database has no tables.";
      tableListSpace.appendChild(errorMessage);
      return;
    }
    
    makeTableListAndReason(tableListSpace, dbName, tableList);
  });
}

function makeTableListAndReason(tableListSpace, dbName, tableList) {
  createForm(tableListSpace, dbName);
  addSpace();
  addTableSelectInstr();
  createSelectElement();
  for (let index = 0; index < tableList.length; index++) {
    addTableOption(tableList[index]);
  }
  addSpace();
  addReasonInput();
  createSubmit();
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
 
function createForm(tableListSpace, databaseName) {
  const form = document.createElement("form");
  form.setAttribute("id", "table-form");
  form.setAttribute("action", "/main-page.html" + window.location.search);
  form.setAttribute("method", "GET");
 
  const databaseInput = addDatabaseToQueryString(databaseName);
  form.appendChild(databaseInput);
 
  tableListSpace.appendChild(form);
}
 
// Add hidden form input to send database name on form submit
function addDatabaseToQueryString(databaseName) {
  const databaseInput = document.createElement("input");
  databaseInput.setAttribute("type", "hidden");
  databaseInput.setAttribute("value", databaseName);
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
  submit.type = "submit";
  submit.value = "Continue";
  document.getElementById("table-form").appendChild(submit);
}
 
function addTableOption(text) {
  const option = document.createElement("option");
  option.setAttribute("value", text);
  option.appendChild(document.createTextNode(text));
  document.getElementById("table-select").appendChild(option);
}
 
function onLoad() {
  login();
  getDatabases();
}

function createListElement(text) {
  const liElement = document.createElement('li');
  liElement.innerText = text;
  return liElement;
}

<<<<<<< HEAD
var shareShowing = Boolean(false)
function showShare() {
  if (!shareShowing){
      shareShowing = true;
      document.getElementById("share-form").classList.remove("invisible");
      document.getElementById("share-button").textContent = "Hide Share";
  } else {
      shareShowing= false;
      document.getElementById("share-button").textContent = "Share Query";
      document.getElementById("share-form").classList.add("invisible");
  }
}

function copyLink() {
  var copyText = document.getElementById("share-text");
  copyText.select();
  copyText.setSelectionRange(0, 99999)
  document.execCommand("copy");
  alert("Copied the text: " + copyText.value);
=======
function copyLink() {
  // Create temporary input to copy text and then remove input
  var tempInput = document.createElement("input");
  tempInput.value = window.location.href;
  document.body.appendChild(tempInput);
  tempInput.select();
  document.execCommand("copy");
  document.body.removeChild(tempInput);
  document.getElementById("alert").classList.remove("invisible");
}

function closeAlert() {
   document.getElementById("alert").classList.add("invisible");
>>>>>>> 4ae5deda0bc0ce3c7e659368173abccb0cf98ca2
}

// The below methods with "Lucky" in the name are rough draft for the easter egg
var previousText = "placeholder";
var previousId = "id";

function luckyFilter() {
  previousId="filter-button";
  previousText = document.getElementById("filter-button").textContent;
  document.getElementById("filter-button").textContent = "I'm Feeling Lucky!";
}

function luckyData() {
  previousId="data-button";
  previousText = document.getElementById("data-button").textContent;
  document.getElementById("data-button").textContent = "I'm Feeling Lucky!";
}

function unlucky() {
  document.getElementById(previousId).textContent = previousText;
}

function changeText() {
  document.getElementById("share-text").value = window.location.href;
}

function login(){
  fetch("/login").then(response => response.json()).then((user) => {
    document.getElementById("user").innerText = user;
  });
<<<<<<< HEAD
}
=======
}
>>>>>>> 4ae5deda0bc0ce3c7e659368173abccb0cf98ca2
