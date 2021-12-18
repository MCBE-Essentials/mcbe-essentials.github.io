var focusedTextElement;
var contentframe = '<div w3-include-html="/trade-table/fullgriddump2.html" style="overflow-y:scroll;overflow-x:hidden;width:245px;background-color:white;text-indent:0;padding:5px;"></div><span id="iddisplay" style="background-color:white;" class="iddisplay">identifier</span>';
var saveLastMouseover = "";
function mouseOverGridIcon(elem){
  var target = document.getElementById(focusedTextElement.id + "iddisplay");
  target.textContent = data[elem.getAttribute("data-index")].identifier;
  //focusedTextElement.value = data[elem.getAttribute("data-index")].identifier;
  saveLastMouseover = elem.getAttribute("data-index");
  return elem.getAttribute("data-index") + data[elem.getAttribute("data-index")].identifier;
}
function clickGridIcon(elem){
   focusedTextElement.value = data[elem.getAttribute("data-index")].identifier;
  blurAll();
}
function filterGrid(query) {
  var key = query;
  key = correctIdentifier(key)[0];
    if(document.getElementById("dictionarytype").value == "grid"){
  var doc = document.getElementById(focusedTextElement.id + "dictionary");
  tkey = key;
  var n = 0;
  for (n = 0; n < doc.children[0].children.length; n++) {
      if (doc.children[0].children[n].getAttributeNode("data-search-id").value.includes(key) || doc.children[0].children[n].getAttributeNode("data-search-id").value == "empty") {
        doc.children[0].children[n].style.display = "inline";
      } else {
        doc.children[0].children[n].style.display = "none";
      }
  }
    }
}
var tkey = "";
function testKeyword(din){
  return din.getAttribute("data-search-id").contains(tkey);
}

function newTextfocus(element){  
  if(document.getElementById("dictionarytype").value == "grid"){
    blurAll();
    element.select(); 
    if(focusedTextElement != element){
    focusedTextElement = element;
  

  document.getElementById(focusedTextElement.id + "anchor").style.display="block";
      
    }
    if(focusedTextElement.value == "empty"){
      filterGrid("");
    }else{
      filterGrid(focusedTextElement.value);
    }
  }
  if(document.getElementById("dictionarytype").value == "autofill"){
    element.setAttribute("list","dictionarydata");
  } else {
    element.removeAttribute("list");
  }
}

function newTextBlur(el){  
  //Placeholder so there are no errors. Moved to blurAll();.
}

document.addEventListener("keyup", function(event) {
  if (event.keyCode === 13) {
    blurAll();
  }
});

function blurAll(){
  var i = 0;
  var search = document.getElementsByClassName("anchor");
  for(i = 0; i < search.length; i++){
    search[i].style.display="none";
  }
  updateAll();
  focusedTextElement = "";
}

//Blur activate when clicking off an element
document.getElementById("editor").addEventListener("click", function( e ){
    e = window.event || e; 
    if(e.target == document.getElementById("right") || e.target == document.getElementById("textedit")) {
    //if(e.target != document.querySelector("input:focus")){
        blurAll();
    }
});

var selectedItem = 0;
var listitem = '<div class="tradebutton" onclick="selectNewItem(this);" gives-xp="false" max-uses="-1"><img src="https://cdn.glitch.com/d28d8954-15cb-47a1-b9d3-c7e70ece9961%2Fempty_armor_slot_shield.png" height="35" width="35" class="buttonitem item1" item="empty" count="1"><span class="count count1">&nbsp;</span>   <img src="https://cdn.glitch.com/d28d8954-15cb-47a1-b9d3-c7e70ece9961%2Fempty_armor_slot_shield.png" height="35" width="35" class="buttonitem item2" item="empty" count="1"><span class="count count2">&nbsp;</span>    <span class="equals">=</span>    <img src="https://cdn.glitch.com/d28d8954-15cb-47a1-b9d3-c7e70ece9961%2Fempty_armor_slot_shield.png" height="35" width="35" class="buttonitem itemresult" item="empty" count="1"><span class="count countR">&nbsp;</span></div>';
var data = data;

function correctIdentifier(query){
  var returnable = [];
  var suffix = "";
  var key = query;
    if(key.includes(":")){
    key = key.split(":");
      if(parseInt(key[1], 10) > 0 && parseInt(key[1], 10) != NaN){
      key.unshift("minecraft");
      }
      key.splice(0, 1);
      if(key.length == 2){
        suffix = key.splice(1, 1);
        suffix.toString();
      }
    key.toString();
  }
  returnable.push(key);
  if(suffix != ""){
    returnable.push(suffix);
  }
  return returnable;
}

