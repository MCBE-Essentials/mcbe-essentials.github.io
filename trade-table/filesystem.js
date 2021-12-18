function importProj(data) {
  var decodedData = atob(data);
  document.getElementById("tradelist").innerHTML = decodedData;
  if(!document.getElementById("newItem")){
    alert("The project\n" + document.getElementById("filename").textContent + ".tradeproj\nwas saved with the OLD format. Please save it again to convert your save file into the NEW format.");
    convertOld();
  }
  projectOpened();
  var filenameImported = document.getElementById('input-file').value.split(/(\\|\/)/g).pop();
  filenameImported = filenameImported.replaceAll(".tradeproj", "");
  document.getElementById("filename").value = filenameImported;
}

function convertOld(){
  var oldFilename = document.getElementById("filename").textContent;
  var oldData = document.getElementsByClassName("tradeleft")[1].innerHTML;
  document.getElementById("tradelist").parentNode.innerHTML = oldData;
  document.getElementsByClassName("tradebuttonnew").id="newItem";
  document.getElementsByClassName("tradelist")[0].style.display="block";
  document.getElementById("filename").value = oldFilename;
}

function saveProj() {
  if(document.getElementById("filename").value == ""){
        alert("Please name your project before saving or exporting.");
        return;
  }
  downloadasTextFile(document.getElementById("filename").value + ".tradeproj", btoa(document.getElementById("tradelist").innerHTML));
}

function downloadasTextFile(filename, text) {
    var element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
    element.setAttribute('download', filename);

    element.style.display = 'none';
    document.body.appendChild(element);

    element.click();

    document.body.removeChild(element);
}

// Start file download.
document.getElementById("dwn-btn").addEventListener("click", function(){
    // Generate download of phpcodertech.txt file with some content
    var text = JSON.stringify(exportTable());
    if(document.getElementById("filename").value == ""){
        alert("Please name your project before saving or exporting.");
        return;
    }
    var filename = document.getElementById("filename").value + ".json";
      
    downloadasTextFile(filename, text);
}, false);

document.getElementById('input-file')
  .addEventListener('change', getFile)

document.getElementById('input-file2')
  .addEventListener('change', getFileJson)

function getFile(event) {
	const input = event.target
  if ('files' in input && input.files.length > 0) {
	  placeFileContent("null", input.files[0]);
  }
}

function getFileJson(event) {
	const input = event.target
  if ('files' in input && input.files.length > 0) {
	  placeFileContentJson("null", input.files[0]);
  }
}

function placeFileContent(target, file) {
	readFileContent(file).then(content => {
  	importProj(content);
  })//.catch(error => console.log(error))
}

function placeFileContentJson(target, file) {
	readFileContent(file).then(content => {
  	importTable(content);
  })//.catch(error => console.log(error))
}

function readFileContent(file) {
	const reader = new FileReader()
  return new Promise((resolve, reject) => {
    reader.onload = event => resolve(event.target.result)
    reader.onerror = error => reject(error)
    reader.readAsText(file)
  })
}

//Output

var tableTemplate1 = '{"tiers": [{"trades": [';
var tableTemplate2 = ']}]}';

var tradeEntryTemplate1 = '{"wants": [{"item": "minecraft:emerald","quantity": 1}],"gives": [{"item": "minecraft:dye:16","quantity": 10}]}';

function generateTradeTable(){
  var output = "";
  output += tableTemplate1;
  var a = 0;
  var elements = document.getElementsByClassName("tradebutton");
  for(a = 0; a < elements.length; a++){
    //Generate entries
    output += '{';
    output += '"wants": [';
    
    output += '{"item": "';
    output += document.getElementsByClassName("item1")[a].getAttribute("item");
    output += '", "quantity": '
    output += document.getElementsByClassName("item1")[a].getAttribute("count");
    output += '}';
    
    
    if(document.getElementsByClassName("item2")[a].getAttribute("item") != "empty"){
      output += ",";
    output += '{"item": "';
    output += document.getElementsByClassName("item2")[a].getAttribute("item");
    output += '", "quantity": '
    output += document.getElementsByClassName("item2")[a].getAttribute("count");
    output += '}';
    }
    output += "]";
    
    output += ',"gives": ['
    
    output += '{"item": "';
    output += document.getElementsByClassName("itemresult")[a].getAttribute("item");
    output += '", "quantity": '
    output += document.getElementsByClassName("itemresult")[a].getAttribute("count");
    output += '}';
    
    output += "],";
    output += ' "rewards_exp": '
    output += document.getElementsByClassName("tradebutton")[a].getAttribute("gives-xp");
    
    output += ', "max_uses": '
    output += document.getElementsByClassName("tradebutton")[a].getAttribute("max-uses");
    
    output += "}";
    
    if(a != elements.length - 1){
      output += ",";
    }
    output += "\n";
  }
  output += tableTemplate2;
  return output;
}

