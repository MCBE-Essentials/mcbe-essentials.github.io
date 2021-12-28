if(window.location.href.includes("glitch.me") && window.localStorage.isDev != "true"){
  window.location.href = window.location.href.replace("glitch.me", "github.io");
}

if(location.protocol != "https:"){
window.location.href= (window.location.href).replaceAll("http:", "https:")
}

if(location.href[location.href.length-1] != "/" && location.pathname != "/loopr/"){
  window.location.href = location.href + "/";
}

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
function loadApp(path, type, elem){
  //main;list
  var svg = '<svg viewBox="0 0 24 24" class="' + path.icon.class[type] + '">' + path.icon.data + "</svg>";
  elem.innerHTML += svg;
  if(window.location.href == path.link){
    elem.setAttribute("class", "selected");
  } else {
    if(!path.tba){
      elem.setAttribute("onclick", "window.location.href='"+ path.link +"'");
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