function updateAll() {
  //Define variables
  var item1 = document.getElementsByClassName("item1")[selectedItem - 1];
  var count1 = document.getElementsByClassName("count1")[selectedItem - 1];
  var desiredItem1 = document.getElementById("wants1").value;
  var desiredCount1 = document.getElementById("wants1c").value;
  var item2 = document.getElementsByClassName("item2")[selectedItem - 1];
  var count2 = document.getElementsByClassName("count2")[selectedItem - 1];
  var desiredItem2 = document.getElementById("wants2").value;
  var desiredCount2 = document.getElementById("wants2c").value;
  var itemR = document.getElementsByClassName("itemresult")[selectedItem - 1];
  var countR = document.getElementsByClassName("countR")[selectedItem - 1];
  var desiredItemR = document.getElementById("gives").value;  
  var desiredCountR = document.getElementById("givesc").value;
  var selectedItemParent = document.getElementsByClassName("tradebutton")[selectedItem - 1];  
  //var givesXP = selectedItemParent.getAttribute("wantsXP");
  var desiredGivesXP = document.getElementById("givesXPCheckbox").checked;
  var desiredMaxUses = document.getElementById("maxUses").value;
  //var desiredPriceMult = document.getElementById("priceMult").value;
  
  //Update item images of desired items and results
  //desiredItem1 = correctIdentifier(desiredItem1)[0];
  if(searchData(data, correctIdentifier(desiredItem1)[0])){
    //if(!data[searchData(data, desiredItem1)].isCustom){
    item1.src =
    "https://cdn.glitch.com/d28d8954-15cb-47a1-b9d3-c7e70ece9961%2F" +
    data[searchData(data, correctIdentifier(desiredItem1)[0])].png +
    ".png";
   /* } else {
      item1.src = data[searchData(data, desiredItem1)].imgData;
    }*/
  } else if(data[searchData(data, desiredItem1)]){
    if(data[searchData(data, desiredItem1)].isCustom){
      item1.src = data[searchData(data, desiredItem1)].imgData;
    } else {
      item1.src = "https://cdn.glitch.com/d28d8954-15cb-47a1-b9d3-c7e70ece9961%2Fempty_armor_slot_shield.png";         
    }
  } else {
    item1.src = "https://cdn.glitch.com/d28d8954-15cb-47a1-b9d3-c7e70ece9961%2Fempty_armor_slot_shield.png";                                  
  }
  count1.innerHTML = desiredCount1;
  if (count1.innerHTML == "1") {
    count1.innerHTML = "&nbsp;";
  }
  item1.setAttribute("item", desiredItem1);
  item1.setAttribute("count", desiredCount1);
  
  //desiredItem2 = correctIdentifier(desiredItem2)[0];
  if(searchData(data, correctIdentifier(desiredItem2)[0])){   
    item2.src =
      "https://cdn.glitch.com/d28d8954-15cb-47a1-b9d3-c7e70ece9961%2F" +
      data[searchData(data, correctIdentifier(desiredItem2)[0])].png +
      ".png";
  } else if(data[searchData(data, desiredItem2)]){
    if(data[searchData(data, desiredItem2)].isCustom){
      item2.src = data[searchData(data, desiredItem2)].imgData;
    } else {
      item2.src = "https://cdn.glitch.com/d28d8954-15cb-47a1-b9d3-c7e70ece9961%2Fempty_armor_slot_shield.png";         
    }
  } else {
    item2.src = "https://cdn.glitch.com/d28d8954-15cb-47a1-b9d3-c7e70ece9961%2Fempty_armor_slot_shield.png"; 
  }
  count2.innerHTML = desiredCount2;
  if (count2.innerHTML == "1") {
    count2.innerHTML = "&nbsp;";
  }
  item2.setAttribute("item", desiredItem2);
  item2.setAttribute("count", desiredCount2);
  
  //desiredItemR = correctIdentifier(desiredItemR)[0];
  if(searchData(data, correctIdentifier(desiredItemR)[0])){
      itemR.src =
        "https://cdn.glitch.com/d28d8954-15cb-47a1-b9d3-c7e70ece9961%2F" +
        data[searchData(data, correctIdentifier(desiredItemR))].png +
        ".png";   
  } else if(data[searchData(data, desiredItemR)]){
    if(data[searchData(data, desiredItemR)].isCustom){
      itemR.src = data[searchData(data, desiredItemR)].imgData; 
    } else {
      itemR.src = "https://cdn.glitch.com/d28d8954-15cb-47a1-b9d3-c7e70ece9961%2Fempty_armor_slot_shield.png";         
    }
  } else {
    itemR.src = "https://cdn.glitch.com/d28d8954-15cb-47a1-b9d3-c7e70ece9961%2Fempty_armor_slot_shield.png"; 
  }
  countR.innerHTML = desiredCountR;
  if (countR.innerHTML == "1") {
    countR.innerHTML = "&nbsp;";
  }
  itemR.setAttribute("item", desiredItemR);
  itemR.setAttribute("count", desiredCountR);
  
  selectedItemParent.setAttribute("gives-xp", desiredGivesXP.toString());
  selectedItemParent.setAttribute("max-uses", desiredMaxUses);
  //selectedItemParent.setAttribute("price-mult", desiredPriceMult);
  
/*
  //Empty item PNG
  item1.addEventListener("error", function() {
    item1.src =
      "https://cdn.glitch.com/d28d8954-15cb-47a1-b9d3-c7e70ece9961%2Fempty_armor_slot_shield.png";
  });
    item2.addEventListener("error", function() {
    item2.src =
      "https://cdn.glitch.com/d28d8954-15cb-47a1-b9d3-c7e70ece9961%2Fempty_armor_slot_shield.png";
  });
    itemR.addEventListener("error", function() {
    itemR.src =
      "https://cdn.glitch.com/d28d8954-15cb-47a1-b9d3-c7e70ece9961%2Fempty_armor_slot_shield.png";
  });
*/  
  
    //Tooltips
  item1.title = item1.getAttribute("item");
  item2.title = item2.getAttribute("item");
  itemR.title = itemR.getAttribute("item");
}

