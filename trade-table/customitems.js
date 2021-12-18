function importCustomItem(name, image){
  var line = {};
  line.identifier = name;
  line.isCustom = true;
  line.imgData = image;
  data.push(line);
}

document.getElementById("inp").addEventListener("change", readImgForB64);

function customItem(){
  if(window.localStorage.getItem("customItemTutorial") != "true"){
    window.localStorage.setItem("customItemTutorial", "true");
    if(confirm("You've never used the Custom Item feature before. Would you like a tutorial?")){
      alert("As of right now, to make the program recognize a custom item in its display, first upload the image of your item's icon.");
      alert("Make sure it's a square PNG, otherwise we might display it strangely.");
      alert("After that, enter the exact identifier that you use in the Editor to make your item appear. Please note, your custom item will not appear in the dictionary.");
      alert("We don't yet save your custom items' data, so you will have to do this every time you reload the page.");
      readImgForB64();
    }
  } else {
    readImgForB64();
  }
}

function readImgForB64() {
  if (this.files && this.files[0]) {
    //console.log(this.files[0].name.replaceAll(".png", ""));
    var FR = new FileReader();

    FR.addEventListener("load", function(e) {
      //document.getElementById("img").src = e.target.result;
      //document.getElementById("b64").innerHTML = e.target.result;
      var ciname = prompt("What identifier will show this image? Include the namespace."/*, this.files[0].name.replaceAll(".png", "")*/);
      var cidata = e.target.result;
      importCustomItem(ciname, cidata);
    });

    FR.readAsDataURL(this.files[0]);
  }
}