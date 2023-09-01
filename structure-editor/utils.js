function getStructureBlockCoords([distX, distY, distZ], index){
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

function convertToColorString (argb){ 
  let argbOutput = ('000000' + (argb+16777216).toString(16)).slice(-8); 
  let rgbaOutput = '#' + (argbOutput.slice(-6) + argbOutput.slice(0, 2));
  return rgbaOutput;
}

function applyCoordModifications([x1, y1, z1], [x2, y2, z2], modifier = 1){
  return [
    x1 + x2 * modifier,
    y1 + y2 * modifier,
    z1 + z2 * modifier,
  ]
}

function colourToNumber(r, g, b, a) {
  return (r << 32) + (g << 16) + (b << 8) + (a);
}

function getStructureBlockIndex([distX, distY, distZ], [x, y, z]){
  return ((distY * distZ) * x) + ((distZ) * y) + z;
}

function boolByte(input){
  //Converts 0/1 into false/true
  if(Boolean(input) === input){
    return Number(input)
  } else {
    return Boolean(input)
  }
}

function getEntities(structuredata){
  //Returns an array with all the entities in the structure, or `false` if there are none.
  let structure = structuredata || window.structure;
  
  let innerstructuredata = structure.value.structure.value || {entities: {value: false}};
  let entitiesheader = innerstructuredata.entities.value || {type: "end"};
  
  if(entitiesheader.hasOwnProperty("type") && entitiesheader.type === "end") return false;
  if(entitiesheader.hasOwnProperty("type") && entitiesheader.type === "compound"){
    return entitiesheader.value;
  } 
  return false;
}

function getBlockDataOfBlockEntity(index){
  //This function returns the palette data of the block at a block entity's position.
  let output = false;
  try {
    let paletteind = structure.value.structure.value.block_indices.value.value[0].value[index];
    output = structure.value.structure.value.palette.value.default.value.block_palette.value.value[paletteind];
  } catch(e) {
    throw e;
    return false;
  }

  return output;
}

function getTileEntities(structuredata){
  //Returns an object containing all the (indexed) tile entities in the structure, or `false` if there are none
  let structure = structuredata || window.structure;
  
  let innerstructuredata = structure.value.structure.value || {palette: {value: false}};
  let bentitiesheader = innerstructuredata.palette.value || {type: "end"};
  let blockposdata = bentitiesheader.hasOwnProperty("default") ? bentitiesheader.default.value.block_position_data.value : false;
  
  if(!blockposdata) return false;
  if(bentitiesheader.default.value.block_position_data.hasOwnProperty("type") && bentitiesheader.default.value.block_position_data.type === "compound"){
    return blockposdata;
  } 
  return false;
}

function getValidTileEntities(tileentities, searchindex = false){
  //Generates an iterable array of tile entities with essential pieces of data. 
  if(!tileentities) return [];
  
  let valids = [];
  for(let tentity of Object.keys(tileentities)){
    if(tileentities[tentity].value.block_entity_data){
      let entry = {
        data: tileentities[tentity].value.block_entity_data.value,
        index: tentity,
        original: tileentities[tentity]
      };
      
      //Check through valid tile data before fully creating the entry.
      if(!data.tiles.hasOwnProperty(entry.data.id.value) || (!data.tiles[entry.data.id.value].hasOwnProperty("display") || (data.tiles[entry.data.id.value].hasOwnProperty("display") && data.tiles[entry.data.id.value].display == true))){
        valids.push(entry)
      }
    } else {
      //Not a valid block entitiy, some other obsucre structure anomaly.
      console.log('invalid block_position_data entry: ', tileentities[tentity].value)
    }
  }
  
  let directions = [ //Used in calculating which block the command block points to according to its facing_direction bit.
    [0, -1, 0],
    [0, +1, 0],
    [0, 0, -1],
    [0, 0, +1],
    [-1, 0, 0],
    [+1, 0, 0]
  ];
  
  //Then, identify command block chains.
  //Separate tile entities into repeating/impulse command blocks, chain command blocks and everything else.
  let rawlist = [];
  let chains = [];
  
  let commandblocks = {
    "startables": [],
    "linkables": []
  };
  for(let potentialcmd of valids){
    if(potentialcmd.data.id.value == "CommandBlock"){ //Potential command block is a command block
      let blockdata = getBlockDataOfBlockEntity(potentialcmd.index);
      let blockname = blockdata.name.value;
      let blockstates = blockdata.states;
      let facingdirection = nbt.simplify(blockstates).facing_direction;
      let coords = getStructureBlockCoords(structuresize, potentialcmd.index);
      
      potentialcmd.blockname = blockname;
      if(blockname === "minecraft:chain_command_block"){
        //Block is linkable to chains
        commandblocks.linkables.push(potentialcmd);
      } else {
        //Block is a potential chain starter
        commandblocks.startables.push(potentialcmd);
      }
    } else {
      //Potential command block is not a command block, add it directly to the list.
      rawlist.push(potentialcmd);
    }
  }
  
  //Create chains from startable blocks
  for(let startable of commandblocks.startables){
    let blockdata = getBlockDataOfBlockEntity(startable.index);
    let blockname = blockdata.name.value;
    let blockstates = blockdata.states;
    let facingdirection = nbt.simplify(blockstates).facing_direction;
    //Find current block coords from its index value
    let coords = getStructureBlockCoords(structuresize, startable.index);
    
    //Find the coordinates of the block this one is facing
    let nextcoords = applyCoordModifications(coords, directions[facingdirection]);
    chains.push({
      originCoords: coords,
      blocks: [startable],
      nextAllowedBlockCoords: nextcoords
    });
  }
  
  function findLinkableByCoords([x,y,z]){
    let indexvalue = getStructureBlockIndex(structuresize, [x,y,z]) || -1;
    for(let potentialmatch of commandblocks.linkables){
      if(parseFloat(potentialmatch.index) === indexvalue && !potentialmatch.discovered){
        potentialmatch.discovered = true; //This ensures that the same block isn't added to multiple chains. Unfortunately, this means that multi-headed chains will behave strangely and be cut off after the intersecting block as tile entities won't be displayed in the list twice. Feel free to suggest otherwise on our Discord server!
        return {result: potentialmatch, index: commandblocks.linkables.indexOf(potentialmatch)};
      }/* else {
        console.log('failed: ', indexvalue, potentialmatch)
      }*/
    }
    return false;
  }
  
  //Expand each chain as much as possible
  for(let chain of chains){
    let moreblocksfound = true;
    let loops = 0;
    //Continuously search for tile entities until there are no more found.
    while(moreblocksfound && loops < 999){ //This is capped at 999 loops in case of bad programming.
      let potentialnext = findLinkableByCoords(chain.nextAllowedBlockCoords);
      let nextblock = potentialnext.result || false;
      if(nextblock){
        chain.blocks.push(nextblock);
        //Change the next allowed block coords
        let blockdata = getBlockDataOfBlockEntity(nextblock.index);
        let blockname = blockdata.name.value;
        let blockstates = blockdata.states;
        let facingdirection = nbt.simplify(blockstates).facing_direction;
        let coords = getStructureBlockCoords(structuresize, nextblock.index);
        let nextcoords = applyCoordModifications(coords, directions[facingdirection]);
        chain.nextAllowedBlockCoords = nextcoords;
      } else {
        moreblocksfound = false;
      }
    }
  }
  
  //TODO: lonely chain blocks get added to list
  for(let lonelyblock of commandblocks.linkables){
    if(!lonelyblock.discovered){
      //This block is all alone and is not part of any chain. Add it to the list. 
      rawlist.push(lonelyblock)
    }
  }
  
  //Merge chains into the rawlist
  for(let chain of chains){
    if(chain.blocks.length == 1){
      //The source block is alone. Add it directly to the list instead of in a chain.
      rawlist.splice(0, 0, chain.blocks[0]);
    } else {
      //The chain contains multiple blocks, add it to the list as a chain.
      rawlist.splice(0, 0, chain.blocks);
    }
  }
  
  if(searchindex === false){
    return rawlist;
  } else {
    //Search through the rawlist for an entry that matches the index value
    for(let validitem of rawlist){
      if(validitem.constructor == Array){
        //Current item is a group, return the group if possible
        for(let groupitem of validitem){
          if(groupitem.index == searchindex){
            return groupitem;
          } 
        }
      } else {
        if(validitem.index == searchindex){
          return validitem;
        } 
      }
    }
    //No valid tile entity matching that index was found
    return false;
  }
}

function findItem(itemslist, slotid){
  //Some slot lists don't save empty slots, so they must be properly searched to select the appropriate save data.
  //Additionally, the item entry must be created if it doesn't exist
  for(let i = 0; i < itemslist.length; i++){
    let itementry = itemslist[i];
    let slotvalue = false;
    if(itementry.Slot){
      slotvalue = itementry.Slot.value;
    } else {
      slotvalue = i;
    }
    
    if(slotvalue == slotid){
      return itementry;
    }
  }
  
  //No valid item has been found. Add one to the list
  let newitem = {"Count":{"type":"byte","value":0},"Damage":{"type":"short","value":0},"Name":{"type":"string","value":""},"Slot":{"type":"byte","value":slotid},"WasPickedUp":{"type":"byte","value":0}};
  itemslist.push(newitem);
  return newitem;
}

function getPalette(){
  let innerstructuredata = structure.value.structure.value || {palette: {value: false}};
  let paletteheader = innerstructuredata.palette.value || {type: "end"};
  let palettelist = paletteheader.hasOwnProperty("default") ? paletteheader.default.value.block_palette.value.value : false;
  
  if(!palettelist){
    return false;
  } else {
    return palettelist;
  }
}

function getValidPalette(palette){
  if(!palette) return false
  
  let usedimages = [];
  let imagecounts = {};
  let output = []
  
  for(let entry of palette){
    let image = getTopTexture(entry.name.value);
    usedimages.push(image)
    imagecounts[image] = imagecounts[image] ? imagecounts[image] + 1 : 1;
    let newentry = {
      "name": getDynamicBlockIdentifier(entry),
      "image": image,
      "imageid": imagecounts[image] - 1,
      "data": entry
    }
    
    output.push(newentry)
  }
  
  return output;
}

function getBlockList(layer = 0){
  let blocksheader = structure.value.structure.value.block_indices.value.value[layer]
  if(blocksheader.type != "end"){
    return blocksheader.value
  } else {
    return false;
  }
}

function findPaletteIndex(name, states = false){
  let innerstructuredata = structure.value.structure.value || {palette: {value: false}};
  let paletteheader = innerstructuredata.palette.value || {type: "end"};
  let palettelist = paletteheader.hasOwnProperty("default") ? paletteheader.default.value.block_palette.value.value : false;
  
  if(!palettelist) return false;
  for(let i = 0; i < palettelist.length; i++){
    let entry = palettelist[i];
    if(entry.name.value === name && (!states || JSON.stringify(entry.states.value) === states )){
      return i;
    }
  }
  
  return false;
}

function getTopTexture(blockid){
  if(blockid.startsWith("minecraft:")) blockid = blockid.replace("minecraft:", "")
  
  let blockmapping = {
    "command_block": "https://github.com/Mojang/bedrock-samples/raw/main/resource_pack/textures/blocks/command_block_front_mipmap.png",
    "chain_command_block": "https://github.com/Mojang/bedrock-samples/raw/main/resource_pack/textures/blocks/chain_command_block_front_mipmap.png",
    "repeating_command_block": "https://github.com/Mojang/bedrock-samples/raw/main/resource_pack/textures/blocks/repeating_command_block_front_mipmap.png",
    "flower_pot": "https://github.com/Mojang/bedrock-samples/raw/main/resource_pack/textures/items/flower_pot.png",
    "bell": "https://github.com/Mojang/bedrock-samples/raw/main/resource_pack/textures/items/villagebell.png",
    "cauldron": "https://github.com/Mojang/bedrock-samples/raw/main/resource_pack/textures/items/cauldron.png",
    "lava_cauldron": "https://github.com/Mojang/bedrock-samples/raw/main/resource_pack/textures/items/cauldron.png",
    "jigsaw": "https://github.com/Mojang/bedrock-samples/raw/main/resource_pack/textures/blocks/jigsaw_front.png",
    "daylight_detector_inverted": "https://github.com/Mojang/bedrock-samples/raw/main/resource_pack/textures/blocks/daylight_detector_inverted_top.png",
    "campfire": "https://github.com/Mojang/bedrock-samples/raw/main/resource_pack/textures/items/campfire.png",
    "soul_campfire": "https://github.com/Mojang/bedrock-samples/raw/main/resource_pack/textures/items/soul_campfire.png",
    "bamboo_hanging_sign": "https://github.com/Mojang/bedrock-samples/raw/main/resource_pack/textures/blocks/bamboo_planks.png",
    "bamboo_standing_sign": "https://github.com/Mojang/bedrock-samples/raw/main/resource_pack/textures/blocks/bamboo_planks.png",
    "bamboo_wall_sign": "https://github.com/Mojang/bedrock-samples/raw/main/resource_pack/textures/blocks/bamboo_planks.png",
    "decorated_pot": "https://github.com/Mojang/bedrock-samples/raw/main/resource_pack/textures/blocks/decorated_pot_side.png",
    "suspicious_sand": "https://github.com/Mojang/bedrock-samples/raw/main/resource_pack/textures/blocks/suspicious_sand_0.png",
    "suspicious_gravel": "https://github.com/Mojang/bedrock-samples/raw/main/resource_pack/textures/blocks/suspicious_gravel_0.png",
  };
  
  if(Object.keys(blockmapping).includes(blockid)){
    return blockmapping[blockid]
  } else {
    let searchablelist = data.rendering.texturedef;
    let texlist = data.rendering.texturepaths;
    let branch = "main"
    if(!Object.keys(searchablelist).includes(blockid)){
      //Try seaching through preview data instead
      searchablelist = data.rendering.preview_texturedef;
      texlist = data.rendering.preview_texturepaths;
      branch = "preview"
    }
    if(!Object.keys(searchablelist).includes(blockid)) return 'https://github.com/Mojang/bedrock-samples/raw/main/resource_pack/textures/misc/missing_texture.png';
    let definition = data.rendering.texturedef[blockid] || {"sound": "gravel","textures": "missing"};
    if(!definition.textures && !definition.carried_textures) return 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAZAAAAGQCAYAAACAvzbMAAACg0lEQVR4nO3BgQAAAADDoPlTX+EAVQEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAwG/GFwABESYOUAAAAABJRU5ErkJggg=='
    let selectedtextures = definition.carried_textures || definition.textures;
    if(typeof selectedtextures != 'string' && !selectedtextures.hasOwnProperty("up")) console.log(definition)
    let texturename = (typeof selectedtextures == 'string' ? selectedtextures : selectedtextures.up)

    /*
    let texturepaths = texlist.texture_data[texturename].textures;
    let partialpath = "";
    if(typeof texturepaths === 'string'){
      partialpath = texturepaths;
    } else {
      if(typeof texturepaths[0] === 'string'){
        partialpath = texturepaths[0];
      } else {
        partialpath = texturepaths[0].path;
      }    
    }*/
    let partialpath = "";
    if(texlist.texture_data[texturename]){
      let texturepaths = texlist.texture_data[texturename].textures;
    
      if(typeof texturepaths === 'string'){
        partialpath = texturepaths;
      } else {
        if(typeof texturepaths[0] === 'string'){
          partialpath = texturepaths[0];
        } else {
          partialpath = texturepaths[0].path;
        }    
      }
    } else {
      partialpath = 'textures/blocks/' + texturename; //Last resort for attempting to find texture
    }

    return "https://github.com/Mojang/bedrock-samples/raw/"+ branch +"/resource_pack/"+ partialpath +".png"
  }
}

function getBlockDefinitionType(value, tileEntity = {}){
  if(value.constructor === Array){
    for(let potentialblocktype of value){
      if(eval(potentialblocktype.condition)){
        return potentialblocktype.value;
      }
    }
  } else {
    return value;
  }
}