function addItemHere(){
  //if(document.getElementById("tradelist").children[selectedItem]){
    document.getElementById("tradelist").innerHTML += listitem;
    var selectedItemOld = selectedItem;
    selectNewItem(document.getElementsByClassName("tradebutton")[(document.getElementsByClassName("tradebutton").length - 1)]);
    var l;
    for(l = 0; l < (document.getElementsByClassName("tradebutton").length - selectedItemOld - 1); l++){
    moveItemUp();
    }
  //}
}

function addNewItem(){
  document.getElementById("tradelist").innerHTML += listitem;
  selectNewItem(document.getElementsByClassName("tradebutton")[(document.getElementsByClassName("tradebutton").length - 1)]);
}

function deleteSelected(){
  if(document.getElementById("tradelist").children[selectedItem]){
    document.getElementById("tradelist").removeChild(document.getElementById("tradelist").children[selectedItem]);
    if(document.getElementsByClassName("tradebutton")[selectedItem - 1]){
      selectNewItem(document.getElementsByClassName("tradebutton")[selectedItem - 1]);
    } else {
       selectNewItem(document.getElementsByClassName("tradebutton")[(document.getElementsByClassName("tradebutton").length - 1)]);   
    }
  }
}

function duplicateSelected(){
  if(document.getElementById("tradelist").children[selectedItem]){
    var selectedData = document.getElementsByClassName("tradebutton")[selectedItem - 1].innerHTML;
    document.getElementById("tradelist").innerHTML += '<div class="tradebutton" onclick="selectNewItem(this);" gives-xp="'+ document.getElementsByClassName("tradebutton")[selectedItem - 1].getAttribute("gives-xp") +'" max-uses="'+ document.getElementsByClassName("tradebutton")[selectedItem - 1].getAttribute("max-uses") +'">' + selectedData + '</div>';
    var selectedItemOld = selectedItem;
    selectNewItem(document.getElementsByClassName("tradebutton")[(document.getElementsByClassName("tradebutton").length - 1)]);
    var l;
    for(l = 0; l < (document.getElementsByClassName("tradebutton").length - selectedItemOld - 1); l++){
    moveItemUp();
    }
  }
}

function moveItemUp(){
  if(document.getElementById("tradelist").children[selectedItem]){
    if(selectedItem != 1){
      var selectedData = document.getElementById("tradelist").children[selectedItem - 1];
      moveChoiceTo(selectedData, 1);
      selectedItem--;
    }
  }
}

function moveItemDown(){
  if(document.getElementById("tradelist").children[selectedItem]){
    if(selectedItem != document.getElementById("tradelist").children.length - 1){
    var selectedData = document.getElementById("tradelist").children[selectedItem];
    moveChoiceTo(selectedData, 1);
    selectedItem++;
    }
  }
}

