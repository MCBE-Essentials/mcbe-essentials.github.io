  //Custom item format:
  /*
  customItems = {
    "namespaced:identifier": {
        readable: "namespaced:identifier",
        texture: "data:..."
    }
  }
  */
  if(!window.localStorage.customItems || !window.localStorage.customItems.startsWith("{")){
    window.localStorage.customItems = "{}";
  }

  var customItemsData = JSON.parse(window.localStorage.customItems);
  document.getElementById("displays").innerHTML = "";
  for(var i = 0; i < Object.keys(customItemsData).length; i++){
  var key = Object.keys(customItemsData)[i];
  var entry = customItemsData[key];
  document.getElementById("displays").innerHTML += createRow(entry.texture, key, entry.readable, i, entry.durability);
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
      texture: dataurl,
      durability: 0
    };
    window.localStorage.customItems = JSON.stringify(customItemsData);
    location.reload();
  }
  
  function del(index){
    delete customItemsData[Object.keys(customItemsData)[index]];
    window.localStorage.customItems = JSON.stringify(customItemsData);
    location.reload();
  }

function createRow(texture, identifier, namevalue, index, durability){
  return '<tr>' +
    '<td class="app-inner"><img src="'+ texture +'" class="customimg" onabort="abort(this)"></td>' +
    '<td class="app-inner">'+identifier+'</td>' +
    '<td class="app-inner"><input value="'+ namevalue +'" class="app-input" oninput="updateItem('+index+', this, \'readable\')"></td>' +
    // NEW NUMERICAL FIELD FOR DURABILITY
    '<td class="app-inner"><input type="number" value="'+ (durability || 0) +'" class="app-input" style="width:70px" oninput="updateItem('+index+', this, \'durability\')"></td>' +
    '<td class="app-inner"><img class="deleteimg" src="/assets/icons/icon_trash.png" ondrag="return false;" onclick="del('+index+')"></td>' +
  '</tr>';
}

function updateItem(index, el, field){
  var keys = Object.keys(customItemsData);
  var entry = customItemsData[keys[index]];
  
  if(field === 'durability') {
    entry.durability = parseInt(el.value) || 0;
  } else {
    entry.readable = el.value;
  }
  
  window.localStorage.customItems = JSON.stringify(customItemsData);
}


function abort(el){
  el.src = "https://github.com/Mojang/bedrock-samples/raw/main/resource_pack/textures/items/empty_armor_slot_shield.png";
}