var tableproject = {};
var tpd;
var tableprojectData;

function importTable(data){
  var output = "";
  
  try {
    tableproject = JSON.parse(data);
  } catch(e) {
    alert("We couldn't open the project. Check the syntax of the file.");
    console.log(data);
    return;
  }
  //console.log(JSON.parse(data));
  if(tableproject.tiers[0].trades){
    tableprojectData = tableproject.tiers[0].trades;
    tpd = tableprojectData;
  } else if(tableproject.tiers[0].groups[0]){
    tableprojectData = tableproject.tiers[0].groups[0].trades;
    alert("We've only used the first trade group you have.");
    tpd = tableprojectData;
  }
  
  if(tableproject.tiers.length > 1){
    alert("Your trade table has multiple tiers. This program is a simple editor, so we've only looked at the first tier.");
  }
  document.getElementById("tradelist").innerHTML = '<div id="tradelist" class="tradelist" meta-data="v2"><div class="tradebuttonnew" onclick="addNewItem()" id="newItem" style="margin-left: 5px; width: 235px;"><span class="plus">+</span><!-- <img src="https://cdn.glitch.com/17ff8eee-9239-4ba0-8a5c-9263261550b5%2Fcolor_plus.png?v=1617471105142" width="25" height="25" style=" margin-top: 10px;"> --></div></div>';
  for(var i = 0; i < tpd.length; i++){
    var givesXp = true;
    var maxUses = -1;
    
    var wants1 = {functions: ""};
    var wants2 = {exists: false, functions: ""};
    var gives1 = {functions: ""};
    
    if(!tpd[i]["rewards_exp"]){
      givesXp = false;
    }
    
    if(tpd[i]["max_uses"]){
      maxUses = tpd[i]["max_uses"];
    } else {
      maxUses = 0;
    }
    
    if(tpd[i].wants[0]){
      //Property "wants" exists
      if(tpd[i].wants[0].item){
        wants1.item = tpd[i].wants[0].item;
      } else {
        wants1.item = "empty";
      }
      if(tpd[i].wants[0].quantity){
        wants1.quantity = tpd[i].wants[0].quantity;
      } else {
        wants1.quantity = 1;
      }
      
      if(tpd[i].wants[0].functions){
        
          wants1.functions = '"functions":' + tpd[i].wants[0].functions + "";
          //wants1.functions.slice(1, wants1.functions.length - 1);
      }
      
      if(tpd[i].wants.length == 2){
        wants2.exists = true;
          if(tpd[i].wants[1].item){
            wants2.item = tpd[i].wants[1].item;
          } else {
            wants2.item = "empty";
          }
          if(tpd[i].wants[1].quantity){
            wants2.quantity = tpd[i].wants[1].quantity;
          } else {
            wants2.quantity = 1;
          }
        if(tpd[i].wants[1].functions){
          wants2.functions = '"functions":' + tpd[i].wants[1].functions + "";
          //wants2.functions.slice(1, wants2.functions.length - 1);
        }
      } else {
        wants2.exists = true;
        wants2.item = "empty";
        wants2.quantity=1;
      }
      
    } else {
      console.log("Missing 'wants' in trade" + i);
      alert("Error, aborted. Missing at least 1 'wants' property in trade" + i);
      return;
    }
    
    
    if(tpd[i].gives[0]){
      //Property "gives" exists
      if(tpd[i].gives[0].item){
        gives1.item = tpd[i].gives[0].item;
      } else {
        gives1.item = "empty";
      }
      if(tpd[i].gives[0].quantity){
        gives1.quantity = tpd[i].gives[0].quantity;
      } else {
        gives1.quantity = 1;
      }
      
      
      if(tpd[i].gives[0].functions){
          //console.log(tpd[i].gives[0].functions);
          gives1.functions = '"functions":' + JSON.stringify(tpd[i].gives[0].functions) + "";
          //gives1.functions.slice(1, gives1.functions.length - 1);
      }
    } else {
      console.log("Missing 'gives' in trade" + i);
      alert("Error, aborted. Missing at least 1 'gives' property in trade" + i);
      return;
    }
    
    /*output += listitemtemplate1 + givesXp + listitemtemplate2 + maxUses + listitemtemplate3 + wants1.item + listitemtemplate4 + wants1.quantity + listitemtemplate5 + wants1.functions + listitemtemplate6;
    if(wants2.exists){output += wants2.item}else{output += "empty"};
    output += listitemtemplate7;
    if(wants2.exists){output += wants2.quantity}else{output += "1"};
    output += listitemtemplate8;
    if(wants2.exists){output += wants2.functions}else{output += ""};
    output += listitemtemplate9 + gives1.item + listitemtemplate10 + gives1.quantity + listitemtemplate11 + gives1.functions + listitemtemplate12;*/
    
        document.getElementById("tradelist").innerHTML += "<div class=\"tradebutton\" onclick=\"selectNewItem(this);\" gives-xp=\"\" max-uses=\"\" style=\"margin-left: 15px; width: 225px;\"><img src=\"https://cdn.glitch.com/7ebd45ef-9ef1-4a6b-8943-4d9c8195b2ff%2Fempty_armor_slot_shield.png\" height=\"35\" width=\"35\" class=\"buttonitem item1\" item=\"\" count=\"\" json=\"\"><span class=\"count count1\">&nbsp;</span>&nbsp;<img src=\"https://cdn.glitch.com/7ebd45ef-9ef1-4a6b-8943-4d9c8195b2ff%2Fempty_armor_slot_shield.png\" height=\"35\" width=\"35\" class=\"buttonitem item2\" item=\"\" count=\"\" json=\"\"><span class=\"count count2\">&nbsp;</span>&nbsp;<span class=\"equals\">=</span><img src=\"https://cdn.glitch.com/7ebd45ef-9ef1-4a6b-8943-4d9c8195b2ff%2Fempty_armor_slot_shield.png\" height=\"35\" width=\"35\" class=\"buttonitem itemresult\" item=\"\" count=\"\" json=\"\"><span class=\"count countR\">&nbsp;</span></div>";
    var ingeneration = document.getElementsByClassName("tradebutton")[document.getElementsByClassName("tradebutton").length - 1]
    ingeneration.setAttribute("gives-xp", givesXp);
    ingeneration.setAttribute("max-uses", maxUses);
    ingeneration.getElementsByClassName("item1")[0].setAttribute("item", wants1.item);
    ingeneration.getElementsByClassName("item1")[0].setAttribute("count", wants1.quantity);
    ingeneration.getElementsByClassName("item1")[0].setAttribute("json", wants1.functions);
    ingeneration.getElementsByClassName("item2")[0].setAttribute("item", wants2.item);
    ingeneration.getElementsByClassName("item2")[0].setAttribute("count", wants2.quantity);
    ingeneration.getElementsByClassName("item2")[0].setAttribute("json", wants2.functions);
    ingeneration.getElementsByClassName("itemresult")[0].setAttribute("item", gives1.item);
    ingeneration.getElementsByClassName("itemresult")[0].setAttribute("count", gives1.quantity);
    ingeneration.getElementsByClassName("itemresult")[0].setAttribute("json", gives1.functions);
  }
  //document.getElementById("tradelist").innerHTML = '<div class="tradebuttonnew" onclick="addNewItem()" id="newItem" style="margin-left: 5px; width: 235px;"><span class="plus">+</span></div>' + output;
  projectOpened();
  var filenameImported = document.getElementById('input-file2').value.split(/(\\|\/)/g).pop();
  filenameImported = filenameImported.replaceAll(".json", "");
  document.getElementById("filename").value = filenameImported;
  
  reloadValues();
  updateAll();
  
  for(var i = 0; i < (document.getElementsByClassName("tradebutton").length - 0); i++){
    selectNewItem(document.getElementsByClassName("tradebutton")[i]);
    updateAll();
    var group = document.getElementsByClassName("tradebutton")[i];
    for(var m = 0; m < group.getElementsByClassName("buttonitem").length - 0; m++){
      if(group.getElementsByClassName("buttonitem")[m].getAttribute("item") != "empty"){
        selectItemForAttribute(group.getElementsByClassName("buttonitem")[m].classList[1]);
        loadAttributes();
        updateEnchantments();
        //console.log(group.getElementsByClassName("buttonitem")[m]);
      }
    }
  }
  selectNewItem(document.getElementsByClassName("tradebutton")[0]);
}

