var importedData = '{"format_version":"1.17.20","minecraft:npc_dialogue":{"scenes":[{"scene_tag":"scene_1","npc_name":"Scene 1","text":"","on_open_commands":[],"on_close_commands":[],"buttons":[]}]}}';

var file = {
  "format_version": "1.17.20",
  "minecraft:npc_dialogue": {
    "scenes": [
      {
        "scene_tag": "scene_1",
        "npc_name": "Scene 1",
        "text": "",
        "on_open_commands": [],
        "on_close_commands": [],
        "buttons": []
      }
    ]
  }
};

var project = file["minecraft:npc_dialogue"];
var filename = "my-dialogue.json";

var advancedMode = false;
var searchParams = new URLSearchParams(location.search);
if(searchParams.has("advanced")){
  advancedMode = true;
}

/*document.getElementById("file").addEventListener("change", function(){
  if(this.files && this.files[0]){
    var fr = new FileReader();
    fr.onload = function(e){
      if(!JSON.parse(e.target.result) || !JSON.parse(e.target.result)["minecraft:npc_dialogue"]){
        alert("This doesn't appear to be a valid dialouge file.");
        return;
      }
      file = JSON.parse(e.target.result);
      project = file["minecraft:npc_dialogue"];
      readProject();
    }
    fr.readAsText(this.files[0]);
    filename = document.getElementById("file").files[0].name.split(".")[0];
  }
});*/

function exportProject(){
  if(!window.iapi && !window.bridge.connected && !window.bridge.openedFile){
    filename = prompt("What would you like to name your dialogue file?", "dialogue.json");
    if(filename == "" || filename == false || filename == null){
      return;
    }
  }
  
  var text = JSON.stringify(file, null, 3);
    
  exportFile(new File([text], filename), filename);
}

function getScene(tag){
  var result = false;
  for(var i = 0; i < project.scenes.length; i++){
    if(project.scenes[i].scene_tag == tag){
      result = project.scenes[i];
    }
  }
  return result;
}

function validateTag(tag){
  var allTags = [];
  for(var i = 0; i < project.scenes.length; i++){
    allTags.push(project.scenes[i].scene_tag);
  }
  
  if(tag == " " || tag == "" || !tag){
    tag = "(blank)";
  } 
  if(allTags.includes(tag)){
    tag = tag + "1";
  }
  if(!checkValidation(tag)) tag = validateTag(tag);
  
  return tag;
}

function checkValidation(tag){
  var allTags = [];
  for(var i = 0; i < project.scenes.length; i++){
    allTags.push(project.scenes[i].scene_tag);
  }
  if(allTags.includes(tag)){
    //check failed
    return false;
  } else {
    //continue
    return true;
  }
}

var currentScene, currentOptionElement, currentButton;

function openScene(scenedata){
  currentScene = scenedata;
  document.getElementById("selectscene").value = scenedata.scene_tag;
  currentOptionElement = document.querySelectorAll("[value='"+ document.getElementById("selectscene").value +"']")[0];
  
  document.getElementById("scene_tag").value = scenedata.scene_tag;
  
  if(scenedata.npc_name.constructor == Object){
    document.getElementById("userawname").checked = true;
    toggleNameRawtext(document.getElementById("userawname"));
    document.getElementById("npc_name-raw").value = JSON.stringify(scenedata.npc_name.rawtext, null, 3);
  } else {
    document.getElementById("userawname").checked = false;
    toggleNameRawtext(document.getElementById("userawname"));
    document.getElementById("npc_name").value = scenedata.npc_name;
  }
  
  if(scenedata.text.constructor == Object){
    document.getElementById("text-raw").checked = true;
    toggleTextRawtext(document.getElementById("text-raw"));
    document.getElementById("text").value = JSON.stringify(scenedata.text.rawtext, null, 3);
  } else {
    document.getElementById("text-raw").checked = false;
    toggleTextRawtext(document.getElementById("text-raw"));
    document.getElementById("text").value = scenedata.text;
  }
  
  if(scenedata.on_open_commands){
    document.getElementById("open_commands").value  = scenedata.on_open_commands.join("\n");
  } else {
    document.getElementById("open_commands").value = "";
  }
    
  if(scenedata.on_close_commands){
    document.getElementById("close_commands").value = scenedata.on_close_commands.join("\n");
  } else {
    document.getElementById("close_commands").value = "";
  }
  
  //Render buttons
  var buttonplus = '<img src="https://cdn.glitch.com/17ff8eee-9239-4ba0-8a5c-9263261550b5%2Fcolor_plus.png?v=1617471105142">';
  var buttons = scenedata.buttons;
  //Create button elements
  document.getElementById("buttons").children[0].innerHTML = "";
  var completedbuttons = 0;
  
  var totalbuttons = Math.ceil(buttons.length / 3) + 1;
  if(!advancedMode && totalbuttons > 2){
    totalbuttons = 2;
  }
  
  for(var i = 0; i < totalbuttons; i++){
    var btnrow = document.createElement("tr");
    for(var a = 0; a < 3; a++){
      var newbtn = document.createElement("td");
      newbtn.classList = ["dialogue-button"];
      newbtn.setAttribute("disabled", "");
      btnrow.appendChild(newbtn);
    }
    document.getElementById("buttons").children[0].appendChild(btnrow);
  }
  
  var buttonEls = document.getElementsByClassName("dialogue-button");
  
  for(var i = 0; i < buttonEls.length; i++){
    buttonEls[i].setAttribute("disabled", "");
    buttonEls[i].innerHTML = "";
    //buttonEls[i].setAttribute("onclick", "alert('You must define all previous buttons before you can define this one.')");
    buttonEls[i].setAttribute("onclick", "");
    buttonEls[i].setAttribute("oncontextmenu", "return false;");
  }
  
  for(var i = 0; i < buttons.length; i++){
    buttonEls[i].removeAttribute("disabled");
    if(buttons[i].name.constructor == Object){
      var innerCode = "<i>Raw text name.</i>";
      if(buttons[i].name.rawtext[0].translate){
        innerCode = capString(buttons[i].name.rawtext[0].translate, 25);
      } else if(buttons[i].name.rawtext[0].text){
        innerCode = capString(buttons[i].name.rawtext[0].text, 25);
      }
      buttonEls[i].innerHTML = "<code style='font-family: monospace'>"+ innerCode +"</code>";
    } else {
      buttonEls[i].innerHTML = buttons[i].name;
    }
    buttonEls[i].setAttribute("onclick", "editButton("+i+")");
    buttonEls[i].setAttribute("oncontextmenu", "doButtonContext("+i+"); return false;");
  }
  
  if((buttons.length < 6 && !advancedMode) || advancedMode){
    buttonEls[buttons.length].removeAttribute("disabled");
    buttonEls[buttons.length].innerHTML = buttonplus;
    buttonEls[i].setAttribute("onclick", "addButton()");
  }
}

