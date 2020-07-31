function showFiltersPanel() {
  var filterBox = document.getElementById("filter-box");
  var filterButton = document.getElementById("filter-button");
  filterButton.disabled = true;

  if (filterBox.style.width ===  "0px" || filterBox.style.width === null) { //this line change to checking width
    filterBox.style.display = "block";
    //delay width change to make transition visible
    var showTimer = setTimeout("delayWidth()",10);
	filterButton.onmouseout = function() {  clearTimeout(showTimer); }
    filterButton.textContent = "Hide Filters";
  } else {
    filterBox.style.width = 0;
    filterButton.textContent = "Show Filters";
    //timer to change display to none after transition
    var hideTimer = setTimeout("delayDisplay()",500);
  }
}
function delayWidth(){
     var filterBox = document.getElementById("filter-box");
     var filterButton = document.getElementById("filter-button");
     filterBox.style.width = "300px";
     filterButton.disabled = false;
}

function delayDisplay() {
    var filterBox = document.getElementById("filter-box");
    var filterButton = document.getElementById("filter-button");
    filterBox.style.display = "none";
    filterButton.disabled = false;
}

function addDatabaseToForm(database, filterForm) {
  const chosenDatabase = document.createElement('input');
  chosenDatabase.type = "hidden";
  chosenDatabase.name = "list-databases";
  chosenDatabase.value = database;
  filterForm.appendChild(chosenDatabase);
}

function addReasonToForm(reasonForUse,filterForm) {
  const reason = document.createElement('input');
  reason.type = "hidden";
  reason.name = "reason";
  reason.value = reasonForUse;
  filterForm.appendChild(reason);
}

function addSelectedTableToForm(tableName, filterForm) {
  const tableSelect = document.createElement('input');
  tableSelect.type = "hidden";
  tableSelect.name = "table-select";
  tableSelect.value = tableName;
  filterForm.appendChild(tableSelect);
}

//Returns checkbox dropdowns of the selected table's columns which can then be filtered
function createFilters() {
  var queryString = window.location.search;
  var url = "/columns-from-tables";

  var searchParams = new URLSearchParams(window.location.search);
  const filterForm = document.getElementById('filter-form'); 
  const reasonForUse = searchParams.get('reason');
  const database = searchParams.get('list-databases');
  addDatabaseToForm(database, filterForm);
  addReasonToForm(reasonForUse, filterForm);

  const columnDiv = document.getElementById('column-select');
  const primaryKeyDiv = document.getElementById('primarykey-select');
  const perTableDiv = document.getElementById('table-filtering');

  primaryKeyDiv.innerText = "Primary key filters loading...";
  perTableDiv.innerText = "Per-table filters loading...";
  
  fetch(url + queryString).then(response => response.json()).then((tables) => {
    primaryKeyDiv.innerText = "";
    perTableDiv.innerText = "";
    makeQuickStartFilters(tables, primaryKeyDiv, filterForm);
    makeFullFiltersCheckboxes(tables, columnDiv, filterForm);
    makeFullFiltersText(tables, perTableDiv, filterForm);
 });
}

function showUserID(required) {
  var userIdBox = document.getElementById('user_id_box');
  var userId = document.getElementById('user_id');
  userIdBox.style.display = 'block';
  if (required) {
    userId.required = true;
  }
}

function showDeviceID(required) {
  var deviceIdBox = document.getElementById('device_id_box');
  var deviceId = document.getElementById('device_id');
  deviceIdBox.style.display = 'block';
  if (required) {
    deviceId.required = true; 
  }
}

