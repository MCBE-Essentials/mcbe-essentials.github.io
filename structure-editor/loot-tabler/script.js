/*var structure = 'https://cdn.glitch.global/17ff8eee-9239-4ba0-8a5c-9263261550b5/bobby.mcstructure?v=1642358868820';

var tileentities = Object.values(structure.value.structure.value.palette.value.default.value.block_position_data.value);*/
const nbt = require('prismarine-nbt');
const { Buffer } = require('buffer');

var structure = {};
var tileentities = {};
var currentTile = false;
var currentTileMeta = false;
/*document.getElementById("file").addEventListener("change", function(){
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
});*/

var importedData, filename;
function parseImportedData(file){
  if(file.name.endsWith('.json')){
    structure = JSON.parse(importedData);
    structureToEditor(file);
  } else {
    nbt.parse(Buffer.from(importedData)).then(function(data){
      structure = data.parsed;
      unparsedStructure = data.metadata.buffer;
      //console.log(data);

      if(structure.value.entities){
        alert("Unfortunately, this app currently doesn't support Java edition structure files."); return;
      }
      
      structureToEditor(file);
    });
  }
  
  filename = file.name;
}

function structureToEditor(){
  var path = "structure.value";
  entities = structure.value.structure.value.entities.value.value;
  if(structure.value.structure.value.palette.value.default){
    tileentities = Object.values(structure.value.structure.value.palette.value.default.value.block_position_data.value);
    document.getElementById("tile-list").innerHTML = "";
  } else {
    tileentities = false;
  }
  
  //Create Tile Entities List
  if(tileentities){
    let validtiles = tileentities.filter(tentity => {
      if(!tentity.value.block_entity_data) return false;
      let name = tentity.value.block_entity_data.value.id.value;
      return Object.keys(allTEntities).includes(name) && !allTEntities[name].disabled;
    })
    
    if(validtiles.length > 0){
      console.log(validtiles, tileentities)
      for(let validtile of validtiles) {
        let name = validtile.value.block_entity_data.value.id.value;
        document.getElementById("tile-list").innerHTML += '<span class="idlabel" index="'+ tileentities.indexOf(validtile) +'" onclick="openEditTile(this)">'+ name +'</span>';
      }

      document.getElementById("table-path").disabled = false;
      document.getElementById("table-seed").disabled = false;
      openEditTile(document.getElementById("tile-list").children[0]);

      document.getElementById("upload").style.display = "none";
      document.getElementById("download").style.display = "inline-block";
    } else {
      snackbar("There are no containers in that structure.");
    }
  } else {
    snackbar("There are no tile entities in that structure.");
  }
}

var allTEntities = {
  Barrel: {
    type: "container",
    slots: 27
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
  Hopper: {
    type: "container",
    slots: 5
  },
  ShulkerBox: {
    type: "container",
    slots: 27
  },
  BrushableBlock: {
    type: "brushable"
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
  
  //Hide both details windows
  document.getElementById("container-details").style.display = "none";
  document.getElementById("brushable-details").style.display = "none";
  
  var cPosition = [
    currentTile.value.block_entity_data.value.x.value - structure.value.structure_world_origin.value.value[0],
    currentTile.value.block_entity_data.value.y.value - structure.value.structure_world_origin.value.value[1],
    currentTile.value.block_entity_data.value.z.value - structure.value.structure_world_origin.value.value[2],
  ];
  if(currentTileMeta.type == "container"){
    document.getElementById("container-details").style.display = "block";
    document.getElementById("container-position").innerHTML = "~" + cPosition.join(" ~");
  
    var totalItems = 0;
    
    if(currentTile.value.block_entity_data.value.Items){
      for(var i = 0; i < currentTile.value.block_entity_data.value.Items.value.value.length; i++){
        totalItems += currentTile.value.block_entity_data.value.Items.value.value[i].Count.value;
      }
      document.getElementById("item-wipe").style.display = "block";
    } else {
      document.getElementById("item-wipe").style.display = "none";
    }
    
    document.getElementById("container-items").innerHTML = totalItems;
  } else {
    document.getElementById("brushable-details").style.display = "block";
    document.getElementById("brushable-position").innerHTML = "~" + cPosition.join(" ~");
    document.getElementById("brushable-type").innerHTML = currentTile.value.block_entity_data.value.type.value;
  }
  
  
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
  
  if(currentTileMeta.type == "container"){
    for(var i = 0; i < currentTileMeta.slots; i++){
      document.getElementById("tilecontainer").children[0].children[0].innerHTML += "<td index='"+i+"'></td>";
    }
    if(currentTileMeta.slots == 9){
      document.getElementById("tilecontainer").style.maxWidth = "100px";
    } else {
      document.getElementById("tilecontainer").style.maxWidth = "290px";
    }
    
    if(currentTile.value.block_entity_data.value.Items){
      var storageLocation;
      storageLocation = currentTile.value.block_entity_data.value.Items.value.value;

      for(var i = 0; i < storageLocation.length; i++){
        document.getElementById("tilecontainer").children[0].children[0].children[storageLocation[i].Slot.value].innerHTML = '<mcitem identifier="'+ storageLocation[i].Name.value +'" count="'+ storageLocation[i].Count.value +'" width="25px" height="25px" style="font-size:6pt;cursor:unset;" class="nohover hovertooltip"></mcitem>';
      }
      mcitems.init();
      currentTileMeta.storageLocation = storageLocation;
    }
  }
}

function updateTile(){
  if(currentTileMeta.type == "container"){
    if(document.getElementById("table-path").value != ""){
      //Create properties
      if(!currentTile.value.block_entity_data.value.LootTable){
        currentTile.value.block_entity_data.value.LootTable = nbt.string("")
      }
      if(!currentTile.value.block_entity_data.value.LootTableSeed){
        currentTile.value.block_entity_data.value.LootTableSeed = nbt.int(0)
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
      //Delete properties
      if(currentTile.value.block_entity_data.value.LootTable){
        delete currentTile.value.block_entity_data.value.LootTable;
      }
      if(currentTile.value.block_entity_data.value.LootTableSeed){
        delete currentTile.value.block_entity_data.value.LootTableSeed;
      }
    }
  }
}

function wipeItems(){
  if(!confirm("Are you sure you want to delete all items in this container?\nThis will free up space for your loot table.\nThis cannot be undone.")) return;
  
  delete currentTile.value.block_entity_data.value.Items;
  openEditTile(document.querySelector('.idlabel.selected'))
  document.getElementById("item-wipe").style.display = "none";
}

for(var i = 0; i < 27; i++){
  document.getElementById("tilecontainer").children[0].children[0].innerHTML += "<td index='"+i+"'></td>";
}

function downloadStructure(){
  exportFile(new File([nbt.writeUncompressed(structure, 'little')], "export.mcstructure"), filename);
}

function createTable(container){
  var containerItems = container.value.block_entity_data.value.Items.value.value;
  var itemsCount = [];
  for(let item of containerItems){
    if(!itemsCount[item.Name.value]){
      itemsCount[item.Name.value] = {'count': 0};
    }
    itemsCount[item.Name.value] += item.Count.value;
  }
}