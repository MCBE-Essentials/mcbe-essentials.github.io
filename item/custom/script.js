  //Custom item format:
  /*
  customItems = {
    "namespaced:identifier": {
        readable: "namespaced:identifier",
        texture: "data:..."
    }
  }
  */
  if(!window.localStorage.customItems){
    window.localStorage.customItems = "[]";
  }

  var customItemsData = JSON.parse(window.localStorage.customItems);
  document.getElementById("displays").innerHTML = "";
  for(var i = 0; i < Object.keys(customItemsData).length; i++){
    var entry = customItemsData[Object.keys(customItemsData)[i]];
    document.getElementById("displays").innerHTML += createRow(entry.texture, Object.keys(customItemsData)[i], entry.readable, i);
  }
  if(Object.keys(customItemsData).length == 0){
    document.getElementById("displays").innerHTML = "<tr><td colspan='4' class='app-inner' style='border-radius:10px;'><i>No uploaded items yet.</i></td></tr>";
  }
  
  var dataurl = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAABF0lEQVR4XmMYBSM+BBhJDoEghv949axjIMlMpoGOAhaiHQD1+Y1VL8BaMr7MQtF6/dV9MP8lw3xICBEZEkMgBNB8fvXfY6yB9vLcKbC4eEciJCRuQUPiCv40MYhDgEifowcHPCTWQUMiCH9IDP40AIvzrAfTUDw7TSELhX+AYSWE//ofJA1A0wQDATCEygEcPrn88wGqzPP3EL6oMAMxYMBDYNQBxNcFaBGKEfdo8uJGZpDcwHAVb1IY+rngwN/rEB9eeguhJQUZSAEDHgKEWy+wFlCYNsRj0JKOAZbfYd6F+rwhoQks0mAZCpEZ7LUh8e03AiEhnuAJSfVB84nyOSzghkAaQE/SOgRaxVeGWKuYYRSM+BAAAM/kV0mgX0JmAAAAAElFTkSuQmCC";
  document.getElementById("file").addEventListener("change", function(){
    if(this.files[0]){
      var fr = new FileReader();
      fr.onload = function(e){
        dataurl = e.target.result;
        document.getElementById("file").style.display = "none";
        upload();
      }
      fr.readAsDataURL(this.files[0]);
    }
  })
  
  function upload(){
    var identifier = prompt("What identifier would you like to use for the image? Careful, you can't edit this later.", "namespace:identifier");
    if(!identifier.includes(":")){
      upload(); return;
    }
    customItemsData[identifier] = {
      readable: "My Custom Item",
      texture: dataurl
    };
    window.localStorage.customItems = JSON.stringify(customItemsData);
    location.reload();
  }
  
  function del(index){
    delete customItemsData[Object.keys(customItemsData)[index]];
    window.localStorage.customItems = JSON.stringify(customItemsData);
    location.reload();
  }

function updateItem(index, el){
  var entry = customItemsData[Object.keys(customItemsData)[index]];
  entry.readable = el.value;
  window.localStorage.customItems = JSON.stringify(customItemsData);
}

function createRow(texture, identifier, namevalue, index){
  return '<tr><td colspan="1" class="app-inner"><img src="'+ texture +'" class="customimg" onabort="abort(this)"></td><td colspan="1" class="app-inner">'+identifier+'</td><td colspan="1" class="app-inner"><input value="'+ namevalue +'" class="app-input" oninput="updateItem('+index+', this)"></td><td colspan="1" class="app-inner"><img class="deleteimg" src="https://cdn.glitch.com/17ff8eee-9239-4ba0-8a5c-9263261550b5%2Ficon_trash.png?v=1616555108211" ondrag="return false;" onclick="del('+index+')"></td></tr>';
  //'<tr><td colspan="1" class="app-inner"><img src="'+ texture +'" class="customimg"></td><td colspan="1" class="app-inner"><input value="'+ identifier +'" class="app-input" oninput="updateItem('+index+')"></td><td colspan="1" class="app-inner"><input value="'+ namevalue +'" class="app-input" oninput="updateItem('+index+')"></td><td colspan="1" class="app-inner"><img class="deleteimg" src="https://cdn.glitch.com/17ff8eee-9239-4ba0-8a5c-9263261550b5%2Ficon_trash.png?v=1616555108211" ondrag="return false;" onclick="del('+ index +')"></td></tr>';
}


function abort(el){
  el.src = "https://github.com/bedrock-dot-dev/packs/raw/master/stable/resource/textures/items/empty_armor_slot_shield.png";
}