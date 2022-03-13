var data = [];
var identifiers = [];
var eduIdentifiers = [
  "minecraft:agent",
  "minecraft:balloon",
  "minecraft:chalkboard",
  "minecraft:ice_bomb",
  "minecraft:tripod_camera"
];

var identifierList = [];

var xhttp = new XMLHttpRequest();
xhttp.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
       // Typical action to be performed when the document is ready:
       data = JSON.parse(xhttp.responseText);
       identifiers = data.definitions.entity_identifiers.enum;
       doIdentifiers();
    }
};
xhttp.open("GET", "https://raw.githubusercontent.com/bridge-core/editor-packages/main/packages/minecraftBedrock/schema/general/vanilla/identifiers.json", true);
//THANK YOU BRIDGE.!
xhttp.send();

function doIdentifiers(){
  var area = document.getElementById("identifiers_list");
  area.innerHTML = "";
  identifierList = [];
  for(var i = 0; i < identifiers.length; i++){
    var isAcceptable = true;
    for(var a = 0; a < eduIdentifiers.length; a++){
      if(eduIdentifiers[a] == identifiers[i] && !document.getElementById("useEdu").checked){
        isAcceptable = false;
      }
    }
    if(isAcceptable){
      identifierList.push(identifiers[i]);
    }
  }
  
  if(document.getElementById("customentities").value != ""){
    var customentities = document.getElementById("customentities").value.split(" ");
    for(var i = 0; i < customentities.length; i++){
      if(customentities[i] != "" && customentities[i] != " "){
        identifierList.push(customentities[i]);
      }
    }
  }
  
  for(var i = 0; i < identifierList.length; i++){
    var theIdentifier = identifierList[i].split(":");
    theIdentifier[0] = "<span class='id-prefix'>" + theIdentifier[0] + ":</span>";
    theIdentifier = theIdentifier.join("");
    
    var o = document.createElement("label");
        o.setAttribute("identifier", identifierList[i]);
        o.setAttribute("class", "idlabel");
    
        o.innerHTML = "<input type='checkbox' class='idchecker' oninput='checkSAll()'>" + theIdentifier + "<br>";
        area.appendChild(o);
  }
}

function searchList(val){
  var area = document.getElementById("identifiers_list");
  for(var i = 0; i < area.children.length; i++){
    if(val != "*"){
      if(area.children[i].getAttribute("identifier").replaceAll("minecraft", "").includes(val)){
        area.children[i].style.display = "block";
      } else {
        area.children[i].style.display = "none";
      }
    } else {
      if(area.children[i].children[0].checked){
        area.children[i].style.display = "block";
      } else {
        area.children[i].style.display = "none";
      }
    }
  }
  checkSAll();
}

function inputlength(elem){
  elem.style.width = ((elem.value.length * 11.2).toString() + 'px');
  if(elem.value == ""){
    elem.style.width = "200px";
  }
}

function loadPreset(presetname, element){
  var area = document.getElementById("identifiers_list");
  for(var a = 0; a < presetname.length; a++){
    for(var i = 0; i < area.children.length; i++){
      if(area.children[i].getAttribute("identifier") == presetname[a]){
        area.children[i].children[0].checked = element.children[0].checked;
      }
    }
  }
}

function selectAll(elem){
  var area = document.getElementById("identifiers_list");
  for(var i = 0; i < area.children.length; i++){
     if(area.children[i].style.display != "none"){
       area.children[i].children[0].checked = elem.checked;
     }
  }
  
  checkSAll();
}

function checkSAll(){
  var area = document.getElementById("identifiers_list");
  var elem = document.getElementById("selectAllBox");
  var unchecked = 0;
  for(var i = 0; i < area.children.length; i++){
    if(!area.children[i].children[0].checked && area.children[i].style.display != "none"){
      unchecked++;
    }
  }
  if(unchecked == 0){
    elem.indeterminate = false;
    elem.checked = true;
  } else if (unchecked < identifierList.length){
    elem.indeterminate = true;
  } else {
    elem.indeterminate = false;
    elem.checked = false;
  }
  /*if(elem.checked){
     document.getElementById("selectAll").innerHTML = "Deselect All";
  } else {
    document.getElementById("selectAll").innerHTML = "Select All";
  }*/
}

function generateSelector(){
  var targetMobs = [];
  var options = document.getElementsByClassName("idlabel");
  var selectorMobs = [];
  var selector = "";
  
  //Find checked off ones
  for(var i = 0; i < options.length; i++){
    if(options[i].children[0].checked){
      targetMobs.push(options[i].getAttribute("identifier"));
    }
  }
  
  //Compare identifier list with target mobs
  selectorMobs = identifierList;
  for(var i = 0; i < selectorMobs.length; i++){
    for(var a = 0; a < targetMobs.length; a++){
      if(targetMobs[a] == selectorMobs[i]){
        selectorMobs.splice(i, 1);
        i--;
      }
    }
  }
  
  //Generate selector
  selector = "@e[type=!";
  selector += selectorMobs.join(",type=!");
  if(document.getElementById("addargs").value != ""){
    selector += ",";
    selector += document.getElementById("addargs").value;
  }
  selector += "]";
  
  document.getElementById("output").value = selector;
  return targetMobs;
}