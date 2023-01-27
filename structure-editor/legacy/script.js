const nbt = require('prismarine-nbt');
const { Buffer } = require('buffer');
 // fetch('https://cdn.glitch.global/17ff8eee-9239-4ba0-8a5c-9263261550b5/bobby.mcstructure?v=1642358868820').then(resp => resp.arrayBuffer())
 //   .then(buf => nbt.parse(Buffer.from(buf))).then(console.log)

var importedData = false;

var xhttp = new XMLHttpRequest();
xhttp.onreadystatechange = function() {
  if (this.readyState == 4 && this.status == 200) {
    // Typical action to be performed when the document is ready:
    data = JSON.parse(xhttp.responseText);
    identifiers = data.definitions;
    doIdentifiers();
  }
};
xhttp.open("GET", "https://raw.githubusercontent.com/bridge-core/editor-packages/main/packages/minecraftBedrock/schema/general/vanilla/identifiers.json", true);
//THANK YOU BRIDGE.!
xhttp.send();

var identifiers = {};
async function doIdentifiers(){
  document.getElementById("block_identifiers").innerHTML = "";
  for(var i = 0; i < identifiers.prefixed_block_identifiers.enum.length; i++){
    document.getElementById("block_identifiers").innerHTML += '<option value="'+ identifiers.prefixed_block_identifiers.enum[i] +'"></option>';
  }
  
  document.getElementById("item_identifiers").innerHTML = "";
  for(var i = 0; i < identifiers.prefixed_item_identifiers.enum.length; i++){
    document.getElementById("item_identifiers").innerHTML += '<option value="'+ identifiers.prefixed_item_identifiers.enum[i] +'"></option>';
  }
  
  document.getElementById("entity_identifiers").innerHTML = "";
  for(var i = 0; i < identifiers.prefixed_entity_identifiers.enum.length; i++){
    document.getElementById("entity_identifiers").innerHTML += '<option value="'+ identifiers.prefixed_entity_identifiers.enum[i] +'"></option>';
  }
}

var allEffects = null; (async function(){allEffects = await fetch("/data/effects-list.json").then((result) => {return result.json()});})();

var allTEntities = {"BrewingStand":{"type":"container","slots":5,"slotsDescriptions":["Ingredient","Bottle 1","Bottle 2","Bottle 3","Fuel"]},"BlastFurnace":{"type":"container","slots":3,"slotsDescriptions":["Input","Fuel","Result"],"furnace":true},"Barrel":{"type":"container","slots":27},"//ChiseledBookshelf":{"type":"container","slots":6},"FlowerPot":{"type":"flowerpot"},"Dropper":{"type":"container","slots":9},"Dispenser":{"type":"container","slots":9},"Chest":{"type":"container","slots":27},"GlowItemFrame":{"type":"container","behavior":"itemframe","slots":1},"HangingSign":{"type":"sign"},"ItemFrame":{"type":"container","behavior":"itemframe","slots":1},"Hopper":{"type":"container","slots":5},"Furnace":{"type":"container","slots":3,"slotsDescriptions":["Input","Fuel","Result"],"furnace":true},"//Lectern":{"type":"container","behavior":"lectern","slots":1,"slotsDescriptions":["Book"]},"Jukebox":{"type":"container","behavior":"jukebox","slots":1,"slotsDescriptions":["Disc"]},"Smoker":{"type":"container","slots":3,"slotsDescriptions":["Input","Fuel","Result"],"furnace":true},"ShulkerBox":{"type":"container","slots":27},"Sign":{"type":"sign"},"//StructureBlock":{"type":"structureblock"},"CommandBlock":{"type":"commandblock"},"MobSpawner":{"type":"spawner"}}; (async function(){allTEntities = await fetch("/data/tile-entities.json").then((result) => {return result.json()});})();

var texteditor = new JSONEditor(document.getElementById('text-holder'), {
  mode: "tree"
})
function openTextEditor(){
  document.getElementById("text-editor").style.display = "block";
  document.getElementById("overlay").style.display = "block";
  texteditor.set(structure);
}

function openFileEditor(){
  document.getElementById("file-editor").style.display = "block";
  document.getElementById("overlay").style.display = "block";
}

function openPreview(){
  if(!structure.value.structure.value.palette.value.default){
    snackbar("The structure's palette is empty.");
    return;
  }
  
  if(structure.hasOwnProperty("name")){
    drawStructureTop(structure);
    document.getElementById("viewer").style.display = "block";
    document.getElementById("overlay").style.display = "block";
  }
}

function closeEditors(){
  if(document.getElementById("entity-editor").style.display != "none"){
    updateEntity();
  }
  if(document.getElementById("text-editor").style.display != "none"){
    structure = texteditor.get();
    structureToEditor();
  }
  document.getElementById("entity-editor").style.display = "none";
  document.getElementById("text-editor").style.display = "none";
  document.getElementById("file-editor").style.display = "none";
  document.getElementById("viewer").style.display = "none";
  if(document.getElementById("uploader").style.display == "none"){
    document.getElementById("overlay").style.display = "none";
  }
}

function copyJson(){
  navigator.clipboard.writeText(JSON.stringify(structure, null, 3));
  snackbar('Copied structure JSON to clipboard.');
}

function exportJson(){
  exportFile(new File([JSON.stringify(structure, null, 3)], document.getElementById("dataFileInput").files[0].name.replaceAll(".mcstructure", ".json")));
  snackbar('The JSON file can be uploaded the same as a MCSTRUCTURE file.');
}

var structure = {};
var unparsedStructure;
var entities = [];
var tileentities = {};

