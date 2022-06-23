var tradetable = {
	"tiers": [
		{
			"total_exp_required": 0,
			"groups": [
				{
					"num_to_select": 1,
					"trades": [
						{
							"wants": [
								{
									"item": "minecraft:string",
									"quantity": 20,
									"price_multiplier": 0.05
								}
							],
							"gives": [
								{
									"item": "minecraft:emerald",
									"quantity": 1
								}
							],
							"trader_exp": 1,
							"max_uses": 6,
							"reward_exp": true
						}
					]
				},
        {
					"num_to_select": 1,
					"trades": [
						{
							"wants": [
								{
									"item": "minecraft:emerald",
									"quantity": 1,
									"price_multiplier": 0.05
								}
							],
							"gives": [
								{
									"item": "minecraft:emerald",
									"quantity": 1
								}
							],
							"trader_exp": 1,
							"max_uses": 6,
							"reward_exp": true
						}
					]
				}
			]
		}
	]
};
var identifiers = {};
async function fetchData(){
  var ids = await fetch('https://raw.githubusercontent.com/bridge-core/editor-packages/main/packages/minecraftBedrock/schema/general/vanilla/identifiers.json').then(data => data.json());
  identifiers = ids.definitions;
  
  doIdentifiers();
}

function doIdentifiers(){
  document.getElementById("item_identifiers").innerHTML = "";
  for(var i = 0; i < identifiers.prefixed_item_identifiers.enum.length; i++){
    document.getElementById("item_identifiers").innerHTML += '<option value="'+ identifiers.prefixed_item_identifiers.enum[i] +'"></option>';
  }
}

function addFunctionToData(path, fdata, force){
  if(!fdata.function){
    return;
  }
  
  if(fdata.function == "set_damage" && !Object.keys(mcitems.data.durabilities).includes(path.item)){
    fdata.function = "set_data";
    fdata.data = fdata.damage;
    delete fdata.damage;
  }
  
  if(!Object.keys(path).includes("functions")){
    path.functions = [];
  }
  
  if(getFunctionFromData(path, fdata.function) == false){
    path.functions.push(fdata);
  } else {
    if(force){
      removeFunctionFromData(path, fdata.function);
      addFunctionToData(path, fdata);
    }
  }
}

function removeFunctionFromData(path, fname){
  if(!Object.keys(path).includes("functions")){
    return;
  }
  
  if(fname == "set_damage" && !Object.keys(mcitems.data.durabilities).includes(path.item)){
    fname = "set_data";
  }
  
  var ind = path.functions.findIndex(x => x.function === fname);
  
  path.functions.splice(ind, 1);
  
  if(path.functions.length == 0){
    delete path.functions;
  }
}

function getFunctionFromData(path, fname){
  if(!Object.keys(path).includes("functions")){
    return;
  }
  
  var doReplace = false;
  if(fname == "set_damage" && !Object.keys(mcitems.data.durabilities).includes(path.item)){
    fname = "set_data";
    doReplace = true;
  }
  
  var ind = path.functions.findIndex(x => x.function === fname);
  
  if(ind == -1){
    return false;
  }
  
  var returnable = JSON.parse(JSON.stringify(path.functions[ind]));
  if(doReplace){
    returnable.damage = returnable.data;
    delete returnable.data;
    
  }
  if(returnable == undefined){
    returnable = false;
  }
  
  return returnable;
}

fetchData();

var currentGroup, currentGroupElement, currentTrade, currentTradeElement, currentItem, currentItemElement;
var currentTier = 0;
var filename = "undefined";

document.getElementById("file").addEventListener("change", function(){
  if(this.files && this.files[0]){
    var fr = new FileReader();
    fr.onload = function(e){      
      tradetable = correctImportedTable(JSON.parse(e.target.result));
      tableToEditor();
    }
    fr.readAsText(this.files[0]);
    filename = document.getElementById("file").files[0].name.split(".")[0];
  }
});

