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
//alert(x.toString() + ", " + y.toString() + ", " + z.toString() + ", " + n.toString() + ", " + m.toString() + ", " + v.toString());
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

// Input Variables
//var x; var y; var z; var n; var m; var v;
// Position Variables
var hstartx; var hstarty; var hstartz;
var hendx; var hendy; var hendz;
//Count Variables
var hi; var hj; var hk; var hcount = 0;
//Output
var houtput;

function hOutputItems(x,y,z,n,m,v){
  if(n < 3 || m < 3 || v < 3){
    //Call the solid if the dimenstions are too small to be hollow
   houtput = outputItems(x,y,z,n,m,v);
   alert("One or more of the dimensions you have selected cannot contain a hole.");
   return houtput;
  }else{
  houtput = "";
  hstartx = x - ((n - 1) / 2);
  hstarty = y - ((m - 1) / 2);
  hstartz = z - ((v - 1) / 2);
  hendx = hstartx + (n - 1);
  hendy = hstarty + (m - 1);
  hendz = hstartz + (v - 1);
  //Bottom + Top: WidthX & (HeightY = 1) & DepthZ &
  houtput += outputItems(x,hstarty,z,n,1,v);
  houtput += outputItems(x,hendy,z,n,1,v);
  //Sides: (WidthX = 1) & (HeightY - 2) & DepthZ
  var hsideheight = (m - 2);
  
  houtput += outputItems(hstartx,y,z, 1,hsideheight,v);
  houtput += outputItems(hendx,y,z, 1,hsideheight,v);
  //Front + Back: (WidthX = 0) & HeightY & (DepthZ - 2)
  var hfrontwidth = (n - 2);
  houtput += outputItems(x,y,hstartz, hfrontwidth,hsideheight,1);
  houtput += outputItems(x,y,hendz, hfrontwidth,hsideheight,1);
  return houtput;
  }
}