function capString(string, cap){
  if(string.length > cap){
    string = string.substring(0, (cap - 1)) + "&#8230;";
  }
  return string;
}

function updateScene(checkTag){
  var scenedata = currentScene;
  if(checkTag) scenedata.scene_tag = validateTag(document.getElementById("scene_tag").value);
  
  if(document.getElementById("userawname").checked){
    scenedata.npc_name = {"rawtext": []};
    try {
      scenedata.npc_name.rawtext = JSON.parse(document.getElementById("npc_name-raw").value);
    } catch(e) {
      scenedata.npc_name.rawtext = [{"text": "(JSON error)"}];
    }
  } else {
    scenedata.npc_name = document.getElementById("npc_name").value;
  }
  
  if(document.getElementById("text-raw").checked){
    scenedata.text = {"rawtext": []};
    try {
      scenedata.text.rawtext = JSON.parse(document.getElementById("text").value);
    } catch(e) {
      scenedata.text.rawtext = [{"text": "(JSON error)"}];
    }
  } else {
    scenedata.text = document.getElementById("text").value;
  }
  
  if(document.getElementById("open_commands").value == ""){
    if(scenedata.on_open_commands){
      delete scenedata.on_open_commands;
    }
  } else {
    scenedata.on_open_commands = document.getElementById("open_commands").value.split("\n");
  }
  if(document.getElementById("close_commands").value == ""){
    if(scenedata.on_close_commands){
      delete scenedata.on_close_commands;
    }
  } else {
    scenedata.on_close_commands = document.getElementById("close_commands").value.split("\n");
  }
  
  currentOptionElement.value = scenedata.scene_tag;
  currentOptionElement.innerHTML = scenedata.scene_tag;
}

function parseImportedData(){
  file = JSON.parse(sterilizeJSON(importedData));
  project = file["minecraft:npc_dialogue"];
  if(document.getElementById("dataFileInput").files[0]){
    filename = document.getElementById("dataFileInput").files[0].name.split(".")[0];
  } else {
    filename = "bridge-file"
  }
  
  readProject();
}

function readProject(){
  if(project.scenes.length == 0){
    addScene();
  }
  
  document.getElementById("selectscene").innerHTML = "";
  for(var i = 0; i < project.scenes.length; i++){
    document.getElementById("selectscene").innerHTML += '<option value="'+project.scenes[i].scene_tag+'">'+ project.scenes[i].scene_tag+'</option>';
  }
  
  openScene(project.scenes[0]);
}

function addScene(clonable){
  if(!clonable){
    clonable = {
      "scene_tag": validateTag("new_scene"),
      "npc_name": "",
      "text": "",
      "on_open_commands": [],
      "on_close_commands": [],
      "buttons": []
    }
  } else {
    clonable = JSON.parse(JSON.stringify(clonable));
  }
  
  project.scenes.push(clonable);
  readProject();
  openScene(project.scenes[project.scenes.length-1]);
}

function addButton(){
  currentScene.buttons.push({name: 'My Button', commands: ['']});
  openScene(currentScene);
  editButton(currentScene.buttons.length-1);
}