var currentEntity = {};
var currentEntityPath = '';
var currentTile = {};
var currentTileMeta = {};
var currentLabel;
var currentTileItem;
var isTileItem = false;
var currentEntityMeta = {};
var currentEntityItem;
var isEntityItem = false;

function parseImportedData(file){
  if(file.name.endsWith('.json')){
    structure = JSON.parse(importedData);
    structureToEditor();
  } else {
    nbt.parse(Buffer.from(importedData)).then(function(data){
      structure = data.parsed;
      unparsedStructure = data.metadata.buffer;
      //console.log(data);

      if(structure.value.entities){
        javaToBedrock();
      }

      structureToEditor();
    });
  }
}

function loaded(){
  document.getElementById("loading2").style.display="none";
  document.getElementById("upload2").style.display="block";
}

function structureToEditor(){
  if(!structure.value || !structure.type){
    alert("This is not a valid structure file.");
    return;
  }
  
  document.getElementById("upload").style.display="none";
  document.getElementById("uploader").style.display = "none";
  document.getElementById("download").style.display="block";
  document.getElementById("overlay").style.display = "none";
  
  var path = "structure.value";
  entities = structure.value.structure.value.entities.value.value;
  if(structure.value.structure.value.palette.value.default){
    tileentities = Object.values(structure.value.structure.value.palette.value.default.value.block_position_data.value);
  } else {
    tileentities = false;
  }
  
  //Create entity list
  document.getElementById("entity-list").innerHTML = "";
  for(var i = 0; i < entities.length; i++){
    var name = "minecraft:unknown";
    if(entities[i].CustomName){
      name = entities[i].CustomName.value;
    } else if(entities[i].RawtextName) {
      name = entities[i].RawtextName.value;
    } else {
      name = entities[i].identifier.value;
    }
    document.getElementById("entity-list").innerHTML += '<span class="idlabel" index="'+i+'" onclick="openEditEntity(this)">'+name+'</span>';
  }
  
  //Create Tile Entities List
  document.getElementById("tile-list").innerHTML = ""
  if(tileentities){
    for(var i = 0; i < tileentities.length; i++){
      if(tileentities[i].value.block_entity_data){
        var name = tileentities[i].value.block_entity_data.value.id.value;
        if(Object.keys(allTEntities).includes(name)){
          document.getElementById("tile-list").innerHTML += '<span class="idlabel" index="'+i+'" onclick="openEditTile(this)">'+name+'</span>';
        } else {
          snackbar('One or more tile entities in this structure are not supported in the Tile Entity Editor.');
          console.log('Invalid tile entity: ', tileentities[i]);
        }
      }
    }
  }
  
  document.getElementById("worldorigin").innerHTML = structure.value.structure_world_origin.value.value.join(", ");
  document.getElementById("structuresize").innerHTML = structure.value.size.value.value.join(", ");
}

function exportStructure(tiles, air, waterlog, blockstates, tilecontainerloot, entities, entityrot, entityloot){
  var structure2 = JSON.parse(JSON.stringify(structure));
  if(!tiles){
    structure2.value.structure.value.block_indices.value.value = [
      {
          "type": "end",
          "value": []
      },
      {
          "type": "end",
          "value": []
      }
    ];
    structure2.value.structure.value.palette.value = {};
  }
  
  if(!air && structure2.value.structure.value.palette.value.hasOwnProperty("default")){
    var p = structure2.value.structure.value.palette.value.default.value.block_palette.value.value;
    var airIndex = 0;
    for(var i = 0; i < p.length; i++){
      if(p[i].name.value == "minecraft:air"){
        airIndex = i;
      }
    }
    
    for(var i = 0; i < structure2.value.structure.value.block_indices.value.value[0].value.length; i++){
      if(structure2.value.structure.value.block_indices.value.value[0].value[i] == airIndex){
        structure2.value.structure.value.block_indices.value.value[0].value[i] = -1;
      }
    }
  }
  
  if(!waterlog && structure2.value.structure.value.block_indices.value.value[0].type == 'int'){
    for(var i = 0; i < structure2.value.structure.value.block_indices.value.value[1].value.length; i++){
      structure2.value.structure.value.block_indices.value.value[1].value[i] = -1;
    }
  }
  
  if(!blockstates && structure2.value.structure.value.palette.value.hasOwnProperty("default")){
    var p = structure2.value.structure.value.palette.value.default.value.block_palette.value.value;
    for(var i = 0; i < p.length; i++){
      p[i].states.value = {};
    }
  }
  
  if(!tilecontainerloot && structure2.value.structure.value.palette.value.hasOwnProperty("default")){
    structure2.value.structure.value.palette.value.default.value.block_position_data.value = {};
  }
  
  if(!entities){
    structure2.value.structure.value.entities.value.value = [];
  }
  
  if(!entityrot && structure2.value.structure.value.entities.value.value.length > 0){
    for(var i = 0; i = structure2.value.structure.value.entities.value.value.length; i++){
      structure2.value.structure.value.entities.value.value[i].Rotation.value.value = [0, 0];
    }
  }
  
  if(!entityloot && structure2.value.structure.value.entities.value.value.length > 0){
    var entitieslist = structure2.value.structure.value.entities.value.value;
    for(var i = 0; i = entitieslist.length; i++){
      if(entitieslist[i].ChestItems){
        delete entitieslist[i].ChestItems;
      }
      if(entitieslist[i].Armor){
        delete entitieslist[i].Armor;
      }
      if(entitieslist[i].Mainhand){
        delete entitieslist[i].Mainhand;
      }
      if(entitieslist[i].Offhand){
        delete entitieslist[i].Offhand;
      }
    }
  }
  var filename = 'bridge-file'
  if(document.getElementById("dataFileInput").files[0]) filename = document.getElementById("dataFileInput").files[0].name;
  
  exportFile(new File([nbt.writeUncompressed(structure2, 'little')], "hello.mcstructure"), filename);
}

