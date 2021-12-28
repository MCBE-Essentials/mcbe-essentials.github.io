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
    var face = "";
    
    if(facing == 1){
      face = "facing " + faceel.getElementsByClassName("facing-step0")[0].value +
      " " + faceel.getElementsByClassName("facing-step1")[0].value +
      " " + faceel.getElementsByClassName("facing-step2")[0].value
    } else if(facing == 2){
      face = faceel.getElementsByClassName("facing-step0")[0].value +
      " " + faceel.getElementsByClassName("facing-step1")[0].value;
    } else if(facing == 3){
      face = "~" + faceel.getElementsByClassName("facing-step0")[0].value +
      " ~" + faceel.getElementsByClassName("facing-step1")[0].value;
    } else if(facing == 4) {
      var fxs, fys, fzs, fxe, fye, fze, fxd, fyd, fzd, fx, fy, fz;
      fxs = parseFloat(faceel.getElementsByClassName("facing-step0")[0].value);
      fys = parseFloat(faceel.getElementsByClassName("facing-step1")[0].value);
      fzs = parseFloat(faceel.getElementsByClassName("facing-step2")[0].value);
      fxe = parseFloat(faceel.getElementsByClassName("facing-step3")[0].value);
      fye = parseFloat(faceel.getElementsByClassName("facing-step4")[0].value);
      fze = parseFloat(faceel.getElementsByClassName("facing-step5")[0].value);
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