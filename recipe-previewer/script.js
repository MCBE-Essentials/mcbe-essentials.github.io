var preload = new Image()
preload.src =
	'https://github.com/bedrock-dot-dev/packs/raw/master/stable/resource/textures/ui/arrow_dark_right.png'

let myrecipe = {};

var importedData = '';
function parseImportedData(){
  recipeLoaded(importedData);
}

let craftingelement = document.getElementById("crafting-table");

var tagMapping = {
  "crafting_table": "Crafting Table",
  "stonecutter": "Stonecutter",
  "smithing_table": "Smithing Table",
  "furnace": "Furnace",
  "blast_furnace": "Blast Furnace",
  "smoker": "Smoker",
  "campfire": "Campfire",
  "soul_campfire": "Soul Campfire",
  "brewing_stand": "Brewing Stand",
};

//Get potion-mapping.json data
var potionMapping = null; (async function(){potionMapping = await fetch("/data/potion-types.json").then((result) => {return result.json()});})();

function recipeLoaded(recipe) {
  //Set the "current table" variable to the entered value in the function in case the table was not loaded via a file
  if(typeof recipe === 'string'){
    myrecipe = JSON.parse(sterilizeJSON(recipe))
  } else if(typeof recipe === 'object') {
    myrecipe = recipe;
  } else {
    alert('Invalid recipe import (must be either valid JSON or text)');
    return;
  }
  
	//document.getElementById('import').style.display = 'none'
	//document.getElementById('reroll').style.display = 'inline'
	renderRecipe(myrecipe)
}

function renderRecipe(recipe){
  //Clear all slots
  for(let slot of document.querySelectorAll(".slot")){
    slot.innerHTML = "";
  }
  
  for(let cdisplay of document.querySelectorAll(".crafting-type")){
    cdisplay.style.display = "none"
  }
  
  //First, figure out what kind of recipe we're dealing with
  if(recipe.hasOwnProperty("minecraft:recipe_shaped")){
    //Recipe is crafting table or crafting 2x2
    showDesign('shaped', recipe['minecraft:recipe_shaped'])
    shapedRecipe(recipe, craftingelement)
  } else if(recipe.hasOwnProperty("minecraft:recipe_shapeless")){
    //Recipe is crafting table, smithing table, stonecutter or crafting 2x2
    if(recipe['minecraft:recipe_shapeless'].tags[0] == "stonecutter"){
      showDesign('stonecutter', recipe['minecraft:recipe_shapeless'])
    } else if(recipe['minecraft:recipe_shapeless'].tags[0] == "smithing_table"){
      showDesign('brewing', recipe['minecraft:recipe_shapeless'])
    } else {
      showDesign('shapeless', recipe['minecraft:recipe_shapeless'])
    }
    shapelessRecipe(recipe, craftingelement)
  } else if(recipe.hasOwnProperty("minecraft:recipe_furnace")){
    //Recipe is furnace, blast furnace, smoker, campfire or soul campfire
    showDesign('furnace', recipe['minecraft:recipe_furnace'])
    furnaceRecipe(recipe, craftingelement)
  } else if(recipe.hasOwnProperty("minecraft:recipe_brewing_mix")){
    //Recipe is brewing stand
    showDesign('brewing', recipe['minecraft:recipe_brewing_mix'])
    brewingMixRecipe(recipe, craftingelement)
  } else if(recipe.hasOwnProperty("minecraft:recipe_brewing_container")) {
    showDesign('brewing', recipe['minecraft:recipe_brewing_container'])
    brewingContainerRecipe(recipe, craftingelement)
  } else {
    //Invalid
  }
}

function determineName(tags){
  //This function determines what name should be displayed from a tags array.
  var output = "";
  if(tags[0]) output = tags[0]
  for(let tag of tags){
    if(tagMapping.hasOwnProperty(tag) && !Object.values(tagMapping).includes(output)){
      output = tagMapping[tag]
    }
  }
  
  return output;
}

function isShapedSmall(recipebody){
  var pattern = recipebody.pattern;
  if(pattern.length < 3){
    for(let line of pattern){
      if(line.length >= 3){
        return false;
      }
    }
    return true;
  } else {
    return false;
  }
}

function showDesign(type, recipebody){
  let tags = recipebody.tags;
  document.querySelector("#recipe-title").innerHTML = determineName(tags)
  
  if(type == 'shaped'){
    //Choose 3x3 or 2x2
    if(isShapedSmall(recipebody)){
      document.querySelector(".crafting-2x2").style.display = "block"
      craftingelement = document.querySelector(".crafting-2x2");
    } else {
      document.querySelector(".crafting-table-3x3").style.display = "block"
      craftingelement = document.querySelector(".crafting-table-3x3");
    }
  } else if(type == 'shapeless') {
    if(recipebody.ingredients.length < 5){
      document.querySelector(".crafting-2x2").style.display = "block"
      craftingelement = document.querySelector(".crafting-2x2");
    } else {
      document.querySelector(".crafting-table-3x3").style.display = "block"
      craftingelement = document.querySelector(".crafting-table-3x3");
    }
  } else if(type == 'furnace') {
    document.querySelector(".furnace").style.display = "block"
    craftingelement = document.querySelector(".furnace");
  } else if(type == 'brewing') {
    document.querySelector(".mock-brewing").style.display = "block"
    craftingelement = document.querySelector(".mock-brewing");
  } else if(type == 'stonecutter') {
    document.querySelector(".stonecutter").style.display = "block"
    craftingelement = document.querySelector(".stonecutter");
  }
}

