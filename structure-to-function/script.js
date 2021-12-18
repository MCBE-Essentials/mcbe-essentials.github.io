var armor = ["slot.armor.head", "slot.armor.chest", "slot.armor.legs", "slot.armor.feet"];

var inputfile = document.getElementById('file');

//alert('js loaded4');
var structure = {};
inputfile.addEventListener('change', function(e) {
  document.getElementById("upload").children[0].children[0].innerHTML = "Uploading...";
  var file = e.target.files[0];
  var reader = new FileReader();
  reader.addEventListener("load",function() {
    var data = reader.result
    nbt.parse(data, function(error, data) {
      if (error) {
        throw error;
      }
      structure = data;
      document.getElementById("upload").style.display="none";
      document.getElementById("download").style.display="table-row";
    });
  });
  
  reader.readAsArrayBuffer(file);
});

//https://wiki.bedrock.dev/concepts/mcstructure.html
/*
 *   //Root
 *   structure.value;
 *
 *   //Size (add [0] for X)
 *   structure.value.size.value
 *
 *   //Block identifiers (base layer)
 *   structure.value.structure.value.block_indices.value.value[0].value
 *   //Block identifiers (waterlog layer)
 *   structure.value.structure.value.block_indices.value.value[1].value
 *
 *   //Block palette for individual block types (replace [0] with [index])
 *   structure.value.structure.value.palette.value.default.value.block_palette.value[0]
 *   //Block palette for individual block types : identifier
 *   structure.value.structure.value.palette.value.default.value.block_palette.value[0].name.value
 *
 *   //Entities
 *   structure.value.structure.value.entities.value
 *
 */
function getBlockCoords([distX, distY, distZ], index){
  var x = 0; var y = 0; var z = 0;
  for(var i = 0; i < index; i++){
    z++;
    if(z == distZ){
      z = 0; y++;
      if(y == distY){
        y = 0; x++;
      }
    }
  }
  return [x,y,z];
}

function getRelativeCoords([x,y,z]){
  return "~"+x+"~"+y+"~"+z;
}

function getEntityCoords([worldX, worldY, worldZ], [x, y, z]){
  x -= worldX;
  y -= worldY;
  z -= worldZ;
  x = Math.floor(x);
  y = Math.floor(y);
  z = Math.floor(z);
  return [x,y,z];
}