function correctImportedTable(table){
  var tiers = table.tiers;
  var choiceMessage = false;
  for(var i = 0; i < tiers.length; i++){
    //Make sure everything is sorted into groups
    if(tiers[i].hasOwnProperty("trades")){
      tiers[i].groups = [
        {
          trades: JSON.parse(JSON.stringify(tiers[i].trades))
        }
      ];
      delete tiers[i].trades;
    }
    
    var groups = tiers[i].groups;
    for(var a = 0; a < groups.length; a++){
      var trades = groups[a].trades;
      for(var b = 0; b < trades.length; b++){
        //Make sure the choice attribute doesn't exist
        var wants = trades[b].wants;
        var gives = trades[b].gives;
        if(!wants[0] || !gives[0]){
          alert("Your trade table is invalid: missing basic required wants/gives items.");
          location.reload();
        }
        
        if(wants[0].hasOwnProperty("choice")){
          choiceMessage = true;
          wants[0] = wants[0].choice[0];
        }
        
        if(wants[1]){
          if(wants[1].hasOwnProperty("choice")){
            choiceMessage = true;
            wants[1] = wants[1].choice[0];
          }
        }
        
        if(gives[0].hasOwnProperty("choice")){
          choiceMessage = true;
          gives[0] = gives[0].choice[0];
        }
      }
    }
  }
  if(choiceMessage) alert("It seems that one or more trades in your trade table use the [choice] feature for either the wants[0], wants[1] or gives item. The choice feature is not supported by this program. The first item in the list has been selected to permanently apply instead. ");

  return table;
}

function exportTable(){
  filename = prompt("What would you like to name your trade table file?", "trade-table.json");
  if(filename == "" || filename == false || filename == null){
    return;
  }
  
  var text = JSON.stringify(tradetable, null, 3);
  var element = document.createElement('a');
  element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
  element.setAttribute('download', filename);

  element.style.display = 'none';
  document.body.appendChild(element);

  element.click();

  document.body.removeChild(element);
}

function tableToEditor(){
  document.getElementById("tierslist").innerHTML = "";
  for(var i = 0; i < tradetable.tiers.length; i++){
    document.getElementById("tierslist").innerHTML += "<option value='"+ i +"'>Tier "+ i +"</option>";
  }
  currentTier = 0;
  selectTier();
}

function selectTier(t){
  if(t){
    currentTier = parseFloat(t);
  }
  
  document.getElementById("tierslist").value = currentTier;
  var tierdata = tradetable.tiers[currentTier];
  document.getElementById("grouplist").innerHTML = "";
  for(var i = 0; i < tierdata.groups.length; i++){
    var groupEl = document.createElement("details");
    groupEl.innerHTML = "<summary onclick='selectGroup(this)'>Group "+i+"</summary>";
    groupEl.setAttribute("index", i);
    for(var a = 0; a < tierdata.groups[i].trades.length; a++){
      var tradedata = tierdata.groups[i].trades[a];
      var tradeEl = document.createElement("div");
      tradeEl.classList = ["trade"];
      tradeEl.setAttribute("onclick", "selectTrade(this)");
      tradeEl.setAttribute("index", a);
      
      //Correct quantity of items to fit with editor
      correctTradeData(tradedata);
      
      correctTrade(tradeEl, tradedata);
      
      groupEl.appendChild(tradeEl);
    }
    document.getElementById("grouplist").appendChild(groupEl);
  }
  
  mcitems.init();
  
  if(document.getElementById("grouplist").children[0]){
    selectGroup(document.getElementById("grouplist").children[0].children[0], true);
  }
}

function selectTrade(el){
  var els = document.getElementsByClassName("trade");
  var has = false//getSelectedTrade() == el;
  for(var i = 0; i < els.length; i++){
    els[i].setAttribute('class', els[i].getAttribute('class').replaceAll(' selected', ''));
  }
  
  if(!has)
  el.setAttribute('class', el.getAttribute('class') + ' selected');
  
  currentTradeElement = el;
  currentGroupElement = el.parentNode;
  var tradeIndex = parseFloat(currentTradeElement.getAttribute("index"));
  var groupIndex = parseFloat(currentGroupElement.getAttribute("index"));
  
  var tradedata = tradetable.tiers[currentTier].groups[groupIndex].trades[tradeIndex];
  var groupdata = tradetable.tiers[currentTier].groups[groupIndex];
  currentTrade = tradedata;
  currentGroup = groupdata;
  
  //Apply trade data to the editor
  if(tradedata.max_uses){
    document.getElementById("trade-uses").value = tradedata.max_uses;
  } else {
    document.getElementById("trade-uses").value = -1;
  }
  
  if(tradedata.trader_exp){
    document.getElementById("trade-trader-xp").value = tradedata.trader_exp;
  } else {
    document.getElementById("trade-trader-xp").value = "";
  }
  
  if(tradedata.reward_exp){
    document.getElementById("trade-rewards-xp").checked = tradedata.reward_exp;
  } else {
    document.getElementById("trade-rewards-xp").checked = false;
  }
  
  //Apply group data to the editor
  if(groupdata.num_to_select){
    document.getElementById("group-select").value = groupdata.num_to_select;
  } else {
    document.getElementById("group-select").value = "";
  }
}

