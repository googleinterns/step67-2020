
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

function showFiltersPanel(){
  var filterBox = document.getElementById("filter-box");
  document.getElementById("filter-button").style.visibility = "hidden";
  if (filterBox.style.display === "none") {
    filterBox.style.display = "block";
  } else {
    filterBox.style.display = "none";
  }
}

//Returns checkbox dropdowns of the selected table's columns which can then be filtered
function filterColumns() {
  var queryString = window.location.search;
  var url = "/columns-from-tables";
  console.log(url + queryString);
  fetch(url + queryString).then(response => response.json()).then((tables) => {
      console.log(tables);
    const columnDiv = document.getElementById('column-filters');
    const primkeyDiv = document.getElementById('primarykey-filters');
    columnDiv.style.position = 'relative';
    primkeyDiv.style.position = 'relative';

    var primkey_select = document.createElement('select');
      primkey_select.style.width = '200px';
      primkey_select.options.remove(0);
      primkey_select.name = 'Primary Keys';
      primkey_select.id = 'primary_key';
    
    //Create a select dropdown based on the table name as keys
    for(var keys in tables){
      var column_select = document.createElement('select');
      column_select.style.width = '200px';
      column_select.options.remove(0);
      column_select.name = keys;
      column_select.id = keys;

      let colDefaultOption = document.createElement('option');
      let pkDefaultOption = document.createElement('option');
        colDefaultOption.text = keys;
        colDefaultOption.style.display = 'none'; //Hiding table name as a valid option to select
        pkDefaultOption.text = 'Primary Keys';
        pkDefaultOption.style.display = 'none';

      column_select.add(colDefaultOption);
      column_select.selectedIndex = 0;
      primkey_select.add(pkDefaultOption);
      primkey_select.selectedIndex = 0;

            
      let colFilters = document.createElement('div'); //div for columns filter
      let primkeyFilters = document.createElement('div');//div for primary keys filter
      
      //Create checkboxes for each column of the table
      for(var col in tables[keys][0]){
        var col_checkbox = document.createElement('input');
        col_checkbox.type= 'checkbox';
        col_checkbox.value = tables[keys][0][col];
        col_checkbox.id = tables[keys][0][col];

        var label = document.createElement('label');
        label.innerHTML = tables[keys][0][col];
        label.htmlFor =  tables[keys][0][col];
        col_checkbox.innerHTML = label.outerHTML;
                
        col_checkbox.appendChild(label);
        colFilters.appendChild(col_checkbox);
        colFilters.appendChild(label);

        colFilters.style.border = "1px solid";
        colFilters.style.display = "none";
        colFilters.style.width = '200px';

        var colBoxDiv = document.createElement('div');
        colBoxDiv.style.padding ='4px';
        colFilters.appendChild(colBoxDiv);
      } 

     // creating the checkboxes for the primary keys of the selected tables
      for(var col in tables[keys][1]){
          console.log(tables[keys][1]);
            var primkey_checkbox = document.createElement('input');
            primkey_checkbox.type= 'checkbox';
            primkey_checkbox.value = tables[keys][1][col];
            primkey_checkbox.id = tables[keys][1][col];;

            var label = document.createElement('label');
            label.innerHTML = tables[keys][1][col];
            label.htmlFor =  'primkey-select';
            primkey_checkbox.innerHTML = label.outerHTML;
                    
            primkey_checkbox.appendChild(label);
            primkeyFilters.appendChild(primkey_checkbox);
            primkeyFilters.appendChild(label);

            primkeyFilters.style.border = "1px solid";
            primkeyFilters.style.display = "none";
            primkeyFilters.style.width = '200px';

            var pkBoxDiv = document.createElement('div');
            pkBoxDiv.style.padding ='4px';
            primkeyFilters.appendChild(pkBoxDiv);
            console.log("checkbox was made for the primary key" + tables[keys][1][col]);
        }
      //onclick event that will hide/show column filters
      primkey_select.onclick = function() {
      if (primkeyFilters.style.display === "none") {
        primkeyFilters.style.display = "block";
      } else {
            primkeyFilters.style.display = "none";
        }
      };

      //onclick event that will hide/show column filters
      column_select.onclick = function() {
        if (colFilters.style.display === "none") {
            colFilters.style.display = "block";
        } else {
            colFilters.style.display = "none";
        }
     };

      //appending colum filter dropdown
      columnDiv.appendChild(column_select);
      columnDiv.appendChild(colFilters);
      var div = document.createElement('div');
      div.style.padding ='10px';
      columnDiv.appendChild(div);
 
    //appending primary keys filter dropdown
      primkeyDiv.appendChild(primkey_select);
      primkeyDiv.appendChild(primkeyFilters);
      var div = document.createElement('div');
      div.style.padding ='10px';
      primkeyDiv.appendChild(div);
    }
 });
}

function toggleFilters() {
  var toggle = document.getElementById("toggle");
  var column_filters = document.getElementById("column-filters");
  var primarykey_filters = document.getElementById("primarykey-filters");
  if (toggle.innerHTML === "Default") {
    toggle.innerHTML = "Quick Start";
    var column_filters = document.getElementById("column-filters");
    column_filters.style.display = "none";
    primarykey_filters.style.display = "block";

  } else {
    toggle.innerHTML = "Default";
    column_filters.style.display = "block";
    primarykey_filters.style.display = "none";
  }
}