function moveChoiceTo(elem_choice, direction) {
    var span = elem_choice,
        td = span.parentNode;
    
    if (direction === -1 && span.previousElementSibling) {
        td.insertBefore(span, span.previousElementSibling);
    } 
    if (direction === 1 && span.nextElementSibling) {
        td.insertBefore(span, span.nextElementSibling.nextElementSibling)
    }
}

function selectNewItem(itemToSelect, fromUser){
  if(itemToSelect){
    var child = itemToSelect;
    var parent = child.parentNode;
    // The equivalent of parent.children.indexOf(child)
    var index = Array.prototype.indexOf.call(parent.children, child);
    selectedItem = index;
    var i = 0;
    for (i = 0; i < parent.children.length; i++){
      parent.children[i].style.marginLeft = "5px";
      parent.children[i].style.width = "235px";
    }
    itemToSelect.style.marginLeft = "15px";
    itemToSelect.style.width = "225px";

    reloadValues();

    //updateEnchantments();
    /*currentInvItem = undefined;
    document.getElementById("enchlist").innerHTML = "";
    document.getElementById('righteditor').style.display = 'none'; document.getElementById('editor').style.width = '614px';*/
    if(typeof currentInvItem != "undefined"){
      selectItemForAttribute(currentInvItem.classList[1], true);
      loadAttributes();
    }
  }
}

function reloadValues(){
  var item1 = document.getElementsByClassName("item1")[selectedItem - 1];
  var count1 = document.getElementsByClassName("count1")[selectedItem - 1];
  var desiredItem1 = document.getElementById("wants1");
  var desiredCount1 = document.getElementById("wants1c");
  var item2 = document.getElementsByClassName("item2")[selectedItem - 1];
  var count2 = document.getElementsByClassName("count2")[selectedItem - 1];
  var desiredItem2 = document.getElementById("wants2");
  var desiredCount2 = document.getElementById("wants2c");
  var itemR = document.getElementsByClassName("itemresult")[selectedItem - 1];
  var countR = document.getElementsByClassName("countR")[selectedItem - 1];
  var desiredItemR = document.getElementById("gives");  
  var desiredCountR = document.getElementById("givesc"); 
  
  var selectedItemParent = document.getElementsByClassName("tradebutton")[selectedItem - 1];  
  var desiredGivesXP = document.getElementById("givesXPCheckbox");
  var desiredMaxUses = document.getElementById("maxUses");
  //var desiredPriceMult = document.getElementById("priceMult");
  
  desiredItem1.value = item1.getAttribute("item");
  desiredItem2.value = item2.getAttribute("item");
  desiredItemR.value = itemR.getAttribute("item");
  desiredCount1.value = item1.getAttribute("count");
  desiredCount2.value = item2.getAttribute("count");
  desiredCountR.value = itemR.getAttribute("count");
  if (selectedItemParent.getAttribute("gives-xp") == "true") {desiredGivesXP.checked = true;} else {desiredGivesXP.checked = false;}
  desiredMaxUses.value = selectedItemParent.getAttribute("max-uses");
  //desiredPriceMult.value = selectedItemParent.getAttribute("price-mult");
}

addNewItem();
//selectNewItem(document.getElementsByClassName("tradebutton")[0]);

function projectOpened(){
  selectNewItem(document.getElementsByClassName("tradebutton")[0]);
}

function getUrlParam(param, url) {
  //Code from https://stackoverflow.com/questions/5194280/get-data-from-url
  param = param.replace(/([\[\](){}*?+^$.\\|])/g, "\\$1");
  var regex = new RegExp("[?&]" + param + "=([^&#]*)");
  url = url || decodeURIComponent(window.location.href);
  var match = regex.exec(url);
  return match ? match[1] : "";
}

//Filesystem

function saveToLocalStorage(){
  window.localStorage.setItem("lastSavedData", btoa(document.getElementById("tradelist").innerHTML));
}

function correctCount(countToCorrect){
  if(parseInt(countToCorrect.value, 10) >= 64){
    countToCorrect.value = "64";
  }
  if(parseInt(countToCorrect.value, 10) <= 0){
    countToCorrect.value = "1";
  }
  
  if(countToCorrect.value == ""){
    countToCorrect.value="1";
    updateAll();
    countToCorrect.value=" ";
  } else {
    updateAll();
  }
}

function correctCountV(elel){
  if(elel.value == ""){
    elel.value = "1";
  }
}