function exportFunction(tiles, air, waterlog,blockstates, tilecontainerloot, entities, entityrot, entityloot){
  
  
  exportFile(new File([
    structureToFunction(
      tiles,
      air,
      waterlog,
      blockstates,
      tilecontainerloot,
      entities,
      entityrot,
      entityloot
    )
  ], "hello.mcfunction"), document.getElementById("dataFileInput").files[0].name.replaceAll(".mcstructure", ".mcfunction"));
}

function download(){
  if(document.getElementById("filetype").value == "mcstructure"){
    exportStructure(
      document.getElementById("tiles").checked,
      document.getElementById("air").checked,
      document.getElementById("waterlog").checked,
      document.getElementById("blockstates").checked,
      document.getElementById("tilecontainerloot").checked,
      document.getElementById("entities").checked,
      document.getElementById("entityrot").checked,
      document.getElementById("entityloot").checked
    );
  } else if(document.getElementById("filetype").value == "mcfunction"){
    exportFunction(
      document.getElementById("tiles").checked,
      document.getElementById("air").checked,
      document.getElementById("waterlog").checked,
      document.getElementById("blockstates").checked,
      document.getElementById("tilecontainerloot").checked,
      document.getElementById("entities").checked,
      document.getElementById("entityrot").checked,
      document.getElementById("entityloot").checked
    );
  }
}

function fillBlocks(){
  if(!structure.value.structure.value.palette.value.default){
    snackbar("This structure does not support blocks.");
    return;
  }
  
  var disallowedValues = [
    //If any of these values are entered, the program considers the user response "omitted"
    "",
    " ",
    "null",
    null
  ];
  
  var fill = document.getElementById("fill-fill").value;
  var layer = parseFloat(document.getElementById("fill-layer").value);
  var from = [
    parseFloat(document.getElementById("fill-f-1").value), // X
    parseFloat(document.getElementById("fill-f-2").value), // Y
    parseFloat(document.getElementById("fill-f-3").value)  // Z
  ];
  var to = [
    parseFloat(document.getElementById("fill-t-1").value) + 1, // X
    parseFloat(document.getElementById("fill-t-2").value) + 1, // Y
    parseFloat(document.getElementById("fill-t-3").value) + 1  // Z
  ];
  var target = document.getElementById("fill-target").value;
  if(disallowedValues.includes(target)){
    target = false;
  }
  
  if(disallowedValues.includes(fill)){
    //If fill is invalid, don't do anything
    return false;
  }
  
  //Search for an existing item in the palette. Defaults to not found.
  var palette = false;
  var matchingPalette = false;
  if(structure.value.structure.value.palette.value){
    palette = structure.value.structure.value.palette.value.default.value.block_palette.value.value;
    for(var i = 0; i < palette.length; i++){
      if(palette[i].name.value == fill && Object.keys(palette[i].states.value).length == 0){
        //Potential future update to add blockstates?
        
        //Found palette entry.
        matchingPalette = palette[i];
      }
    }
  } else {
    structure.value.structure.value.palette.value.default = {
        "type": "compound",
        "value": {
        "block_palette": {
            "type": "list",
            "value": {
            "type": "compound",
            "value": []
          }
        }
      }
    };
  }
  
  if(!matchingPalette){
    var entry = {
        "name": {
            "type": "string",
            "value": fill
        },
        "states": {
            "type": "compound",
            "value": {}
        },
        "version": {
            "type": "int",
            "value": 17825808
        }
    };
    palette.push(entry);
    matchingPalette = palette[palette.length-1];
  }
  
  var paletteIndex = palette.indexOf(matchingPalette);
  
  //Get point A and point B
  var pointA = [];
  var pointB = [];
  for(var i = 0; i < 3; i++){
    if(from[i] < to[i]){
      pointA.push(from[i]);
      pointB.push(to[i]);
    } else {
      pointA.push(to[i]);
      pointB.push(from[i]);
    }
  }
  
  //Fill from point A to point B
  var structureSize = structure.value.size.value.value;
  var blocks = structure.value.structure.value.block_indices.value.value[layer].value;
  var blockFilled = 0;
  for(var z = pointA[2]; z < pointB[2] + 1; z++){
    for(var y = pointA[1]; y < pointB[1] + 1; y++){
      for(var x = pointA[0]; x < pointB[0] + 1; x++){
        if(blocks[getStructureBlockIndex(structureSize, [x,y,z])] != paletteIndex){
          if(!target || palette[blocks[getStructureBlockIndex(structureSize, [x,y,z])]].name.value == target){
            blocks[getStructureBlockIndex(structureSize, [x,y,z])] = paletteIndex;
            blockFilled++;
            console.log(blocks[getStructureBlockIndex(structureSize, [x,y,z])]);
          }
        } 
      }
    }
  }
  
  snackbar(blockFilled + " blocks filled with " + fill);
}

var entityStorageLocations = {
  'inventory': 'ChestItems',
  'mainhand': 'Mainhand',
  'offhand': 'Offhand',
  'armor': 'Armor'
};

var armorSrcs = [
  "https://github.com/bedrock-dot-dev/packs/raw/master/stable/resource/textures/items/empty_armor_slot_helmet.png",
  "https://github.com/bedrock-dot-dev/packs/raw/master/stable/resource/textures/items/empty_armor_slot_chestplate.png",
  "https://github.com/bedrock-dot-dev/packs/raw/master/stable/resource/textures/items/empty_armor_slot_leggings.png",
  "https://github.com/bedrock-dot-dev/packs/raw/master/stable/resource/textures/items/empty_armor_slot_boots.png",
  "https://github.com/bedrock-dot-dev/packs/raw/master/stable/resource/textures/items/empty_armor_slot_shield.png",
  ""
];

