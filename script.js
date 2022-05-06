function includeHTML() {
  var z, i, elmnt, file, xhttp;
  /* Loop through a collection of all HTML elements: */
  z = document.getElementsByTagName("*");
  for (i = 0; i < z.length; i++) {
    elmnt = z[i];
    /*search for elements with a certain atrribute:*/
    file = elmnt.getAttribute("id");
    if (file == "left") {
      /* Make an HTTP request using the attribute value as the file name: */
      xhttp = new XMLHttpRequest();
      xhttp.onreadystatechange = function() {
        if (this.readyState == 4) {
          if (this.status == 200) {elmnt.innerHTML = this.responseText;}
          if (this.status == 404) {elmnt.innerHTML = "Page not found.";}
          loadApps();
        }
      }
      xhttp.open("GET", "/left.html", true);
      xhttp.send();
      /* Exit the function: */
      return;
    }
  }
}

includeHTML();

if(window.location.href.includes("glitch.me") && window.localStorage.isDev != "true"){
  window.location.href = window.location.href.replace("glitch.me", "github.io");
}

if(window.location.host == "mcbe-essentials.glitch.me"){
  document.title = "[DEV BUILD] MCBE Essentials";
}

if(location.protocol != "https:"){
window.location.href= (window.location.href).replaceAll("http:", "https:")
}

if(location.href[location.href.length-1] != "/" && location.pathname != "/loopr/"){
  window.location.href = location.href + "/";
}

function loadApps(){
  if(window.location.pathname == "/home" || window.location.pathname == "/"){
    document.getElementById("left-tools").style.display = "none";
    list = document.getElementsByTagName("tbody")[0];
    for(var i = 0; i < list.getElementsByTagName("td").length; i++){
      loadApp(apps[i], 'main', list.getElementsByTagName("td")[i]);
    }
  } else {
    var list = document.getElementById("left-tools");
    for(var i = 0; i < list.children.length; i++){
      loadApp(apps[i], 'list', list.children[i]);
    }
  }
}
function loadApp(path, type, elem){
  //main;list
  var svg = '<svg viewBox="0 0 24 24" class="' + path.icon.class[type] + '">' + path.icon.data + "</svg>";
  elem.innerHTML += svg;
  
  var link = path.link;
  if(location.host == "mcbe-essentials.glitch.me"){
    link = link.replaceAll("github.io", "glitch.me");
    if(path.subapps){
      for(var a = 0; a < path.subapps.length; a++){
        path.subapps[a].link = path.subapps[a].link.replaceAll("github.io", "glitch.me");
      }
    }
  }
  
  if(window.location.href == link){
    elem.setAttribute("class", "selected");
    document.title = path.name + " - MCBE Essentials";
    if(path.confirmUnload){
      doUnload();
    }
  } else {
    if(!path.tba){
      elem.setAttribute("onclick", "window.location.href='"+ link +"'");
    }
  }
  
  if(path.subapps){
    for(var a = 0; a < path.subapps.length; a++){
      if(path.subapps[a].link == window.location.href){
        elem.setAttribute("class", "selected");
        document.title = path.subapps[a].name + " - MCBE Essentials";
      }
    }
  }
  
  if(type == "list"){
    var span = document.createElement("span");
    span.innerHTML = path.name;
    if(path.tba == true){
      span.innerHTML = "TBA";
    }
    if(path.beta == true){
      span.innerHTML += ' <tag class="smalltag" style="background-color:red;color:white;">BETA</tag>';
    }
    if(path.bridge == true){
      span.innerHTML += ' <tag class="smalltag" style="background-color:#0096c7;color:white;">BRIDGE</tag>';
    }
    elem.appendChild(span);
  }
  
  if(type == "main"){
    elem.innerHTML += '<br class="break">';
    var span = document.createElement("span");
    span.setAttribute("class", "tdtitle");
    span.innerHTML = path.name;
    if(path.tba == true){
      span.innerHTML = "TBA";
    }
    if(path.beta == true){
      span.innerHTML += ' <tag class="smalltag" style="background-color:red;color:white;">BETA</tag>';
    }
    if(path.bridge == true){
      span.innerHTML += ' <tag class="smalltag" style="background-color:#0096c7;color:white;">BRIDGE</tag>';
    }
    elem.appendChild(span);
  }
}

function toggleMenu(btn){
  if(document.getElementById("left").style.display != "block"){
    document.getElementById("left").style.display = "block";
    btn.style.backgroundColor = "#2e3148";
  } else {
    document.getElementById("left").style.display = "none";
    btn.style.backgroundColor = "#4a4a5c";
  }
}

document.getElementById("head").addEventListener("click", function(e){
  if(e.target.getAttribute("class").includes("imgicon")){
    window.location.href="/";
  }
});

if(window.localStorage.lastSavedData){
  delete window.localStorage.lastSavedData;
}

function doUnload(){
  window.addEventListener('beforeunload', function (e) {
    // Cancel the event
    e.preventDefault(); // If you prevent default behavior in Mozilla Firefox prompt will always be shown
    // Chrome requires returnValue to be set
    e.returnValue = '';
  });
}