//Search for Identifier
function searchData(dataa, query){
  var b = 0;
  for(b=0; b<dataa.length; b++){
    if(dataa[b].identifier == query){
      return b;
    }
  }
}

var datarow1 = '<tr><td><img src="'
var datarow2 = '"></td><td>'
var datarow3 = '</td></tr>';
function dataGrid(data){
  var table = document.getElementById("itemsgrid");
  var i = 0;
  var currentrow;
  for(i=0; i<data.length; i++){
    currentrow = datarow1 + "https://cdn.glitch.com/d28d8954-15cb-47a1-b9d3-c7e70ece9961%2F" + data[i].png + ".png" + datarow2 + data[i].identifier + datarow3;
    table.innerHTML += currentrow;
  }
  alert("doneGenerating");
}

function dataGrid2(data, mode){
  if(!mode){
    var table = document.getElementById("datadumpm");
    var i = 0;
    var currentrow;
    for(i=0; i<data.length; i++){
      table.innerHTML += "<img height='32' width='32' src='https://cdn.glitch.com/d28d8954-15cb-47a1-b9d3-c7e70ece9961%2F" + data[i].png + ".png' data-index='"+ i +"' onmouseover='mouseOverGridIcon(this)' onclick='clickGridIcon(this)' onmouseover='window.parent.mouseOverGridIcon(this)' onclick='window.parent.clickGridIcon(this)' data-search-id='"+ data[i].identifier +"'>";
    }
  } else {
    var table = document.getElementById("wants1dictionary").children[0];
    var i = 0;
    var currentrow;
    for(i = 0; i < newdata.length; i++){
      console.log(i);
      if(table.children[i].getAttribute("data-search-id") != newdata[i]){
            var op = document.createElement("img");
            op.height = "32";
            op.width = "32";
            op.src = "https://cdn.glitch.com/d28d8954-15cb-47a1-b9d3-c7e70ece9961%2F" + newdata[i] + ".png";
            op.setAttribute("data-index", i);
            op.setAttribute("data-search-id", newdata[i]);
            op.onmouseover = "window.parent.mouseOverGridIcon(this)";
            op.onclick = "window.parent.clickGridIcon(this)"; 
        table.insertBefore(op, table.children[i + 1]);
      }
      //table.innerHTML += "<option value='"+ data[i].identifier +"'>"+ data[i].identifier +"</option>";
    }
  }
  alert("doneGenerating");
}

function dataGrid3(data, mode){
  if(!mode){
    var table = document.getElementById("dictionarydata");
    var i = 0;
    var currentrow;
    for(i=0; i<data.length; i++){
      table.innerHTML += "<option value='"+ data[i].identifier +"'>"+ data[i].identifier +"</option>";
    }
  } else {
    var table = document.getElementById("dictionarydata");
    var i = 0;
    var currentrow;
    for(i = 0; i < newdata.length; i++){
      if(table.children[i].value != newdata[i]){
            var op = document.createElement("option");
            op.value = newdata[i];
            op.innerHTML = newdata[i];  
        table.insertBefore(op, table.children[i + 1]);
      }
      //table.innerHTML += "<option value='"+ data[i].identifier +"'>"+ data[i].identifier +"</option>";
    }
  }
  alert("doneGenerating");
}

function includeHTML() {
  var z, i, elmnt, file, xhttp;
  /* Loop through a collection of all HTML elements: */
  z = document.getElementsByTagName("*");
  for (i = 0; i < z.length; i++) {
    elmnt = z[i];
    /*search for elements with a certain atrribute:*/
    file = elmnt.getAttribute("w3-include-html");
    if (file) {
      /* Make an HTTP request using the attribute value as the file name: */
      xhttp = new XMLHttpRequest();
      xhttp.onreadystatechange = function() {
        if (this.readyState == 4) {
          if (this.status == 200) {elmnt.innerHTML = this.responseText;}
          if (this.status == 404) {elmnt.innerHTML = "Page not found.";}
          /* Remove the attribute, and call this function once more: */
          elmnt.removeAttribute("w3-include-html");
          includeHTML();
        }
      }
      xhttp.open("GET", file, true);
      xhttp.send();
      /* Exit the function: */
      return;
    }
  }
}
var newChanges;
//Save every 60 seconds
setInterval(saveToLocalStorage, (1000 * 60));

  window.onbeforeunload = confirmExit;
  function confirmExit(){
    /*if(newChanges = true){
    return "You have attempted to leave this page. Changes on these page may not be saved.  Are you sure you want to exit this page?";
    }*/
  }