function openEditEntity(label){
  var index = parseFloat(label.getAttribute("index"));
  var entity = entities[index];
  currentLabel = label;
  currentEntity = entity;
  currentEntityPath = ['value', 'structure', 'value', 'entities', 'value', 'value', index]
  
  document.getElementById("entity-editor").style.display = "block";
  document.getElementById("overlay").style.display = "block";
  
  document.getElementById("entity-id").value = currentEntity.identifier.value;
  if(currentEntity.CustomName){
    document.getElementById("entity-name").value = currentEntity.CustomName.value;
  } else {
    document.getElementById("entity-name").value = "";
  }
  
  //Get entity health
  if(currentEntity.Attributes){
    for(var i = 0; i < currentEntity.Attributes.value.value.length; i++){
      if(currentEntity.Attributes.value.value[i].Name.value == "minecraft:health"){
        document.getElementById("entity-health-current").disabled = false;
        document.getElementById("entity-health-max").disabled = false;
        
        document.getElementById("entity-health-current").value = currentEntity.Attributes.value.value[i].Current.value;
        document.getElementById("entity-health-max").value = currentEntity.Attributes.value.value[i].Max.value;
      }
    }
  } else {
    document.getElementById("entity-health-current").value = "";
    document.getElementById("entity-health-max").value = "";
    
    document.getElementById("entity-health-current").disabled = true;
    document.getElementById("entity-health-max").disabled = true;
  }
  
  if(currentEntity.ActiveEffects){
    var effects = currentEntity.ActiveEffects.value.value;
    var effectTexts = [];
    for(var i = 0; i < effects.length; i++){
      var effectText = [
        allEffects[effects[i].Id.value - 1],
        effects[i].Duration.value,
        effects[i].Amplifier.value,
        effects[i].ShowParticles.value
      ].join(":");
      
      effectTexts.push(effectText);
    }
    document.getElementById("entity-effects").value = effectTexts.join("\n");
  }
  
  //Entity Inventory
  if(isEntityItem) deselectEntityItem();
  
  document.getElementById("entity-inventory").children[0].children[0].innerHTML = "";
  //If entity inventory exists, create slots and show inventory tab.
  if(currentEntity.ChestItems){
    document.getElementById("entity-inventory").parentNode.style.display = "inline-block";
    var storageLocation = currentEntity.ChestItems.value.value;
    for(var i = 0; i < storageLocation.length; i++){
      document.getElementById("entity-inventory").children[0].children[0].innerHTML += "<td index='"+i+"' onclick='selectEntityItem(this)'></td>";
    }
    
    for(var i = 0; i < storageLocation.length; i++){
      if(storageLocation[i].Name.value != ""){
        document.getElementById("entity-inventory").children[0].children[0].children[storageLocation[i].Slot.value].innerHTML = '<mcitem identifier="'+ storageLocation[i].Name.value +'" count="'+ storageLocation[i].Count.value +'" width="25px" height="25px" style="font-size:6pt;" class="nohover"></mcitem>';
      }
    }
  } else {
    document.getElementById("entity-inventory").parentNode.style.display = "none";
  }
  
  //Entity Equiptment  
  var eqSlotEls = document.getElementById("entity-equipment").getElementsByTagName("td");
  for(var i = 0; i < eqSlotEls.length; i++){
    if(eqSlotEls[i].children[0]) eqSlotEls[i].removeChild(eqSlotEls[i].children[0]);
    eqSlotEls[i].style.backgroundImage = "url("+ armorSrcs[i] +")";
  }
  
  if(currentEntity.Armor){
    document.getElementById("entity-equipment").children[0].children[0].style.display = "table-row";
    
    var storageLocation = currentEntity.Armor.value.value;
    for(var i = 0; i < storageLocation.length; i++){
      if(storageLocation[i].Name.value != ""){
        document.getElementById("entity-equipment").children[0].children[0].children[i].innerHTML = '<mcitem identifier="'+ storageLocation[i].Name.value +'" count="'+ storageLocation[i].Count.value +'" width="25px" height="25px" style="font-size:6pt;" class="nohover"></mcitem>';
        document.getElementById("entity-equipment").children[0].children[0].children[i].style.backgroundImage = "";
      }
    }
  } else {
    document.getElementById("entity-equipment").children[0].children[0].style.display = "none";
  }
  
  if(currentEntity.Offhand){
    document.getElementById("entity-equipment").children[0].children[1].children[0].style.display = "inline-block";
    var storageLocation = currentEntity.Offhand.value.value[0];
    if(storageLocation.Name.value != ""){
      document.getElementById("entity-equipment").children[0].children[1].children[0].innerHTML = '<mcitem identifier="'+ storageLocation.Name.value +'" count="'+ storageLocation.Count.value +'" width="25px" height="25px" style="font-size:6pt;" class="nohover"></mcitem>';
      document.getElementById("entity-equipment").children[0].children[1].children[0].style.backgroundImage = "";
    }
  } else {
    document.getElementById("entity-equipment").children[0].children[1].children[0].style.display = "none";
  }
  
  if(currentEntity.Mainhand){
    document.getElementById("entity-equipment").children[0].children[1].children[1].style.display = "inline-block";
    var storageLocation = currentEntity.Mainhand.value.value[0];
    if(storageLocation.Name.value != ""){
      document.getElementById("entity-equipment").children[0].children[1].children[1].innerHTML = '<mcitem identifier="'+ storageLocation.Name.value +'" count="'+ storageLocation.Count.value +'" width="25px" height="25px" style="font-size:6pt;" class="nohover"></mcitem>';
      document.getElementById("entity-equipment").children[0].children[1].children[1].style.backgroundImage = "";
    }
  } else {
    document.getElementById("entity-equipment").children[0].children[1].children[1].style.display = "none";
  }
  
  //If no equipment slots are present, hide all equipment
  if(!currentEntity.Armor && !currentEntity.Mainhand && !currentEntity.Offhand){
    document.getElementById("entity-equipment").parentNode.style.display = "none";
  } else {
    document.getElementById("entity-equipment").parentNode.style.display = "inline-block";
  }
  
  //If neither inventory nor equipment is present, hide the item editor as well
  if(!currentEntity.ChestItems && (!currentEntity.Armor && !currentEntity.Mainhand && !currentEntity.Offhand)){
    document.getElementById("entity-equipment").parentNode.parentNode.style.display = "none";
  } else {
    document.getElementById("entity-equipment").parentNode.parentNode.style.display = "block";
  }
  
  mcitems.init();
}

