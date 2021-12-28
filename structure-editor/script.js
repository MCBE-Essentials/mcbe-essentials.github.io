var structure = {};
var inputfile = document.getElementById("file");
inputfile.addEventListener('change', function(e) {
  var file = e.target.files[0];
  var reader = new FileReader();
  reader.addEventListener("load",function() {
    var data = reader.result
    nbt.parse(data, function(error, data) {
      if (error) {
        throw error;
      }
      structure = data;
      //document.getElementById("editor").value = JSON.stringify(structure);
      document.getElementById("upload").style.display="none";
      document.getElementById("download").style.display="block";
      structureToEditor();
    });
  });
  
  reader.readAsArrayBuffer(file);
});

function structureToEditor(){
  var path = "structure.value";
  
}

function exportStructure(){
  structure = JSON.parse(document.getElementById("editor").value);
  saveAs(new File([nbt.writeUncompressed(structure)], "hello.mcstructure"), "hello.mcstructure");
}