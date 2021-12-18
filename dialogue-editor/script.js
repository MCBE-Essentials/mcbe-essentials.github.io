var proj = {
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

var project = proj["minecraft:npc_dialogue"];
var currentScene = '0';

loadScene(project.scenes.length-1);

function addScene(scn){
  var scene = {
        "scene_tag": "",
        "npc_name": "",
        "text": "",
        "on_open_commands": [],
        "on_close_commands": [],
        "buttons": []
    };
  if(scn) scene = JSON.parse(JSON.stringify(project.scenes[scn]));
  scene["scene_tag"] += " (copy)";
  project.scenes.push(scene);
  loadScene(project.scenes.length-1);
  
  document.getElementById("id").focus();
}

function removeScene(){
  project.scenes.splice(currentScene, 1);
  if(project.scenes.length>0){
  loadScene(project.scenes.length-1);
  } else {
    addScene();
  }
}

function loadScene(num){
  var scene = project.scenes[num];
  currentScene = num;
  
  document.getElementById("title").value = scene.npc_name;
  document.getElementById("id").value = scene.scene_tag;
  if(typeof scene.text == 'object'){
    document.getElementById("text").value = scene.text.rawtext[0].text;
  } else {
    document.getElementById("text").value = scene.text;
  }
  if(scene.on_open_commands){
    document.getElementById("onopen").value = scene.on_open_commands.join("\n");
  } else {
    document.getElementById("onopen").value = "";
  }
  
  if(scene.on_close_commands){
    document.getElementById("onclose").value = scene.on_close_commands.join("\n");
  } else {
    document.getElementById("onclose").value = "";
  }
  
  var buttons = document.getElementById("buttons").children;
  for(var i = 0; i < buttons.length; i++){
    if(scene.buttons.length > i){
      if(typeof scene.buttons[i].name == 'object'){
        buttons[i].innerHTML = scene.buttons[i].name.rawtext[0].text.replaceAll(" ", "&nbsp;");
      } else {
        buttons[i].innerHTML = scene.buttons[i].name.replaceAll(" ", "&nbsp;");
      }
      buttons[i].setAttribute("undef", "false");
    } else {
      buttons[i].innerHTML = "&nbsp;";
      buttons[i].setAttribute("undef", "true");
    }
  }
  
  project.scenes[num] = scene;
  updateScene();
}

function updateScene(){
  var scene = project.scenes[currentScene];
  
  scene.npc_name = document.getElementById("title").value;
  scene.scene_tag = document.getElementById("id").value;
  scene.text = document.getElementById("text").value;
  scene.on_open_commands = document.getElementById("onopen").value.split("\n");
  scene.on_close_commands = document.getElementById("onclose").value.split("\n");
  
  var buttons = document.getElementById("buttons").children;
  //scene.buttons = [];
  for(var i = 0; i < buttons.length; i++){
    if(buttons[i].getAttribute("undef") != "true"){
      buttons[i].classList.toggle("disabledHalf", false);
      buttons[i].classList.toggle("disabled", false);
    } else {
      if(buttons[i].previousElementSibling){
        if(buttons[i].previousElementSibling.getAttribute("undef") == "true"){
          buttons[i].classList.toggle("disabled", true);
          buttons[i].classList.toggle("disabledHalf", false);
        } else {
          buttons[i].classList.toggle("disabled", false);
          buttons[i].classList.toggle("disabledHalf", true);
        }
      } else {
        buttons[i].classList.toggle("disabled", false);
        buttons[i].classList.toggle("disabledHalf", true);
      }
    }
  }
  
  document.getElementById("selectscene").innerHTML = "";
  for(var i = 0; i < project.scenes.length; i++){
    var tag = project.scenes[i].scene_tag;
    if(tag == ""){
      tag = "(blank)";
    }
    document.getElementById("selectscene").innerHTML += "<option value='"+ i +"'>" + tag + "</option>";
  }
  document.getElementById("selectscene").value = currentScene;
}

var buttonIndex = 0;

function editButton(el, index){
  var undef = false;
  buttonIndex = index;
  document.getElementById("button-delete").style.display = "block";
  if(el.previousElementSibling){
    if(el.previousElementSibling.getAttribute("undef") == "true"){
      alert("You must define all previous buttons before you can define this one.");
      return;
    }
  }
  
  if(el.nextElementSibling){
    if(el.getAttribute("undef") == "true" || el.nextElementSibling.getAttribute("undef") == "false"){
      document.getElementById("button-delete").style.display = "none";
    }
  } else {
    if(el.getAttribute("undef") == "true"){
      document.getElementById("button-delete").style.display = "none";
    }
  }
  
  if(!project.scenes[currentScene].buttons[index]){
    project.scenes[currentScene].buttons.push({"name": "", "commands": []});
  }
  
  button = project.scenes[currentScene].buttons[index];

  document.getElementById("overlay").style.display = "block";
  document.getElementById("button-editor").style.display = "block";
  
  if(typeof button.name == 'object'){
    document.getElementById("button-name").value = button.name.rawtext[0].text;
  } else {
    document.getElementById("button-name").value = button.name;
  }
  
  document.getElementById("button-commands").value = button.commands.join("\n");

  el.innerHTML = "&nbsp;";
  el.setAttribute("undef", "false");
  
  document.getElementById("button-name").focus();
  
  updateScene();
}

function previewAction(el, index){
  if(!project.scenes[currentScene].buttons[index]){
    return;
  }
  var button = project.scenes[currentScene].buttons[index];
  var finished = false;
  var newScene = "";
  for(var i = 0; i < button.commands.length; i++){
    if(button.commands[i].includes("dialogue open") && !finished){
      var divided = button.commands[i].split(" ");
      newScene = divided[4];
      finished = true;
    }
  }
  if(finished){
    for(var i = 0; i < project.scenes.length; i++){
      if(project.scenes[i]["scene_tag"] == newScene){
        loadScene(i);
      }
    }
  }
}

function closeButtonEditor(ignoreUpdating){
  document.getElementById("overlay").style.display = "none";
  document.getElementById("button-editor").style.display = "none";
  
  if(!ignoreUpdating){
    if(document.getElementById("button-name").value == ""){
      document.getElementById("button-name").value = " ";
    }
    
    project.scenes[currentScene].buttons[buttonIndex].name = document.getElementById("button-name").value;
    project.scenes[currentScene].buttons[buttonIndex].commands = document.getElementById("button-commands").value.split("\n");

    var atitle = project.scenes[currentScene].buttons[buttonIndex].name.replaceAll(" ", "&nbsp;");

    if(atitle == ""){
      atitle = "&nbsp;";
    }

    document.getElementById("buttons").children[buttonIndex].innerHTML = atitle;
    updateScene();
  }
}

function deleteButton(){
  project.scenes[currentScene].buttons.splice(project.scenes[currentScene].buttons.length-1, 1);
  document.getElementById("buttons").children[buttonIndex].setAttribute("undef", "true");
  
  closeButtonEditor(true);
  updateScene();
}

function downloadasTextFile(filename, text) {
    var element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
    element.setAttribute('download', filename);

    element.style.display = 'none';
    document.body.appendChild(element);

    element.click();

    document.body.removeChild(element);
}

function saveProj() {
  var name = "";
  name = prompt("What would you like to name your project?","dialogue");
  if(name == null || name == "" || !name){
    return;
  }
  downloadasTextFile(name + ".json", JSON.stringify(proj));
}

function importProj(text){
  try{
    proj = JSON.parse(text);
  }catch(e){
    alert("Importing your project failed for the following reasons: " + e);
    return;
  }
  project = proj["minecraft:npc_dialogue"];
  loadScene(0);
}

document.getElementById('input-file').addEventListener('change', getFile);

function getFile(event) {
	const input = event.target
  if ('files' in input && input.files.length > 0) {
	  placeFileContent("null", input.files[0]);
  }
}

function placeFileContent(target, file) {
	readFileContent(file).then(content => {
  	importProj(content)
  }).catch(error => console.log(error))
}

function readFileContent(file) {
	const reader = new FileReader()
  return new Promise((resolve, reject) => {
    reader.onload = event => resolve(event.target.result)
    reader.onerror = error => reject(error)
    reader.readAsText(file)
  })
}

var example = {"format_version":"1.17.10","minecraft:npc_dialogue":{"scenes":[{"scene_tag":"home","text":"Welcome to the server!","npc_name":"Home","buttons":[{"name":"Teleport","commands":["/dialogue open @s @initiator warp"]},{"name":"Friends","commands":["/dialogue open @s @initiator friends"]},{"name":"Quests","commands":["/dialogue open @s @initiator quests"]},{"name":"§cReport player","commands":["/dialogue open @s @initiator report"]},{"name":"Discord","commands":["/dialogue open @s @initiator discord"]},{"name":"Close","commands":["undefined"]}],"on_open_commands":[""],"on_close_commands":[""]},{"scene_tag":"warp","text":"Please select an area to warp to.","npc_name":"Warp","buttons":[{"name":"§l&lt; Back","commands":["/dialogue open @s @initiator home"]}],"on_open_commands":[""],"on_close_commands":[""]},{"scene_tag":"quests","text":"Coming soon!","npc_name":"Quests","buttons":[{"name":"§l< Back","commands":["/dialogue open @s @initiator home"]}]},{"scene_tag":"discord","text":{"rawtext":[{"text":"§k§f.:.§r §bServername §k§f.:.§r\n\nOur discord server invite is\n§9discord.gg/invite§r\nYou can join us for special rewards and giveaways!\n"}]},"npc_name":"Discord server","buttons":[{"name":"Got it!","commands":["/dialogue open @s @initiator home"]}]},{"scene_tag":"report","text":"Found a rulebreaker? Report them on our Discord server or email us at\n§fserveremail@example.com§r\nPlease include video proof if possible. We're happy to help!","npc_name":"Report","buttons":[{"name":"§9Discord info","commands":["/dialogue open @s @initiator discord"]},{"name":"§l&lt; Back","commands":["/dialogue open @s @initiator home"]}],"on_open_commands":[""],"on_close_commands":[""]},{"scene_tag":"banned","text":"Oops! Looks like you've been §csuspended§r from this segment. Please contact the admins on our Discord server at\ndiscord.gg/ban-appeal\n to appeal your ban.","npc_name":"§lSuspended"}]}};