function copyText() {
  /* Get the text field */
  var copyText = document.getElementById("output");
  
  /* Enable the text field */
  copyText.disabled = false;
  
  /* Select the text field */
  copyText.select();
  copyText.setSelectionRange(0, 99999); /* For mobile devices */

  /* Copy the text inside the text field */
  document.execCommand("copy");

  /* Alert the copied text */
  //alert("Copied the text: " + copyText.value);
  
  /* Disable the text field */
  copyText.disabled = true;
}

var value, line, length;

function getUrlParam(param, url) {
  //Code from https://stackoverflow.com/questions/5194280/get-data-from-url
  param = param.replace(/([\[\](){}*?+^$.\\|])/g, "\\$1");
  var regex = new RegExp("[?&]" + param + "=([^&#]*)");
  //url = url || decodeURIComponent(window.location.href);
  var match = regex.exec(url);
  return match ? match[1] : "";
}

function init(hrefdef) {
  if (getUrlParam("mode", hrefdef)) {
    var encodedLog = getUrlParam("command", hrefdef);
      var decodedLog = atob(encodedLog);
    document.getElementById("wantedOutput").value = decodedLog;
    
    if (getUrlParam("mode", hrefdef) == "1") {
      document.getElementById("inval").value = atob(getUrlParam(
        "list",
        hrefdef
      ));
      document.getElementById("mode1").checked = true;
    } else if (getUrlParam("mode", hrefdef) == "2") {
      document.getElementById("repeatTimes").value = atob(getUrlParam(
        "list",
        hrefdef
      ));
      document.getElementById("mode2").checked = true;
    }
    if(!getUrlParam("edit-allowed", hrefdef) || getUrlParam("edit-allowed", hrefdef) == "false"){
      console.log("Link author has enabled preview mode.");
      for(var i = 0; i < document.getElementsByClassName("edit-only").length; i++){
        document.getElementsByClassName("edit-only")[i].style.display="none";
        document.getElementById("output").style.width = "60vw";
        document.getElementById("output").placeholder = "Looks like something may have gone wrong, please reload the page and if the issue persists, contact the Loop author and have them send you a new link.";
        document.getElementById("readonly").innerHTML = "This loop is in Read-Only mode. Please contact the author of the Loop if you want to be able to edit it.";
      }
      runLoop();
    } else {
    }
  }else{
    console.log("No mode defined in URL params, invalid");
  }
}

function exportUrl(edita) {
  var area = document.getElementById("wantedOutput");
  var mode;
  var list;
  if (radioValue() == "a") {
    mode = "1";
    list = btoa(document.getElementById("inval").value);
  } else if (radioValue() == "b") {
    mode = "2";
    list = btoa(document.getElementById("repeatTimes").value);
  }
  var encodedLog = btoa(area.value);
  var returnLog =
    "http://mcbe-essentials.github.io/loopr/?mode=" +
    mode +
    "&encoded=true&command=" +
    encodedLog +
    "&list=" +
    list;
    if(!document.getElementById("editallowed").checked || edita == true){
      returnLog += "&edit-allowed=true";
    }
  document.getElementById("shareOutput").value = returnLog;
  document.getElementById("share").style.display = "table-cell";
  return returnLog;
}

function checkRadios() {
  var value = radioValue();
  var listelem = document.getElementById("loopList");
  if (value == "a") {
    listelem.style.display = "block";
  } else {
    listelem.style.display = "none";
  }
}

function radioValue() {
  var radios = document.getElementsByName("type");

  for (var i = 0, length = radios.length; i < length; i++) {
    if (radios[i].checked) {
      // do whatever you want with the checked radio
      return radios[i].value;
    }
  }
}

function runLoop() {
  var i = 0;
  if (radioValue() == "b") {
 
    var incode = document.getElementById("wantedOutput");
    var innum = document.getElementById("repeatTimes");
    var out = "";
    for (i = 0; i < parseInt(innum.value, 10); i++) {
      var val = incode.value;
      
      line = i;
      length = parseInt(innum.value, 10);
      
      val = mathParam(val, "<<", ">>");
      
      out += val;
      //out += incode.value;
      if (i != parseInt(innum.value, 10) - 1) {
        out += "\n";
      }
    }
    document.getElementById("output").value = out;
  } else if (radioValue() == "a") {
    var incode = document.getElementById("wantedOutput");
    var inval = document.getElementById("inval").value;
    var invals = inval.split("\n");
    var out = "";

    for (i = 0; i < invals.length; i++) {
      var val = incode.value;
      line = i;
      value = invals[i];
      length = invals.length;
      
      val = mathParam(val, "<<", ">>");
      
      out += val;
      //out += incode.value;
      if (i != invals.length - 1) {
        out += "\n";
      }
    }
    document.getElementById("output").value = out;
  }
}

function mathParam(dataVal, prefix, suffix){
  var output = dataVal;
  output = output.split(prefix);
  for(var i = 0; i < output.length; i++){
    if(output[i].includes(suffix)){
      //This is a data value
      var splitVals = output[i].split(suffix);
      output.splice(i, 1);
      i--;
      for(var j = 0; j < splitVals.length; j++){
        output.splice(i + 1, 0, splitVals[j]);
        i++;
      }
      if(!output[i-1].includes("document") && !output[i-1].includes("console") && !output[i-1].includes("query") && !output[i-1].includes("window") && !output[i-1].includes("href") && !output[i-1].includes("alert") && !output[i-1].includes("confirm") && !output[i-1].includes("prompt") && !output[i-1].includes("history") && !output[i-1].includes("Function") && !output[i-1].includes("function") && !output[i-1].includes("import") && !output[i-1].includes("export") && !output[i-1].includes("eval") && !output[i-1].includes("location") && !output[i-1].includes("await") && !output[i-1].includes("async") && !output[i-1].includes("do ")){
        try {
            output[i-1] = eval(output[i -1]);
        } catch(catchError) {
            output[i-1] = "[JavaScript " + catchError + "]";
        }
      } else {
        output[i-1] = "[Illegal Code]";
      }
    }
    //
  }
  
  output = output.join("");
  return output;
  //
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
  name = prompt("What would you like to name your project?","My Loop");
  if(name == null || name == "" || !name){
    return;
  }
  downloadasTextFile(name + ".lpr", exportUrl(true));
}

function importProj(data) {
  var decodedData = data;
  init(decodedData);
  var filenameImported = document.getElementById('input-file').value.split(/(\\|\/)/g).pop();
  filenameImported = filenameImported.replaceAll(".lpr", "");
  document.getElementById("filename").value = filenameImported;
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
  	importProj(content);
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