function revealCurrentEntity(){
  closeEditors();
  openTextEditor();
  let paths = [];
  for(let i = 0; i < currentEntityPath.length; i++){
    let newpath = [];
    if(i != 0){
      newpath = JSON.parse(JSON.stringify(paths[i-1]))
    }
    newpath.push(currentEntityPath[i])
    paths.push(newpath);
  }
  for(let path of paths){
    texteditor.expand({path: path, isExpand: true, recursive: false})
  }
  
  document.querySelector(".jsoneditor-tree").scrollTop = 336 + (24 * (currentEntityPath[currentEntityPath.length-1] + 1))
}

function selectEntityItem(el, location){
  if(isEntityItem) deselectEntityItem();
  
  var index = parseFloat(el.getAttribute("index"));
  if(!location){
    var location = 'inventory';
  }
  
  if(!currentEntity[entityStorageLocations[location]]){
    snackbar('This slot is not supported on this entity.');
    return;
  }
  
  for(let el of document.getElementById("entity-inventory").getElementsByTagName("td")){el.classList.toggle("selected", false);}
  for(let el of document.getElementById("entity-equipment").getElementsByTagName("td")){el.classList.toggle("selected", false);}
  el.classList.toggle("selected", true);
  
  document.getElementById("entity-container-item-id").disabled = false;
  document.getElementById("entity-container-item-count").disabled = false;
  document.getElementById("entity-container-item-damage").disabled = false;
  
  currentEntityItem = currentEntity[entityStorageLocations[location]].value.value[index];
  
  document.getElementById("entity-container-item-id").value = currentEntityItem.Name.value;
  document.getElementById("entity-container-item-count").value = currentEntityItem.Count.value;
  document.getElementById("entity-container-item-damage").value = currentEntityItem.Damage.value;
  
  isEntityItem = true;
}

function deselectEntityItem(location){
  if(!location){
    if(!document.querySelector('#entity-editor td.selected')) return;
    var location = document.querySelector('#entity-editor td.selected').getAttribute("location");
  }
  
  //Items in entity inventories should not get deleted, only replaced with an empty value.
  isTileItem = false;
  
  for(let el of document.getElementById("entity-inventory").getElementsByTagName("td")){el.classList.toggle("selected", false);}
  for(let el of document.getElementById("entity-equipment").getElementsByTagName("td")){el.classList.toggle("selected", false);}
  document.getElementById("entity-container-item-id").disabled = true;
  //document.getElementById("entity-container-item-id").value = "";
  
  document.getElementById("entity-container-item-count").disabled = true;
  //document.getElementById("entity-container-item-count").value = "";
  
  document.getElementById("entity-container-item-damage").disabled = true;
  //document.getElementById("entity-container-item-damage").value = "";
}

function updateEntity(){
  currentEntity.identifier.value = document.getElementById("entity-id").value;
  if(currentEntity.CustomName){
    currentEntity.CustomName.value = document.getElementById("entity-name").value;
  } else if(document.getElementById("entity-name").value != "") {
    currentEntity.CustomName = {"type": "string", "value": document.getElementById("entity-name").value}
  }
  
  //Detect and set entity health
  if(currentEntity.Attributes){
    for(var i = 0; i < currentEntity.Attributes.value.value.length; i++){
      if(currentEntity.Attributes.value.value[i].Name.value == "minecraft:health"){        
        currentEntity.Attributes.value.value[i].Current.value = document.getElementById("entity-health-current").value;
        currentEntity.Attributes.value.value[i].Max.value = document.getElementById("entity-health-max").value;
      }
    }
  }
  
  if(currentEntity.CustomName){
    currentLabel.innerHTML = currentEntity.CustomName.value;
  } else if(currentEntity.RawtextName) {
    currentLabel.innerHTML = currentEntity.RawtextName.value;
  } else {
    currentLabel.innerHTML = currentEntity.identifier.value;
  }
  
  if(document.getElementById("entity-effects").value != ""){
    if(!currentEntity.ActiveEffects){
      currentEntity.ActiveEffects = {"type": "list","value": {"type": "compound","value": []}};
    }
    
    var effects = currentEntity.ActiveEffects.value.value;
    var effectTexts = document.getElementById("entity-effects").value.split("\n");
    var effList = [];
    for(var i = 0; i < effectTexts.length; i++){
      var effectText = effectTexts[i].split(":");
      if(allEffects.indexOf(effectText[0]) != -1){
        effList.push({
          Ambient: {
            type: "byte",
            value: 0,
          },
          Amplifier: {
            type: "byte",
            value: 1,
          },
          DisplayOnScreenTextureAnimation: {
            type: "byte",
            value: 0,
          },
          Duration: {
            type: "int",
            value: 53,
          },
          Id: {
            type: "byte",
            value: 0,
          },
          ShowParticles: {
            type: "byte",
            value: 0,
          },
        });
        effList[i].Id.value = allEffects.indexOf(effectText[0]) + 1;
        effList[i].Duration.value = parseInt(effectText[1]);
        effList[i].Amplifier.value = parseInt(effectText[2]);
        effList[i].ShowParticles.value = parseInt(effectText[3]);
      } else {
        snackbar('"'+effectText[0]+'"' + ' is not a valid effect name.');
      }
    }
    currentEntity.ActiveEffects.value.value = effList;
    console.log(effList);
  }
  
}