//Helper method that creates the quickstart filters
function makeQuickStartFilters(tables, primaryKeyDiv, filterForm){
  //Creating primary key dropdown 
  var primarykey_select = document.createElement('select');
  primarykey_select.style.width = '200px';
  primarykey_select.options.remove(0);
  primarykey_select.name = 'Primary Keys';
  primarykey_select.id = 'primary_key';

  let primkeyDefaultOption = document.createElement('option');
  primkeyDefaultOption.text = 'Primary Keys';
  primkeyDefaultOption.style.display = 'none'; //Hiding table name as a valid option to select

  primarykey_select.add(primkeyDefaultOption);
  primarykey_select.selectedIndex = 0;

  let primarykey_column_inputs = document.createElement('div');
  //primarykey_column_inputs.style.backgroundColor = 'white';

  var userIDRequired = Boolean(false);
  var deviceIDRequired = Boolean(false);

  for(var keys in tables){
    const columnNames = tables[keys][0];
    if (keys != 'PrimaryKeys') {
      if(columnNames.includes('UserId') && !columnNames.includes('DeviceId')){
        userIDRequired = true;
      } else if(columnNames.includes('DeviceId') && !columnNames.includes('UserId')){
        deviceIDRequired = true;
      } 
    }
    else if(keys === 'PrimaryKeys'){
      for(var col in columnNames){
        //Skip making input boxes for UserId and DeviceId for Quickstart
        const columnName = columnNames[col];
        if(columnName === 'UserId' || columnName === 'DeviceId'){
          continue;
        } else{
            //Creating text inputs
            const columnName = tables[keys][0][col];
            var primkey_input = document.createElement('input');
            primkey_input.type= 'text';
            primkey_input.id = columnName;
            primkey_input.name = columnName;
            //Creating the label placeholders for the inputs
            primkey_input.placeholder = columnName;

            //Appending input boxes to the primary_column_inputs div
            primarykey_column_inputs.appendChild(primkey_input);

            //Styling DOM elements
            primarykey_column_inputs.style.border = '1px solid';
            primarykey_column_inputs.style.display = 'none';
            primarykey_column_inputs.style.width = '200px';
            var div = document.createElement('div');
            div.style.padding = '10px';
            primarykey_column_inputs.appendChild(div);
        }
      }
      //onclick event that will hide/show primary key text boxes
      primarykey_select.onclick = function() {
      if (primarykey_column_inputs.style.display === 'none') {
        primarykey_column_inputs.style.display = 'block';
      } else {
          primarykey_column_inputs.style.display = 'none';
      }};

      //After all primary key filter options have been created, append to primaryKeyDiv 
      primaryKeyDiv.appendChild(primarykey_select);
      primaryKeyDiv.appendChild(primarykey_column_inputs);
      var div = document.createElement('div');
      div.style.padding ='10px';
      primaryKeyDiv.appendChild(div);
    }
  }
  showUserID(userIDRequired);
  showDeviceID(deviceIDRequired);
}

function makeFullFiltersText(tables, perTableDiv, filterForm) {
  var searchParams = new URLSearchParams(window.location.search);

  //Create a select dropdown based on the table name as tableName
  for(var tableName in tables){
    if(tableName === 'PrimaryKeys'){
      continue;
    }
    addSelectedTableToForm(tableName, filterForm);
    
    var select = document.createElement('select');
    select.style.width = '200px';
    select.options.remove(0);
    select.id = "table-select";

    let defaultOption = document.createElement('option');
    defaultOption.text = tableName;
    defaultOption.style.display = 'none'; //Hiding table name as a valid option to select

    select.add(defaultOption);
    select.selectedIndex = 0;

    let textInputs = document.createElement('div');
    
    //Create textInputs for each column of the table
    for(var col in tables[tableName][0]){
      const columnName = tables[tableName][0][col];
      if (columnName == "UserId" || columnName == "DeviceId") {
        continue;
      }
      var textInput = document.createElement('input');
      textInput.type= 'text';
      textInput.placeholder = columnName;
      textInput.name = tableName + "-" + columnName;

      var label = document.createElement('label');
      label.innerHTML = columnName;
      label.htmlFor =  columnName;
      textInput.innerHTML = label.outerHTML;
              
      textInputs.appendChild(textInput);

      textInputs.style.border = "1px solid";
      textInputs.style.display = "none";
      textInputs.style.width = '200px';

      var boxDiv = document.createElement('div');
      boxDiv.style.padding ='4px';
      textInputs.appendChild(boxDiv);
    }

    //onclick event that will hide/show column filters
    select.onclick = function() {
      if (textInputs.style.display === "none") {
        textInputs.style.display = "block";
      } else {
        textInputs.style.display = "none";
      }
    };

    perTableDiv.appendChild(select);
    perTableDiv.appendChild(textInputs);
    var div = document.createElement('div');
    div.style.padding ='10px';
    perTableDiv.appendChild(div);
  }  
}

