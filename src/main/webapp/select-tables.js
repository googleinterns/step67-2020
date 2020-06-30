function getList() {
  console.log('get list')
  fetch('/tables-from-db')
  .then(response => response.json())
  .then((list) => { //list is a json object representing the list of tables
    const tableListSpace = document.getElementById('table-list');
    createSelectElement();
    for (let index = 0; index < list.length; index++) {
      addTableOption(list[index]);
    }
  });
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
  document.body.appendChild(select);
  document.getElementById("table-select").multiple = true;
}