function editButton(index){
  document.getElementById("overlay").style.display = "block";
  document.getElementById("button-editor").style.display = "block";  
  currentButton = currentScene.buttons[index];
  if(index == currentScene.buttons.length-1){
    document.getElementById("button-delete").style.display = "block";
  } else {
    document.getElementById("button-delete").style.display = "none";
  }
  
  if(currentButton.name.constructor == Object){
    document.getElementById("button-use-rawtext").checked = true;
  } else {
    document.getElementById("button-use-rawtext").checked = false;
  }
  toggleButtonRawtext(document.getElementById("button-use-rawtext"));
  
  if(document.getElementById("button-use-rawtext").checked){
    document.getElementById("button-name-raw").value = JSON.stringify(currentButton.name.rawtext, null, 3);
  } else {
    document.getElementById("button-name").value = currentButton.name;
  }
  document.getElementById("button-commands").value = currentButton.commands.join("\n");
  
  if(!advancedMode){
    document.getElementById("button-image").style.display = "none";
  } else {
    document.getElementById("button-name").removeAttribute("maxlength");
    if(!currentButton.image) currentButton.image = [""];
    document.getElementById("button-image").value = currentButton.image[0];
  }
}

function closeEditors(){
  document.getElementById("overlay").style.display = "none";
  document.getElementById("button-editor").style.display = "none";
  
  currentButton.name = document.getElementById("button-name").value;
  if(document.getElementById("button-use-rawtext").checked){
    currentButton.name = {"rawtext": []};
    try {
      currentButton.name.rawtext = JSON.parse(document.getElementById("button-name-raw").value);
    } catch(e) {
      currentButton.name.rawtext = [{"text": "(JSON error)"}];
    }
  } else {
    currentButton.name = "";
    currentButton.name = document.getElementById("button-name").value;
  }
  
  currentButton.commands = document.getElementById("button-commands").value.split("\n");
  
  if(advancedMode){
    if(document.getElementById("button-image").value != ""){
      currentButton.image = [
        document.getElementById("button-image").value
      ];
    }
  }
  openScene(currentScene);
}

function deleteScene(){
  project.scenes.splice(project.scenes.indexOf(currentScene), 1);
  readProject();
  openScene(project.scenes[project.scenes.length-1]);
}

function deleteButton(){
  closeEditors();
  currentScene.buttons.splice(currentScene.buttons.indexOf(currentButton), 1);
  //readProject();
  openScene(currentScene);
}

function toggleButtonRawtext(el){
  if(el.checked){
    document.getElementById("button-name-raw").style.display = "block";
    document.getElementById("button-name-raw").value = '[\n   {\n      "translate": "button.name",\n      "with": [\n         "My Button"\n      ]\n   }\n]';
    document.getElementById("button-name").style.display = "none";
  } else {
    document.getElementById("button-name-raw").style.display = "none";
    document.getElementById("button-name").style.display = "inline-block";
    document.getElementById("button-name").value = "My Button";
  }
}

function toggleTextRawtext(el){
  if(el.checked){
    /*if(document.getElementById("text").value != ""){
      if(!confirm("This will delete anything you had in the dialogue box already. Proceed and delete your current text permanently?")){
        el.checked = false;
        return;
      }
    }*/
    document.getElementById("text").value = "";
    document.getElementById("text").placeholder = '[{"text": "rawtext"}]';
    document.getElementById("text").style.fontFamily = "monospace";
    document.getElementById("text").style.fontSize = "9pt";
  } else {
    /*if(document.getElementById("text").value != ""){
      if(!confirm("This will delete anything you had in the dialogue box already. Proceed and delete your current text permanently?")){
        el.checked = true;
        return;
      }
    }*/
    document.getElementById("text").value = "";
    document.getElementById("text").placeholder = "NPC dialogue...";
    document.getElementById("text").style.fontFamily = "Minecraftia";
    document.getElementById("text").style.fontSize = "11pt";
  }
}

function toggleNameRawtext(el){
  if(el.checked){
    document.getElementById("npc_name-raw").style.display = "block";
    document.getElementById("npc_name-raw").value = '[\n   {\n      "translate": "npc.name",\n      "with": [\n         "My NPC Name"\n      ]\n   }\n]';
    document.getElementById("npc_name").style.display = "none";
  } else {
    document.getElementById("npc_name-raw").style.display = "none";
    document.getElementById("npc_name").style.display = "inline-block";
    document.getElementById("npc_name").value = "";
  }
}

function doButtonContext(index){
  var button = currentScene.buttons[index];
  var foundPointer = false;
  for(var i = 0; i < button.commands.length; i++){
    if(!foundPointer && button.commands[i].includes("/dialogue")){
      foundPointer = true;
      var dialogue = button.commands[i].split(" ");
      var scene = dialogue[4];
      if(getScene(scene)){
        openScene(getScene(scene));
      } else {
        alert("Scene " + scene + " doesn't appear to exist in your dialogue file. Maybe it got renamed or it's in another file.");
      }
    }
  }
}

readProject();
