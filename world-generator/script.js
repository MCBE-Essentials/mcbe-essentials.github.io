const nbt = require('prismarine-nbt');
const { Buffer } = require('buffer');
const jszip = new JSZip();
var worldArchive = false;
var leveldat = {};
var unparsedldb = {};
let isCustomBiomeMode = false; 

function selectWorldType(typeclass){
  for(let el of document.getElementById("main-page").getElementsByTagName("tr")){
    el.style.display = "none";
  }
  
  var group = document.getElementById("main-page").getElementsByClassName(typeclass);
  for(let el of group){
    el.style.display = "table-row";
  }
  
  var group = document.getElementById("main-page").getElementsByClassName('all');
  for(let el of group){
    el.style.display = "table-row";
  }
  
  fetchWorld(typeclass);
}

function loadWorldArchive(){
  worldArchive.file("level.dat").async("arrayBuffer").then(res => nbt.parse(Buffer.from(res))).then(function(result){
    unparsedldb = result;
    leveldat = result.parsed;
    if(leveldat.value.Generator.value == 2){
      flatWorldLayers = JSON.parse(leveldat.value["FlatWorldLayers"].value);
      renderFlatWorld();
    } else if(leveldat.value.Generator.value == 0) {      
      document.getElementById("old-width").value = leveldat.value.limitedWorldWidth.value;
      document.getElementById("old-depth").value = leveldat.value.limitedWorldDepth.value;
      document.getElementById("old-x").value = leveldat.value.LimitedWorldOriginX.value;
      document.getElementById("old-z").value = leveldat.value.LimitedWorldOriginZ.value;

      //document.getElementById("old-seed").value = "";
    } else {
      const savedBiome = leveldat.value.BiomeOverride ? leveldat.value.BiomeOverride.value : "minecraft:plains";
      
  if (biomeData[savedBiome]) {
    document.getElementById("inf-biome").value = savedBiome;
    isCustomBiomeMode = false;
  } else {
    isCustomBiomeMode = true;
  }

  leveldat.value.BiomeOverride.value = savedBiome;
}
  });
}

/*document.getElementById("file").addEventListener("change", function(){
  if(this.files && this.files[0]){
    var fr = new FileReader();
    fr.onload = function(e){      
      nbt.parse(Buffer.from(e.target.result)).then(function(data){
        console.log(data);
      });
    }
    fr.readAsArrayBuffer(this.files[0]);
    //Set global variable "filename" for use in exporting later
    filename = document.getElementById("file").files[0].name.split(".")[0];
  }
});*/

var biomeData = false;

async function fetchData(){
  var ids = await fetch('https://raw.githubusercontent.com/bridge-core/editor-packages/main/packages/minecraftBedrock/schema/general/vanilla/identifiers.json').then(data => data.json());
  //Using the dev domain so that list can be updated without updating site
  var biomes = await fetch('/data/biomes.json').then(data => data.json());
  identifiers = ids.definitions;
  biomeData = biomes;
  
  doIdentifiers();
}

var worldfiles = {
  flat: "/assets/worlds/Superflat%20Template.mcworld",
  infinite: "/assets/worlds/Infinite%20Single%20Biome%20Template.mcworld",
  old: "/assets/worlds/Old%20World%20Template.mcworld"
};

async function fetchWorld(type){
  await fetch(worldfiles[type]).then(resp => resp.arrayBuffer())
  .then(buf => jszip.loadAsync(Buffer.from(buf))).then(function(result){worldArchive = result; loadWorldArchive();})
}

var identifiers = {};
function doIdentifiers(){
  document.getElementById("block-identifiers").innerHTML = "";
  for(var i = 0; i < identifiers.prefixed_block_identifiers.enum.length; i++){
    document.getElementById("block-identifiers").innerHTML += 
      '<option value="'+ identifiers.prefixed_block_identifiers.enum[i] +'"></option>';
  }
  
  document.getElementById("flat-biome").innerHTML = "";
  document.getElementById("inf-biome").innerHTML = "";

  for(var i = 0; i < Object.keys(biomeData).length; i++){
    var key = Object.keys(biomeData)[i];
    
    if (biomeData[key].numeric) {
      document.getElementById("flat-biome").innerHTML += 
        '<option value="' + biomeData[key].numeric + '">' + key + '</option>';
    }
    
    document.getElementById("inf-biome").innerHTML += 
      '<option value="' + key + '">' + key + '</option>';
  }
}

fetchData();

