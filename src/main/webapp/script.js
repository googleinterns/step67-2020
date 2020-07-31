function mainLoad(){
  login();
  showReason();
  showFiltersPanel();
  createFilters();
  populateFilters();
}

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
  const loadingElement = document.createElement('div');
  loadingElement.id = 'loading';
  loadingElement.innerText = 'Loading...';
  tableListSpace.appendChild(loadingElement);
  
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

function copyLink() {
  // Create temporary input to copy text and then remove input
  var tempInput = document.createElement("input");
  tempInput.value = window.location.href;
  document.body.appendChild(tempInput);
  tempInput.select();
  document.execCommand("copy");
  document.body.removeChild(tempInput);
  //Animate popup
  alertPopup(document.getElementById("alert"));
}

function applyFiltersIfPossible() {
  const deviceId = document.getElementById('device_id');
  const userId = document.getElementById('user_id');

  if (deviceId == null || userId == null) {
    document.getElementById("idAlert").classList.remove("invisible");
  } else if (deviceId.value == null && userId.value == null) {
    document.getElementById("idAlert").classList.remove("invisible");
  } else if (deviceId.value == "" && userId.value == "") {
    document.getElementById("idAlert").classList.remove("invisible");
  } else {
    filterAlert();
    getFilterValues();
  }
  return false;
}

function filterAlert(){
  alertPopup(document.getElementById("filter-alert"));
}

function alertPopup(x){
  x.style.display = "block";
  x.style.width = "110px";
  x.style.opacity = 100;
  x.style.animation = "hide 4s";
  x.addEventListener("animationend", endAnimation);
}

function endAnimation() {
  this.style.opacity = 0; 
  this.style.width = 0;
  this.style.animation = "none";
  this.style.display = "none";
}

function closeIDAlert() {
  document.getElementById("idAlert").classList.add("invisible");
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
}

var darkMode = Boolean(false);

function switchColorMode() {
  const oldStyle = document.getElementsByTagName("link").item(1);
  const newStyle = document.createElement("link");
  newStyle.rel = "stylesheet";
  newStyle.type = "text/css";

  const tableStyleOld = document.getElementsByTagName("link").item(2);
  const tableStyleNew = document.createElement("link");
  tableStyleNew.rel = "stylesheet";
  tableStyleNew.type = "text/css";

  if (darkMode) {
    newStyle.href = "/table-light.css";
    tableStyleNew.href = "/main-page-light.css";
    document.getElementById("mode-button").innerText = "Dark Mode";
  } else {
    newStyle.href = "/table-dark.css";
    tableStyleNew.href = "/main-page-dark.css";
    document.getElementById("mode-button").innerText = "Light Mode";
  }
  darkMode = !darkMode;
  document.getElementsByTagName("head").item(0).replaceChild(newStyle, oldStyle);
  document.getElementsByTagName("head").item(0).replaceChild(tableStyleNew, tableStyleOld);
}