function toggleRightEditor(){
  var redit = document.getElementById("righteditor");
  var fedit = document.getElementById("editor");
  if(redit.style.display == "none"){
    redit.style.display = "block";
    fedit.style.width = "881px";
  } else {
    redit.style.display = "none";
    fedit.style.width = "614px";
  }
  
    for(var i = 0; i < document.getElementsByClassName("attributebutton").length - 1; i++){
      document.getElementsByClassName("attributebutton")[i].src = "https://cdn.glitch.com/17ff8eee-9239-4ba0-8a5c-9263261550b5%2Fsmithing_icon.png?v=1617472249024";
  }
}

//Enchantments
function correctEnch(val){
  var output = "";
  output = val;
  output = output.toLowerCase();
  output = output.replaceAll(' ', '_');
  return output;
}

function selectItemForAttribute(item, isFromThing, caller){
  for(var i = 0; i < document.getElementsByClassName("attributebutton").length - 1; i++){
      document.getElementsByClassName("attributebutton")[i].src = "https://cdn.glitch.com/17ff8eee-9239-4ba0-8a5c-9263261550b5%2Fsmithing_icon.png?v=1617472249024";
  }
  if(currentInvItem != document.getElementsByClassName(item)[selectedItem - 1]){

    if(document.getElementsByClassName(item)[selectedItem - 1].getAttribute("item") != "empty"){
      document.getElementById('righteditor').style.display = 'block'; document.getElementById('editor').style.width = '881px';
      currentInvItem = document.getElementsByClassName(item)[selectedItem - 1];
      loadAttributes();
    } else {
      if(!isFromThing){
        alert("Please specify an item other than \"empty\" to edit attributes.");
      } else {
        document.getElementById("righteditor").style.display = "none";
        document.getElementById("editor").style.width = "614px";
        currentInvItem = undefined;
      }

    }
  } else {
    toggleRightEditor();
  }
  
  if(caller){
    if(document.getElementById("righteditor").style.display == "none"){
      caller.src = "https://cdn.glitch.com/17ff8eee-9239-4ba0-8a5c-9263261550b5%2Fsmithing_icon.png?v=1617472249024";
    } else {
      caller.src = "https://cdn.glitch.com/17ff8eee-9239-4ba0-8a5c-9263261550b5%2Fconfirm.png?v=1617471060114";
    }
  }
}

var currentEnchantment;
var currentInvItem;

var enchantmentTemplate = '<div class="enchantmentitem"><input type="text" list="enchants" placeholder="enchantment_id" oninput="this.value = correctEnch(this.value); updateEnchantments();" class="enchantmentitemID"><input type="number" style="width: 38px" placeholder="lvl" value="0" oninput="updateEnchantments()" class="enchantmentitemLVL"></div>';

var enchantmentTemplate1 = '<div class="enchantmentitem"><input type="text" list="enchants" placeholder="enchantment_id" oninput="this.value = correctEnch(this.value); updateEnchantments();" class="enchantmentitemID" value="';
var enchantmentTemplate2 = '"><input type="number" style="width: 38px" placeholder="lvl" oninput="updateEnchantments()" class="enchantmentitemLVL" value="';
var enchantmentTemplate3 = '"><img src="https://cdn.glitch.com/17ff8eee-9239-4ba0-8a5c-9263261550b5%2Ficon_trash.png?v=1616555108211" class="smallbutton" width="20" height="20" onclick="this.parentNode.parentNode.removeChild(this.parentNode); updateEnchantments();"></div>';