// Listener for custom toggle 
document.getElementById("inf-custom-toggle").addEventListener("change", function() {
  isCustomBiomeMode = this.checked;
  
  if (isCustomBiomeMode) {
    // Show custom input, hide select vanilla 
    document.getElementById("inf-biome-custom").style.display = "block";
    document.getElementById("inf-biome-custom-warning").style.display = "block";
    document.getElementById("inf-biome").style.display = "none";
    
    // Applies custom value (if something has already been entered) 
    changeInfBiome(document.getElementById("inf-biome-custom").value.trim());
  } else {
    // Show select vanilla, hide custom.
    document.getElementById("inf-biome-custom").style.display = "none";
    document.getElementById("inf-biome-custom-warning").style.display = "none";
    document.getElementById("inf-biome").style.display = "block";
    
    changeInfBiome(document.getElementById("inf-biome").value.trim());
  }
});

// Listener para input custom
document.getElementById("inf-biome-custom").addEventListener("input", function() {
  if (isCustomBiomeMode) {
    changeInfBiome(this.value.trim());
  }
});

document.getElementById("inf-biome").addEventListener("change", function() {
  if (!isCustomBiomeMode) {
    changeInfBiome(this.value);
  }
});

/* 
<div class="app-inner-inner">
  <mcitem identifier="minecraft:grass_block" count="1" style="width:45px;height:45px;font-size:0pt;"></mcitem>
  <input value="minecraft:grass_block" class="app-input" style="font-size: 8pt; width: 200px;" list="block-identifiers">
  x
  <input type="number" value="1" class="app-input" min="1" max="340">
</div>
*/

var flatWorldLayers = {
  "biome_id": 1,
  "block_layers": [
      {
          "block_name": "minecraft:bedrock",
          "count": 1
      },
      {
          "block_name": "minecraft:dirt",
          "count": 2
      },
      {
          "block_name": "minecraft:grass",
          "count": 1
      }
  ],
  "encoding_version": 6,
  "structure_options": null,
  "world_version": "version.post_1_18"
};

function renderLayer(identifier, count, layerIndex){
  if(flatWorldLayers.block_layers[parseFloat(layerIndex)].block_data){
    delete flatWorldLayers.block_layers[parseFloat(layerIndex)].block_data;
  }
  
  var layer = document.createElement("div");
  layer.classList = ["app-inner-inner"];
  var itemEngine = document.createElement("mcitem");
  itemEngine.setAttribute("identifier", identifier);
  itemEngine.setAttribute("count", count);
  itemEngine.setAttribute("width", "45px");
  itemEngine.setAttribute("height", "45px");
  itemEngine.style = "font-size:6pt;cursor:default;";
  itemEngine.classList = ["nohover"];
  //itemEngine.setAttribute("allowlist", "identifiers.prefixed_block_identifiers.enum");

  var identifierInput = document.createElement("input");
  identifierInput.type = "text";
  identifierInput.classList = ["app-input"];
  identifierInput.style = "font-size: 8pt; width: 200px;";
  identifierInput.setAttribute("list", "block-identifiers");
  identifierInput.value = identifier;
  
  var text = document.createElement("span");
  text.innerHTML = "&nbsp;x&nbsp;";

  var countInput = document.createElement("input");
  countInput.type = "number";
  countInput.classList = ["app-input"];
  countInput.min = "1";
  countInput.value = count;
  
  var inputResponse = function(){
    flatWorldLayers.block_layers[parseFloat(layerIndex)] = {
      "block_name": identifierInput.value,
      "count": parseFloat(countInput.value)
    };
    itemEngine.setAttribute("identifier", identifierInput.value);
    itemEngine.setAttribute("count", countInput.value);
    mcitems.init();
    
    renderFlatWorld(true);
  }
  identifierInput.oninput = inputResponse;
  countInput.oninput = inputResponse;
  
  layer.appendChild(itemEngine);
  layer.appendChild(identifierInput);
  layer.appendChild(text);
  layer.appendChild(countInput);
    var buttons = document.createElement("div");
    buttons.style = "display: inline-block; cursor: pointer; margin-left: 10px; margin-right: 10px;";
    buttons.innerHTML = ' <img src="/assets/icons/copy.png" class="minibutton" onclick="duplicateLayer('+layerIndex+')"> <img src="/assets/icons/icon_trash.png" class="minibutton" onclick="deleteLayer('+layerIndex+')"> <img src="/assets/icons/arrow_down_small.png" onclick="moveLayer('+layerIndex+', 1)" style="-webkit-transform: scaleY(-1); transform: scaleY(-1);" class="minibutton"> <img src="/assets/icons/arrow_down_small.png" onclick="moveLayer('+layerIndex+', -1)" class="minibutton">';
  layer.appendChild(buttons);
  
  document.getElementById("layers-list").appendChild(layer);
  
  if(mcitems.data.items.items){
    mcitems.init();
  }
}

