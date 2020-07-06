
function getData() {
    console.log("fetch");
    fetch('/example-db').then(response => response.text()).then((word) => {
    document.getElementById('data-container').innerText = word;
  });
}