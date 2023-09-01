/*
  When given a trade table, this file is responsible for processing it and turning it into a functional preview. 
  This file simulates:
  - random enchantment selection
  - custom names for items
  - custom lore for items
  - the "choice" function in items
*/
var preload = new Image()
preload.src =
	'https://github.com/Mojang/bedrock-samples/raw/main/resource_pack/textures/ui/arrow_dark_right.png'

function tradeTableLoaded(tradeTable) {
  //Set the "current table" variable to the entered value in the function in case the table was not loaded via a file
  if(typeof tradeTable === 'string'){
    mytable = JSON.parse(sterilizeJSON(tradeTable))
  } else if(typeof tradeTable === 'object') {
    mytable = tradeTable;
  } else {
    alert('Invalid trade import');
    return;
  }
  
	//document.getElementById('import').style.display = 'none'
	//document.getElementById('reroll').style.display = 'inline'
	simulateTable(mytable)
}

var importedData = '';
function parseImportedData(){
  tradeTableLoaded(importedData);
}

var tradeTemplate = {
	wants: [
		{ item: 'minecraft:string', quantity: 20, price_multiplier: 0.05 },
		{ item: 'minecraft:brick', quantity: 1 },
	],
	gives: [{ item: 'minecraft:emerald', quantity: 1 }],
	trader_exp: 1,
	max_uses: 6,
	reward_exp: true,
}

var mytable = {};

function simulateTable(table){
  table = JSON.parse(JSON.stringify(correctImportedTable(table)))
  if(!table.tiers) return;
	document.getElementById('list').innerHTML = '';
  
  for(let tier of table.tiers){
    var myTier = createTier(table.tiers.length > 1 ? false : true)
    for(let group of tier.groups){
      
      var trades = []
      if (group.num_to_select && group.num_to_select > 0) {
				var alltrades = group.trades
				for (var r = 0; r < group.num_to_select; r++) {
					var index = Math.floor(Math.random() * alltrades.length) + 0
					trades.push(alltrades[index])
					alltrades.splice(index, 1)
				}
			} else {
				trades = group.trades
			}
      
      for(let trade of trades){
        addTrade(myTier, trade)
      }
    }
    addTier(myTier)
  }
}

function correctImportedTable(table){
  //In a perfect world, this function would do nothing. Unfortunately, trade tables have a variety of possible syntaxes so this function sorts the table into the most accomodating one.
  var tiers = table.tiers || []
  
  for (var i = 0; i < tiers.length; i++) {
		//Make sure everything is sorted into groups
		if (tiers[i].hasOwnProperty('trades')) {
      //If tier contains trades, move tier's trades into a group.
			tiers[i].groups = [
				{
					trades: JSON.parse(JSON.stringify(tiers[i].trades)),
				},
			]
			delete tiers[i].trades
		}
  }
  
  return table;
}

//Dealing with Tiers
function addTier(tier) {
  //Adds the tier element to the list. Restarts the item engine.
	document.getElementById('list').appendChild(tier)
	mcitems.init()
}

function createTier(disableName) {
	var index = document.getElementById('list').children.length;
	var tierName =
		index <= tierNames.length
			? tierNames[index]
			: tierNames[tierNames.length - 1]
	var tier = document.createElement('div')
	tier.classList = ['tier'];
	if (!disableName) {
    var levellabel = document.createElement("span");
    levellabel.classList = ["levellabel"];
    levellabel.innerHTML = 'Level ' + (index + 1) + ' - ' + tierName;
    tier.appendChild(levellabel);
	} else {
		tier.innerHTML = '<br>'
	}

	return tier;
}

function addTrade(element, tradeData){
  if (!tradeData) {
		var tradeData = tradeTemplate
	}

	var wants0 = tradeData.wants[0]
	var wants1 = tradeData.wants[1] ? tradeData.wants[1] : false
	var gives = tradeData.gives[0]

	var trade = document.createElement('div')
	trade.classList = ['trade'];
  
  var tradeInner = document.createElement('div');
  tradeInner.classList = ['trade-inner']
  //wants0
  tradeInner.appendChild(createItem(wants0));
  //wants1
  tradeInner.appendChild(createItem(wants1));
  
  //Create division arrow
  var arrow = document.createElement("img");
  arrow.classList = ["trade-arrow"];
  arrow.src = "https://github.com/bedrock-dot-dev/packs/raw/master/stable/resource/textures/ui/arrow_dark_right.png";
  tradeInner.appendChild(arrow);
  
  //gives
  tradeInner.appendChild(createItem(gives));
  
  trade.appendChild(tradeInner);
  element.appendChild(trade);
}

function createItem(data){
  if(data === false){
    return createItemElement(true);
  } else {
    //Provide functionality for the "choice" function
    if(data.choice){
      data = data.choice[Math.floor(Math.random() * data.choice.length)];
    }
    
    var itemidentifier = data.item || 'minecraft:air';
    var quantity = checkQuantity(data.quantity) || 1;
    var damage = ((getFunction('set_damage', 'damage', data)) != false ? checkQuantity(getFunction('set_damage', 'damage', itemdata)) : false);
    var enchanted = (doEnchantments(data) !== false);
    var itemdata = JSON.stringify(data);
    
    //Operate on the item identifier    
    if(enchanted !== false && itemidentifier == "minecraft:book"){
      itemidentifier = "minecraft:enchanted_book"
    }
    if(getFunction('set_data', 'function', data)){
      itemidentifier += ":" + getFunction('set_data', 'data', data);
    } else if(getFunction('random_aux_value', 'function', data) != false){
      itemidentifier += ":" + checkQuantity(getFunction('random_aux_value', 'values', data));
    }
    
    return createItemElement(false, itemidentifier, quantity, damage, enchanted, itemdata);
  }
}