function newLayer(identifier, count){
  flatWorldLayers.block_layers.push({
    "block_name": identifier,
    "count": parseFloat(count)
  });
  
  renderFlatWorld();
}

function renderFlatWorld(justParse){
  if(!justParse){
    document.getElementById("layers-list").innerHTML = "";
    for(var i = 0; i < flatWorldLayers.block_layers.length; i++){
      var ind = flatWorldLayers.block_layers.length - (i + 1);
      var currentLayer = flatWorldLayers.block_layers[ind];
      renderLayer(currentLayer.block_name, currentLayer.count, ind);
    }

    document.getElementById("flat-biome").value = flatWorldLayers.biome_id;
    
    const checkbox = document.getElementById("flat-version-post-118");
    if (checkbox) {
      // If the template already has the tag, check the checkbox; otherwise, leave it unchecked. 
      checkbox.checked = !!flatWorldLayers.world_version;
    }
  }
  
  // Updates the JSON in level.dat
  leveldat.value["FlatWorldLayers"].value = JSON.stringify(flatWorldLayers);
  worldArchive.file("level.dat", nbt.writeUncompressed(leveldat, 'little'));
}

function duplicateLayer(index){
  flatWorldLayers.block_layers.splice(index, 0, flatWorldLayers.block_layers[index]);
  renderFlatWorld();
}

function deleteLayer(index){
  flatWorldLayers.block_layers.splice(index, 1);
  renderFlatWorld();
  if(flatWorldLayers.block_layers.length == 0){
    newLayer("minecraft:bedrock", "1"); 
  }
}

function moveLayer(index, mod){
  if(mod == -1 && index == 0){
    return;
  }
  flatWorldLayers.block_layers.splice(index + mod, 0, flatWorldLayers.block_layers.splice(index, 1)[0]);
  renderFlatWorld();
}

function changeFlatBiome(value){
  flatWorldLayers.biome_id = parseFloat(value);
  
  renderFlatWorld();
}

function changeInfBiome(value) {
  if (!value) return;

  // Always apply the value (whether from the vanilla select or the custom input). 
  leveldat.value.BiomeOverride.value = value.trim();
  
  if (leveldat.value.RandomSeed) delete leveldat.value.RandomSeed;
}

function changeInfSeed(value){
  if(document.getElementById("inf-seed").value === "" || document.getElementById("inf-seed").value === "0"){
    if(leveldat.value.RandomSeed) delete leveldat.value.RandomSeed
  } else {
    document.getElementById("inf-seed").value = Math.floor(parseFloat(document.getElementById("inf-seed").value));
    leveldat.value.RandomSeed = nbt.long(datHandler.generateLongTag(BigInt(document.getElementById("inf-seed").value)));
  }
}

function changeOldWorld(){
  leveldat.value.limitedWorldWidth.value = parseFloat(document.getElementById("old-width").value);
  leveldat.value.limitedWorldDepth.value = parseFloat(document.getElementById("old-depth").value);
  leveldat.value.LimitedWorldOriginX.value = parseFloat(document.getElementById("old-x").value);
  leveldat.value.LimitedWorldOriginZ.value = parseFloat(document.getElementById("old-z").value);
  
  if(document.getElementById("old-seed").value === "" || document.getElementById("old-seed").value === "0"){
    if(leveldat.value.RandomSeed) delete leveldat.value.RandomSeed
  } else {
    document.getElementById("old-seed").value = Math.floor(parseFloat(document.getElementById("old-seed").value));
    leveldat.value.RandomSeed = nbt.long(datHandler.generateLongTag(BigInt(document.getElementById("old-seed").value)));
  }
}

function flatVersioning(bool) {
  if (bool) {
    flatWorldLayers.world_version = "version.post_1_18";  // force always as a string 
    flatWorldLayers.encoding_version = 6;  // force always as a string 
  } else {
    delete flatWorldLayers.world_version;
  }
  
  renderFlatWorld();
}

function exportMcworld(){
  var filename = "custom_" + document.getElementById("worldtype").value + "_world";
  
  //Remove world icon & Fix world name
  leveldat.value["LevelName"].value = filename;
  worldArchive.remove('world_icon.jpeg');
  
  //Fix ldb
  var brokenldb = nbt.writeUncompressed(leveldat, 'little');
  var fixedldb = datHandler.fix(brokenldb);
  worldArchive.file("level.dat", fixedldb);
  worldArchive.generateAsync({type:"blob"})
  .then(function (blob) {
    saveAs(blob, filename + ".mcworld");
  });
}

selectWorldType("flat");