function exportTable(){
  var elements = document.getElementsByClassName("tradebutton");
  tableproject = {};
  tableproject.tiers = [];
  tableproject.tiers[0] = {};
  tableproject.tiers[0].trades = [];
  
  tableprojectData = tableproject.tiers[0].trades;
  tpd = tableprojectData;
  
  for(var i = 0; i < elements.length; i++){
    var module = {};
    module.rewards_exp = elements[i].getAttribute("gives-xp");
    module.max_uses = parseInt(elements[i].getAttribute("max-uses"), 10);
    module.wants = [];
    module.gives = [];
    
    var elementItems = elements[i].getElementsByTagName("img");
    module.wants[0] = {};
      module.wants[0].item = elementItems[0].getAttribute("item");
      module.wants[0].quantity = parseInt(elementItems[0].getAttribute("count"), 10);
      if(elementItems[0].getAttribute("json") && elementItems[0].getAttribute("json") != "" && JSON.parse("{" + elementItems[0].getAttribute("json") + "}").functions.length > 0){
        module.wants[0].functions = JSON.parse("{" + elementItems[0].getAttribute("json") + "}").functions;
      }
    
    if(elementItems[1].getAttribute("item") != "empty" && elementItems[1].getAttribute("item") != "" && JSON.parse("{" + elementItems[1].getAttribute("json") + "}").functions.length > 0){
    module.wants[1] = {};
      module.wants[1].item = elementItems[1].getAttribute("item");
      module.wants[1].quantity = parseInt(elementItems[1].getAttribute("count"), 10);
      if(elementItems[1].getAttribute("json") && elementItems[1].getAttribute("json") != "" ){
        module.wants[1].functions = JSON.parse("{" + elementItems[1].getAttribute("json") + "}").functions;
      }
    }
    
    module.gives[0] = {};
      module.gives[0].item = elementItems[2].getAttribute("item");
      module.gives[0].quantity = parseInt(elementItems[2].getAttribute("count"), 10);
      if(elementItems[2].getAttribute("json") && elementItems[2].getAttribute("json") != "" && JSON.parse("{" + elementItems[2].getAttribute("json") + "}").functions.length > 0){
        module.gives[0].functions = JSON.parse("{" + elementItems[2].getAttribute("json") + "}").functions;
      }
    
    tableproject.tiers[0].trades.push(module);
  }
  
  return tableproject;
}

