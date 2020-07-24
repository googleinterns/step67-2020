
function openSide() {
  document.getElementById("sideBar").style.width = "250px";
  document.getElementById("filter").style.visibility = "hidden";
  sideOpen = true;
  hideLogo();
  hideShare();
}
var sideOpen = Boolean(false)

function closeSide() {
  document.getElementById("sideBar").style.width = "0px";
  document.getElementById("filter").style.visibility = "visible";
  sideOpen = false;
}

var tableVisible = Boolean(false)
function showDataTable() {
  document.getElementById("data-table").classList.remove("invisible");
  tableVisible = true;
  hideLogo();
  hideShare();
  closeSide();
}

function hideDataTable() {
  tableVisible = false;
  document.getElementById("data-table").classList.add("invisible");
  closeSide();
  showLogo();
}

function showLogo(){
   document.getElementById("centered").classList.remove("invisible");
}

function hideLogo(){
   document.getElementById("centered").classList.add("invisible");
}

function showShare() {
  document.getElementById("share").classList.remove("invisible");
  closeSide();
  hideLogo();
}

function hideShare() {
  document.getElementById("share").classList.add("invisible");
  if(!sideOpen && !tableVisible){
    showLogo();
  }
}