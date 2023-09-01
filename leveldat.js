/*
  This file is responsible for doing essential operations with NBT such as
  - creating a Bedrock edition level.dat header and applying it and 
  - generating long inputs 
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
  },
  generateLongTag: function(bint){
    if(typeof bint !== 'bigint') throw new Error('generateLongTag must have a BigInt as its argument');
    class BigIntExtended extends Array {
      valueOf () { return BigInt.asIntN(64, BigInt(this[0]) << 32n) | BigInt.asUintN(32, BigInt(this[1])) }
    }
    let output = new BigIntExtended(0, 0);
    output[1] = bint;
    
    output[0] = (bint / 4294967296n)
    output[1] -= (4294967296n * output[0]);
    
    if(output[1] < 0n){ //Value is negative
      output[0] -= 1n; //Drop the second value by 1
    }
    
    output[0] = Number(output[0]);
    output[1] = Number(output[1]);
    
    return output;
  },
  longTagValue: function(long){
    return BigInt.asIntN(64, BigInt(long[0]) << 32n) | BigInt.asUintN(32, BigInt(long[1]))
  },
  argb: {
    intToHex: function(int, excludeAlpha = false){
      let a = 0xff & int >>> 24;
      let r = 0xff & int >>> 16;
      let g = 0xff & int >>> 8;
      let b = 0xff & int;

      function toZeroPadded(num){
        let result = num.toString(16);
        if(result.length == '1'){
          result = '0' + result;
        }
        return result;
      }

      return '#' + toZeroPadded(r) + toZeroPadded(g) + toZeroPadded(b) + (!excludeAlpha ? toZeroPadded(a) : '');
    },
    hexToInt: function(hex, addAlpha){
      hex = hex.replaceAll('#', '');
      if(addAlpha) hex += 'ff';
      let r = parseInt(hex.substring(0, 2), 16);
      let g = parseInt(hex.substring(2, 4), 16);
      let b = parseInt(hex.substring(4, 6), 16);
      let a = parseInt(hex.substring(6, 8), 16);

      return (a << 24) + (r << 16) + (g << 8) + (b << 0);
    }
  }
};