/*var structure = 'https://cdn.glitch.global/17ff8eee-9239-4ba0-8a5c-9263261550b5/bobby.mcstructure?v=1642358868820';

var tileentities = Object.values(structure.value.structure.value.palette.value.default.value.block_position_data.value);*/
const nbt = require('prismarine-nbt');
const { Buffer } = require('buffer');

var structure = {};
var tileentities = {};
var currentTile = false;
var currentTileMeta = false;
document.getElementById("file").addEventListener("change", function(){
  if(this.files && this.files[0]){
    var fr = new FileReader();
    fr.onload = function(e){
      nbt.parse(Buffer.from(e.target.result)).then(function(data){
        structure = data.parsed;
        document.getElementById("upload").style.display = "none";
        document.getElementById("download").style.display = "inline-block";
        structureToEditor();
      });
    }
    
    fr.readAsArrayBuffer(this.files[0]);
    //Set global variable "filename" for use in exporting later
    filename = document.getElementById("file").files[0].name.split(".")[0];
  }
});

function structureToEditor(){
  
  var path = "structure.value";
  entities = structure.value.structure.value.entities.value.value;
  if(structure.value.structure.value.palette.value.default){
    tileentities = Object.values(structure.value.structure.value.palette.value.default.value.block_position_data.value);
    document.getElementById("tile-list").innerHTML = "";
  } else {
    tileentities = false;
    document.getElementById("tile-list").innerHTML = "There are no tile entities in the structure.";
  }
  
  //Create Tile Entities List
  
  if(tileentities){
    for(var i = 0; i < tileentities.length; i++){
      if(tileentities[i].value.block_entity_data){
        var name = tileentities[i].value.block_entity_data.value.id.value;
        if(Object.keys(allTEntities).includes(name) && allTEntities[name].type == "container" && !allTEntities[name].behavior){
          document.getElementById("tile-list").innerHTML += '<span class="idlabel" index="'+i+'" onclick="openEditTile(this)">'+name+'</span>';
        }
      }
    }
    
    document.getElementById("table-path").disabled = false;
    document.getElementById("table-seed").disabled = false;
    openEditTile(document.getElementById("tile-list").children[0]);
  }
}

var allTEntities = {
  BrewingStand: {
    type: "container",
    slots: 5,
    slotsDescriptions: [
      "Ingredient",
      "Bottle 1",
      "Bottle 2",
      "Bottle 3",
      "Fuel"
    ]
  },
  BlastFurnace: {
    type: "container",
    slots: 3,
    slotsDescriptions: [
      "Input",
      "Fuel",
      "Result"
    ],
    furnace: true
  },
  Barrel: {
    type: "container",
    slots: 27
  },
  FlowerPot: {
    type: "flowerpot"
  },
  Dropper: {
    type: "container",
    slots: 9
  },
  Dispenser: {
    type: "container",
    slots: 9
  },
  Chest: {
    type: "container",
    slots: 27
  },
  GlowItemFrame: {
    type: "container",
    behavior: "itemframe",
    slots: 1
  },
  ItemFrame: {
    type: "container",
    behavior: "itemframe",
    slots: 1
  },
  Hopper: {
    type: "container",
    slots: 5
  },
  Furnace: {
    type: "container",
    slots: 3,
    slotsDescriptions: [
      "Input",
      "Fuel",
      "Result"
    ],
    furnace: true
  },
  Lectern: {
    type: "container",
    behavior: "lectern",
    slots: 1,
    slotsDescriptions: [
      "Book"
    ]
  },
  Jukebox: {
    type: "container",
    behavior: "jukebox",
    slots: 1,
    slotsDescriptions: [
      "Disc"
    ]
  },
  Smoker: {
    type: "container",
    slots: 3,
    slotsDescriptions: [
      "Input",
      "Fuel",
      "Result"
    ],
    furnace: true
  },
  ShulkerBox: {
    type: "container",
    slots: 27
  },
  Sign: {
    type: "sign"
  },
  /*StructureBlock: {
    type: "structureblock"
  },*/
  CommandBlock: {
    type: "commandblock"
  }
};

