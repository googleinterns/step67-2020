function getList() {
  console.log('get list')
  fetch('/tables-from-db')
  .then(response => response.json())
  .then((list) => { //list is a json object representing the list of tables
    const tableListSpace = document.getElementById('table-list');
    createForm();
    createSelectElement();
    for (let index = 0; index < list.length; index++) {
      addTableOption(list[index]);
    }
    createSubmit();
  });
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
  form.setAttribute("action", "/tables-from-db");
  form.setAttribute("method", "POST");
  document.body.appendChild(form);
}

function getSelectValues(select) {
  var result = [];
  var options = select && select.options;
  var opt;

  for (var i=0, iLen=options.length; i<iLen; i++) {
    opt = options[i];

    if (opt.selected) {
      result.push(opt.value || opt.text);
    }
  }
  return result;
}

// Prints selected table names onto page
// Need to do a post request (?) to put the selected tables into a url, this way they can be saved and passed into the next page
// to actually show the data from the tables.
// Need to figure out how to do this. Maybe create a url that has the selected tables.
function printSelected() {
  const select = document.getElementById("table-select");
  const selectedSpace = document.getElementById("selected");
  var result = getSelectValues(select);
  for (let index = 0; index < result.length; index++) {
    const selectedElement = document.createElement("p");
    selectedElement.innerText = result[index];
    selectedSpace.appendChild(selectedElement);
  }
}