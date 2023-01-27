var armor = ["slot.armor.head", "slot.armor.chest", "slot.armor.legs", "slot.armor.feet"];

function getFunctionBlockCoords([distX, distY, distZ], index){
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

function getFunctionEntityCoords([worldX, worldY, worldZ], [x, y, z]){
  x -= worldX;
  y -= worldY;
  z -= worldZ;
  x = Math.floor(x);
  y = Math.floor(y);
  z = Math.floor(z);
  return [x,y,z];
}

async function convertTiles(indicies_index, placeAir, size, keepStates){
  var commands = [];
  var blockIdentifiers = structure.value.structure.value.block_indices.value.value[indicies_index].value;
  var palette = structure.value.structure.value.palette.value.default.value.block_palette.value.value;
  
  var unsortedTiles = [];
  for(var i = 0; i < blockIdentifiers.length; i++){
    var tileCoords = getFunctionBlockCoords(size, i);
    var newEntry = {
      x: tileCoords[0],
      y: tileCoords[1],
      z: tileCoords[2],
      palette: blockIdentifiers[i]
    };
    unsortedTiles.push(newEntry);
  }
  
  var shapes = [];
  var currentShape = -1;
  var sortedTiles = JSON.parse(JSON.stringify(unsortedTiles));
  //Create shapes based off model tiles. Determine which tiles belong to which shapes.
  while (sortedTiles.length > 1/* && currentShape < 1000*/){
    currentShape++;
    shapes.push([]);
    
    //Get the lowest entry in the list
    var modelEntry = sortedTiles[getLowestEntry(sortedTiles)];
    
    var startX = modelEntry.x;
    var startY = modelEntry.y;
    var startZ = modelEntry.z;
    
    var maxX = size[0] - 1;
    var maxY = size[1] - 1;
    var maxZ = size[2] - 1;
    
    var x = startX;
    var y = startY;
    var z = startZ;
    
    //Find the X width of the shape. If no invalid blocks are run into, it defaults to max structure width.
    for(x = startX; x < size[0]; x++){
      //Find a single tile
      var foundUnit = sortedTiles.find(function(tile){
        return ((tile.x == x) && (tile.y == y) && (tile.z == z));
      });
      if(!foundUnit || !isGroupMatching(foundUnit, modelEntry)){
        //End of the line has been found. We now know how wide the line must be.
        maxX = (x - 1);
        break;
      }
    }
    
    //Find the Z width of the shape. If no invalid blocks are run into, it defaults to max structure width.
    var breakZ = false;
    for(z = startZ; z < size[2]; z++){
      //Get X lines
      for(x = startX; x < maxX + 1; x++){
        //Find a single tile
        var foundUnit = sortedTiles.find(function(tile){
          return ((tile.x == x) && (tile.y == y) && (tile.z == z));
        });
        
        if(!foundUnit || !isGroupMatching(foundUnit, modelEntry)){
          //End of the Z line has been found. We now know how wide the line must be.
          maxZ = (z - 1);
          breakZ = true;
          break;
        }
      }
      
      if(breakZ){
        break;
      }
    }
      
    //Find the Y width of the shape. If no invalid blocks are run into, it defaults to max structure width.
    var breakY = false;
    breakZ = false;
    for(y = startY; y < size[1]; y++){
      //Get Z lines
      for(z = startZ; z < maxZ + 1; z++){
        //Get X lines
        for(x = startX; x < maxX + 1; x++){
          //Find a single tile
          var foundUnit = sortedTiles.find(function(tile){
            return ((tile.x == x) && (tile.y == y) && (tile.z == z));
          });
          if(!foundUnit || !isGroupMatching(foundUnit, modelEntry)){
            //End of the Y line has been found. We now know how wide the line must be.
            maxY = (y - 1);
            breakZ = true;
            breakY = true;
            break;
          }
        }
        
        if(breakZ){
          break;
        }
      }
      
      if(breakY){
        break;
      }
    }
    
    //Grab rectangular prism
    for(y = startY; y < maxY + 1; y++){
      //Grab rectangle
      for(z = startZ; z < maxZ + 1; z++){
        //Grab line
        for(x = startX; x < maxX + 1; x++){
          //Find unit, add it to the shape and remove it from the sorted tiles list
          var foundUnit = sortedTiles.find(function(tile){
            return ((tile.x == x) && (tile.y == y) && (tile.z == z));
          });
          var foundUnitIndex = sortedTiles.findIndex(function(tile){
            return ((tile.x == x) && (tile.y == y) && (tile.z == z));
          });
          shapes[currentShape].push(foundUnit);
          sortedTiles.splice(foundUnitIndex, 1);
        }
      }
    }
  }
  
  //Transform all shapes into fill commands
  for(var i = 0; i < shapes.length; i++){
    var currentShape = shapes[i];
    var tilePalette = shapes[i][0].palette;
    if(currentShape.length == 1){
      //There's only one tile in the shape, so use /setblock
      if(tilePalette != -1){
        var id = palette[tilePalette].name.value;
        var states = parseStates(palette[tilePalette].states.value);
        var coords = [currentShape[0].x, currentShape[0].y, currentShape[0].z];
        //Some blocks should not be placed by commands (top half of doors, ect). These must be filtered out.
        if(whitelistStates(palette[tilePalette].states.value)){
          //Ignore placing the block if it is air and air should be filtered out
          if(placeAir || (!placeAir && id != "minecraft:air")){
            commands.push("setblock " + getRelativeCoords(coords) + " " + id + (keepStates ? states : ""));
          }
        }
      }
    } else {
      //Discover coordinates for use in /fill
      var lowX = size[0];
      var lowY = size[1];
      var lowZ = size[2];
      var hiX = 0;
      var hiY = 0;
      var hiZ = 0;
      for(var a = 0; a < currentShape.length; a++){
        var currentEntry = currentShape[a];
        if(currentEntry.x < lowX) lowX = currentEntry.x;
        if(currentEntry.y < lowY) lowY = currentEntry.y;
        if(currentEntry.z < lowZ) lowZ = currentEntry.z;
        if(currentEntry.x > hiX) hiX = currentEntry.x;
        if(currentEntry.y > hiY) hiY = currentEntry.y;
        if(currentEntry.z > hiZ) hiZ = currentEntry.z;
      }
      
      //Create the command from these measurments
      if(tilePalette != -1){
        var id = palette[tilePalette].name.value;
        var states = parseStates(palette[tilePalette].states.value);
        var xyz1 = [lowX, lowY, lowZ];
        var xyz2 = [hiX, hiY, hiZ];
        //Some blocks should not be placed by commands (top half of doors, ect). These must be filtered out.
        if(whitelistStates(palette[tilePalette].states.value)){
          //Ignore placing the block if it is air and air should be filtered out
          if(placeAir || (!placeAir && id != "minecraft:air")){
            commands.push("fill " + getRelativeCoords(xyz1) + " " + getRelativeCoords(xyz2) + " " + id + (keepStates ? states : ""));
          }
        }
      }
    }
  }
  
  return commands;
}


function isGroupMatching(group, value){
  if(group.constructor != Array){
    if(group.palette != value.palette){
      return false;
    }
  } else {
    for(var i = 0; i < group.length; i++){
      if(!isGroupMatching(group[i], value)){
        return false;
      }
    }
  }
  
  return true;
}

function getLowestEntry(list, size){  
  var lowestEntry = 0;
  for(var i = 0; i < list.length; i++){
    if(list[i].z < list[lowestEntry].z){
      lowestEntry = i;
    } else if(list[i].z == list[lowestEntry].z){
      if(list[i].x < list[lowestEntry].x){
        lowestEntry = i;
      } else if(list[i].x == list[lowestEntry].x){
        if(list[i].y < list[lowestEntry].y){
          lowestEntry = i;
        }
      }
    }
  }
  
  return lowestEntry;
}

async function structureToFunction(includeBlocks, placeAir, keepWaterlog, keepStates, tileContainerItems, includeEntities, entityRotation, entityEquiptment, structure = window.structure){
  var output = ["#Generated with ReBrainer's Structure Editor at https://mcbe-essentials.glitch.me/structure-editor/ on " + new Date()];
  var size = structure.value.size.value.value;
  var structure_world_origin = structure.value.structure_world_origin.value.value;  
  //Entities
  var entities = structure.value.structure.value.entities.value.value;
  if(structure.value.structure.value.entities.value.type != "end" && includeEntities){
    output.push("#Entities");
    for(var i = 0; i < entities.length; i++){
      //Entities
      var coords = getFunctionEntityCoords(structure_world_origin, entities[i].Pos.value.value);
      output.push("summon " + entities[i].identifier.value + " " + getRelativeCoords(getFunctionEntityCoords(structure_world_origin, entities[i].Pos.value.value)) + " none " + (entities[i].CustomName ? entities[i].CustomName.value : ""));
      
      //Entity loot
      if(entityEquiptment){
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
      
      if(entityRotation){
        output.push("execute @e[type="+entities[i].identifier.value+",x=~"+coords[0]+",y=~"+coords[1]+",z=~"+coords[2]+",r=1,c=1] ~~~ /tp @s ~ ~ ~ " + entities[i].Rotation.value.value.join(" "));
      }
    }
  }
  
  //Tile Entities
  if(tileContainerItems){
    output.push("#Tile Entities");
    var tileEntityData = structure.value.structure.value.palette.value.default.value.block_position_data.value;
    var tileentities = Object.keys(tileEntityData);
    for(var i = 0; i < tileentities.length; i++){
      var tile = tileEntityData[tileentities[i]].value.block_entity_data.value;
      var tilecoords = getFunctionEntityCoords(structure_world_origin, [tile.x.value, tile.y.value, tile.z.value]);
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
  
  //Blocks (waterlog layer)
  if(keepWaterlog){
    output.push("#Blocks (blocklog layer)");
    output = output.concat(await convertTiles(1, placeAir, size, keepStates));
  }
  
  //Blocks (main layer)
  if(includeBlocks){
    output.push("#Blocks (default layer)");
    output = output.concat(await convertTiles(0, placeAir, size, keepStates));
  }
  
  return output.join("\n");
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

