function generate(name, [xstart, ystart, zstart], [xend, yend, zend], steps, removeTagWhenFinished){
  var output = ["execute @e[tag="+name+"] ~~~ scoreboard players add @s "+name+" 1"];
  var distx, disty, distz;
  distx = xend - xstart;
  disty = yend - ystart;
  distz = zend - zstart;
  
  for(var i = 0; i < steps+1; i++){
    var x = Math.ceil((xstart + (distx / steps) * i) * 1000) / 1000;
    var y = Math.ceil((ystart + (disty / steps) * i) * 1000) / 1000;
    var z = Math.ceil((zstart + (distz / steps) * i) * 1000) / 1000;
    
    output.push("execute @e[tag="+name+",scores={"+name+"="+ (i+1) +"}] ~ ~ ~ /tp @s " + [x,y,z].join(" "));
  }
  
  return output;
}

function doOutput(){
  document.getElementById("output").value = generate(
    document.getElementById("name").value,
    [
      parseFloat(document.getElementById("x").value),
      parseFloat(document.getElementById("y").value),
      parseFloat(document.getElementById("z").value)
    ],
    [
      parseFloat(document.getElementById("x2").value),
      parseFloat(document.getElementById("y2").value),
      parseFloat(document.getElementById("z2").value)
    ],
    parseFloat(document.getElementById("steps").value),
    false
  ).join("\n");
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