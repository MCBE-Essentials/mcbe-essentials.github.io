var logdata = {};
var playerdata = {};

function analyze(){
  var input = document.getElementById("input").value.split("\n");  
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
  for(var i = 0; i < logdata.players.length; i++){
    var el = document.createElement("div");
    el.innerHTML = "<a class='preset' onclick='loadPlayer(logdata.players["+ i +"])'>" + logdata.players[i].name + "</a>";
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

function loadPlayer(data){
  document.getElementById("playername").innerHTML = data.name;
  document.getElementById("playerxuid").innerHTML = data.xuid;
  document.getElementById("playerconnections").innerHTML = playerdata[data.name][data.name];
  
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