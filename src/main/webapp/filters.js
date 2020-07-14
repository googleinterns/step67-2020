
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
  var x = document.getElementById("filter-box");
  if (x.style.display === "none") {
    x.style.display = "block";
  } else {
    x.style.display = "none";
  }
}

//Returns checkbox dropdowns of the selected table's columns which can then be filtered
function filterColumns() {
  fetch("/columns-from-tb").then(response => response.json()).then((tables) => {
    const tableFilters = document.getElementById('table-filters');
    tableFilters.style.position = 'relative';
    
    //Create a select dropdown based on the table name as keys
    for(var keys in tables){
      var select = document.createElement('select');
      select.style.width = '200px';
      select.options.remove(0);
      select.name = keys;
      select.id = keys;

      let defaultOption = document.createElement('option');
      defaultOption.text = keys;
      defaultOption.style.display = 'none'; //Hiding table name as a valid option to select

      select.add(defaultOption);
      select.selectedIndex = 0;

            
      let checkboxes = document.createElement('div');
      
      //Create checkboxes for each column of the table
      for(var col in tables[keys][0]){
        var checkbox = document.createElement('input');
        checkbox.type= 'checkbox';
        checkbox.value = tables[keys][0][col];
        checkbox.id = tables[keys][0][col];

        var label = document.createElement('label');
        label.innerHTML = tables[keys][0][col];
        label.htmlFor =  tables[keys][0][col];
        checkbox.innerHTML = label.outerHTML;
                
        checkbox.appendChild(label);
        checkboxes.appendChild(checkbox);
        checkboxes.appendChild(label);

        checkboxes.style.border = "1px solid";
        checkboxes.style.display = "none";
        checkboxes.style.width = '200px';

        var boxDiv = document.createElement('div');
        boxDiv.style.padding ='4px';
        checkboxes.appendChild(boxDiv);

        console.log(keys, col, tables[keys][0][col]);
      }

      //onclick event that will hide/show column filters
      select.onclick = function() {
        if (checkboxes.style.display === "none") {
            checkboxes.style.display = "block";
        } else {
            checkboxes.style.display = "none";
        }
     };

        tableFilters.appendChild(select);
        tableFilters.appendChild(checkboxes);
        var div = document.createElement('div');
        div.style.padding ='10px';
        tableFilters.appendChild(div);
    }   
  });
}