function openEditTile(label){  
  var index = parseFloat(label.getAttribute("index"));
  var tile = tileentities[index];
  currentTile = tile;
  currentTileMeta = allTEntities[currentTile.value.block_entity_data.value.id.value];
  for(var i = 0; i < document.getElementById("tile-list").getElementsByTagName("span").length; i++){
    document.getElementById("tile-list").getElementsByTagName("span")[i].classList.toggle("selected", false);
  }
  label.classList.toggle("selected", true);
  
  var cPosition = [
    currentTile.value.block_entity_data.value.x.value - structure.value.structure_world_origin.value.value[0],
    currentTile.value.block_entity_data.value.y.value - structure.value.structure_world_origin.value.value[1],
    currentTile.value.block_entity_data.value.z.value - structure.value.structure_world_origin.value.value[2],
  ];
  document.getElementById("container-position").innerHTML = "~" + cPosition.join(" ~");
  
  var totalItems = 0;
  for(var i = 0; i < currentTile.value.block_entity_data.value.Items.value.value.length; i++){
    totalItems += currentTile.value.block_entity_data.value.Items.value.value[i].Count.value;
  }
  document.getElementById("container-items").innerHTML = totalItems;
  
  if(currentTile.value.block_entity_data.value.LootTable){
    document.getElementById("table-path").value = currentTile.value.block_entity_data.value.LootTable.value;
  } else {
    document.getElementById("table-path").value = "";
  }
  
  if(currentTile.value.block_entity_data.value.LootTableSeed){
    document.getElementById("table-seed").value = currentTile.value.block_entity_data.value.LootTableSeed.value;
  } else {
    document.getElementById("table-seed").value = "";
  }
  
  //<mcitem identifier="minecraft:diamond_pickaxe" count="1" style="width:25px;height:25px;font-size:6pt;" class="nohover"></mcitem>
  document.getElementById("tilecontainer").children[0].children[0].innerHTML = "";
  
  for(var i = 0; i < document.getElementsByClassName("tile-editor-type").length; i++){
    document.getElementsByClassName("tile-editor-type")[i].style.display = "none";
  }
  
  if(currentTileMeta.type == "container"){
    for(var i = 0; i < currentTileMeta.slots; i++){
      document.getElementById("tilecontainer").children[0].children[0].innerHTML += "<td index='"+i+"'></td>";
    }
    
    var storageLocation;
    storageLocation = currentTile.value.block_entity_data.value.Items.value.value;
    
    for(var i = 0; i < storageLocation.length; i++){
      document.getElementById("tilecontainer").children[0].children[0].children[storageLocation[i].Slot.value].innerHTML = '<mcitem identifier="'+ storageLocation[i].Name.value +'" count="'+ storageLocation[i].Count.value +'" style="width:25px;height:25px;font-size:6pt;cursor:unset;" class="nohover"></mcitem>';
    }
    mcitems.init();
    currentTileMeta.storageLocation = storageLocation;
  }
}

function updateTile(){
  if(currentTileMeta.type == "container"){
    if(document.getElementById("table-path").value != ""){
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
      currentTile.value.block_entity_data.value.LootTable.value = document.getElementById("table-path").value;
      if(!parseFloat(document.getElementById("table-seed").value) == 0){
        currentTile.value.block_entity_data.value.LootTableSeed.value = parseFloat(document.getElementById("table-seed").value);
      } else {
        if(currentTile.value.block_entity_data.value.LootTableSeed){
          delete currentTile.value.block_entity_data.value.LootTableSeed;
        }
      }
    } else {
      if(currentTile.value.block_entity_data.value.LootTable){
        delete currentTile.value.block_entity_data.value.LootTable;
      }
      if(currentTile.value.block_entity_data.value.LootTableSeed){
        delete currentTile.value.block_entity_data.value.LootTableSeed;
      }
    }
  }
}

for(var i = 0; i < 27; i++){
  document.getElementById("tilecontainer").children[0].children[0].innerHTML += "<td index='"+i+"'></td>";
}

function downloadStructure(){
  saveAs(new File([nbt.writeUncompressed(structure, 'little')], "hello.mcstructure"), document.getElementById("file").files[0].name);
}