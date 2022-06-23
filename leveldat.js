/*
  This file is responsible for creating a Bedrock edition level.dat header and applying it.
  
*/

//Thanks to https://stackoverflow.com/a/43933693 for this essential piece of code!!
function concatenate(resultConstructor, ...arrays) {
  let totalLength = 0;
  for (const arr of arrays) {
      totalLength += arr.length;
  }
  const result = new resultConstructor(totalLength);
  let offset = 0;
  for (const arr of arrays) {
      result.set(arr, offset);
      offset += arr.length;
  }
  return result;
}

const datHandler = {
  generateHeader: function(brokenldb){
    var byteLength = brokenldb.byteLength;
    
    var fileSize = Uint8Array.from(datHandler.numTo8Bit(byteLength));
    
    return concatenate(Uint8Array, Uint8Array.of(8, 0, 0, 0), fileSize, brokenldb);
  },
  fix: function(data){
    return concatenate(Uint8Array, datHandler.generateHeader(data), data);
  },
  numTo8Bit: function(number){
    var output = [0, 0, 0, 0];
    output[3] = (Math.floor(number / 16777216));
    number -= (16777216 * output[3]);
    output[2] = (Math.floor(number / 65536));
    number -= (65536 * output[2]);
    output[1] = (Math.floor(number / 256));
    number -= (256 * output[1]);
    output[0] = (Math.floor(number / 1));
    number -= (1 * output[0]);
    
    return output;
  }
};