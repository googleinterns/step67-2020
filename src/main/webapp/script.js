
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