function updateEntityItem(){
  currentEntityItem.Name.value = document.getElementById("entity-container-item-id").value;
  if(currentEntityItem.Name.value != ""){
    currentEntityItem.Count.value = parseFloat(document.getElementById("entity-container-item-count").value);
    currentEntityItem.Damage.value = parseFloat(document.getElementById("entity-container-item-damage").value);
    document.querySelector('#entity-editor td.selected').innerHTML = '<mcitem identifier="'+ currentEntityItem.Name.value +'" count="'+ currentEntityItem.Count.value +'" width="25px" height="25px" style="font-size:6pt;" class="nohover"></mcitem>';
  } else {
    currentEntityItem.Count.value = 0;
    currentEntityItem.Damage.value = 0;
    document.querySelector('#entity-editor td.selected').innerHTML = '';
  }
  
  //If item is in equipment slot, determine if slot should have a background image now
  if(document.querySelector('#entity-editor td.selected').parentNode.parentNode.parentNode.id == "entity-equipment"){
    if(currentEntityItem.Name.value != ""){
      document.querySelector('#entity-editor td.selected').style.backgroundImage = "";
    } else {
      var allEquipmentSlots = Array.prototype.slice.call(document.getElementById("entity-equipment").getElementsByTagName("td"));
      document.querySelector('#entity-editor td.selected').style.backgroundImage = "url("+ armorSrcs[allEquipmentSlots.indexOf(document.querySelector('#entity-editor td.selected'))] +")";
    }
  }
  
  mcitems.init();
}

function openEditTile(label){
  if(isTileItem) deselectContainerItem();
  
  var index = parseFloat(label.getAttribute("index"));
  var tile = tileentities[index];
  currentTile = tile;
  currentTileMeta = allTEntities[currentTile.value.block_entity_data.value.id.value];
  for(var i = 0; i < document.getElementById("tile-list").getElementsByTagName("span").length; i++){
    document.getElementById("tile-list").getElementsByTagName("span")[i].classList.toggle("selected", false);
  }
  label.classList.toggle("selected", true);
  
  //<mcitem identifier="minecraft:diamond_pickaxe" count="1" width="25px" height="25px" style="font-size:6pt;" class="nohover"></mcitem>
  document.getElementById("tilecontainer").children[0].children[0].innerHTML = "";
  
  for(var i = 0; i < document.getElementsByClassName("tile-editor-type").length; i++){
    document.getElementsByClassName("tile-editor-type")[i].style.display = "none";
  }
  document.getElementById("tile-"+currentTileMeta.type).style.display = "block";
  
  if(currentTileMeta.type == "container"){
    for(var i = 0; i < currentTileMeta.slots; i++){
      document.getElementById("tilecontainer").children[0].children[0].innerHTML += "<td index='"+i+"' onclick='selectContainerItem(this)'></td>";
    }
    if(currentTileMeta.slots == 9){
      document.getElementById("tilecontainer").style.maxWidth = "100px";
    } else {
      document.getElementById("tilecontainer").style.maxWidth = "290px";
    }
    
    var storageLocation;
    var doLoop = true;
    document.getElementById("tile-container-loot").style.display = "none";
    document.getElementById("tile-container-xp").style.display = "none";
    if(currentTileMeta.behavior == "itemframe"){
      storageLocation = currentTile.value.block_entity_data.value.Item.value;
      doLoop = false;
    } else if(currentTileMeta.behavior == "jukebox"){
      storageLocation = currentTile.value.block_entity_data.value.RecordItem.value;
      doLoop = false;
    } else if(currentTileMeta.behavior == "lectern"){
      if(currentTile.value.block_entity_data.value.book){
        storageLocation = currentTile.value.block_entity_data.value.book.value;
      }
      doLoop = false;
    } else {
      storageLocation = currentTile.value.block_entity_data.value.Items.value.value;
      if(currentTileMeta.furnace){
        document.getElementById("tile-container-xp").style.display = "block";
        if(currentTile.value.block_entity_data.value.StoredXPInt){
          document.getElementById("tile-container-stored-xp").value = currentTile.value.block_entity_data.value.StoredXPInt.value;
        }
      } else {
        document.getElementById("tile-container-loot").style.display = "block";
        if(currentTile.value.block_entity_data.value.LootTable){
          document.getElementById("tile-container-loot-editor").value = currentTile.value.block_entity_data.value.LootTable.value;
        } else {
          document.getElementById("tile-container-loot-editor").value = "";
        }
      }
    }
    
    if(doLoop){
      for(var i = 0; i < storageLocation.length; i++){
        let slot = (storageLocation[i].Slot || {}).value || i;
        document.getElementById("tilecontainer").children[0].children[0].children[slot].innerHTML = '<mcitem identifier="'+ storageLocation[i].Name.value +'" count="'+ storageLocation[i].Count.value +'" width="25px" height="25px" style="font-size:6pt;" class="nohover"></mcitem>';
      }
    } else {
      document.getElementById("tilecontainer").children[0].children[0].children[0].innerHTML = '<mcitem identifier="'+ storageLocation.Name.value +'" count="'+ storageLocation.Count.value +'" width="25px" height="25px" style="font-size:6pt;" class="nohover"></mcitem>';
    }
    mcitems.init();
    currentTileMeta.storageLocation = storageLocation;
  } else if(currentTileMeta.type == "sign"){
    document.getElementById("tile-sign-editor").value = currentTile.value.block_entity_data.value.Text.value;
    document.getElementById("tile-sign-ignorelighting").checked = (currentTile.value.block_entity_data.value.IgnoreLighting.value == 1 ? true : false);
    document.getElementById("tile-sign-persistformatting").checked = (currentTile.value.block_entity_data.value.PersistFormatting.value == 1 ? true : false);
  } else if(currentTileMeta.type == "commandblock"){
    document.getElementById("tile-cb-name").value = currentTile.value.block_entity_data.value.CustomName.value;
    document.getElementById("tile-cb-command").value = currentTile.value.block_entity_data.value.Command.value;
    document.getElementById("tile-cb-delay").value = currentTile.value.block_entity_data.value.TickDelay.value;
    document.getElementById("tile-cb-firsttick").checked = (currentTile.value.block_entity_data.value.ExecuteOnFirstTick.value == 1 ? true : false);
    document.getElementById("tile-cb-conditional").checked = (currentTile.value.block_entity_data.value.conditionalMode.value == 1 ? true : false);
    document.getElementById("tile-cb-trackoutput").checked = (currentTile.value.block_entity_data.value.TrackOutput.value == 1 ? true : false);
  } else if(currentTileMeta.type == "flowerpot"){
    document.getElementById("tile-fp-block").value = currentTile.value.block_entity_data.value.PlantBlock.value.name.value;
    document.getElementById("tile-fp-block-type").value = currentTile.value.block_entity_data.value.PlantBlock.value.states.value.flower_type.value;
  } else if(currentTileMeta.type == "spawner"){
    document.getElementById("tile-spawner-id").value = currentTile.value.block_entity_data.value.EntityIdentifier.value;
    document.getElementById("tile-spawner-delay").value = currentTile.value.block_entity_data.value.Delay.value;
    document.getElementById("tile-spawner-mindelay").value = currentTile.value.block_entity_data.value.MinSpawnDelay.value;
    document.getElementById("tile-spawner-maxdelay").value = currentTile.value.block_entity_data.value.MaxSpawnDelay.value;
    document.getElementById("tile-spawner-count").value = currentTile.value.block_entity_data.value.SpawnCount.value;
    document.getElementById("tile-spawner-maxnearbyentities").value = currentTile.value.block_entity_data.value.MaxNearbyEntities.value;
    document.getElementById("tile-spawner-requiredplayerradius").value = currentTile.value.block_entity_data.value.RequiredPlayerRange.value;
    document.getElementById("tile-spawner-spawnradius").value = currentTile.value.block_entity_data.value.SpawnRange.value;
    document.getElementById("tile-spawner-displayscale").value = currentTile.value.block_entity_data.value.DisplayEntityScale.value;
  }
}

