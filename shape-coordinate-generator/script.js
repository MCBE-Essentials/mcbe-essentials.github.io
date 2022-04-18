function parseCoordinates(val){
  val = val.replaceAll('~', "");
  val = val.replaceAll('^', "");
  val = val.split(" ");
  if(val.length > 3){
    val = [val[0], val[1], val[2]];
  }
  
  for(var i = 0; i < val.length; i++){
    val[i] = parseFloat(val[i]);
  }
  
  return val;
}

function importFill(text){
  if(text.includes("\n") || !text.includes("fill") || text.split(" ").length < 8){
    return false;
  }
  
  var retext = text.split(" ");
  
  document.getElementById("from").value = retext[1] + " " + retext[2] + " " + retext[3];
  document.getElementById("to").value = retext[4] + " " + retext[5] + " " + retext[6];
  if(retext.length > 7) {
    document.getElementById("hollow").checked = (retext[7] == "hollow" || retext[7] == "outline" ? true : false);
  } else {
    document.getElementById("hollow").checked = false;
  }
}

function doGeneration(){
  var from = document.getElementById("from").value;
  var to = document.getElementById("to").value;
  var modifier = document.getElementById("modifier").value;
  var hollow = document.getElementById("hollow").checked;
  
  var generation = generateShape(
    parseCoordinates(from),
    parseCoordinates(to),
    modifier,
    hollow
  );
  
  for(var i = 0; i < generation.length; i++){
    generation[i] = generation[i].join(" ");
  }
  
  document.getElementById("output").value = generation.join("\n");
}

function generateShape([x1, y1, z1], [x2, y2, z2], modifier, hollow){
  var startx = (x1 >= x2 ? x2 : x1);
  var starty = (y1 >= y2 ? y2 : y1);
  var startz = (z1 >= z2 ? z2 : z1);
  var endx = (x1 >= x2 ? x1 : x2) + 1;
  var endy = (y1 >= y2 ? y1 : y2) + 1;
  var endz = (z1 >= z2 ? z1 : z2) + 1;
  var coordslist = [];
  
  //console.log([startx, starty, startz], [endx, endy, endz]);
  
  if (!hollow) {
    //Shape filled
    var x, y, z, width, height, depth, ix, iy, iz;
    x = startx; y = starty; z = startz;
    width = endx - x; height = endy - y; depth = endz - z;

    for (iy = 0; iy < height; iy++) {
      for (var ix = 0; ix < width; ix++) {
        for (var iz = 0; iz < depth; iz++) {
          coordslist.push([
            modifier + (ix + x),
            modifier + (iy + y),
            modifier + (iz + z)
            //Prefix + number generated
          ]);
        }
      }
    }
  } else {
    //Shape hollow
    var x, y, z, width, height, depth, ix, iy, iz;
    //Set xyz to values defined by user
    x = startx; y = starty; z = startz;
    width = endx - x; height = endy - y; depth = endz - z;

    for (iy = 0; iy < height; iy++) {
      if (iy == (height - 1) || iy == 0) {
        //Bottom or top layer, do entire thing.
        for (var ix = 0; ix < width; ix++) {
          for (var iz = 0; iz < depth; iz++) {
            coordslist.push([
              modifier + (ix + x),
              modifier + (iy + y),
              modifier + (iz + z)
              //Prefix + number generated
            ]);
          }
        }
      } else {
        //Not bottom or top layer, go around the edges
        for (var ix = 0; ix < width; ix++) {
          if (ix == (width - 1) || ix == 0) {
            //On top or bottom edge
            for (var iz = 0; iz < depth; iz++) {
              coordslist.push([
                modifier + (ix + x),
                modifier + (iy + y),
                modifier + (iz + z)
                //Prefix + number generated
              ]);
            }
          } else {
            //Not on top or bottom edge
            for (var iz = 0; iz < depth; iz++) {
              if (iz == (depth - 1) || iz == 0) {
                //On left or right edge
                coordslist.push([
                  modifier + (ix + x),
                  modifier + (iy + y),
                  modifier + (iz + z)
                  //Prefix + number generated
                ]);
              } else {
                //Not on left or right edge
                //Do nothing
              }
            }
          }
        }
      }
    }
  }
  
  return coordslist;
}

function copyText() {
  /* Get the text field */
  var copyText = document.getElementById("output");
  
  /* Enable the text field */
  copyText.disabled = false;
  
  /* Select the text field */
  copyText.select();
  copyText.setSelectionRange(0, 99999); /* For mobile devices */

  /* Copy the text inside the text field */
  document.execCommand("copy");

  /* Alert the copied text */
  //alert("Copied the text: " + copyText.value);
  
  /* Disable the text field */
  copyText.disabled = true;
}