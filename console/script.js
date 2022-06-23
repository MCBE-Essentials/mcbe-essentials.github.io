//Redirect to homepage if not child window
if(!window.opener) window.location.href = "/";

function closeOverlays(){
  var doc = window.opener.document;
  for(let el of doc.getElementsByClassName("tier-editor")){
    el.style.display = "none";
  }
  doc.getElementById("overlay").style.display = "none";
}

function newError(err){
  var area = document.getElementById("errors");
  var errEl = document.createElement("div");
  errEl.style = "background-color: #ff5f5f; border: 2px solid #a30000; padding: 2px;";
  errEl.innerHTML = "<a href='"+ err.url +"'><b>" + err.line + "</b></a>: " + err.data;
  
  area.appendChild(errEl);
}

function getStylesheets(){
  var area = document.getElementById("stylesheets");
  for(var i = 0; i < opener.document.getElementsByTagName("link").length; i++){
    var link = opener.document.getElementsByTagName("link")[i];
    if(link.rel == "stylesheet"){
      href = link.href.replaceAll(location.origin, "");
      area.innerHTML += "<li><input type='checkbox' checked oninput='doStylesheet(this, "+ i +")'> "+ href +"</li>";
    }
  }
}

function doStylesheet(checkbox, index){
  var el = opener.document.getElementsByTagName("link")[index];
  if(checkbox.checked){
    if(el.hasAttribute("dev-href")){
      el.href = el.getAttribute("dev-href");
      el.removeAttribute("dev-href");
    }
  } else {
    el.setAttribute("dev-href", href);
    el.href = "";
  }
}

getStylesheets();