function selectContainerItem(el){
  if(isTileItem) deselectContainerItem();
  
  var index = parseFloat(el.getAttribute("index"));
  for(var i = 0; i < document.getElementById("tile-container").getElementsByTagName("td").length; i++){
    document.getElementById("tile-container").getElementsByTagName("td")[i].classList.toggle("selected", false);
  }
  el.classList.toggle("selected", true);
  document.getElementById("tile-container-item-id").disabled = false;
  document.getElementById("tile-container-item-count").disabled = false;
  document.getElementById("tile-container-item-damage").disabled = false;
  if(currentTileMeta.behavior){
    currentTileItem = currentTileMeta.storageLocation;
  } else {
    var success = false;
    for(var i = 0; i < currentTileMeta.storageLocation.length; i++){
      let slot = (currentTileMeta.storageLocation[i].Slot || {}).value || i;
      if(slot == index){
        currentTileItem = currentTileMeta.storageLocation[i];
        success = true;
      }
    }
    if(!success){
      var newItem = 
        {
          "Count": {
              "type": "byte",
              "value": 1
          },
          "Damage": {
              "type": "short",
              "value": 0
          },
          "Name": {
              "type": "string",
              "value": "minecraft:air"
          },
          "Slot": {
              "type": "byte",
              "value": index
          },
          "WasPickedUp": {
              "type": "byte",
              "value": 0
          }
        };
      currentTileMeta.storageLocation.push(newItem);
      currentTileItem = newItem;
    }
  }
  document.getElementById("tile-container-item-id").value = currentTileItem.Name.value;
  document.getElementById("tile-container-item-count").value = currentTileItem.Count.value;
  document.getElementById("tile-container-item-damage").value = currentTileItem.Damage.value;
  
  if(currentTileMeta.slotsDescriptions){
    if(currentTileMeta.behavior){
      snackbar("Slot: " + currentTileMeta.slotsDescriptions[0]);
    } else {
      snackbar("Slot: " + currentTileMeta.slotsDescriptions[currentTileItem.Slot.value]);
    }
  }
  isTileItem = true;
}

