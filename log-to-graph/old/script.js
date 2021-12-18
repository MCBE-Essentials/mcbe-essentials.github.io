function init(){
  if(getUrlParam("log", location.href)){
  var encodedLog = getUrlParam("log", location.href);
    if(getUrlParam("encoded") == "true"){var decodedLog = atob(encodedLog);}else{var decodedLog = encodedLog;}
    document.getElementById("area").value = decodedLog;
    document.getElementById("settings").style.display="none";
    listNames();
  } else {
    
  }
}

function encodeLog(){
  var area = document.getElementById("area");
  var encodedLog = btoa(area.value);
  var returnLog = "http://mcbe-essentials.glitch.me/log-to-graph/?encoded=true&log=" + encodedLog;
  area.value = returnLog;
  alert("Your server log has been encoded. Check the text box that you pasted your log in originally. It's a URL now (clickable link). Paste that into your browser and press Enter to see the graph. You may want to use a URL shortening service if you intend on sharing your graph with others.");
  return returnLog;
}

function textToArray(){
  var area = document.getElementById("area");             
  var lines = area.value.replace(/\r\n/g,"\n").split("\n");
  if(lines[0].includes("NO LOG FILE") == true){
    lines.splice(0, 1); 
  }
  return lines;
}

function deleteAutocompaction(){
  var i = 0;
  var deletedItems = 0;
  var array = textToArray();
  for (i = 0; i < array.length; i++){
    if(array[i].includes("Running AutoCompaction...") == true){
      array.splice(i, 1); 
      deletedItems++;
      i--;
    }
  }
  return array;
}

function removeUserCommands(){
  var i = 0;
  var deletedItems = 0;
  var array = deleteAutocompaction();
  for (i = 0; i < array.length; i++){
    if(array[i].includes("INFO]") == false){
      array.splice(i, 1); 
      deletedItems++;
      i--;
    }
  }
  return array;
}

function getBodyIndex(){
  var i = 0;
  var bodyStartsAt = 0;
  var array = deleteAutocompaction();
  for (i = 0; i < array.length; i++){
    if(array[i].includes("[INFO] Server started.") == true){
      return bodyStartsAt;
    }
    bodyStartsAt++;
  }
}

function returnBodyOnly(){
  var i = 0;
  var bodyStartsAt = getBodyIndex();
  var array = removeUserCommands();
  array.splice(0, (bodyStartsAt + 1));
  return array;
}

function returnUsernames() {
  var i = 0;
  var array = returnBodyOnly();
  for (i = 0; i < array.length; i++) {
      if (array[i].includes("[INFO] Player connected: ") == true) {
        array[i] = array[i].replace("[INFO] Player connected: ", "");
        array[i] = array[i].substring(0, array[i].length - 24);
        var temp = "+" + array[i];
        array[i] = temp;
      } else if (array[i].includes("[INFO] Player disconnected: ") == true) {
        array[i] = array[i].replace("[INFO] Player disconnected: ", "");
        array[i] = array[i].substring(0, array[i].length - 24);
        var temp = "-" + array[i];
        array[i] = temp;
      }
    }
  return array;
}

function neutralizeRepeatedConnections(){
  var i = 0;
  var deletedItems = 0;
  var array = returnUsernames();
  for (i = 0; i < array.length; i++){
    if(document.getElementById("norepeatedconnection").checked == true){
    if(array[i] === array[(i - 1)]){
      array.splice(i, 1);
      console.log(array[i] + " was removed due to repeated conncetion cancelling.");
      i--;
    }
  }
  }
  return array;  
}

function listNames() {
  var i = 0;
  var bodyStartsAt = getBodyIndex();
  var array = neutralizeRepeatedConnections();

  var currentNames = [];
  var result = [];

  document.getElementById("graph").innerHTML = "";
  for (i = 0; i < (array.length + 0); i++) {
          var tablerow = document.createElement("tr");
          var b;
          if (currentNames.length == 0) {
            if(document.getElementById("shownone").checked == true){
            tablerow.innerHTML = "<td><b><i>None</i></b></td>";
            }
          } else {
            for (b = 0; b < currentNames.length; b++) {
              tablerow.innerHTML += "<td>" + currentNames[b] + "</td>";
              //tablerow.innerHTML += currentNames[b];
              //tablerow.innerHTML += '</td>';
            }
          }
          document.getElementById("graph").appendChild(tablerow);
                
    //alert(currentNames);
    if (array[i].charAt(0) === "-") {
      array[i] = array[i].substring(1);
      //Splice current names
      var a;
      for (a = 0; a < currentNames.length; a++) {
        if (currentNames[a] === array[i]) {
          currentNames.splice(a, 1);
          a--;
        }
      }
      //End Splice
    }

    if (array[i].charAt(0) === "+") {
      array[i] = array[i].substring(1);
      currentNames.push(array[i]);
    }
  }
  return result;
}

function getUrlParam(param, url) {
  //Code from https://stackoverflow.com/questions/5194280/get-data-from-url
  param = param.replace(/([\[\](){}*?+^$.\\|])/g, "\\$1");
  var regex = new RegExp("[?&]" + param + "=([^&#]*)");
  url   = url || decodeURIComponent(window.location.href);
  var match = regex.exec(url);
  return match ? match[1] : "";
}