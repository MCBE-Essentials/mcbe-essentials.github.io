document.getElementById("file").addEventListener("change", function(){
  if(this.files && this.files[0]){
    var fr = new FileReader();
    fr.onload = function(e){      
      tradetable = correctImportedTable(JSON.parse(e.target.result));
      tableToEditor();
    }
    fr.readAsText(this.files[0]);
    filename = document.getElementById("file").files[0].name.split(".")[0];
  }
});