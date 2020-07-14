function getDatabases(){
  fetch("/databases").then(response => response.json()).then((list) => {
    let dropdown = document.getElementById('list-databases');
    dropdown.options.remove(0);
    let defaultOption = document.createElement('option');
    defaultOption.text = 'Select a Database';

    dropdown.add(defaultOption);
    dropdown.selectedIndex = 0;

    let option;
    
    for (let i in list) {
      option = document.createElement('option');
      option.text = list[i];
      option.value = list[i];
      if(list[i] != null){
        dropdown.add(option);
      } 
    }
  });
}

function submitDatabaseForm() {
  document.getElementById("database-select-form").submit();
}
 
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
      errorMessage.innerText = "This database has no tables.";
      tableListSpace.appendChild(errorMessage);
      return;
    }
    
    createForm();
    createSelectElement();
    for (let index = 0; index < list.length; index++) {
      addTableOption(list[index]);
    }
    createSubmit();
  });
}
 
function createSelectElement() {
  const select = document.createElement("SELECT");
  select.setAttribute("id", "table-select");
  select.setAttribute("name", "table-select");
  document.getElementById("table-form").appendChild(select);
  document.getElementById("table-select").multiple = true;
}
 
function createForm() {
  const form = document.createElement("form");
  form.setAttribute("id", "table-form");
  form.setAttribute("action", "/main-page.html" + window.location.search);
  form.setAttribute("method", "GET");
 
  const databaseInput = addDatabaseToQueryString();
  form.appendChild(databaseInput);
 
  document.body.appendChild(form);
}
 
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
}

function showShare() {
    console.log("Show");
    document.getElementById("share-form").classList.remove("invisible");
}

function copyLink() {
    var copyText = document.getElementById("share-text");
    copyText.select();
    copyText.setSelectionRange(0, 99999)
    document.execCommand("copy");
    alert("Copied the text: " + copyText.value);
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