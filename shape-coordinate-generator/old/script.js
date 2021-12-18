// Input Variables
//var x; var y; var z; var n; var m; var v;
// Position Variables
var startx; var starty; var startz;
var endx; var endy; var endz;
//Count Variables
var i; var j; var k; var count = 0;
//Output
var output;

function outputItems(x,y,z,n,m,v){
//Get start positions
  startx = x - ((n - 1) / 2);
  starty = y - ((m - 1) / 2);
  startz = z - ((v - 1) / 2);
// DEBUG    output = "\nStart pos: " + startx + ", " + starty + ", " + startz + "\n\n";
  output = "";
//Do loops
//DEBUG     count = 0;
  for(k = startz; k < (startz + v); k++){
    for(j = starty; j < (starty + m); j++){
      for(i = startx; i < (startx + n); i++){
      //count++;
        output += (i.toString() + ", " + j.toString() + ", " + k.toString());
        output += "\n";
      }
    }
  }
  
  /* DEBUG
  output += "\nCount:";
  output += count;
  */
//Output
  return output;
}

function outputItemsHollow(x, y, z, n, m, v) {
  //Get start positions
  startx = x - (n - 1) / 2;
  starty = y - (m - 1) / 2;
  startz = z - (v - 1) / 2;
  endx = startx + (n - 1);
  endy = starty + (m - 1);
  endz = startz + (v - 1);
  
  output = "\n";
  output = "\nStart pos: " + startx + ", " + starty + ", " + startz + "\n";
  output += "\nEnd pos: " + endx + ", " + endy + ", " + endz + "\n\n";

//Draw the full face
outputItems(x,y,startz,n,m,1);
  //Do loops for each dimension
  count = 0;
  for (k = (startz + 1); k < endz; k++) {
      /*
      //Draw a hollow square
      for (j = starty; j < endy; j++) {
        if (j == starty || j == endy) {
          //Draw a line
          for (i = startx; i < endx; i++) {
            count++;
            output += i.toString() + ", " + j.toString() + ", " + k.toString();
            output += "\n";
          }
        } else {
          //Output ONLY first dot and last dot in line.
            output += startx.toString() + ", " + j.toString() + ", " + k.toString();
            output += "\n"; 
          count++;
            output += endx.toString() + ", " + j.toString() + ", " + k.toString();
            output += "\n"; 
          count++;
        }
      }
      */
    output += "\nK: " + k;
  }
  //Draw the full face
  outputItems(x,y,endz,n,m,1);

  output += "\nCount:";
  output += count;
  //Output
  return output;
}