
function getDatabases(){
 
    fetch("/example").then(response => response.json()).then((list) => {
      console.log(list);

      let dropdown = document.getElementById('list-databases');
      dropdown.length = 0;
      console.log("The length of the dropdown is : " + dropdown.length);

      let defaultOption = document.createElement('option');
      defaultOption.text = 'Select a Database';

      dropdown.add(defaultOption);
      dropdown.selectedIndex = 0;

      let option;
    
    	for (let i in list) {
          option = document.createElement('option');
      	  option.text = list[i];
            console.log(option.text);
      	  option.value = list[i];
            console.log(option.value);
            if(list[i] != null){
                dropdown.add(option);
                console.log(list[i] + "was added into the dropdown");
            }else{
                console.log(list[i] + "was  not added into the dropdown");
            }
      	  
        }


    });
}

