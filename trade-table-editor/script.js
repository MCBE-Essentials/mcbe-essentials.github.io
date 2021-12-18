function selectTrade(el){
  var els = document.getElementsByClassName("trade");
  var has = getSelectedTrade() == el;
  for(var i = 0; i < els.length; i++){
    els[i].setAttribute('class', els[i].getAttribute('class').replaceAll(' selected', ''));
  }
  
  if(!has)
  el.setAttribute('class', el.getAttribute('class') + ' selected');
}

function getSelectedTrade(){
  return document.getElementsByClassName("selected")[0];
}

function closeTierEditor(ignoreUpdating){
  document.getElementById("overlay").style.display = "none";
  document.getElementById("tier-editor").style.display = "none";
}

function closeItemEditor(ignoreUpdating){
  document.getElementById("overlay").style.display = "none";
  document.getElementById("item-editor").style.display = "none";
}