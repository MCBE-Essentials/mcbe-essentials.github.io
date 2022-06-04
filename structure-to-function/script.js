const nbt = require('prismarine-nbt');
const { Buffer } = require('buffer');

var structure = {};
document.getElementById("file").addEventListener("change", function(){
  if(this.files && this.files[0]){
    var fr = new FileReader();
    fr.onload = function(e){
      nbt.parse(Buffer.from(e.target.result)).then(function(data){
        structure = data.parsed;
        document.getElementById("upload").style.display = "none";
        document.getElementById("download").style.display = "table-row";
      });
    }
    
    fr.readAsArrayBuffer(this.files[0]);
    //Set global variable "filename" for use in exporting later
    filename = document.getElementById("file").files[0].name.split(".")[0];
  }
});

function exportFunction(tiles, air, waterlog,blockstates, tilecontainerloot, entities, entityrot, entityloot){
  var data = structureToFunction(
    tiles,
    air,
    waterlog,
    blockstates,
    tilecontainerloot,
    entities,
    entityrot,
    entityloot
  );
  
  var files = [];
  var filename = document.getElementById("file").files[0].name.replaceAll(".mcstructure", "");
  if(data.split("\n").length > 9000){
    var lines = data.split("\n");
    
    var loops = 1;
    while(lines.length > 1 && loops < 25){
      files.push(
        new File([lines.splice(0, 9000).join("\n")], filename + loops + ".mcfunction")
      );
      loops++;
    }
  } else {
    files = [
      new File([data], filename + ".mcfunction")
    ];
  }
  
  for(let downloadable of files){
    saveAs(downloadable);
  }
}

function download(){
  exportFunction(
    document.getElementById("tiles").checked,
    document.getElementById("air").checked,
    document.getElementById("waterlog").checked,
    document.getElementById("blockstates").checked,
    document.getElementById("tilecontainerloot").checked,
    document.getElementById("entities").checked,
    document.getElementById("entityrot").checked,
    document.getElementById("entityloot").checked
  );
}