function convert(){
  var output = ["#Generated with ReBrainer's Structure File to MCFunction Converter on https://mcbe-essentials.glitch.me/structure-to-function/ on " + new Date()];
  var size = structure.value.size.value.value;
  //Blocks (waterlog layer)
  if(document.getElementById("waterlog").checked){
    output.push("#Blocks (water layer)");
    var wblockIdentifiers = structure.value.structure.value.block_indices.value.value[1].value;
    for(var i = 0; i < wblockIdentifiers.length; i++){
      var coords = getBlockCoords(size, i);
      var id = structure.value.structure.value.palette.value.default.value.block_palette.value.value[wblockIdentifiers[i]].name.value;
      var states = parseStates(structure.value.structure.value.palette.value.default.value.block_palette.value.value[wblockIdentifiers[i]].states.value);
      if(whitelistStates(structure.value.structure.value.palette.value.default.value.block_palette.value.value[wblockIdentifiers[i]].states.value)){
        if(document.getElementById("air").checked || (!document.getElementById("air").checked && id != "minecraft:air")){
          output.push("setblock " + getRelativeCoords(coords) + " " + id + (document.getElementById("blockstates").checked ? states : ""));
        }
      }
    }
  }
  
  //Blocks (main layer)
  if(document.getElementById("tiles").checked){
    output.push("#Blocks (main layer)");
    var blockIdentifiers = structure.value.structure.value.block_indices.value.value[0].value;
    for(var i = 0; i < blockIdentifiers.length; i++){
      var coords = getBlockCoords(size, i);
      var id = structure.value.structure.value.palette.value.default.value.block_palette.value.value[blockIdentifiers[i]].name.value;
      var states = parseStates(structure.value.structure.value.palette.value.default.value.block_palette.value.value[blockIdentifiers[i]].states.value);
      if(whitelistStates(structure.value.structure.value.palette.value.default.value.block_palette.value.value[blockIdentifiers[i]].states.value)){
        if(document.getElementById("air").checked || (!document.getElementById("air").checked && id != "minecraft:air")){
          output.push("setblock " + getRelativeCoords(coords) + " " + id + (document.getElementById("blockstates").checked ? states : ""));
        }
      }
    }
  }
  
  //Entities
  var entities = structure.value.structure.value.entities.value.value;
  if(structure.value.structure.value.entities.value.type != "end" && document.getElementById("entities").checked){
    output.push("#Entities");
    for(var i = 0; i < entities.length; i++){
      //Entities
      var coords = getEntityCoords(structure.value.structure_world_origin.value.value, entities[i].Pos.value.value);
      output.push("summon " + entities[i].identifier.value + " " + getRelativeCoords(getEntityCoords(structure.value.structure_world_origin.value.value, entities[i].Pos.value.value)) + " none " + (entities[i].CustomName ? entities[i].CustomName.value : ""));
      
      //Entity loot
      if(document.getElementById("entityloot").checked){
        if(entities[i].Armor){
          for(var a = 0; a < entities[i].Armor.value.value.length; a++){
            if(entities[i].Armor.value.value[a].Name.value != ""){
              output.push("replaceitem entity @e[type="+entities[i].identifier.value+",x=~"+coords[0]+",y=~"+coords[1]+",z=~"+coords[2]+",r=1,c=1] " + armor[a] + " 0 " + entities[i].Armor.value.value[a].Name.value + " " + entities[i].Armor.value.value[a].Count.value + " " + entities[i].Armor.value.value[a].Damage.value);
            }
          }
        }
        
        if(entities[i].Mainhand){
          if(entities[i].Mainhand.value.value[0].Name.value != ""){
            output.push("replaceitem entity @e[type="+entities[i].identifier.value+",x=~"+coords[0]+",y=~"+coords[1]+",z=~"+coords[2]+",r=1,c=1] slot.weapon.mainhand 0 " + entities[i].Mainhand.value.value[0].Name.value + " " + entities[i].Mainhand.value.value[0].Count.value + " " + entities[i].Mainhand.value.value[0].Damage.value);
          }
        }
        
        if(entities[i].Offhand){
          if(entities[i].Offhand.value.value[0].Name.value != ""){
            output.push("replaceitem entity @e[type="+entities[i].identifier.value+",x=~"+coords[0]+",y=~"+coords[1]+",z=~"+coords[2]+",r=1,c=1] slot.weapon.offhand 0 " + entities[i].Offhand.value.value[0].Name.value + " " + entities[i].Offhand.value.value[0].Count.value + " " + entities[i].Offhand.value.value[0].Damage.value);
          }
        }
        
        if(entities[i].ChestItems){
          //Entity is of type "chest container"
          for(var a = 0; a < entities[i].ChestItems.value.value.length; a++){
            if(entities[i].ChestItems.value.value[a].Name.value != ""){
              output.push("replaceitem entity @e[type="+entities[i].identifier.value+",x=~"+coords[0]+",y=~"+coords[1]+",z=~"+coords[2]+",r=1,c=1] slot.inventory " + entities[i].ChestItems.value.value[a].Slot.value + " " + entities[i].ChestItems.value.value[a].Name.value + " " + entities[i].ChestItems.value.value[a].Count.value + " " + entities[i].ChestItems.value.value[a].Damage.value);
            }
          }
        }
      }
      
      if(document.getElementById("entityrot").checked){
        output.push("execute @e[type="+entities[i].identifier.value+",x=~"+coords[0]+",y=~"+coords[1]+",z=~"+coords[2]+",r=1,c=1] ~~~ /tp @s ~ ~ ~ " + entities[i].Rotation.value.value.join(" "));
      }
    }
  }
  
  //Tile Entities
  if(document.getElementById("tilecontainerloot").checked){
    output.push("#Tile Entities");
    var tileEntityData = structure.value.structure.value.palette.value.default.value.block_position_data.value;
    var tileentities = Object.keys(tileEntityData);
    for(var i = 0; i < tileentities.length; i++){
      var tile = tileEntityData[tileentities[i]].value.block_entity_data.value;
      var tilecoords = getEntityCoords(structure.value.structure_world_origin.value.value, [tile.x.value, tile.y.value, tile.z.value]);
      if(tile.Items){
        var tileitems = tile.Items.value.value;
        for(var a = 0; a < tileitems.length; a++){
          if(tileitems[a].Name.value != ""){
           output.push("replaceitem block " + getRelativeCoords(tilecoords) + " slot.container " + tileitems[a].Slot.value + " " + tileitems[a].Name.value + " " + tileitems[a].Count.value + " " + tileitems[a].Damage.value);
          }
        }
      }
    }
  }
  
  return output;
}