function selectGroup(el, forceOpen){
  currentGroupElement = el.parentNode;
  var groupIndex = parseFloat(currentGroupElement.getAttribute("index"));
  var groupdata = tradetable.tiers[currentTier].groups[groupIndex];
  currentGroup = groupdata;
  
  for(var i = 0; i < document.getElementsByTagName("details").length; i++){
    //if(document.getElementsByTagName("details")[i] != currentGroupElement)
      document.getElementsByTagName("details")[i].open = false;
  }
  if(forceOpen) currentGroupElement.open = true;
  if(currentGroupElement.children.length > 1){
    selectTrade(currentGroupElement.children[1]);
  }
}

function correctTrade(tradeEl, tradedata){
  tradeEl.innerHTML = "";
  tradeEl.innerHTML += '<mcitem identifier="'+ tradedata.wants[0].item +'" count="'+ tradedata.wants[0].quantity +'" '+ 
    (getFunctionFromData(tradedata.wants[0], "set_damage") ? 'damage="'+ getFunctionFromData(tradedata.wants[0], "set_damage").damage +'"' : "")
    +' itemtype="wants[0]" onclick="editItem(this)" '+ (getFunctionFromData(tradedata.wants[0], "specific_enchants") ? 'class="enchanted"' : "") +'></mcitem>';
  if(tradedata.wants[1]){
    if(!tradedata.wants[1].quantity || tradedata.wants[1].quantity < 1){tradedata.wants[1].quantity = 1;}
    if(tradedata.wants[1].item.split(":").length == 1){
      tradedata.wants[1].item = "minecraft:" + tradedata.wants[1].item
    } else if(tradedata.wants[1].item.split(":").length == 3){
      addFunctionToData(tradedata.wants[1], {function: "set_damage", damage: parseFloat(tradedata.wants[1].item.split(":")[2])}, true);
      tradedata.wants[1].item = "minecraft:" + tradedata.wants[1].item.split(":")[1];
    }
    tradeEl.innerHTML += ' + ';
    tradeEl.innerHTML += '<mcitem identifier="'+ tradedata.wants[1].item +'" count="'+ tradedata.wants[1].quantity +'" '+ 
    (getFunctionFromData(tradedata.wants[1], "set_damage") ? 'damage="'+ getFunctionFromData(tradedata.wants[1], "set_damage").damage +'"' : "")
    +' onclick="editItem(this)" itemtype="wants[1]" '+ (getFunctionFromData(tradedata.wants[1], "specific_enchants") ? 'class="enchanted"' : "") +'></mcitem>';
    
    
  } else {
    tradeEl.innerHTML += ' + ';
    tradeEl.innerHTML += '<mcitem identifier="null" count="" itemtype="wants[1]" onclick="editItem(this)"></mcitem>';
  }
  tradeEl.innerHTML += ' = '
  tradeEl.innerHTML += '<mcitem identifier="'+ tradedata.gives[0].item +'" count="'+ tradedata.gives[0].quantity +'" '+ 
    (getFunctionFromData(tradedata.gives[0], "set_damage") ? 'damage="'+ getFunctionFromData(tradedata.gives[0], "set_damage").damage +'"' : "")
    +' itemtype="gives[0]" onclick="editItem(this)" '+ (getFunctionFromData(tradedata.gives[0], "specific_enchants") ? 'class="enchanted"' : "") +'></mcitem>';
  //tradeEl.innerHTML += '<mcitem identifier="'+ tradedata.gives[0].item +'" count="'+ tradedata.gives[0].quantity +'" itemtype="gives[0]" onclick="editItem(this)"></mcitem>';
}