function deselectContainerItem(){
  if(document.getElementById("tile-container-item-id").value == "" || document.getElementById("tile-container-item-id").value == "minecraft:air"){
    //Delete item
    if(currentTileMeta.behavior || !currentTileItem.Slot){
      //Single-item
      currentTileMeta.storageLocation = {};
      document.getElementById("tile-container").getElementsByTagName("td")[0].innerHTML = '';
    } else {
      for(var i = 0; i < currentTileMeta.storageLocation.length; i++){
        if(currentTileMeta.storageLocation[i].Slot.value == currentTileItem.Slot.value){
          currentTileMeta.storageLocation.splice(i, 1);
        }
      }
      document.getElementById("tile-container").getElementsByTagName("td")[currentTileItem.Slot.value].innerHTML = '';
    }
    isTileItem = false;
  }
  
  for(var i = 0; i < document.getElementById("tile-container").getElementsByTagName("td").length; i++){
    document.getElementById("tile-container").getElementsByTagName("td")[i].classList.toggle("selected", false);
  }
  document.getElementById("tile-container-item-id").disabled = true;
  //document.getElementById("tile-container-item-id").value = "";
  
  document.getElementById("tile-container-item-count").disabled = true;
  //document.getElementById("tile-container-item-count").value = "";
  
  document.getElementById("tile-container-item-damage").disabled = true;
  //document.getElementById("tile-container-item-damage").value = "";
}

function updateTileItem(){
  if(!(document.getElementById("tile-container-item-id").value == "" || document.getElementById("tile-container-item-id").value == "minecraft:air")){
    currentTileItem.Name.value = document.getElementById("tile-container-item-id").value;
    currentTileItem.Count.value = parseFloat(document.getElementById("tile-container-item-count").value);
    currentTileItem.Damage.value = parseFloat(document.getElementById("tile-container-item-damage").value);
    document.getElementById("tile-container").getElementsByTagName("td")[currentTileItem.Slot.value].innerHTML = '<mcitem identifier="'+ currentTileItem.Name.value +'" count="'+ currentTileItem.Count.value +'" width="25px" height="25px" style="font-size:6pt;" class="nohover"></mcitem>';
    mcitems.init();
  }
}

function updateTile(){
  if (currentTileMeta.type == "container") {
    if(currentTileMeta.furnace){
      currentTile.value.block_entity_data.value.StoredXPInt.value = parseInt(document.getElementById("tile-container-stored-xp").value);
    } else {
      if(document.getElementById("tile-container-loot-editor").value != ""){
        if(!currentTile.value.block_entity_data.value.LootTable){
          currentTile.value.block_entity_data.value.LootTable = {
              "type": "string",
              "value": ""
          }
        }
        if(!currentTile.value.block_entity_data.value.LootTableSeed){
          currentTile.value.block_entity_data.value.LootTableSeed = {
              "type": "int",
              "value": 0
          }
        }
        currentTile.value.block_entity_data.value.LootTable.value = document.getElementById("tile-container-loot-editor").value;
        currentTile.value.block_entity_data.value.LootTableSeed.value = 0;
      } else {
        if(currentTile.value.block_entity_data.value.LootTable){
          delete currentTile.value.block_entity_data.value.LootTable;
        }
        if(currentTile.value.block_entity_data.value.LootTableSeed){
          delete currentTile.value.block_entity_data.value.LootTableSeed;
        }
      }
    }
  } else if(currentTileMeta.type == "sign"){
    currentTile.value.block_entity_data.value.Text.value = document.getElementById("tile-sign-editor").value;
    currentTile.value.block_entity_data.value.IgnoreLighting.value = (document.getElementById("tile-sign-ignorelighting").checked ? 1 : 0);
    currentTile.value.block_entity_data.value.PersistFormatting.value = (document.getElementById("tile-sign-persistformatting").checked ? 1 : 0);
  } else if(currentTileMeta.type == "commandblock"){
    currentTile.value.block_entity_data.value.CustomName.value = document.getElementById("tile-cb-name").value;
    currentTile.value.block_entity_data.value.Command.value = document.getElementById("tile-cb-command").value;
    currentTile.value.block_entity_data.value.TickDelay.value = parseFloat(document.getElementById("tile-cb-delay").value); 
    currentTile.value.block_entity_data.value.ExecuteOnFirstTick.value = (document.getElementById("tile-cb-firsttick").checked ? 1 : 0); 
    currentTile.value.block_entity_data.value.conditionalMode.value = (document.getElementById("tile-cb-conditional").checked ? 1 : 0); 
    currentTile.value.block_entity_data.value.TrackOutput.value = (document.getElementById("tile-cb-trackoutput").checked ? 1 : 0); 
  } else if(currentTileMeta.type == "flowerpot"){
    currentTile.value.block_entity_data.value.PlantBlock.value.name.value = document.getElementById("tile-fp-block").value;
    currentTile.value.block_entity_data.value.PlantBlock.value.states.value.flower_type.value = document.getElementById("tile-fp-block-type").value;
  } else if(currentTileMeta.type == "spawner"){
    currentTile.value.block_entity_data.value.EntityIdentifier.value = document.getElementById("tile-spawner-id").value;
    currentTile.value.block_entity_data.value.Delay.value = parseFloat(document.getElementById("tile-spawner-delay").value);
    currentTile.value.block_entity_data.value.MinSpawnDelay.value = parseFloat(document.getElementById("tile-spawner-mindelay").value);
    currentTile.value.block_entity_data.value.MaxSpawnDelay.value = parseFloat(document.getElementById("tile-spawner-maxdelay").value);
    currentTile.value.block_entity_data.value.SpawnCount.value = parseFloat(document.getElementById("tile-spawner-count").value);
    currentTile.value.block_entity_data.value.MaxNearbyEntities.value = parseFloat(document.getElementById("tile-spawner-maxnearbyentities").value);
    currentTile.value.block_entity_data.value.RequiredPlayerRange.value = parseFloat(document.getElementById("tile-spawner-requiredplayerradius").value);
    currentTile.value.block_entity_data.value.SpawnRange.value = parseFloat(document.getElementById("tile-spawner-spawnradius").value);
    currentTile.value.block_entity_data.value.DisplayEntityScale.value = parseFloat(document.getElementById("tile-spawner-displayscale").value);
  }
}

function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}