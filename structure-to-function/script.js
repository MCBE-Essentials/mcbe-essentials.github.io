const nbt = require('prismarine-nbt');
const { Buffer } = require('buffer');

const worker = new Worker("./portable.js");
worker.onmessage = (e) => {
  if(e.data.type == 'progress'){
    revealProgress(e.data.message)
  } else if(e.data.type == 'result'){
    downloadFunction(e.data.data)
  } else {
    console.log('Invalid message from Worker: ', e);
  }
}

function revealProgress(message){
  console.log(message)
  
  document.getElementById("output-logs").value += message + "\n";
  document.getElementById("output-logs").scrollTop = document.getElementById("output-logs").scrollHeight;
}

var structure = {};
/*document.getElementById("file").addEventListener("change", function(){
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
});*/

var importedData = '';
/*function parseImportedData(){
  structure = importedData;
  document.getElementById("upload").style.display = "none";
  document.getElementById("download").style.display = "table-row";
}*/
var currentFile = '';
function parseImportedData(file){
  currentFile = file;
  if(file.name.endsWith('.json')){
    structure = JSON.parse(importedData);
    document.getElementById("upload").style.display = "none";
    document.getElementById("download").style.display = "table-row";
  } else {
    nbt.parse(Buffer.from(importedData)).then(function(data){
      structure = data.parsed;
      unparsedStructure = data.metadata.buffer;
      //console.log(data);

      document.getElementById("upload").style.display = "none";
      document.getElementById("download").style.display = "table-row";
    });
  }
}

function exportFunction(){
  worker.postMessage({
    "tiles": document.getElementById("tiles").checked,
    "air": document.getElementById("air").checked,
    "waterlog": document.getElementById("waterlog").checked,
    "blockstates": document.getElementById("blockstates").checked,
    "tilecontainerloot": document.getElementById("tilecontainerloot").checked,
    "entities": document.getElementById("entities").checked,
    "entityrot": document.getElementById("entityrot").checked,
    "entityloot": document.getElementById("entityloot").checked,
    
    "structure": structure
  })
  document.querySelector("#download-btn").style.display = "none";
  document.querySelector("#loading-btn").style.display = "block";
}

function downloadFunction(data){ 
  var files = [];
  var filename = currentFile.name.replaceAll(".mcstructure", "");
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
    if(window.bridge && window.bridge.connected){
      revealProgress('Downloading file to bridge. ...')
      exportFile(downloadable, downloadable.name, window.bridge.openedPath.replace("structures", "functions").replaceAll(".mcstructure", ".mcfunction"));
    } else {
      revealProgress('Downloading file to your device...')
      exportFile(downloadable);
    }
  }
  
  document.querySelector("#download-btn").style.display = "block";
  document.querySelector("#loading-btn").style.display = "none";
}

function download(){
  Array.from(document.getElementsByClassName("parameters-tab")).forEach((el) => {el.style.display = "none"})
  Array.from(document.getElementsByClassName("logs-tab")).forEach((el) => {el.style.display = "block"})
  
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