function correctTradeData(tradedata){
  if(!tradedata.wants[0].quantity || tradedata.wants[0].quantity < 1){tradedata.wants[0].quantity = 1;}
  if(!tradedata.gives[0].quantity || tradedata.gives[0].quantity < 1){tradedata.gives[0].quantity = 1;}

  //Correct item identifiers, if it's missing a prefix then add minecraft:, and if it has a data value apply `set_damage` or `set_data`
  if(tradedata.wants[0].item.split(":").length == 1){
    tradedata.wants[0].item = "minecraft:" + tradedata.wants[0].item
  } else if(tradedata.wants[0].item.split(":").length == 3){
    addFunctionToData(tradedata.wants[0], {function: "set_damage", damage: parseFloat(tradedata.wants[0].item.split(":")[2])}, true);
    tradedata.wants[0].item = "minecraft:" + tradedata.wants[0].item.split(":")[1];
  }

  if(tradedata.gives[0].item.split(":").length == 1){
    tradedata.gives[0].item = "minecraft:" + tradedata.gives[0].item
  } else if(tradedata.gives[0].item.split(":").length == 3){
    addFunctionToData(tradedata.gives[0], {function: "set_damage", damage: parseFloat(tradedata.gives[0].item.split(":")[2])}, true);
    tradedata.gives[0].item = "minecraft:" + tradedata.gives[0].item.split(":")[1];
  }
    
}

function addTrade(tradeTemplate){
  if(!currentTradeElement){
    if(!currentGroupElement){
      return;
    }
  }
  
  var tradeIndex = 0;
  if(currentTradeElement){
    tradeIndex = parseFloat(currentTradeElement.getAttribute("index"));
  }
  var groupIndex = parseFloat(currentGroupElement.getAttribute("index"));
  if(!tradeTemplate){ 
    tradeTemplate = {
      "wants": [
        {
          "item": "minecraft:emerald",
          "quantity": 1
        }
      ],
      "gives": [
        {
          "item": "minecraft:emerald",
          "quantity": 1
        }
      ],
      "max_uses": -1,
      "reward_exp": true
    };
  } else {
    tradeTemplate = JSON.parse(JSON.stringify(tradeTemplate));
  }
  
  tradetable.tiers[currentTier].groups[groupIndex].trades.push(tradeTemplate);
  var tradedata = tradetable.tiers[currentTier].groups[groupIndex].trades[tradetable.tiers[currentTier].groups[groupIndex].trades.length-1]
  
  var tradeEl = document.createElement("div");
  tradeEl.classList = ["trade"];
  tradeEl.setAttribute("onclick", "selectTrade(this)");
  tradeEl.setAttribute("index", tradetable.tiers[currentTier].groups[groupIndex].trades.length-1);

  correctTradeData(tradedata);
  correctTrade(tradeEl, tradedata);

  currentGroupElement.appendChild(tradeEl);
  
  mcitems.init();
}

function addGroup(groupTemplate){  
  var tradeIndex = 0;
  if(currentTradeElement){
    tradeIndex = parseFloat(currentTradeElement.getAttribute("index"));
  }
  //var groupIndex = parseFloat(currentGroupElement.getAttribute("index"));
  if(!groupTemplate) { 
    groupTemplate = {
      "trades": [
        {
          "wants": [
            {
              "item": "minecraft:emerald",
              "quantity": 1,
              "price_multiplier": 0.05
            }
          ],
          "gives": [
            {
              "item": "minecraft:emerald",
              "quantity": 1
            }
          ],
          "trader_exp": 1,
          "max_uses": 6,
          "reward_exp": true
        }
      ]
    };
  } else {
    groupTemplate = JSON.parse(JSON.stringify(groupTemplate));
  }
  
  tradetable.tiers[currentTier].groups.push(groupTemplate);
  var groupdata = tradetable.tiers[currentTier].groups[tradetable.tiers[currentTier].groups.length-1];
  
  var groupEl = document.createElement("details");
  groupEl.innerHTML = "<summary onclick='selectGroup(this)'>Group "+ (tradetable.tiers[currentTier].groups.length - 1) +"</summary>";
  groupEl.setAttribute("index", (tradetable.tiers[currentTier].groups.length - 1));
  for(var a = 0; a < groupdata.trades.length; a++){
    var tradedata = groupdata.trades[a];
    var tradeEl = document.createElement("div");
    tradeEl.classList = ["trade"];
    tradeEl.setAttribute("onclick", "selectTrade(this)");
    tradeEl.setAttribute("index", a);

    //Correct quantity of items to fit with editor
    correctTradeData(tradedata);

    correctTrade(tradeEl, tradedata);

    groupEl.appendChild(tradeEl);
  }
  document.getElementById("grouplist").appendChild(groupEl);
  
  mcitems.init();
}

