function getDynamicBlockIdentifier(blkobject){
  //Clone the blockobject so any operations don't affect it
  blockobject = JSON.parse(JSON.stringify(blkobject));
  
  let baseidentifier = "minecraft:air";
  let stateslist = {
    //{name: 'direction', value: '0'}
  };
  
  if(blockobject.hasOwnProperty("name")){
    //Bedrock palette object
    baseidentifier = blockobject.name.value;
    for(let statename of Object.keys(blockobject.states.value)){
      let state = blockobject.states.value[statename];
      stateslist[statename] = state.value;
      if(state.type === "byte" && typeof state.value !== 'boolean') stateslist[statename] = boolByte(parseFloat(state.value))
    }
  } else if(blockobject.hasOwnProperty("Name")){
    //Java palette object
    baseidentifier = blockobject.Name.value;
    if(blockobject.hasOwnProperty("Properties")){
      for(let statename of Object.keys(blockobject.Properties.value)){
        let state = blockobject.Properties.value[statename];
        stateslist[statename] = state.value
      }
    }
  } else {
    //Unrecognizable palette object.
    return;
  }
  
  //Create dynamic properties list
  let properties = [];
  for(let statename of Object.keys(stateslist).sort()){
    properties.push(statename + "=" + stateslist[statename]);
  }
  
  return baseidentifier + "["+ properties.join(",") +"]";
}

function getBlockObject(dynamicblockid, format = 'bedrock'){
  let baseidentifier = dynamicblockid.split("[")[0]
  let properties = dynamicblockid.split("[")[1].replaceAll("]", "");
  properties = (properties.split(",")[0] != '' ? properties.split(",") : []);
  
  let stateslist = {};
  for(let property of properties){
    stateslist[property.split("=")[0]] = property.split("=")[1];
  }
  
  switch(format){
    case 'java': {
      let object = {
        "Properties": {
          "type": "compound",
          "value": {}
        },
        "Name": {
          "type": "string",
          "value": baseidentifier
        }
      };
      for(let statename of Object.keys(stateslist)){
        object.Properties.value[statename] = {type: 'string', value: stateslist[statename]}
      }
      if(Object.keys(object.Properties.value).length == 0) delete object.Properties;
      
      return object;
      break;
    }
    default: {
      let object = {
        "name": {
          "type": "string",
          "value": baseidentifier
        },
        "states": {
          "type": "compound",
          "value": {}
        },
        "version": {
          "type": "int",
          "value": 17959425
        }
      };
      
      for(let statename of Object.keys(stateslist)){
        //Find bedrock edition state type
        let statetype = 'string';
        let statevalue = stateslist[statename];
        if(data.blockstates.hasOwnProperty(statename)){
          statetype = data.blockstates[statename].type;
          if(statetype == 'int'){
            statevalue = parseFloat(statevalue);
          } else if(statetype == 'byte') {
            statevalue = boolByte(eval(statevalue));
          }
        }
        
        object.states.value[statename] = {type: statetype, value: statevalue}
      }
      
      return object;
    }
  }
}

function javaToBedrock(){
  var blocks = structure.value.blocks.value.value;
  var palette = structure.value.palette.value.value;
  var oldsize = structure.value.size.value.value;
  
  var newBlocks = [];
  var newBlocks2 = [];
  var newPalette = [];
  for(var i = 0; i < blocks.length; i++){
    newBlocks.push(-1);
    newBlocks2.push(-1);
  }
  
  for(var i = 0; i < blocks.length; i++){
    newBlocks[getStructureBlockIndex(oldsize, blocks[i].pos.value.value)] = blocks[i].state.value;
  }
  
  for(var i = 0; i < palette.length; i++){
    //Using prismarine-data, find the java edition ID
    let javaId = data.conversion.blocks.j2b[getDynamicBlockIdentifier(palette[i])];
    if(!javaId){
      newPalette.push(getBlockObject('minecraft:air[]', 'bedrock'));
    } else {
      newPalette.push(getBlockObject(javaId, 'bedrock'));
    }
  }
  
  var newStructure = {
    type: 'compound',
    name: '',
    value: {
      format_version: {
        type: 'int', 
        value: 1
      },
      size: {
        type:'list',
        value: {
          "type": "int",
          "value": oldsize
        }
      },
      structure_world_origin: {
          "type": "list",
          "value": {
              "type": "int",
              "value": [
                  0, 0, 0
              ]
          }
      },
      structure: {
        type: "compound",
        value: {
          block_indices: {
              type: 'list',
              value: {
                  type: 'list',
                  value: [
                      {
                          type: 'int',
                          value: newBlocks
                      },
                      {
                          type: 'int',
                          value: newBlocks2
                      },
                  ]
              }
          },
          entities: {
              "type": "list",
              "value": {
                  "type": "end",
                  "value": []
              }
          },
          palette: {
            type: 'compound',
            value: {
              default: {
                type: 'compound',
                value: {
                  block_palette: {
                      type: 'list',
                      value: {
                          type: 'compound',
                          value: newPalette
                      }
                  },
                  block_position_data: {
                    type: 'compound',
                    value: {}
                  }
                }
              }
            }
          }
        }
      }
    }
  };
  
  structure = newStructure;
  alert("You've just imported a Java Edition structure file. Using experimental software, it has been converted to the Bedrock format. Only the structure's main blocks were carried over, ignoring waterlog data. Use this at your own risk!");
}

function bedrockToJava(bedrockstructure){
  let size = structure.value.size.value.value;
  let paletteheader = structure.value.structure.value.palette.value;
  let newPalette = [];
  if(paletteheader.hasOwnProperty("default") && paletteheader.default.value.hasOwnProperty("block_palette")){
    let palette = paletteheader.default.value.block_palette.value.value;
    for(var i = 0; i < palette.length; i++){
      //Using prismarine-data, find the bedrock edition ID
      let bedrockId = data.conversion.blocks.b2j[getDynamicBlockIdentifier(palette[i])];
      if(!bedrockId){
        newPalette.push(getBlockObject("minecraft:air[]", 'java'));
      } else {
        newPalette.push(getBlockObject(bedrockId, 'java'));
      }
    }
  }
  
  let oldBlocksHeader = structure.value.structure.value.block_indices.value.value[0];
  let newblockslist = [];
  if(oldBlocksHeader.type !== "end"){
    let oldblockslist = oldBlocksHeader.value;
    for(var i = 0; i < oldblockslist.length; i++){
      let entry = {
        "pos": {
          "type": "list",
          "value": {
            "type": "int",
            "value": getStructureBlockCoords(size, i)
          }
        },
        "state": {
          "type": "int",
          "value": oldblockslist[i]
        }
      };
      if(oldblockslist[i] != -1) newblockslist.push(entry)
    }
  }
  
  var newStructure = {
    "type": "compound",
    "name": "",
    "value": {
      "size": {
        "type": "list",
        "value": {
          "type": "int",
          "value": size
        }
      },
      "entities": {
          "type": "list",
          "value": {
            "type": "end",
            "value": []
          }
      },
      "blocks": {
        "type": "list",
        "value": {
          "type": "compound",
          "value": newblockslist
        }
      },
      "palette": {
        "type": "list",
        "value": {
          "type": "compound",
          "value": newPalette
        }
      },
      "DataVersion": {
        "type": "int",
        "value": 3120
      }
    }
  };
  
  return newStructure;
}