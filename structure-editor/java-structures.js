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
    newPalette.push(
      {
        "name": {
            "type": "string",
            "value": palette[i].Name.value
        },
        "states": {
            "type": "compound",
            "value": {}
        },
        "version": {
            "type": "int",
            "value": 17825808
        }
      }
    );
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
  alert("You've just imported a Java Edition structure file. Using experimental software, it has been converted to the Bedrock format. Identifiers were likely not converted properly. Use this at your own risk!");
}