var listitemtemplate1 = '<div class="tradebutton" onclick="selectNewItem(this);" gives-xp="';
var listitemtemplate2 = '" max-uses="';
var listitemtemplate3 = '" style="margin-left: 15px; width: 225px;"><img src="https://cdn.glitch.com/7ebd45ef-9ef1-4a6b-8943-4d9c8195b2ff%2Fempty_armor_slot_shield.png" height="35" width="35" class="buttonitem item1" item="';
var listitemtemplate4 = '" count="';
var listitemtemplate5 = '" json="'
var listitemtemplate6 = '"><span class="count count1">&nbsp;</span><img src="https://cdn.glitch.com/7ebd45ef-9ef1-4a6b-8943-4d9c8195b2ff%2Fempty_armor_slot_shield.png" height="35" width="35" class="buttonitem item2" item="';
var listitemtemplate7 = '" count="';
var listitemtemplate8 = '" json="'
var listitemtemplate9 = '"><span class="count count2">&nbsp;</span><span class="equals">=</span><img src="https://cdn.glitch.com/7ebd45ef-9ef1-4a6b-8943-4d9c8195b2ff%2Fempty_armor_slot_shield.png" height="35" width="35" class="buttonitem itemresult" item="';
var listitemtemplate10 = '" count="';
var listitemtemplate11 = '" json="'
var listitemtemplate12 = '"><span class="count countR">&nbsp;</span></div>';

