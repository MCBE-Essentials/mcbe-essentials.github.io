var logdata = {};
var playerdata = {};
var filedata = {};

document.getElementById("file-log").addEventListener("change", function(){
  var file = this.files[0];
  var reader = new FileReader();
  reader.addEventListener("load",function() {
    filedata.log = reader.result;
    document.getElementById("btn-log").classList.toggle("gb-gray", true);
  });
  reader.readAsText(file);
});

document.getElementById("file-level").addEventListener('change', function() {
  var file = this.files[0];
  var reader = new FileReader();
  reader.addEventListener("load",function() {
    var data = reader.result;
    nbt.parse(data, function(error, d) {
      if (error) {
        throw error;
      }
      filedata.dat = d;
      document.getElementById("btn-level").classList.toggle("gb-gray", true);
    });
  });
  
  reader.readAsArrayBuffer(file);
});

document.getElementById("file-whitelist").addEventListener("change", function(){
  var file = this.files[0];
  var reader = new FileReader();
  reader.addEventListener("load",function() {
    try{filedata.whitelist = JSON.parse(reader.result);}catch(e){alert(e);}
    document.getElementById("btn-whitelist").classList.toggle("gb-gray", true);
  });
  if(file.name == "whitelist.json"){
    reader.readAsText(file);
  } else {
    alert("Oops! Make sure you upload a whitelist.json file.");
  }
});

document.getElementById("file-permissions").addEventListener("change", function(){
  var file = this.files[0];
  var reader = new FileReader();
  reader.addEventListener("load",function() {
    try{filedata.permissions = JSON.parse(reader.result);}catch(e){alert(e);}
    document.getElementById("btn-permissions").classList.toggle("gb-gray", true);
  });
  if(file.name == "permissions.json"){
    reader.readAsText(file);
  } else {
    alert("Oops! Make sure you upload a permissions.json file.");
  }
});

function analyze(){
  if(document.getElementById("input").value != ""){
    analyzeLog(document.getElementById("input").value.split("\n"));
  } else {
    if(filedata.log){
      analyzeLog(filedata.log.split("\n"));
    } else {
      //No log file
      alert("We're missing a server log file. Please upload a TXT or paste your server log in the text box.");
      return;
    }
  }
  
  if(filedata.dat){
    //Make sure log world name matches filedata world name
    if(filedata.dat.value.LevelName.value != logdata.levelName.replaceAll("\r", "")){
      if(!confirm("Looks like your level.dat world and server log's world have a different name.\n\nLevel.dat name:" + filedata.dat.value.LevelName.value + "\nLog name:" + logdata.levelName.replaceAll("\r", "") + "\n\nAre you sure these are the same world?")){
        return;
      }
    }
    analyzeGamerules(filedata.dat);
  }
  
  if(filedata.whitelist && filedata.whitelist.length > 0){
    //Make sure whitelist is indeed a whitelist file
    if(!Object.keys(filedata.whitelist[0]).includes("ignoresPlayerLimit")){
      alert("Your uploaded whitelist.json file doesn't appear to be a whitelist file.");
    }
  }
  
  if(filedata.permissions && filedata.permissions.length > 0){
    //Make sure permissions is indeed a permissions file
    if(!Object.keys(filedata.permissions[0]).includes("permission")){
      alert("Your uploaded permissions.json file doesn't appear to be a permission file.");
    }
  }
}

