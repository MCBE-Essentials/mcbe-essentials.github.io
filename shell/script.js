var container = document.getElementById("container");
function init(){
  addTextInput();
}

function addTextInput(){
  container.innerHTML += "<li><input></li>";
}

init();