function loadEnchantments(){
  if(typeof currentInvItem == "object"){
    var subject = currentInvItem;
    var editorarea = document.getElementById("enchlist");
    var enchantdata;
    var output = "";

    if(!subject.getAttribute("json")){
      subject.setAttribute("json", '"functions": []');
    }

    var extradata = JSON.parse("{" + subject.getAttribute("json") + "}");
    //{"function": "specific_enchants","enchants": []},{"function": "set_name","name": ""},{"function": "set_lore","lore": []}
    if(!extradata.functions){
        extradata = {};
        extradata.functions = [];
        var jsonout = JSON.stringify(extradata);
        jsonout = jsonout.slice(1, jsonout.length - 1);
        subject.setAttribute("json", jsonout);
        return;
    }
    var not = 0;
    for(var i = 0; i < (extradata.functions.length - 0); i++){
      //not = 0;
      if(extradata.functions[i].function == "specific_enchants"){
          enchantdata = extradata.functions[i];
      } else {
        not++;
      }
    }

      if(not == (extradata.functions.length - 0)){
        editorarea.innerHTML = "";
        return;
      }
    //console.log(enchantdata);
    editorarea.innerHTML = "";
    for(var j = 0; j < enchantdata.enchants.length; j++){
      if(enchantdata.enchants[j].id){
        if(typeof enchantdata.enchants[j].id != "string"){
          enchantdata.enchants[j].id = "";
        }
        var limboitem = enchantmentTemplate1 + enchantdata.enchants[j].id + enchantmentTemplate2 + enchantdata.enchants[j].level + enchantmentTemplate3;
        editorarea.innerHTML += limboitem;
      } else {
        if(typeof enchantdata.enchants[j] != "string"){
          enchantdata.enchants[j] = "";
        }
        var limboitem = enchantmentTemplate1 + enchantdata.enchants[j] + enchantmentTemplate2 + "1" + enchantmentTemplate3;
        editorarea.innerHTML += limboitem;
      }
    }
  }
}
var enchantmentitemtemplate = '<input type="text" list="enchants" placeholder="enchantment_id" oninput="this.value=correctEnch(this.value); updateEnchantments();" class="enchantmentitemID"><input type="number" style="width: 38px" placeholder="lvl" value="1" oninput="updateEnchantments()"><img src="https://cdn.glitch.com/17ff8eee-9239-4ba0-8a5c-9263261550b5%2Ficon_trash.png?v=1616555108211" class="smallbutton" width="20" height="20" onclick="this.parentNode.parentNode.removeChild(this.parentNode); updateEnchantments();">';

function newEnchantment(){
  if(typeof currentInvItem == "object"){
    var newNode = document.createElement("div");
    newNode.innerHTML = enchantmentitemtemplate;
    document.getElementById("enchlist").appendChild(newNode);
    updateEnchantments();
  } else {
    alert("Please select an item before performing this action.");
  }
}

function updateEnchantments(){
  if(typeof currentInvItem == "object"){
    var subject = currentInvItem;
    var editorarea = document.getElementById("enchlist");
    var enchantdata;
    var enchantdatanum;
    var output = "";
    var extradata = JSON.parse("{" + subject.getAttribute("json") + "}");

    var not = 0;
    for(var i = 0; i < (extradata.functions.length - 0); i++){
      //not = 0;
      if(extradata.functions[i].function == "specific_enchants"){
          enchantdata = extradata.functions[i];
          enchantdatanum = i;
          break;
      } else {
        not++;
      }
    }
    
    if(not == (extradata.functions.length - 0)){
        extradata.functions.push({"function":"specific_enchants", "enchants":[]});
        enchantdata = extradata.functions[extradata.functions.length-1];
    }
    
    enchantdata.enchants = [];
    for(var i = 0; i < editorarea.children.length; i++){
      if(editorarea.children[i]){
        var selectedench = {};
          selectedench.id = document.getElementById("enchlist").children[i].children[0].value;
          selectedench.level = document.getElementById("enchlist").children[i].children[1].value;
          enchantdata.enchants.push(selectedench);
      }
    }
    
    if(enchantdata.enchants.length != 0){
      subject.style.backgroundColor = "violet";
    } else {
      subject.style.backgroundColor = "";
      extradata.functions.splice(enchantdatanum, 1);
    }

    var jsonout = JSON.stringify(extradata);
    jsonout = jsonout.slice(1, jsonout.length - 1);
    subject.setAttribute("json", jsonout);
    //loadEnchantments();
    return jsonout;
  }
}

function loadName(){
  if(typeof currentInvItem == "object"){
    var subject = currentInvItem;
    var editorarea = document.getElementById("customName");
    var enchantdata;
    var output = "";

    if(!subject.getAttribute("json")){
      subject.setAttribute("json", '"functions": []');
    }

    var extradata = JSON.parse("{" + subject.getAttribute("json") + "}");
    //{"function": "specific_enchants","enchants": []},{"function": "set_name","name": ""},{"function": "set_lore","lore": []}
    if(!extradata.functions){
        extradata = {};
        extradata.functions = [];
        var jsonout = JSON.stringify(extradata);
        jsonout = jsonout.slice(1, jsonout.length - 1);
        subject.setAttribute("json", jsonout);
        return;
    }
    var not = 0;
    for(var i = 0; i < (extradata.functions.length - 0); i++){
      //not = 0;
      if(extradata.functions[i].function == "set_name"){
          enchantdata = extradata.functions[i];
      } else {
        not++;
      }
    }
    if(not == (extradata.functions.length - 0)){
      editorarea.value = "";
      return;
    }
    //console.log(enchantdata);
    editorarea.value = enchantdata.name;
  }
}

