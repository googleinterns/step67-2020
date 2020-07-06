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
  form.setAttribute("action", "/data-from-db");
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

function showDatabase() {
  fetch('/data-from-db')
  .then(response => response.json())
  .then((data) => { //data is a json object representing the data
    const dataArea = document.getElementById("data");
    
    for (tableIndex in data) {
      const tableData = data[tableIndex];

      // Make header for table (show name)
      const name = tableData.name;
      createTableName(name, dataArea);

      // Make table itself, add headers for column names
      const table = createTable(name);
      const colsArray = tableData.columns;
      table.appendChild(makeTableHeaders(colsArray));

      // add data
      makeRows(tableData.rows, table, colsArray);
      dataArea.appendChild(table);
    }
  });
}

// Create column name labels for table
function makeTableHeaders(colsArray) {
  const columnNamesRow = document.createElement("tr");

  let index;
  for (index in colsArray) {
    const columnTitle = addColumnHeader(colsArray[index]);
    columnNamesRow.appendChild(columnTitle);
  }
  return columnNamesRow;
}

function makeRows(rows, table, colsArray) {
  for (index in rows) {
    const row = rows[index].row;
    const rowElement = document.createElement("tr");

    for (colIndex in colsArray) {
      const colName = colsArray[colIndex];
      const dataPoint = row[colName];
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