function addTier(tierTemplate){  
  if(!tierTemplate) { 
    tierTemplate = {
        "total_exp_required": 0,
        "groups": [
            {
                "num_to_select": 1,
                "trades": []
            }
        ]
    };
  } else {
    tierTemplate = JSON.parse(JSON.stringify(tierTemplate));
  }
  
  tradetable.tiers.push(tierTemplate);
  var tierdata = tradetable.tiers[tradetable.tiers.length-1];
  
  var tierEl = document.createElement("option");
  tierEl.innerHTML = "Tier " + (tradetable.tiers.length - 1);
  tierEl.value = tradetable.tiers.length-1;
  document.getElementById("tierslist").appendChild(tierEl);
  
  selectTier(tradetable.tiers.length-1);
}

function deleteTrade(){
  if(!currentTradeElement){
    return;
  }
  
  var tradeIndex = parseFloat(currentTradeElement.getAttribute("index"));
  var groupIndex = parseFloat(currentGroupElement.getAttribute("index"));
  
  tradetable.tiers[currentTier].groups[groupIndex].trades.splice(tradeIndex, 1);
  currentGroupElement.removeChild(currentGroupElement.children[tradeIndex + 1]);
  
  for(var i = 0; i < currentGroupElement.children.length-1; i++){
    currentGroupElement.children[i+1].setAttribute("index", i);
  }
  
  currentTradeElement = null;
}

function deleteGroup(){
  if(!currentGroupElement){
    return;
  }

  var groupIndex = parseFloat(currentGroupElement.getAttribute("index"));
  
  tradetable.tiers[currentTier].groups.splice(groupIndex, 1);
  document.getElementById("grouplist").removeChild(currentGroupElement);
  
  for(var i = 0; i < document.getElementById("grouplist").children.length; i++){
    document.getElementById("grouplist").children[i].setAttribute("index", i);
    document.getElementById("grouplist").children[i].children[0].innerHTML = "Group " + i;
  }
  
  currentGroupElement = null; 
}

function deleteTier(){
  if(tradetable.tiers.length == 1){
    return;
  }
  
  tradetable.tiers.splice(currentTier, 1);
  document.getElementById("tierslist").removeChild(document.getElementById("tierslist").children[currentTier]);
  
  for(var i = 0; i < document.getElementById("tierslist").children.length; i++){
    document.getElementById("tierslist").children[i].setAttribute("value", i);
    document.getElementById("tierslist").children[i].innerHTML = "Tier " + i;
  }
  
  selectTier(tradetable.tiers.length-1);
}

function updateTrade(){
  if(!currentTradeElement){
    return;
  }
  
  var tradeIndex = parseFloat(currentTradeElement.getAttribute("index"));
  var groupIndex = parseFloat(currentGroupElement.getAttribute("index"));
  var tradedata = tradetable.tiers[currentTier].groups[groupIndex].trades[tradeIndex];
  
  if(document.getElementById("trade-uses").value != ""){
    tradedata.max_uses = parseFloat(document.getElementById("trade-uses").value);
  } else {
    if(tradedata.max_uses){
      delete tradedata.max_uses;
    }
  }
  
  if(document.getElementById("trade-trader-xp").value != ""){
    tradedata.trader_exp = parseFloat(document.getElementById("trade-trader-xp").value);
  } else {
    if(tradedata.trader_exp){
      delete tradedata.trader_exp;
    }
  }
  
  tradedata.reward_exp = document.getElementById("trade-rewards-xp").checked;
}

