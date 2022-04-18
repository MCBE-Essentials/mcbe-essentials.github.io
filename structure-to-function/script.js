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
      structure = e.target.result;
    }
    
    fr.readAsArrayBuffer(this.files[0]);
    //Set global variable "filename" for use in exporting later
    filename = document.getElementById("file").files[0].name.split(".")[0];
  }
});

function exportFunction(tiles, air, waterlog,blockstates, tilecontainerloot, entities, entityrot, entityloot){
  saveAs(new File([
    structureToFunction(
      tiles,
      air,
      waterlog,
      blockstates,
      tilecontainerloot,
      entities,
      entityrot,
      entityloot
    )
  ], "hello.mcfunction"), document.getElementById("file").files[0].name.replaceAll(".mcstructure", ".mcfunction"));
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