document.getElementById("file").addEventListener("change", function(){
  if(this.files && this.files[0]){
    var fr = new FileReader();
    fr.onload = function(e){      
      //Set global variable
      //Do something with global variable
    }
    fr.readAsText(this.files[0]);
    //Set global variable "filename" for use in exporting later
    filename = document.getElementById("file").files[0].name.split(".")[0];
  }
});

//version that utilises filehandler
document.getElementById("file").addEventListener("change", function(){
  importFile(this.files, project, 'text', doSomething);
});