function moveTrade(type){
  if(!currentTradeElement){
    return;
  }
  
  var tradeIndex = parseFloat(currentTradeElement.getAttribute("index"));
  var groupIndex = parseFloat(currentGroupElement.getAttribute("index"));
  var tradedata = tradetable.tiers[currentTier].groups[groupIndex].trades[tradeIndex];
  
  var allTrades = tradetable.tiers[currentTier].groups[groupIndex].trades;
  if(type < 0){
    if(currentTradeElement.previousSibling.tagName != "SUMMARY"){
      currentGroupElement.insertBefore(currentTradeElement, currentTradeElement.previousSibling);
      allTrades.splice(tradeIndex + type, 0, allTrades.splice(tradeIndex, 1)[0]);
    }
  } else {
    if(currentTradeElement.nextSibling){
      if(currentTradeElement.nextSibling.nextSibling){
        currentGroupElement.insertBefore(currentTradeElement, currentTradeElement.nextSibling.nextSibling);
        allTrades.splice(tradeIndex + type, 0, allTrades.splice(tradeIndex, 1)[0]);
      } else {
        currentGroupElement.appendChild(currentTradeElement);
        allTrades.splice(allTrades.length-1, 0, allTrades.splice(tradeIndex, 1)[0]);
      }
    } 
  }
  
  for(var i = 0; i < currentGroupElement.children.length-1; i++){
    currentGroupElement.children[i+1].setAttribute("index", i);
  }
  
  selectTrade(currentTradeElement);
}

function moveGroup(type){
  if(!currentGroupElement){
    return;
  }
  
  var groupIndex = parseFloat(currentGroupElement.getAttribute("index"));
  var groupdata = tradetable.tiers[currentTier].groups[groupIndex];
  
  var allGroups = tradetable.tiers[currentTier].groups;
  if(type < 0){
    if(currentGroupElement.previousSibling.tagName != "SUMMARY"){
      document.getElementById("grouplist").insertBefore(currentGroupElement, currentGroupElement.previousSibling);
      allGroups.splice(groupIndex + type, 0, allGroups.splice(groupIndex, 1)[0]);
    }
  } else {
    if(currentGroupElement.nextSibling){
      if(currentGroupElement.nextSibling.nextSibling){
        document.getElementById("grouplist").insertBefore(currentGroupElement, currentGroupElement.nextSibling.nextSibling);
        allGroups.splice(groupIndex + type, 0, allGroups.splice(groupIndex, 1)[0]);
      } else {
        document.getElementById("grouplist").appendChild(currentGroupElement);
        allGroups.splice(allGroups.length-1, 0, allGroups.splice(groupIndex, 1)[0]);
      }
    } 
  }
  
  for(var i = 0; i < document.getElementById("grouplist").children.length; i++){
    document.getElementById("grouplist").children[i].setAttribute("index", i);
    document.getElementById("grouplist").children[i].children[0].innerHTML = "Group " + i;
  }
  
  //selectTrade(currentGroupElement);
}

function moveTier(type){
  //var tierdata = tradetable.tiers[currentTier];
  var allTiers = tradetable.tiers;
  if((currentTier + type) >= allTiers.length || (currentTier + type) < 0){
    return;
  }
  
  allTiers.splice(currentTier + type, 0, allTiers.splice(currentTier, 1)[0]);
  
  currentTier += type;
  selectTier();
  document.getElementById("tierslist").value = currentTier;
  //selectTrade(currentGroupElement);
}

function updateGroup(){
  var tradeIndex = parseFloat(currentTradeElement.getAttribute("index"));
  var groupIndex = parseFloat(currentGroupElement.getAttribute("index"));
  var groupdata = tradetable.tiers[currentTier].groups[groupIndex];
  
  if(document.getElementById("group-select").value != ""){
    groupdata.num_to_select = parseFloat(document.getElementById("group-select").value);
  } else {
    if(groupdata.num_to_select){
      delete groupdata.num_to_select;
    }
  }
}

function snackbar(message, delay) {
  var x = document.getElementById("snackbar");
  x.innerHTML = message;
  if(!delay){
    var delay = 3000;
  }
  x.className = "show";
  setTimeout(function(){ x.className = x.className.replace("show", ""); }, delay);
}

function closeTierEditor(ignoreUpdating){
  document.getElementById("overlay").style.display = "none";
  document.getElementById("tier-editor").style.display = "none";
}

function closeItemEditor(ignoreUpdating){
  document.getElementById("overlay").style.display = "none";
  document.getElementById("item-editor").style.display = "none";
}