//Helper method that created the Full filters including column selection
function makeFullFiltersCheckboxes(tables, columnDiv, filterForm){
  columnDiv.style.position = 'relative';
    
  //Create a select dropdown based on the table name as keys
  for(var keys in tables){
    if(keys === 'PrimaryKeys'){
      continue;
    }

    var column_select = document.createElement('select');
    column_select.style.width = '200px';
    column_select.options.remove(0);
    column_select.name = keys;
    column_select.id = keys;
        
    let colDefaultOption = document.createElement('option');
    colDefaultOption.text = keys;
    colDefaultOption.style.display = 'none'; //Hiding table name as a valid option to select

    column_select.add(colDefaultOption);
    column_select.selectedIndex = 0;
            
    let colFilters = document.createElement('div'); //div for columns filter
    //colFilters.style.backgroundColor = 'white';
    
    const columnNames = tables[keys][0];
    //Create checkboxes for each column of the table
    for(var col in columnNames){
      const columnName = columnNames[col];

      var col_checkbox = document.createElement('input');
      col_checkbox.type= 'checkbox';
      col_checkbox.value = columnName;
      col_checkbox.id = columnName;
      col_checkbox.name = keys;
      col_checkbox.checked = true; //by default checkbox is checked

      var label = document.createElement('label');
      label.innerHTML = columnName;
      label.htmlFor =  columnName;

      col_checkbox.innerHTML = label.outerHTML;
      col_checkbox.appendChild(label);
      colFilters.appendChild(col_checkbox);
      colFilters.appendChild(label);

      colFilters.style.border = '1px solid';
      colFilters.style.display = 'none';
      colFilters.style.width = '200px';

      var colBoxDiv = document.createElement('div');
      colBoxDiv.style.padding ='4px';
      colFilters.appendChild(colBoxDiv);
    } 

    //onclick event that will hide/show column list filters
    column_select.onclick = function() {
    if (colFilters.style.display === 'none') {
      colFilters.style.display = 'block';
    } else {
      colFilters.style.display = 'none';
    }};

    //appending colum filter dropdown
    columnDiv.appendChild(column_select);
    columnDiv.appendChild(colFilters);
    var div = document.createElement('div');
    div.style.padding ='10px';
    columnDiv.appendChild(div);
  }
}

//Function that toggles between QuickStart mode or Full Mode for filtering
function toggleFilters() {
  var toggle = document.getElementById('toggle');
  if (toggle.innerHTML === 'QUICK START') {
    toggle.innerHTML = 'FULL';
    document.getElementById('primarykey-select').style.display = 'none';
    document.getElementById('column-select').style.display = 'block';
    document.getElementById('table-filtering').style.display = 'block';
  } else {
    toggle.innerHTML = 'QUICK START';
    document.getElementById('primarykey-select').style.display = 'block';
    document.getElementById('column-select').style.display = 'none';
    document.getElementById('table-filtering').style.display = 'none';
  }
}

//function that updates query string when filters are applied
function getFilterValues() {
  var elements = document.getElementById("filter-form").elements;
  var newURL = new URLSearchParams();
  for (var i =0; i < elements.length; i++) {
      if (elements[i].type == "checkbox") {
          if(elements[i].checked == true) {
            newURL.append(elements[i].name,elements[i].value);
          }
          continue;
      } else if (elements[i].name) {
        newURL.append(elements[i].name,elements[i].value);
      }  
  }
  var newQueryString = window.location.pathname + '?' + newURL.toString();
  history.pushState(null, '', newQueryString);
  return false;
}

function clearFilters() { 
    var elements = document.getElementById("filter-form").elements;
    for (var i =0; i < elements.length; i++) {
      if (elements[i].type == "text") {
        elements[i].value = "";
      } else if (elements[i].type == "checkbox") {
        elements[i].checked = true;
      } 
    }
    //update url after filters cleared
    getFilterValues();
}

//Check each element of panel and populate values based on queryString
function populateFilters() {
  var elements = document.getElementById("filter-form").elements;
  var params = new URLSearchParams(window.location.search);
  var checkList;
  for (var i =0; i < elements.length; i++) {
    if (elements[i].type == "text") {
      elements[i].value = params.get(elements[i].name);
    } else if (elements[i].type == "select-one") {
      checkList = params.getAll(elements[i].name);
    }
    else if (elements[i].type == "checkbox") {
      var uncheck = Boolean(true);
      for (var j=0; j<checkList.length; j++) {
        if (checkList[j] == elements[i].value){
          elements[i].checked = true;
          uncheck = false;
          break;
        }
      }
      if (uncheck) {
        elements[i].checked = false;
      }
    }
  }
}