function updateName(){
  if(typeof currentInvItem == "object"){
    var subject = currentInvItem;
    var editorarea = document.getElementById("customName");
    var enchantdata;
    var enchantdatanum;
    var output = "";
    var extradata = JSON.parse("{" + subject.getAttribute("json") + "}");

    var not = 0;
    for(var i = 0; i < (extradata.functions.length - 0); i++){
      //not = 0;
      if(extradata.functions[i].function == "set_name"){
          enchantdata = extradata.functions[i];
          enchantdatanum = i;
          break;
      } else {
        not++;
      }
    }
    
    if(not == (extradata.functions.length - 0)){
        extradata.functions.push({"function":"set_name", "name":""});
        enchantdata = extradata.functions[extradata.functions.length-1];
    }
    
    enchantdata.name = editorarea.value;
    
    if(enchantdata.name == ""){
      extradata.functions.splice(enchantdatanum, 1);
    }

    var jsonout = JSON.stringify(extradata);
    jsonout = jsonout.slice(1, jsonout.length - 1);
    subject.setAttribute("json", jsonout);
    //loadEnchantments();
    return jsonout;
  }
}

function loadLore(){
  if(typeof currentInvItem == "object"){
    var subject = currentInvItem;
    var editorarea = document.getElementById("customLore");
    var enchantdata;
    var output = "";

    if(!subject.getAttribute("json")){
      subject.setAttribute("json", '"functions": []');
    }

    var extradata = JSON.parse("{" + subject.getAttribute("json") + "}");
    //{"function": "specific_enchants","enchants": []},{"function": "set_name","name": ""},{"function": "set_lore","lore": []}
    if(!extradata.functions){
        extradata = {};
        extradata.functions = [];
        var jsonout = JSON.stringify(extradata);
        jsonout = jsonout.slice(1, jsonout.length - 1);
        subject.setAttribute("json", jsonout);
        return;
    }
    var not = 0;
    for(var i = 0; i < (extradata.functions.length - 0); i++){
      //not = 0;
      if(extradata.functions[i].function == "set_lore"){
          enchantdata = extradata.functions[i];
      } else {
        not++;
      }
    }
    if(not == (extradata.functions.length - 0)){
      editorarea.value = "";
      return;
    }
    //console.log(enchantdata);
    editorarea.value = enchantdata.lore.join("\n");
  }
}

function updateLore(){
  if(typeof currentInvItem == "object"){
    var subject = currentInvItem;
    var editorarea = document.getElementById("customLore");
    var enchantdata;
    var enchantdatanum;
    var output = "";
    var extradata = JSON.parse("{" + subject.getAttribute("json") + "}");

    var not = 0;
    for(var i = 0; i < (extradata.functions.length - 0); i++){
      //not = 0;
      if(extradata.functions[i].function == "set_lore"){
          enchantdata = extradata.functions[i];
          enchantdatanum = i;
          break;
      } else {
        not++;
      }
    }
    
    if(not == (extradata.functions.length - 0)){
        extradata.functions.push({"function":"set_lore", "lore":[]});
        enchantdata = extradata.functions[extradata.functions.length-1];
    }

    enchantdata.lore = editorarea.value.split("\n");
    
    if(enchantdata.lore.length == 0 || editorarea.value == ""){
      extradata.functions.splice(enchantdatanum, 1);
    }

    var jsonout = JSON.stringify(extradata);
    jsonout = jsonout.slice(1, jsonout.length - 1);
    subject.setAttribute("json", jsonout);
    //loadEnchantments();
    return jsonout;
  }
}

function loadAttributes(){
  /*
  if(typeof currentInvItem != "undefined"){
    var subject = currentInvItem;
    if(subject.getAttribute("json")){
      var extradata = JSON.parse("{" + subject.getAttribute("json") + "}");
      for(var i = 0; i < (extradata.functions.length - 0); i++){
        if(extradata.functions[i].function == "set_data"){
            if(typeof extradata.functions[i].data == "number"){
              //subject.setAttribute("item", subject.getAttribute("item") + ":" + extradata.functions[i].data);
              alert("We've detected an item with a data value set by functions. We recommend you set the data value in the identifier because this program currently overwrites functions that it doesn't use such as set_data.");
              return;
            }
        }
      }
    }
  }*/
  loadEnchantments();
  loadName();
  loadLore();
}

