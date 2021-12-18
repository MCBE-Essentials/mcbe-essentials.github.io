//Table ID: document.getElementsByTagName("table")[8];

//Paste this in the console:
/*

function siphonTable(indexS){
var table = document.getElementsByTagName("table")[8];
var tablerows = table.children[0].children;
var output = [];
var index = "";
for (var i = 0; i < tablerows.length; i++){
output.push(tablerows[i].cells[indexS].innerHTML);
}
return output;
}
JSON.stringify(siphonTable(0));
*/

/*
var newdata = ...;

for(var i = 0; i < newdata.length; i++){
  if(data[i].identifier != newdata[i]){
    var entry = {};
    entry.identifier = newdata[i];
    entry.png = newdata[i];
    data.splice(i, 0, entry);
  }
}
*/
var data = [];

var xhttp = new XMLHttpRequest();
xhttp.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
       // Typical action to be performed when the document is ready:
       data = JSON.parse(xhttp.responseText);
       //data.definitions.entity_identifiers.enum
    }
};
xhttp.open("GET", "https://raw.githubusercontent.com/bridge-core/editor-packages/main/packages/minecraftBedrock/schema/general/vanilla/identifiers.json", true);
xhttp.send();