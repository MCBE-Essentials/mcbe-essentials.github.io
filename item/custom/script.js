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
    window.localStorage.customItems = "{}";
  }

  var customItemsData = JSON.parse(window.localStorage.customItems);
  for(var i = 0; i < Object.keys(customItemsData).length; i++){
    document.getElementById("displays").innerHTML += '<tr><td><img src="' + customItemsData[Object.keys(customItemsData)[i]].texture + '" height="32" width="32" style="image-rendering:pixelated;" /></td><td>' + Object.keys(customItemsData)[i] + '</td><td>' + customItemsData[Object.keys(customItemsData)[i]].readable + '</td><td><input type="button" value="Delete" onclick="del('+i+')" />';    
  }
  
  var dataurl = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAABF0lEQVR4XmMYBSM+BBhJDoEghv949axjIMlMpoGOAhaiHQD1+Y1VL8BaMr7MQtF6/dV9MP8lw3xICBEZEkMgBNB8fvXfY6yB9vLcKbC4eEciJCRuQUPiCv40MYhDgEifowcHPCTWQUMiCH9IDP40AIvzrAfTUDw7TSELhX+AYSWE//ofJA1A0wQDATCEygEcPrn88wGqzPP3EL6oMAMxYMBDYNQBxNcFaBGKEfdo8uJGZpDcwHAVb1IY+rngwN/rEB9eeguhJQUZSAEDHgKEWy+wFlCYNsRj0JKOAZbfYd6F+rwhoQks0mAZCpEZ7LUh8e03AiEhnuAJSfVB84nyOSzghkAaQE/SOgRaxVeGWKuYYRSM+BAAAM/kV0mgX0JmAAAAAElFTkSuQmCC";
  document.getElementById("file").addEventListener("change", function(){
    if(this.files[0]){
      var fr = new FileReader();
      fr.onload = function(e){
        dataurl = e.target.result;
        document.getElementById("file").style.display = "none";
        document.getElementById("preview").style.display = "block";
        document.getElementById("preview").src = dataurl;
      }
      fr.readAsDataURL(this.files[0]);
    }
  })
  
  function upload(){
    customItemsData[document.getElementById("identifier").value] = {
      readable: document.getElementById("displayas").value,
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