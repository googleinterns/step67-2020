
//Checks whether the user has left both of the user_id/device_id input box empty. If true, the user cannot submit the filter
// query,if false submit
function isFilterInputEmpty(){
  var userID = document.getElementById("user_id").value;
  var deviceID = document.getElementById("device_id").value;

  //Return a message saying that the filters cannot be applied unless at least one of the inputs is filled.
  if(userID == "" && deviceID == ""){
    alert("Applying filters failed: Please input either user_id, device_id or both.");
    return false;
  }
  return true;
}

function submitFilters() {
  return isFilterInputEmpty();
}

function showFiltersPanel(){
  var filterBox = document.getElementById("filter-box");
  if (filterBox.style.display === "none") {
    filterBox.style.display = "block";
  } else {
    filterBox.style.display = "none";
  }
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

function addSelectedTableToForm(keys, filterForm) {
  const tableSelect = document.createElement('input');
  tableSelect.type = "hidden";
  tableSelect.name = "table-select";
  tableSelect.value = keys;
  filterForm.appendChild(tableSelect);
}

//Returns textInput dropdowns of the selected table's columns which can then be filtered
function filterColumns() {
  var queryString = window.location.search;
  var url = "/columns-from-tables";

  var searchParams = new URLSearchParams(window.location.search);
  const filterForm = document.getElementById('filter-form'); 
  const reasonForUse = searchParams.get('reason');
  const database = searchParams.get('list-databases');
  addDatabaseToForm(database, filterForm);
  addReasonToForm(reasonForUse, filterForm);
  
  fetch(url + queryString).then(response => response.json()).then((tables) => {
    const tableFilters = document.getElementById('table-filters');
    tableFilters.style.position = 'relative';
    
    //Create a select dropdown based on the table name as keys
    for(var keys in tables){
      addSelectedTableToForm(keys, filterForm);
      
      var select = document.createElement('select');
      select.style.width = '200px';
      select.options.remove(0);
      select.id = "table-select";

      let defaultOption = document.createElement('option');
      defaultOption.text = keys;
      defaultOption.style.display = 'none'; //Hiding table name as a valid option to select

      select.add(defaultOption);
      select.selectedIndex = 0;

      let textInputs = document.createElement('div');
      
      //Create textInputs for each column of the table
      for(var col in tables[keys][0]){
        var textInput = document.createElement('input');
        textInput.type= 'text';
        textInput.placeholder = tables[keys][0][col];
        textInput.id = "column-select";
        textInput.name = keys + "-" + tables[keys][0][col];
        console.log(textInput.name)

        var label = document.createElement('label');
        label.innerHTML = tables[keys][0][col];
        label.htmlFor =  tables[keys][0][col];
        textInput.innerHTML = label.outerHTML;
                
        //textInput.appendChild(label);
        textInputs.appendChild(textInput);
        //textInputs.appendChild(label);

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

      tableFilters.appendChild(select);
      tableFilters.appendChild(textInputs);
      var div = document.createElement('div');
      div.style.padding ='10px';
      tableFilters.appendChild(div);
    }   
  });
}