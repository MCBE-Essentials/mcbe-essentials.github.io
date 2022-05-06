function generate(name, [xstart, ystart, zstart], [xend, yend, zend], steps, removeTagWhenFinished, modifier){
  var output = [
    "#Generated with Camera Movement Generator by ReBrainerTV",
    "scoreboard objectives add "+name+" dummy",
    "execute @e[tag="+name+"] ~~~ scoreboard players add @s "+name+" 1"
  ];
  
  if(name == ""){
    return [];
  }
  
  var distx, disty, distz;
  distx = xend - xstart;
  disty = yend - ystart;
  distz = zend - zstart;
  
  for(var i = 0; i < steps+1; i++){
    var x = document.getElementById("modifier").value + Math.ceil((xstart + (distx / steps) * i) * 1000) / 1000;
    var y = document.getElementById("modifier").value + Math.ceil((ystart + (disty / steps) * i) * 1000) / 1000;
    var z = document.getElementById("modifier").value + Math.ceil((zstart + (distz / steps) * i) * 1000) / 1000;
    var face = "";
    
    if(facing == 1){
      face = "facing " + faceel.getElementsByClassName("facing-step0")[0].value;
    } else if(facing == 2){
      face = faceel.getElementsByClassName("facing-step0")[0].value +
      " " + faceel.getElementsByClassName("facing-step1")[0].value;
    } else if(facing == 3){
      face = "~" + faceel.getElementsByClassName("facing-step0")[0].value +
      " ~" + faceel.getElementsByClassName("facing-step1")[0].value;
    } else if(facing == 4) {
      var fxs, fys, fzs, fxe, fye, fze, fxd, fyd, fzd, fx, fy, fz;
      fxs = getCoordinatesFromValue(faceel.getElementsByClassName("facing-step0")[0].value)[0];
      fys = getCoordinatesFromValue(faceel.getElementsByClassName("facing-step0")[0].value)[1];
      fzs = getCoordinatesFromValue(faceel.getElementsByClassName("facing-step0")[0].value)[2];
      fxe = getCoordinatesFromValue(faceel.getElementsByClassName("facing-step1")[0].value)[0];
      fye = getCoordinatesFromValue(faceel.getElementsByClassName("facing-step1")[0].value)[1];
      fze = getCoordinatesFromValue(faceel.getElementsByClassName("facing-step1")[0].value)[2];
      fxd = fxe - fxs;
      fyd = fye - fys;
      fzd = fze - fzs;
      fx = Math.ceil((fxs + (fxd / steps) * i) * 1000) / 1000;
      fy = Math.ceil((fys + (fyd / steps) * i) * 1000) / 1000;
      fz = Math.ceil((fzs + (fzd / steps) * i) * 1000) / 1000;
      
      face = "facing " + [fx,fy,fz].join(" ");
    }
    
    output.push("execute @e[tag="+name+",scores={"+name+"="+ (i+1) +"}] ~ ~ ~ /tp @s " + [x,y,z].join(" ") + " " + face);
  }
  
  
  
  return output;
}

function getCoordinatesFromValue(val){
  var output = val.split(" ");
  for(var i = 0; i < output.length; i++){
    output[i].replaceAll("^", "");
    output[i].replaceAll("~", "");
  }
  
  return [
    parseFloat(output[0]), 
    parseFloat(output[1]),
    parseFloat(output[2])
  ];
}

function doOutput(){
  document.getElementById("output").value = generate(
    document.getElementById("name").value.replaceAll(" ", "_"),
    getCoordinatesFromValue(document.getElementById("from").value),
    getCoordinatesFromValue(document.getElementById("to").value),
    parseFloat(document.getElementById("steps").value),
    false,
    document.getElementById("modifier").value
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

var facing = 0;
var faceel = document.getElementById("facing-0");
function facingMode(el){
  for(var i = 0; i < document.getElementsByClassName("facing-settings").length; i++){
    document.getElementsByClassName("facing-settings")[i].style.display = "none";
  }
  document.getElementById("facing-" + el.value).style.display = "block";
  faceel = document.getElementById("facing-" + el.value);
  facing = parseFloat(el.value);
}