function editItem(element){
  if(element.parentNode == currentTradeElement){
    document.getElementById("overlay").style.display = "block";
    document.getElementById("item-editor").style.display = "block"; 
    
    var tradeIndex = parseFloat(currentTradeElement.getAttribute("index"));
    var groupIndex = parseFloat(currentGroupElement.getAttribute("index"));

    var tradedata = tradetable.tiers[currentTier].groups[groupIndex].trades[tradeIndex];
    if(!eval("tradedata." + element.getAttribute("itemtype"))){
      eval("tradedata." + element.getAttribute("itemtype") + ' = {"item": "","quantity": 1}');
    }
    var itemdata = eval("tradedata." + element.getAttribute("itemtype"));

    currentItemElement = element;
    currentItem = itemdata;
    
    //Enchantment format
    if(getFunctionFromData(itemdata, "specific_enchants")){
      var enchants = getFunctionFromData(itemdata, "specific_enchants").enchants;
      if(enchants.length > 0){
        for(var i = 0; i < enchants.length; i++){
          if(typeof enchants[i] == "string"){
            enchants[i] = {
              id: enchants[i],
              level: 1
            };
          }
        }
      }
    }
    
    document.getElementById("item-preview").innerHTML = 
    '<mcitem identifier="'+ itemdata.item +'" count="'+ itemdata.quantity +'" '+ 
    (getFunctionFromData(itemdata, "set_damage") ? 'damage="'+ getFunctionFromData(itemdata, "set_damage").damage +'"' : "")
    + ' onclick="copyItem(this)" style="width:64px;height:64px;font-size:18pt;" '
    + (getFunctionFromData(itemdata, "specific_enchants") ? 'class="enchanted"' : ' ') +'></mcitem>';
    
    document.getElementById("item-identifier").value = itemdata.item;
    if(Object.keys(mcitems.data.durabilities).includes(itemdata.item)){
      document.getElementById("item-dmg-data").innerHTML = "Damage:";
    } else {
      document.getElementById("item-dmg-data").innerHTML = "Data:";
    }
    document.getElementById("item-count").value = itemdata.quantity;
    
    var damage = getFunctionFromData(itemdata, "set_damage");
    if(damage){
      document.getElementById("item-damage").value = getFunctionFromData(itemdata, "set_damage").damage;
    } else {
      document.getElementById("item-damage").value = "";
    }
  
    if(itemdata.price_multiplier){
      document.getElementById("item-pricemult").value = itemdata.price_multiplier;
    } else {
      document.getElementById("item-pricemult").value = "";
    }
    
    //Custom Name / Lore
    if(getFunctionFromData(itemdata, "set_name")){
      document.getElementById("item-name").value = getFunctionFromData(itemdata, "set_name").name;
    } else {
      document.getElementById("item-name").value = "";
    }
    
    if(getFunctionFromData(itemdata, "set_lore")){
      document.getElementById("item-lore").value = getFunctionFromData(itemdata, "set_lore").lore.join("\n");
    } else {
      document.getElementById("item-lore").value = "";
    }
    
    if(getFunctionFromData(itemdata, "specific_enchants")){
      var enchants = getFunctionFromData(itemdata, "specific_enchants").enchants;
      var enchantStrings = [];
      for(var i = 0; i < enchants.length; i++){
        enchantStrings.push(enchants[i].id + ":" + enchants[i].level);
      }
      document.getElementById("item-enchantments").value = enchantStrings.join("\n");
    } else {
      document.getElementById("item-enchantments").value = "";
    }
    
    mcitems.init();
    
    //document.getElementById("item-json").value = JSON.stringify(currentItem, null, 1);
  }
}

