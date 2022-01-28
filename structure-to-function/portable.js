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

function structureToFunction(includeBlocks, placeAir, keepWaterlog, keepStates, tileContainerItems, includeEntities, entityRotation, entityEquiptment){
  var output = ["#Generated with ReBrainer's Structure Editor at https://mcbe-essentials.glitch.me/structure-editor/ on " + new Date()];
  var size = structure.value.size.value.value;
  //Blocks (waterlog layer)
  if(keepWaterlog){
    output.push("#Blocks (blocklog layer)");
    var wblockIdentifiers = structure.value.structure.value.block_indices.value.value[1].value;
    for(var i = 0; i < wblockIdentifiers.length; i++){
      if(wblockIdentifiers[i] != -1){
        var coords = getFunctionBlockCoords(size, i);
        var id = structure.value.structure.value.palette.value.default.value.block_palette.value.value[wblockIdentifiers[i]].name.value;
        var states = parseStates(structure.value.structure.value.palette.value.default.value.block_palette.value.value[wblockIdentifiers[i]].states.value);
        if(whitelistStates(structure.value.structure.value.palette.value.default.value.block_palette.value.value[wblockIdentifiers[i]].states.value)){
          if(placeAir || (!placeAir && id != "minecraft:air")){
            output.push("setblock " + getRelativeCoords(coords) + " " + id + (keepStates ? states : ""));
          }
        }
      }
    }
  }
  
  //Blocks (main layer)
  if(includeBlocks){
    output.push("#Blocks (default layer)");
    var blockIdentifiers = structure.value.structure.value.block_indices.value.value[0].value;
    for(var i = 0; i < blockIdentifiers.length; i++){
      if(blockIdentifiers[i] != -1){
        var coords = getFunctionBlockCoords(size, i);
        var id = structure.value.structure.value.palette.value.default.value.block_palette.value.value[blockIdentifiers[i]].name.value;
        var states = parseStates(structure.value.structure.value.palette.value.default.value.block_palette.value.value[blockIdentifiers[i]].states.value);
        if(whitelistStates(structure.value.structure.value.palette.value.default.value.block_palette.value.value[blockIdentifiers[i]].states.value)){
          if(placeAir || (!placeAir && id != "minecraft:air")){
            output.push("setblock " + getRelativeCoords(coords) + " " + id + (keepStates ? states : ""));
          }
        }
      }
    }
  }
  
  //Entities
  var entities = structure.value.structure.value.entities.value.value;
  if(structure.value.structure.value.entities.value.type != "end" && includeEntities){
    output.push("#Entities");
    for(var i = 0; i < entities.length; i++){
      //Entities
      var coords = getFunctionEntityCoords(structure.value.structure_world_origin.value.value, entities[i].Pos.value.value);
      output.push("summon " + entities[i].identifier.value + " " + getRelativeCoords(getFunctionEntityCoords(structure.value.structure_world_origin.value.value, entities[i].Pos.value.value)) + " none " + (entities[i].CustomName ? entities[i].CustomName.value : ""));
      
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
      var tilecoords = getFunctionEntityCoords(structure.value.structure_world_origin.value.value, [tile.x.value, tile.y.value, tile.z.value]);
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