function analyzeLog(log){
  var input = log;  
  //Reset data
  logdata = {
    date: "",
    version: "",
    levelName: "",
    gamemode: "",
    difficulty: "",
    connections: 0,
    activerecord: 0,
    activity: [],
    players: [],
    connectionBlocks: []
  };
  
  //Extract data
  for(var i = 0; i < input.length; i++){
    if(input[i].includes(" INFO]")){
      //Information line ("Starting Server");
      var line = input[i];
      if(line.includes(" Starting Server")){
        //"Starting server" line, contains date and time
        line = line.slice(1);
        logdata.date = line.slice(0,19);
      } else if(line.includes("Version")){
        logdata.version = line.split(" Version ")[1];
      } else if(line.includes(" Level Name: ")){
        logdata.levelName = line.split(" Level Name: ")[1];
      } else if(line.includes(" Game mode: ")){
        logdata.gamemode = line.split(" Game mode: ")[1].split(" ")[1];
      } else if(line.includes(" Difficulty: ")){
        logdata.difficulty = line.split(" Difficulty: ")[1].split(" ")[1];
      } else {
        //Other, useless startup line
        //Do nothing
      }
    } else if(input[i].includes("[INFO]")){
      //Connection, deconnection, AutoCompaction or Stopping Server line
      
      var line = input[i];
      if(line.includes(" Player connected: ")){
        //Is of type 'connect'
        var entry = {
          type: 'connect',
          player: {
            name: line.split(" ")[3].replaceAll(",", ""),
            xuid: parseFloat(line.split(" ")[5])
          }
        };
        logdata.activity.push(entry);
        logdata.connections++;
      } else if(line.includes(" Player disconnected: ")){
        //Is of type 'disconnect'
        var entry = {
          type: 'disconnect',
          player: {
            name: line.split(" ")[3].replaceAll(",", ""),
            xuid: parseFloat(line.split(" ")[5])
          }
        };
        logdata.activity.push(entry);
      } else {
        //Other, useless information line
        //Do nothing
      }
    } else {
      //Manually entered user command line
      //Do nothing
    }
  }
  //Index players
  for(var i = 0; i < logdata.activity.length; i++){
    var fail = false;
    for(var a = 0; a < logdata.players.length; a++){
      if(logdata.players[a].xuid == logdata.activity[i].player.xuid){
        fail = true;
      }
    }
    if(!fail){
      logdata.players.push(logdata.activity[i].player);
    }
  }
  //Index connection blocks
  for(var i = 0; i < logdata.activity.length; i++){
    var block = [];
    if(i!=0){
      block = eval(JSON.stringify(logdata.connectionBlocks[i-1]));
    }
    if(logdata.activity[i].type == "connect"){
      if(!block.includes(logdata.activity[i].player.name)){
        block.push(logdata.activity[i].player.name);
      }
    } else if(logdata.activity[i].type == "disconnect"){
     if(block.includes(logdata.activity[i].player.name)){
      block.splice(block.indexOf(logdata.activity[i].player.name),1);
     }
    }
    logdata.connectionBlocks.push(block);
    if(block.length > logdata.activerecord){
      logdata.activerecord = block.length;
    }
  }
  //Create individual player stats
  for(var i = 0; i < logdata.players.length; i++){
    playerdata[logdata.players[i].name] = {};
  }
  
  for(var i = 0; i < logdata.connectionBlocks.length; i++){
    for(var a = 0; a < logdata.connectionBlocks[i].length; a++){
      var target = playerdata[logdata.connectionBlocks[i][a]];
      for(var b = 0; b < logdata.connectionBlocks[i].length; b++){
        if(!target[[logdata.connectionBlocks[i][b]]]){
          target[[logdata.connectionBlocks[i][b]]] = 0;
        }
        
        target[[logdata.connectionBlocks[i][b]]]++;
      }
    }
  }
  
  //Output to program
  document.getElementById("worldname").innerHTML = logdata.levelName;
  document.getElementById("gamemode").innerHTML = logdata.gamemode;
  document.getElementById("difficulty").innerHTML = logdata.difficulty;
  document.getElementById("date").value = logdata.date.split(" ")[0];
  document.getElementById("time").value = logdata.date.split(" ")[1];
  document.getElementById("mcversion").innerHTML = logdata.version;
  document.getElementById("connections").innerHTML = logdata.connections;
  document.getElementById("uniqueusers").innerHTML = logdata.players.length;
  document.getElementById("connecttop").innerHTML = logdata.activerecord;
  
  var playercontainer = document.getElementById("player-container");
  playercontainer.innerHTML = "";
  for(var i = 0; i < logdata.players.length; i++){
    var el = document.createElement("div");
    var name = logdata.players[i].name;
    if(filedata.permissions){
      var addon = "<img src='https://cdn.glitch.me/17ff8eee-9239-4ba0-8a5c-9263261550b5/permissions_member_star.png?v=1640636000793'>";
      for(var a = 0; a < filedata.permissions.length; a++){
        if(filedata.permissions[a].xuid == logdata.players[i].xuid){
          if(filedata.permissions[a].permission == "operator"){
            addon = "<img src='https://cdn.glitch.com/17ff8eee-9239-4ba0-8a5c-9263261550b5%2Fop.png?v=1617471878244'>";
          }
        }
      }
      name += addon;
    }
    
    if(filedata.whitelist){
      var addon = "<img src='https://cdn.glitch.me/17ff8eee-9239-4ba0-8a5c-9263261550b5/friend_glyph_desaturated.png?v=1640636148423' height='10'>";
      for(var a = 0; a < filedata.whitelist.length; a++){
        if(filedata.whitelist[a].xuid == logdata.players[i].xuid){
          addon = "<img src='https://cdn.glitch.me/17ff8eee-9239-4ba0-8a5c-9263261550b5/Friend2.png?v=1640636105523'>";
          if(filedata.whitelist[a].ignoresPlayerLimit){
            addon = "<img src='https://cdn.glitch.me/17ff8eee-9239-4ba0-8a5c-9263261550b5/FriendsIcon.png?v=1640636103384'>";
          }
        }
      }
      name += addon;
    }
    
    el.innerHTML = "<a class='preset' onclick='loadPlayer(logdata.players["+ i +"])'>" + name + "</a>";
    playercontainer.appendChild(el);
  }
  
  //Chart data
  
  //Delete all existing data
  for(var i = 0; i < totalChart.data.labels.length; i++){
    totalChart.data.labels.pop();
    totalChart.data.datasets[0].data.pop();
    i--;
  }
  
  //Add in new data
  for(var i = 0; i < logdata.connectionBlocks.length; i++){
    totalChart.data.labels.push('');
    totalChart.data.datasets[0].data.push(logdata.connectionBlocks[i].length);
  }
  
  totalChart.update();
}

