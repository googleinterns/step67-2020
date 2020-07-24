function showElement() {
  const tableBox = document.getElementById("table-box");
  tableBox.classList.remove("hidden");
}

function hideElement() {
  const tableBox = document.getElementById("table-box");
  tableBox.classList.add("hidden");
}

function getReason() {
  const input = document.getElementById("reason").value;

  const resultArea = document.getElementById("reason-holder");
  resultArea.textContent = input;
}