function updateItem(){
  var tradeIndex = parseFloat(currentTradeElement.getAttribute("index"));
  var groupIndex = parseFloat(currentGroupElement.getAttribute("index"));

  var tradedata = tradetable.tiers[currentTier].groups[groupIndex].trades[tradeIndex];
  var itemdata = currentItem;

  if(!(document.getElementById("item-identifier").value == "" && currentItemElement.getAttribute("itemtype") == "wants[1]")){
    itemdata.item = document.getElementById("item-identifier").value;
    itemdata.quantity = parseFloat(document.getElementById("item-count").value);
  } else {
    if(tradedata.wants[1]){
      tradedata.wants.splice(1, 1);
    }
  }
  
  if(Object.keys(mcitems.data.durabilities).includes(itemdata.item)){
    document.getElementById("item-dmg-data").innerHTML = "Damage:";
  } else {
    document.getElementById("item-dmg-data").innerHTML = "Data:";
  }
  
  if(document.getElementById("item-damage").value != ""){
    addFunctionToData(itemdata, {function: "set_damage", damage: parseFloat(document.getElementById("item-damage").value)}, true);
  } else {
    if(getFunctionFromData(itemdata, "set_damage")){
      removeFunctionFromData(itemdata, "set_damage");
    }
  }
  
  if(document.getElementById("item-pricemult").value != ""){
    itemdata.price_multiplier = parseFloat(document.getElementById("item-pricemult").value);
  } else {
    if(itemdata.price_multiplier){
      delete itemdata.price_multiplier;
    }
  }
  
  //Custom name / lore
  if(document.getElementById("item-name").value != ""){
    addFunctionToData(itemdata, {function: "set_name", name: document.getElementById("item-name").value}, true);
  } else {
    if(getFunctionFromData(itemdata, "set_name")){
      removeFunctionFromData(itemdata, "set_name");
    }
  }
  
  if(document.getElementById("item-lore").value != ""){
    addFunctionToData(itemdata, {function: "set_lore", lore: document.getElementById("item-lore").value.split("\n")}, true);
  } else {
    if(getFunctionFromData(itemdata, "set_lore")){
      removeFunctionFromData(itemdata, "set_lore");
    }
  }
  
  //Enchantments
  if(document.getElementById("item-enchantments").value != ""){
    var enchantStrings = document.getElementById("item-enchantments").value.split("\n");
    var enchantObjects = [];
    
    for(var i = 0; i < enchantStrings.length; i++){
      enchantObjects.push({
        id: enchantStrings[i].split(":")[0],
        level: parseFloat(enchantStrings[i].split(":")[1])
      });
    }
    
    addFunctionToData(itemdata, {
      function: "specific_enchants",
      enchants: enchantObjects
    }, true);
  } else {
    if(getFunctionFromData(itemdata, "specific_enchants")){
      removeFunctionFromData(itemdata, "specific_enchants");
    }
  }  

  var tradeEl = currentTradeElement;
  correctTradeData(tradedata);
  correctTrade(tradeEl, tradedata);
  
  document.getElementById("item-preview").innerHTML = 
    '<mcitem identifier="'+ itemdata.item +'" count="'+ itemdata.quantity +'" '+ 
    (getFunctionFromData(itemdata, "set_damage") ? 'damage="'+ getFunctionFromData(itemdata, "set_damage").damage +'"' : "")
    + ' onclick="copyItem(this)" style="width:64px;height:64px;font-size:18pt;" '
    + (getFunctionFromData(itemdata, "specific_enchants") ? 'class="enchanted"' : ' ') +'></mcitem>';
  
  //document.getElementById("item-json").value = JSON.stringify(currentItem, null, 1);
  
  mcitems.init();
}

function updateItemJSON(){
  var tradeIndex = parseFloat(currentTradeElement.getAttribute("index"));
  var groupIndex = parseFloat(currentGroupElement.getAttribute("index"));

  var tradedata = tradetable.tiers[currentTier].groups[groupIndex].trades[tradeIndex];
  var itemdata = currentItem;
  
  //itemdata = JSON.parse(document.getElementById("item-json").value);
  
  //editItem(currentItemElement);
}

function editTier(){
  document.getElementById("overlay").style.display = "block";
  document.getElementById("tier-editor").style.display = "block"; 
  
  document.getElementById("tier-view").innerHTML = "Tier " + currentTier;
  var totalTrades = 0;
  var totalGroups = 0;
  for(var i = 0; i < tradetable.tiers[currentTier].groups.length; i++){
    for(var a = 0; a < tradetable.tiers[currentTier].groups[i].trades.length; a++){
      totalTrades++;
    }
    totalGroups++;
  }
  document.getElementById("tier-trade-view").innerHTML = totalTrades;
  document.getElementById("tier-group-view").innerHTML = totalGroups;
  
  if(tradetable.tiers[currentTier].hasOwnProperty("total_exp_required")){
    document.getElementById("tier-xp").value = tradetable.tiers[currentTier].total_exp_required;
  } else {
    document.getElementById("tier-xp").value = "";
  }
}

function updateTier(){
  if(document.getElementById("tier-xp").value != ""){
    tradetable.tiers[currentTier].total_exp_required = parseFloat(document.getElementById("tier-xp").value);
  } else {
    if(tradetable.tiers[currentTier].total_exp_required){
      delete tradetable.tiers[currentTier].total_exp_required;
    }
  }
}

function copyItem(){
  navigator.clipboard.writeText(JSON.stringify(currentItem, null, 3));
  snackbar('Copied item JSON to clipboard.');
}

tableToEditor();