function parseStates(data){
  if(Object.keys(data).length == 0){
    return "";
  }
  var output = "";
  var outputList = [];
  var states = Object.keys(data);
  for(var i = 0; i < states.length; i++){
    var state = states[i];
    var value = data[states[i]].value;
    var statetype = data[states[i]].type;
    if(statetype == "int"){
      outputList.push('"'+state+'":'+value);
    } else if(statetype == "byte") {
      outputList.push('"'+state+'":'+ (value == 1 ? true : false));
    } else {
      outputList.push('"'+state+'":"'+value+'"');
    }
  }
  output = " [" + outputList.join() + "]";
  return output;
}

function whitelistStates(data){
  if(Object.keys(data).length == 0){
    return true;
  }
  var output = true;
  var states = Object.keys(data);
  for(var i = 0; i < states.length; i++){
    var state = states[i];
    var value = data[states[i]].value;
    var statetype = data[states[i]].type;
    if(state == "head_piece_bit" && value == 0){
      output = false;
    }
    if(state == "upper_block_bit" && value == 1){
      output = false;
    }
  }
  return output;
}

function convertAndDownload(){
  if(!document.getElementById("file").files[0]){
    alert("Please upload a MCSTRUCTURE file first!");
    return;
  }
  var input = convert();
  input = input.join("\n");
  var filename = document.getElementById("file").files[0].name.replaceAll(".mcstructure", ".mcfunction") || "structure.mcfunction";
  var element = document.createElement('a');
  element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(input));
  element.setAttribute('download', filename);

  element.style.display = 'none';
  document.body.appendChild(element);

  element.click();

  document.body.removeChild(element);
}

for(var i = 0; i < document.getElementsByTagName("label").length; i++){
  document.getElementsByTagName("label")[i].onmouseleave = function(){
    document.getElementById("tooltip").innerHTML = "Hover over an option to see what it does!";
  }
}

function tooltip(val){
  document.getElementById("tooltip").innerHTML = val;
}

var t = {
  air: "If this option is off, all air blocks will act like structure voids, otherwise, air blocks will be placed.",
  waterlog: "Whether to keep the water in waterlogged blocks",
  blockstates: "Keep attributes such as block facing direction, block color variant, whether doors are open, ect",
  entities: "Scan entities and include them in the strucure. Only works with entities that can be spawned with /summon.",
  entityrot: "Keep the direction that respawned entities are facing.",
  entityloot: "Keep the armor, main hand, off hand, and chest item slots of respawned entities",
  tiles: "Whether to place the blocks saved in the structure",
  tilecontainerloot: "Keep items contained in chests, hoppers and other containers",
  usefill: "Detects repeated block patterns and uses one /fill command instead of multiple /setblocks. Not developed yet."
};