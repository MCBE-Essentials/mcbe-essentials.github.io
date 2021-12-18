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
        if(document.getElementById("useA").checked){output += "&&&"}
        if(document.getElementById("useB").checked){output += "~"}
        output += i.toString();
        if(document.getElementById("useC").checked){output += ", ";}else{output += " ";}
        if(document.getElementById("useB").checked){output += "~"}
        output += j.toString();
        if(document.getElementById("useC").checked){output += ", ";}else{output += " ";}
        if(document.getElementById("useB").checked){output += "~"}
        output += k.toString();
        if(document.getElementById("useA").checked){output += "%%%"}
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