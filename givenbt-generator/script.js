var identifiers = {};
async function fetchData(){
  var ids = await fetch('https://raw.githubusercontent.com/bridge-core/editor-packages/main/packages/minecraftBedrock/schema/general/vanilla/identifiers.json').then(data => data.json());
  //Using the dev domain so that list can be updated without updating site
  identifiers = ids.definitions;
  
  doIdentifiers();
}

fetchData();

function doIdentifiers(){
  var blocks = identifiers.prefixed_block_identifiers.enum;
  
  document.getElementById("place_list").innerHTML = "";
  document.getElementById("destroy_list").innerHTML = "";
  for(var i = 0; i < blocks.length; i++){
    var newItemPlace = '<label identifier="'+ blocks[i] +'" class="idlabel"><input type="checkbox" class="idchecker" oninput="checkSAll(\'place_list\')">'+ blocks[i].replaceAll("minecraft:","") +'</label>';
    var newItemDestroy = '<label identifier="'+ blocks[i] +'" class="idlabel"><input type="checkbox" class="idchecker" oninput="checkSAll(\'destroy_list\')">'+ blocks[i].replaceAll("minecraft:","") +'</label>';
    
    document.getElementById("place_list").innerHTML += newItemPlace;
    document.getElementById("destroy_list").innerHTML += newItemDestroy;
  }
  
  for(let item of identifiers.prefixed_item_identifiers.enum){
    document.getElementById("item_ids").innerHTML += "<option value='"+item+"'></option>";
  }
}

function searchList(val, list){
  var area = document.getElementById(list);
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
  checkSAll(list);
}

function selectAll(elem, list){
  var area = document.getElementById(list);
  for(var i = 0; i < area.children.length; i++){
     if(area.children[i].style.display != "none"){
       area.children[i].children[0].checked = elem.checked;
     }
  }
  
  checkSAll(list);
}

function checkSAll(list){
  var area = document.getElementById(list);
  var elem = document.getElementById(list + "_box");
  var unchecked = 0;
  for(var i = 0; i < area.children.length; i++){
    if(!area.children[i].children[0].checked && area.children[i].style.display != "none"){
      unchecked++;
    }
  }
  if(unchecked == 0){
    elem.indeterminate = false;
    elem.checked = true;
  } else if (unchecked < identifiers.prefixed_block_identifiers.enum.length){
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

function copyText() {
  /* Get the text field */
  var copyText = document.getElementById("output");
  
  /* Enable the text field */
  copyText.disabled = false;
  
  /* Select the text field */
  copyText.select();
  copyText.setSelectionRange(0, 99999); /* For mobile devices */

  /* Copy the text inside the text field */
  document.execCommand("copy");

  /* Alert the copied text */
  //alert("Copied the text: " + copyText.value);
  
  /* Disable the text field */
  copyText.disabled = true;
}

function getList(identifier){
  var list = document.getElementById(identifier);
  var output = [];
  for(let child of list.children){
    if(child.children[0].checked){
      output.push(child.getAttribute("identifier").replaceAll("minecraft:",""));
    }
  }
  
  return output;
}

function doOutput(){
  var outputJson = {};
  
  var canplaceonlist = getList('place_list');
  var candestroylist = getList('destroy_list');
  var itemlock = document.getElementById("itemlock").value;
  var keepondeath = document.getElementById("keepondeath").checked;
  
  var item = document.getElementById("item").value;
  var data = document.getElementById("data").value;
  var selector = document.getElementById("selector").value;
  var count = document.getElementById("count").value;
  
  if(canplaceonlist.length > 0){
    outputJson["minecraft:can_place_on"] = {blocks: canplaceonlist};
  }
  
  if(candestroylist.length > 0){
    outputJson["minecraft:can_destroy"] = {blocks: candestroylist};
  }
  
  if(itemlock != "none"){
    outputJson["minecraft:item_lock"] = {mode: itemlock};
  }
  
  if(keepondeath){
    outputJson["minecraft:keep_on_death"] = {};
  }
  
  var output = JSON.stringify(outputJson);
  if(output == "{}"){
    output = "";
  }
  
  document.getElementById("output").value = "/give "+ selector +" " + item + " "+ count +" " + data + " " + output;
}