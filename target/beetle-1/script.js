//Returns a list of databases from Cloud Spanner as html dropdown
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

//Checks whether the user has left both of the user_id/device_id input box empty. If true, the user cannot submit the filter
// query,if false continue
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