function createItemElement(item, parent){
  let enchanted = false;
  //Handle item data
  //First, append the minecraft: namespace if it doesn't exist
  if(!item.item.startsWith("minecraft:")){
    item.item = "minecraft:" + item.item;
  }
  
  if(typeof item.data !== "undefined" && item.item.split(":").length < 3){
    item.item += ":" + item.data
  }
  //Item identifier
  let itemid = item.item;
  if(itemid.startsWith("minecraft:potion_type:") && potionMapping.includes(itemid.replace("minecraft:potion_type:", ""))){
    itemid = "minecraft:potion:" + potionMapping.indexOf(itemid.replace("minecraft:potion_type:", ""));
    enchanted = true;
  }
  
  var mcitem = document.createElement("mcitem");
  mcitem.setAttribute("width", "40px")
  mcitem.setAttribute("height", "40px")
  mcitem.setAttribute("identifier", itemid)
  mcitem.setAttribute("count", (typeof item.count !== 'undefined' ? item.count : "1"))
  mcitem.setAttribute("class", "nohover hovertooltip" + (enchanted ? " enchanted" : ""))
  
  parent.appendChild(mcitem);
}

function shapedRecipe(recipe, element){
  let pattern = recipe['minecraft:recipe_shaped'].pattern;
  let key = recipe['minecraft:recipe_shaped'].key;
  let result = recipe['minecraft:recipe_shaped'].result
  
  //Figure out the items to render by examining the template
  for(let l = 0; l < pattern.length; l++){
    let patternline = pattern[l];
    for(let i = 0; i < patternline.length; i++){
      let patternitem = patternline[i];
      
      let slot = element.getElementsByTagName("table")[0].getElementsByTagName("tr")[l].getElementsByClassName("slot")[i];
      slot.innerHTML = "";
      
      if(patternitem == " "){
        //Item is blank
      } else {
        createItemElement(key[patternitem], slot);
      }
    }
  }
  
  //Render the end result
  let resultslot = element.getElementsByTagName("table")[1].getElementsByClassName("slot")[0];
  resultslot.innerHTML = "";
  createItemElement(result, resultslot);
  
  mcitems.init()
}

function shapelessRecipe(recipe, element){
  let ingredients = recipe['minecraft:recipe_shapeless'].ingredients;
  let result = recipe['minecraft:recipe_shapeless'].result;
  if(result.constructor == Array){
    result = result[0]
  }
  
  for(let i = 0; i < ingredients.length; i++){
    let slot = element.getElementsByTagName("table")[0].getElementsByClassName("slot")[i];
    slot.innerHTML = "";

    createItemElement(ingredients[i], slot);
  }
  
  //Render the end result
  let resultslot = element.getElementsByTagName("table")[1].getElementsByClassName("slot")[0];
  resultslot.innerHTML = "";
  createItemElement(result, resultslot);
  
  mcitems.init()
}

function furnaceRecipe(recipe, element){
  let input = recipe['minecraft:recipe_furnace'].input;
  let output = recipe['minecraft:recipe_furnace'].output;
  
  //Render the input slot
  let inputslot = element.getElementsByTagName("table")[0].getElementsByClassName("slot")[0];
  inputslot.innerHTML = "";
  createItemElement({item: input}, inputslot);
  
  //Render the end result
  let resultslot = element.getElementsByTagName("table")[1].getElementsByClassName("slot")[0];
  resultslot.innerHTML = "";
  createItemElement({item: output}, resultslot);
  
  mcitems.init()
}

function brewingMixRecipe(recipe, element){
  let input = recipe['minecraft:recipe_brewing_mix'].input;
  let reagent = recipe['minecraft:recipe_brewing_mix'].reagent;
  let output = recipe['minecraft:recipe_brewing_mix'].output;
  
  //Render the input slot
  let inputslot = element.getElementsByTagName("table")[0].getElementsByClassName("slot")[0];
  inputslot.innerHTML = "";
  createItemElement({item: input}, inputslot);
  
  //Render the reagent
  let reagentslot = element.getElementsByTagName("table")[0].getElementsByClassName("slot")[1];
  reagentslot.innerHTML = "";
  createItemElement({item: reagent}, reagentslot);
  
  //Render the end result
  let resultslot = element.getElementsByTagName("table")[1].getElementsByClassName("slot")[0];
  resultslot.innerHTML = "";
  createItemElement({item: output}, resultslot);
  
  mcitems.init()
}

function brewingContainerRecipe(recipe, element){
  let input = recipe['minecraft:recipe_brewing_container'].input;
  let reagent = recipe['minecraft:recipe_brewing_container'].reagent;
  let output = recipe['minecraft:recipe_brewing_container'].output;
  
  //Render the input slot
  let inputslot = element.getElementsByTagName("table")[0].getElementsByClassName("slot")[0];
  inputslot.innerHTML = "";
  createItemElement({item: input}, inputslot);
  
  //Render the reagent
  let reagentslot = element.getElementsByTagName("table")[0].getElementsByClassName("slot")[1];
  reagentslot.innerHTML = "";
  createItemElement({item: reagent}, reagentslot);
  
  //Render the end result
  let resultslot = element.getElementsByTagName("table")[1].getElementsByClassName("slot")[0];
  resultslot.innerHTML = "";
  createItemElement({item: output}, resultslot);
  
  mcitems.init()
}

document.addEventListener('mousemove', moveTooltip, false);

function moveTooltip(e) {
  let tooltip = document.querySelector('.tooltip');
  if(tooltip.style.display != 'none'){
    tooltip.style.left = e.pageX + 'px';
    tooltip.style.top = e.pageY + 'px';
  }
}