function createItemElement(invisible, item, quantity, damage, enchanted, itemdata){
  var mcitem = document.createElement("mcitem");
  mcitem.setAttribute("height", "40px");
  mcitem.setAttribute("width", "40px");
  if(invisible){
    mcitem.style = "visibility: hidden;";
    mcitem.setAttribute("identifier", "minecraft:air");
    mcitem.setAttribute("count", "0");
  } else {
    mcitem.setAttribute("identifier", item);
    mcitem.setAttribute("count", quantity);
    mcitem.setAttribute("class", "hovertooltip nohover" + (enchanted ? ' enchanted' : ''));
    if(damage) mcitem.setAttribute("damage", damage);
    if(itemdata) mcitem.setAttribute("itemdata", itemdata);
  }
  
  return mcitem;
}

function checkQuantity(value){
  var output = 1;
  if(value === undefined) value = 1;
  if(value.constructor === Object){
    //Pick random between "min" and "max" properties
    let min = Math.ceil(value.min);
    let max = Math.floor(value.max);
    output = Math.floor(Math.random() * (max - min + 1)) + min;
  } else {
    //Output the set value
    output = value;
  }
  //Enforce max and min stack size
  if(output > 64) output = 64;
  if(output < 1) output = 1;
  
  return output;
}

var tierNames = [
	'Novice',
	'Apprentice',
	'Journeyman',
	'Expert',
	'Master',
	/*"*Grand Master",
  "*Supreme Master",
  "*Lord",
  "*Demigod",
  "*Ultra-demigod",
  "*Godlike",
  "*Beyond Godlike",
  "*God."*/
	'*',
]

/*document.addEventListener('mousemove', moveTooltip, false);

function moveTooltip(e) {
  let tooltip = document.querySelector('.tooltip');
  if(tooltip.style.display != 'none'){
    tooltip.style.left = e.pageX + 'px';
    tooltip.style.top = e.pageY + 'px';
  }
}*/

mcitems.tooltip.show = function(element){
  let tooltip = document.querySelector('.tooltip')

  var itemdata = JSON.parse(element.getAttribute("itemdata"));

  let itemname = ((getFunction('set_name', 'name', itemdata) != false) ? getFunction('set_name', 'name', itemdata) : (element.children[0].getAttribute("data-title") != element.getAttribute("identifier") ? element.children[0].getAttribute("data-title") : "Unknown Name"));
  let customitemname = (getFunction('set_name', 'name', itemdata) != false);
  let itemenchs = doEnchantments(itemdata);
  let itemlore = ((getFunction('set_lore', 'lore', itemdata) != false) ? getFunction('set_lore', 'lore', itemdata).join("<br>") : false)
  let itemid = element.getAttribute("identifier")

  document.querySelector('.tooltip-name').innerHTML = itemname;
  if(customitemname){
    document.querySelector('.tooltip-name').style.fontStyle = 'italic'
  } else {
    document.querySelector('.tooltip-name').style.fontStyle = 'unset'
  }

  if(itemenchs === false){
    document.querySelector('.tooltip-enchs').innerHTML = "";
  } else {
    document.querySelector('.tooltip-enchs').innerHTML = itemenchs;
  }

  if(itemlore === false){
    document.querySelector('.tooltip-lore').innerHTML = "";
  } else {
    document.querySelector('.tooltip-lore').innerHTML = itemlore;
  }
  document.querySelector('.tooltip-identifier').innerHTML = itemid;

  tooltip.style.display = 'block';  
};

function toggleShowIds(elem){
  document.querySelector('.tooltip-identifier').style.display = (elem.checked ? 'block' : 'none');
}

function getFunction(search, property, itemdata){
  if (!itemdata.functions) {
		return false;
	}

	for (let func of itemdata.functions) {
		if (func.function == search && func.hasOwnProperty(property)) {
			return func[property];
		}
	}
  
  return false;
}

function doEnchantments(itemdata){
  var enchantdata = false;
  if(getFunction("specific_enchants", "enchants", itemdata) !== false){
    enchantdata = getFunction("specific_enchants", "enchants", itemdata)
  } else if(getFunction("enchant_book_for_trading", "function", itemdata) !== false || getFunction("enchant_randomly", "function", itemdata) !== false) {
    let enchid = Object.keys(enchantNames)[Math.floor(Math.random() * Object.keys(enchantNames).length)];
    let enchlvl = Math.floor(Math.random() * enchantNames[enchid].maxLevel) + 1;
    enchantdata = [
      {
        id: enchid,
        level: enchlvl
      }
    ];
    //Use the specific enchants function temporarily during the preview to stop the enchantment re-rolling on the next hover event
    itemdata.functions.push({
      "function": "specific_enchants",
      "enchants": enchantdata
    })
  }
  //No enchantments found, report 'false'
  if(!enchantdata) return false;
  
  var output = "";
  for(let enchant of enchantdata){
    //Write enchantment list
    let enchantId = 'sharpness';
    let enchantLvl = 1;
    if(typeof enchant != 'string'){
      enchantId = enchant.id;
      enchantLvl = enchant.level;
    } else {
      enchantId = enchant;
    }
    if(enchantId && enchantLvl){
      output += "<span" + (enchantNames[enchantId].curse ? ' style="color: #FF5555;"': '') +">" + enchantNames[enchant.id].name + " " + enchantNumerals[enchant.level] + "</span><br>";
    } 
  }
  
  return output; //"Aqua Affinity I<br>Unbreaking III"
}

var enchantNames = null; 
var enchantNumerals = null;
(async function(){
  let general_data = await fetch("/data/general.json").then((result) => {return result.json()});
  enchantNames = general_data.enchantments;
  enchantNumerals = general_data.numerals;
})();