function analyzeGamerules(dat){
  var lastPlayed = new Date(dat.value.LastPlayed.value[0] * 1000);
  var worldSeed = dat.value.RandomSeed.value[0];
  if(dat.value.Generator.value == 2){
    worldSeed = "FLAT ("+ worldSeed +")";
  }
  var spawnCoords = [dat.value.SpawnX.value, dat.value.SpawnY.value, dat.value.SpawnZ.value].join(", ");
  
  //Output to program
  document.getElementById("date2").value = lastPlayed.getFullYear()+"-"+(("0" + (lastPlayed.getMonth() + 1)).slice(-2))+"-"+(("0" + (lastPlayed.getDate() + 1)).slice(-2));
  document.getElementById("time2").value = lastPlayed.toTimeString().split(" ")[0];
  document.getElementById("seed").innerHTML = worldSeed;
  document.getElementById("worldspawn").innerHTML = spawnCoords;
}

function loadPlayer(data){
  document.getElementById("playername").innerHTML = data.name;
  document.getElementById("playerxuid").innerHTML = data.xuid;
  document.getElementById("playerconnections").innerHTML = playerdata[data.name][data.name];
  document.getElementById("playerperm").innerHTML = "Unknown/Default";
  document.getElementById("playerwlst").innerHTML = "Unknown";
  if(filedata.permissions){
    for(var i = 0; i < filedata.permissions.length; i++){
      if(filedata.permissions[i].xuid == data.xuid){
        var string = filedata.permissions[i].permission;
        document.getElementById("playerperm").innerHTML = string.charAt(0).toUpperCase() + string.slice(1);
      }
    }
  }
  
  if(filedata.whitelist){
    for(var i = 0; i < filedata.whitelist.length; i++){
      if(filedata.whitelist[i].xuid == data.xuid){
        document.getElementById("playerwlst").innerHTML = "Yes";
        if(filedata.whitelist[i].ignoresPlayerLimit){
          document.getElementById("playerwlst").innerHTML += "<br>(ignores player limit)<br>";
        }
      }
    }
  }
  
  //Chart
  
  //Delete data
  for(var i = 0; i < playerChart.data.labels.length; i++){
    playerChart.data.labels.pop();
    playerChart.data.datasets[0].data.pop();
    i--;
  }
  
  //Create data
  for(var i = 0; i < logdata.players.length; i++){
    if(logdata.players[i].name != data.name && playerdata[data.name][logdata.players[i].name] > 0){
      playerChart.data.labels.push(logdata.players[i].name);
      playerChart.data.datasets[0].data.push(playerdata[data.name][logdata.players[i].name]);
    }
  }
  playerChart.update();
}