const nbt = require('prismarine-nbt');
const { Buffer } = require('buffer');

var jszip = new JSZip();
var masterzip = "";
var packslist = [];
var currentPack = {};
var leveldat = {};
var mdata = {
  bplist: [],
  rplist: [],
  bps: [],
  rps: []
};
var wt_template = {
    "format_version": 2,
    "header": {
        "name": "",
        "description": "",
        "version": [ 1, 0, 0 ],
        "base_game_version": [ 1, 18, 0 ],
        "lock_template_options": false,
        "uuid": generateUUID()
    },
    "modules": [
        {
            "version": [ 1, 0, 0 ],
            "type": "world_template",
            "uuid": generateUUID()
        }
    ]
};

document.getElementById("file").addEventListener("change", function(){
  if(this.files && this.files[0]){
    jszip.loadAsync(this.files[0]).then(
      function(zip){
        masterzip = zip;
        if(!Object.keys(masterzip.files).includes("level.dat")){
          alert("Upload failed: World is missing a level.dat file.\n\nMake sure that the file is at the top level of the archive (e.g. it's not in a folder within your archive).");
          return;
        }
        if(!Object.keys(masterzip.files).includes("levelname.txt")){
          alert("Upload failed: World is missing a levelname.txt file.\n\nMake sure that the file is at the top level of the archive (e.g. it's not in a folder within your archive).");
          return;
        }
        /*if(!Object.keys(masterzip.files).includes("world_icon.jpeg")){
          alert("Upload failed: World is missing a world_icon.jpeg file.");
          return;
        }*/
        
        processProject();
        inForcedMode = false;
        closeEditors();
      }
    );
  }
});

document.getElementById("packfile").addEventListener("change", function(){
  if(this.files && this.files[0]){
    var testzip = new JSZip();
    testzip.loadAsync(this.files[0]).then(
      function(zip){
        processUplPack(zip);
      }
    );
  }
});

document.getElementById("packiconfile").addEventListener("change", function(){
  if(this.files && this.files[0]){
    var fr = new FileReader();
    fr.onload = function(e){
      if(currentPack){
        var foldertype = (currentPack.modules[0].type == "data" ? "behavior_packs" : "resource_packs");
        masterzip.file(foldertype + "/" + currentPack.metadata.folder + "/pack_icon.png", e.target.result.replace("data:image/png;base64,", ""), {base64: true});
        selectPack(document.getElementsByClassName("idlabel selected")[0]);
      } else {
        console.log('no');
      }
    };
    
    fr.readAsDataURL(this.files[0]);
  }
});

document.getElementById("worldiconfile").addEventListener("change", function(){
  if(this.files && this.files[0]){
    var fr = new FileReader();
    fr.onload = function(e){
      if(currentPack){
        masterzip.file("world_icon.jpeg", e.target.result.replace("data:image/jpeg;base64,", ""), {base64: true});
        openWorldSettings();
      } else {
        console.log('no current pack');
      }
    };
    
    fr.readAsDataURL(this.files[0]);
  }
});

var inForcedMode = false;
function closeEditors(){
  if(!inForcedMode){
    document.getElementById("overlay").style.display = "none";
    document.getElementById("settings-editor").style.display = "none";
    document.getElementById("gamerules-editor").style.display = "none";
    document.getElementById("restrictions-editor").style.display = "none";
    document.getElementById("misc-editor").style.display = "none";
    document.getElementById("upload-notice").style.display = "none";
    document.getElementById("download-notice").style.display = "none";
  }
}

function getLevelDat(){
  masterzip.file("level.dat").async("arraybuffer").then(function(inputfile){
    nbt.parse(Buffer.from(inputfile)).then(function(data){
      leveldat = data.parsed;
    });
  });
}

//Thanks to https://stackoverflow.com/a/43933693 for this essential piece of code!!
function concatenate(resultConstructor, ...arrays) {
  let totalLength = 0;
  for (const arr of arrays) {
    totalLength += arr.length;
  }
  const result = new resultConstructor(totalLength);
  let offset = 0;
  for (const arr of arrays) {
    result.set(arr, offset);
    offset += arr.length;
  }
  return result;
}

function updateLevelDat(){  
  var brokenldb = nbt.writeUncompressed(leveldat, 'little');
  var fixedldb = datHandler.fix(brokenldb);
  masterzip.file("level.dat", fixedldb);
}

function openWorldSettings(){
  document.getElementById("overlay").style.display = "block";
  document.getElementById("settings-editor").style.display = "block";
  
  if(masterzip.file("world_icon.jpeg") != null){
    masterzip.file("world_icon.jpeg").async("base64").then(function(result){
      document.getElementById("world-icon").src = "data:image/jpeg;base64," + result;
    });
  } else {
    document.getElementById("world-icon").src = "https://github.com/Mojang/bedrock-samples/raw/main/resource_pack/textures/ui/WorldDemoScreen_Big_Grayscale.png";
  }
  document.getElementById("ws-name").value = leveldat.value.LevelName.value;
  document.getElementById("ws-seed").innerHTML = leveldat.value.RandomSeed.value.valueOf().toString();
  document.getElementById("ws-difficulty").value = leveldat.value.Difficulty.value;
  document.getElementById("ws-gametype").value = leveldat.value.GameType.value;
  document.getElementById("ws-generator").value = leveldat.value.Generator.value;
  document.getElementById("ws-netherscale").value = leveldat.value.NetherScale.value;
  document.getElementById("ws-spawnx").value = leveldat.value.SpawnX.value;
  document.getElementById("ws-spawny").value = leveldat.value.SpawnY.value;
  document.getElementById("ws-spawnz").value = leveldat.value.SpawnZ.value;
  document.getElementById("ws-spawnmobs").checked = (leveldat.value.spawnMobs.value == 0 ? false : true);
  document.getElementById("ws-bonuschest").checked = (leveldat.value.bonusChestEnabled.value == 0 ? false : true);
  document.getElementById("ws-bonuschestspawned").checked = (leveldat.value.bonusChestSpawned.value == 0 ? false : true);
}
  
function openWorldGamerules(){
  document.getElementById("overlay").style.display = "block";
  document.getElementById("gamerules-editor").style.display = "block";
  
  document.getElementById("wg-commandblockoutput").checked = leveldat.value.commandblockoutput.value;
  document.getElementById("wg-commandblocksenabled").checked = leveldat.value.commandblocksenabled.value;
  document.getElementById("wg-commandsenabled").checked = leveldat.value.commandsEnabled.value;
  document.getElementById("wg-daylightcycle").checked = leveldat.value.dodaylightcycle.value;
  document.getElementById("wg-entitydrops").checked = leveldat.value.doentitydrops.value;
  document.getElementById("wg-firetick").checked = leveldat.value.dofiretick.value;
  document.getElementById("wg-immediaterespawn").checked = leveldat.value.doimmediaterespawn.value;
  document.getElementById("wg-insomnia").checked = leveldat.value.doinsomnia.value;
  document.getElementById("wg-mobloot").checked = leveldat.value.domobloot.value;
  document.getElementById("wg-mobspawning").checked = leveldat.value.domobspawning.value;
  document.getElementById("wg-tiledrops").checked = leveldat.value.dotiledrops.value;
  document.getElementById("wg-weathercycle").checked = leveldat.value.doweathercycle.value;
  document.getElementById("wg-drowningdamage").checked = leveldat.value.drowningdamage.value;
  document.getElementById("wg-falldamage").checked = leveldat.value.falldamage.value;
  document.getElementById("wg-firedamage").checked = leveldat.value.firedamage.value;
  //freezedamage
  document.getElementById("wg-forcegamemode").checked = leveldat.value.ForceGameType.value;
  document.getElementById("wg-funclimit").value = leveldat.value.functioncommandlimit.value;
  document.getElementById("wg-keepinventory").checked = leveldat.value.keepinventory.value;
  document.getElementById("wg-mobgriefing").checked = leveldat.value.mobgriefing.value;
  document.getElementById("wg-naturalregen").checked = leveldat.value.naturalregeneration.value;
  document.getElementById("wg-randomtick").value = leveldat.value.randomtickspeed.value;
  document.getElementById("wg-sendcommandfeedback").checked = leveldat.value.sendcommandfeedback.value;
  document.getElementById("wg-showcoordiantes").checked = leveldat.value.showcoordinates.value;
  document.getElementById("wg-showdeathmessages").checked = leveldat.value.showdeathmessages.value;
  document.getElementById("wg-tntexplodes").checked = leveldat.value.tntexplodes.value;
  document.getElementById("wg-spawnradius").value = leveldat.value.spawnradius.value;
  document.getElementById("wg-chainlimit").value = leveldat.value.maxcommandchainlength.value;
}
  
function openWorldRestrictions(){
  document.getElementById("overlay").style.display = "block";
  document.getElementById("restrictions-editor").style.display = "block";
  
  document.getElementById("wr-creative").checked = leveldat.value.hasBeenLoadedInCreative.value;
  document.getElementById("wr-lockedbp").checked = leveldat.value.hasLockedBehaviorPack.value;
  document.getElementById("wr-lockedrp").checked = leveldat.value.hasLockedResourcePack.value;
  document.getElementById("wr-immutableworld").checked = leveldat.value.immutableWorld.value;
  document.getElementById("wr-fromlockedtemplate").checked = leveldat.value.isFromLockedTemplate.value;
  document.getElementById("wr-fromtemplate").checked = leveldat.value.isFromWorldTemplate.value;
  document.getElementById("wr-fromtemplateoptionlocked").checked = leveldat.value.isWorldTemplateOptionLocked.value;
  document.getElementById("wr-limitedx").value = leveldat.value.LimitedWorldOriginX.value;
  document.getElementById("wr-limitedy").value = leveldat.value.LimitedWorldOriginY.value;
  document.getElementById("wr-limitedz").value = leveldat.value.LimitedWorldOriginZ.value;
  
  if(leveldat.value.limitedWorldWidth){
    document.getElementById("wr-limitedwidth").value = leveldat.value.limitedWorldWidth.value;
    document.getElementById("wr-limitedwidth").disabled = false;
  } else {
    document.getElementById("wr-limitedwidth").disabled = true;
  }
  
  if(leveldat.value.limitedWorldDepth){
    document.getElementById("wr-limiteddepth").value = leveldat.value.limitedWorldDepth.value;
    document.getElementById("wr-limiteddepth").disabled = false;
  } else {
    document.getElementById("wr-limiteddepth").disabled = true;
  }
  
  document.getElementById("wr-texturerequired").checked = leveldat.value.texturePacksRequired.value;
  
  if(leveldat.value.experiments){
    document.getElementById("removeExperiments").style.display = "block";
  } else {
    document.getElementById("removeExperiments").style.display = "none";
  }
}
  
function openWorldMisc(){
  document.getElementById("overlay").style.display = "block";
  document.getElementById("misc-editor").style.display = "block";
  
  document.getElementById("wm-centermaps").checked = leveldat.value.CenterMapsToOrigin.value;
  document.getElementById("wm-education").checked = leveldat.value.educationFeaturesEnabled.value;
  document.getElementById("wm-spawnv1").checked = leveldat.value.SpawnV1Villagers.value;
  document.getElementById("wm-simdistance").value = leveldat.value.serverChunkTickRange.value;
  document.getElementById("wm-startingmap").checked = leveldat.value.startWithMapEnabled.value;
  document.getElementById("wm-usegamertags").checked = leveldat.value.useMsaGamertagsOnly.value;
  document.getElementById("wm-multiplayer").checked = leveldat.value.MultiplayerGame.value;
  document.getElementById("wm-multiplayervisible").checked = leveldat.value.MultiplayerGameIntent.value;
  document.getElementById("wm-visibility").value = leveldat.value.XBLBroadcastIntent.value;
  document.getElementById("wm-lanbroadcase").checked = leveldat.value.LANBroadcast.value;
  document.getElementById("wm-lanvisible").checked = leveldat.value.LANBroadcastIntent.value;
}

function updateWorldSettings() {
  //Update the important stat
  leveldat.value.LevelName.value = document.getElementById("ws-name").value;
  //Update levelname.txt
  masterzip.file("levelname.txt", document.getElementById("ws-name").value);
  //leveldat.value.RandomSeed.value[1] = parseFloat(document.getElementById("ws-seed").value);
  leveldat.value.Difficulty.value = parseFloat(document.getElementById("ws-difficulty").value);
  leveldat.value.GameType.value = parseFloat(document.getElementById("ws-gametype").value);
  leveldat.value.Generator.value = parseFloat(document.getElementById("ws-generator").value);
  leveldat.value.NetherScale.value = parseFloat(document.getElementById("ws-netherscale").value);
  leveldat.value.SpawnX.value = parseFloat(document.getElementById("ws-spawnx").value);
  leveldat.value.SpawnY.value = parseFloat(document.getElementById("ws-spawny").value);
  leveldat.value.SpawnZ.value = parseFloat(document.getElementById("ws-spawnz").value);
  leveldat.value.spawnMobs.valvue = (document.getElementById("ws-spawnmobs").checked == true ? 1 : 0);
  leveldat.value.bonusChestEnabled.value = (document.getElementById("ws-bonuschest").checked == true ? 1 : 0);
  leveldat.value.bonusChestSpawned.value = (document.getElementById("ws-bonuschestspawned").checked == true ? 1 : 0);
  
  //Update level.dat inside zip file
  updateLevelDat();
}

function updateGamerules(){
  leveldat.value.commandblockoutput.value = (document.getElementById("wg-commandblockoutput").checked == true ? 1 : 0);
  leveldat.value.commandblocksenabled.value = (document.getElementById("wg-commandblocksenabled").checked == true ? 1 : 0);
  leveldat.value.commandsEnabled.value = (document.getElementById("wg-commandsenabled").checked == true ? 1 : 0);
  leveldat.value.dodaylightcycle.value = (document.getElementById("wg-daylightcycle").checked == true ? 1 : 0);
  leveldat.value.doentitydrops.value = (document.getElementById("wg-entitydrops").checked == true ? 1 : 0);
  leveldat.value.dofiretick.value = (document.getElementById("wg-firetick").checked == true ? 1 : 0);
  leveldat.value.doimmediaterespawn.value = (document.getElementById("wg-immediaterespawn").checked == true ? 1 : 0);
  leveldat.value.doinsomnia.value = (document.getElementById("wg-insomnia").checked == true ? 1 : 0);
  leveldat.value.domobloot.value = (document.getElementById("wg-mobloot").checked == true ? 1 : 0);
  leveldat.value.domobspawning.value = (document.getElementById("wg-mobspawning").checked == true ? 1 : 0);
  leveldat.value.dotiledrops.value = (document.getElementById("wg-tiledrops").checked == true ? 1 : 0);
  leveldat.value.doweathercycle.value = (document.getElementById("wg-weathercycle").checked == true ? 1 : 0);
  leveldat.value.drowningdamage.value = (document.getElementById("wg-drowningdamage").checked == true ? 1 : 0);
  leveldat.value.falldamage.value = (document.getElementById("wg-falldamage").checked == true ? 1 : 0);
  leveldat.value.firedamage.value = (document.getElementById("wg-firedamage").checked == true ? 1 : 0);
  //freezedamage
  leveldat.value.ForceGameType.value = (document.getElementById("wg-forcegamemode").checked == true ? 1 : 0);
  leveldat.value.functioncommandlimit.value = parseFloat(document.getElementById("wg-funclimit").value);
  leveldat.value.keepinventory.value = (document.getElementById("wg-keepinventory").checked == true ? 1 : 0);
  leveldat.value.mobgriefing.value = (document.getElementById("wg-mobgriefing").checked == true ? 1 : 0);
  leveldat.value.naturalregeneration.value = (document.getElementById("wg-naturalregen").checked == true ? 1 : 0);
  leveldat.value.randomtickspeed.value = parseFloat(document.getElementById("wg-randomtick").value);
  leveldat.value.sendcommandfeedback.value = (document.getElementById("wg-sendcommandfeedback").checked == true ? 1 : 0);
  leveldat.value.showcoordinates.value = (document.getElementById("wg-showcoordiantes").checked == true ? 1 : 0);
  leveldat.value.showdeathmessages.value = (document.getElementById("wg-showdeathmessages").checked == true ? 1 : 0);
  leveldat.value.tntexplodes.value = (document.getElementById("wg-tntexplodes").checked == true ? 1 : 0);
  leveldat.value.spawnradius.value = parseFloat(document.getElementById("wg-spawnradius").value);
  leveldat.value.maxcommandchainlength.value = parseFloat(document.getElementById("wg-chainlimit").value);
  
  //Update level.dat inside zip file
  updateLevelDat();
}

function updateRestrictions(){
  leveldat.value.hasBeenLoadedInCreative.value = (document.getElementById("wr-creative").checked == true ? 1 : 0);
  leveldat.value.hasLockedBehaviorPack.value = (document.getElementById("wr-lockedbp").checked == true ? 1 : 0);
  leveldat.value.hasLockedResourcePack.value = (document.getElementById("wr-lockedrp").checked == true ? 1 : 0);
  leveldat.value.immutableWorld.value = (document.getElementById("wr-immutableworld").checked == true ? 1 : 0);
  leveldat.value.isFromLockedTemplate.value = (document.getElementById("wr-fromlockedtemplate").checked == true ? 1 : 0);
  leveldat.value.isFromWorldTemplate.value = (document.getElementById("wr-fromtemplate").checked == true ? 1 : 0);
  leveldat.value.isWorldTemplateOptionLocked.value = (document.getElementById("wr-fromtemplateoptionlocked").checked == true ? 1 : 0);
  leveldat.value.LimitedWorldOriginX.value = parseFloat(document.getElementById("wr-limitedx").value);
  leveldat.value.LimitedWorldOriginY.value = parseFloat(document.getElementById("wr-limitedy").value);
  leveldat.value.LimitedWorldOriginZ.value = parseFloat(document.getElementById("wr-limitedz").value);
  leveldat.value.limitedWorldWidth.value = parseFloat(document.getElementById("wr-limitedwidth").value);
  leveldat.value.limitedWorldDepth.value = parseFloat(document.getElementById("wr-limiteddepth").value);
  leveldat.value.texturePacksRequired.value = (document.getElementById("wr-texturerequired").checked == true ? 1 : 0);
  
  //Update level.dat inside zip file
  updateLevelDat();
}

function removeExperiments(){
  var currentExperiments = Object.keys(leveldat.value.experiments.value);
  currentExperiments = currentExperiments.filter(item => !['experiments_ever_used', 'saved_with_toggled_experiments'].includes(item));
  
  if(
    confirm(
      "Are you SURE you want to remove all experimental gameplay toggles on the world? This can seriously damage the world you're editing.\n\n" +
      "The following toggles will be disabled: \n" +
      currentExperiments.join("\n") +
      "\n\nAre you sure you want to proceed?"
    )
  ){
    delete leveldat.value.experiments;
    updateLevelDat();
    openWorldRestrictions();
  }
}

function updateWorldMisc() {
  leveldat.value.CenterMapsToOrigin.value = (document.getElementById("wm-centermaps").checked == true ? 1 : 0);
  leveldat.value.educationFeaturesEnabled.value = (document.getElementById("wm-education").checked == true ? 1 : 0);
  leveldat.value.SpawnV1Villagers.value = (document.getElementById("wm-spawnv1").checked == true ? 1 : 0);
  leveldat.value.serverChunkTickRange.value = parseFloat(document.getElementById("wm-simdistance").value);
  leveldat.value.startWithMapEnabled.value = (document.getElementById("wm-startingmap").checked == true ? 1 : 0);
  leveldat.value.useMsaGamertagsOnly.value = (document.getElementById("wm-usegamertags").checked == true ? 1 : 0);
  leveldat.value.MultiplayerGame.value = (document.getElementById("wm-multiplayer").checked == true ? 1 : 0);
  leveldat.value.MultiplayerGameIntent.value = (document.getElementById("wm-multiplayervisible").checked == true ? 1 : 0);
  leveldat.value.XBLBroadcastIntent.value = parseFloat(document.getElementById("wm-visibility").value);
  leveldat.value.LANBroadcast.value = (document.getElementById("wm-lanbroadcase").checked == true ? 1 : 0);
  leveldat.value.LANBroadcastIntent.value = (document.getElementById("wm-lanvisible").checked == true ? 1 : 0);
  
  //Update level.dat inside zip file
  updateLevelDat();
}

function processProject(){
  getLevelDat();
  var files = Object.keys(masterzip.files);
  if(!files.includes("world_behavior_packs.json")){
    masterzip.file("world_behavior_packs.json", '[{}]');
  }
  if(!files.includes("world_resource_packs.json")){
    masterzip.file("world_resource_packs.json", '[{}]');
  }
  if(files.includes("manifest.json")){
    document.getElementById("add-wt").style.display = "none";
    document.getElementById("wt-settings").style.display = "block";
    readWT();
  }
  
  doPacks();
  
  if(masterzip.file("world_icon.jpeg") != null){
    masterzip.file("world_icon.jpeg").async("base64").then(function(result){
      document.getElementById("world-icon").src = "data:image/jpeg;base64," + result;
    });
  } else {
    document.getElementById("world-icon").src = "https://github.com/Mojang/bedrock-samples/raw/main/resource_pack/textures/ui/WorldDemoScreen_Big_Grayscale.png";
  }
}

function packsList(list){
  var listEl = document.getElementById("pack-list");
  listEl.innerHTML = "";
  for(var i = 0; i < list.length; i++){
    //console.log(list[i]);
    listEl.innerHTML += '<span class="idlabel '+ list[i].type +'" onclick="selectPack(this)" draggable="false" uuid="'+ list[i].uuid +'">'+ list[i].display +'</span>';
  }
}

function selectPack(el){
  var uuid = el.getAttribute("uuid");
  var packtype = el.classList[1] + "s";
  var manifest = {};
  
  for(var i = 0; i < document.getElementsByClassName("idlabel").length; i++){
    document.getElementsByClassName("idlabel")[i].classList.toggle("selected", false);
  }
  
  el.classList.toggle("selected", true);
  for(var i = 0; i < mdata[packtype].length; i++){
    if(mdata[packtype][i].header.uuid == uuid){
      manifest = mdata[packtype][i];
    }
  }
  if(manifest.header){
    currentPack = manifest;
  }
  
  document.getElementById("pack-version").value = unifyVersion(currentPack.header.version);
  document.getElementById("pack-me-version").value = unifyVersion(currentPack.header.min_engine_version);
  
  document.getElementById("pack-title").value = currentPack.header.name;
  document.getElementById("pack-desc").value = currentPack.header.description;
  
  var foldertype = (packtype == "bps" ? "behavior_packs" : "resource_packs");
  
  //LOADING IMAGE document.getElementById("pack-icon").src = "https://cdn.glitch.com/17ff8eee-9239-4ba0-8a5c-9263261550b5%2Fbook.png?v=1619285887129";
  
  if(masterzip.file(foldertype + "/" + currentPack.metadata.folder + "/pack_icon.png") == null){
    //No pack icon
    document.getElementById("pack-icon").src = 'https://raw.githubusercontent.com/bedrock-dot-dev/packs/master/stable/resource/pack_icon.png';
  } else {
    masterzip.file(foldertype + "/" + currentPack.metadata.folder + "/pack_icon.png").async("base64").then(function(result){
      document.getElementById("pack-icon").src = "data:image/png;base64," + result;
    })
  }
}

function movePack(mode){
  var modifier = 1;
  if(mode == "up"){
    modifier = -1;
  }
  
  var index = 0;
  for(var i = 0; i < packslist.length; i++){
    if(packslist[i].uuid == currentPack.header.uuid){
      index = i;
    }
  }
  
  var item = JSON.parse(JSON.stringify(packslist[index]));
  
  if(index + modifier < packslist.length && index + modifier > -1){
    packslist.splice(index, 1);
    packslist.splice(index + modifier, 0, item);

    packsList(packslist);
    selectPack(document.getElementsByClassName("idlabel")[index+modifier]);
  }
  
  //Rewrite world_*_packs.json
  var wbp = [];
  var wrp = [];
  for(var i = 0; i < packslist.length; i++){
    if (packslist[i].type == "bp") {
      wbp.push({
        "pack_id" : packslist[i].uuid,
        "version" : packslist[i].version
      });
    } else if (packslist[i].type == "rp") {
      wrp.push({
        "pack_id" : packslist[i].uuid,
        "version" : packslist[i].version
      });
    }
  }
  
  masterzip.file("world_behavior_packs.json", JSON.stringify(wbp, null, 3));
  masterzip.file("world_resource_packs.json", JSON.stringify(wrp, null, 3));
}

function doPacks(){
  document.getElementById("pack-list").innerHTML = "";
  mdata = {
    bplist: [],
    rplist: [],
    bps: [],
    rps: []
  };
  packslist = [];
  
  if(masterzip.folder(/behavior_packs/)){
    for(var i = 0; i < Object.keys(masterzip.files).length; i++){
      var fiq = masterzip.files[Object.keys(masterzip.files)[i]];
      if(fiq.name.startsWith("behavior_packs") && !fiq.dir){
        //It's a file within the behavior packs directory
        if(fiq.name.includes("/manifest.json")){
          //It's a manifest.json file.
          const fiqName = fiq.name;
          getFile(fiq.name).then(function(result){
            result = JSON.parse(result);
            if(mdata.bps.filter(e => e.header.uuid === result.header.uuid).length == 0){
              if(!result.metadata) result.metadata = {};
              result.metadata.folder = fiqName.split("/")[1];
              mdata.bps.push(result);
            } else {
              alert("Multiple behavior packs with the same UUID were found. Only the first example will show up in the editor.");
            }

          })
        }
        /*if(fiq.name.includes("/en_US.lang")){
          //It's a language file, make sure the contents don't include "pack.name"
          getFile(fiq.name).then(function(result){
            result = parseLanguage(result);
            if(Object.keys(result).includes('pack.name')){
              mdata.bps[mdata.bps.length-1].header.name.replaceAll("pack.name", result["pack.name"]);
            }
          })
        }*/
      }
    }
  }
  
  if(masterzip.folder(/resource_packs/)){
    for(var i = 0; i < Object.keys(masterzip.files).length; i++){
      var fiq = masterzip.files[Object.keys(masterzip.files)[i]];
      if(fiq.name.startsWith("resource_packs") && !fiq.dir){
        //It's a file within the resource packs directory
        if(fiq.name.includes("/manifest.json")){
          //It's a manifest.json file.
          const fiqName = fiq.name;
          getFile(fiq.name).then(function(result){
            result = JSON.parse(result);
            if(mdata.rps.filter(e => e.header.uuid === result.header.uuid).length == 0){
              if(!result.metadata) result.metadata = {};
              result.metadata.folder = fiqName.split("/")[1];
              mdata.rps.push(result);
            } else {
              alert("Multiple resource packs with the same UUID were found. Only the first example will show up in the editor.");
            }
          })
        }
        /*if(fiq.name.includes("/en_US.lang")){
          //It's a language file, make sure the contents don't include "pack.name"
          getFile(fiq.name).then(function(result){
            result = parseLanguage(result);
            if(Object.keys(result).includes('pack.name')){
              mdata.rps[mdata.rps.length-1].header.name.replaceAll("pack.name", result["pack.name"]);
            }
          })
        }*/
      }
    }
  }
  
  if(getFile("world_behavior_packs.json")){
    getFile("world_behavior_packs.json").then(
      function(bplist){
        bplist = JSON.parse(bplist);
        mdata.bplist = bplist;
        for(var i = 0; i < bplist.length; i++){
          var uuid = bplist[i].pack_id;
          var version = bplist[i].version;
          for(var a = 0; a < mdata.bps.length; a++){
            if(mdata.bps[a].header.uuid == uuid && unifyVersion(mdata.bps[a].header.version) == unifyVersion(version)){
              packslist.push(
                {
                  type: 'bp',
                  uuid: mdata.bps[a].header.uuid,
                  version: mdata.bps[a].header.version,
                  name: mdata.bps[a].header.name,
                  display: mdata.bps[a].metadata.folder
                }
              );
              packsList(packslist);
            }
          }
        }
      }
    )
  }
  
  if(getFile("world_resource_packs.json")){
    getFile("world_resource_packs.json").then(
      function(rplist){
        rplist = JSON.parse(rplist);
        mdata.rplist = rplist;
        for(var i = 0; i < rplist.length; i++){
          var uuid = rplist[i].pack_id;
          var version = rplist[i].version;
          for(var a = 0; a < mdata.rps.length; a++){
            if(mdata.rps[a].header.uuid == uuid && unifyVersion(mdata.rps[a].header.version) == unifyVersion(version)){
              packslist.push(
                {
                  type: 'rp',
                  uuid: mdata.rps[a].header.uuid,
                  name: mdata.rps[a].header.name,
                  version: mdata.rps[a].header.version,
                  display: mdata.rps[a].metadata.folder
                }
              );
              packsList(packslist);
            }
          }
        }
      }
    )
  }
}

function getFile(filepath, origin){
  if(!origin) origin = masterzip;
  
  if(masterzip.file(filepath)){
    return origin.file(filepath).async("text");
  } else {
    return false;
  }
}

function unifyVersion(v){
  if(v.constructor == Array){
    v = v.join(".");
  }
  return v;
}

function updateVersion(toUpdate, value){
  if(toUpdate.constructor == Array){
    value = value.split(".");
    
    for(var i = 0; i < value.length; i++){
      value[i] = parseFloat(value[i]);
    }
  }
  
  toUpdate = value;
  return value;
}

function parseLanguage(language){
  language = language.split("\n");
  var outputLanguage = {};
  for(var i = 0; i < language.length; i++){
    if(language[i].includes("##")){
      language.splice(i, 1); i--;
    }
  }
  
  for(var i = 0; i < language.length; i++){
    if(!language[i].includes("##")){
      outputLanguage[language[i].split("=")[0]] = language[i].split("=")[1];
    }
  }
  
  return outputLanguage;
}

function updateManifest(){
  currentPack.header.version = updateVersion(currentPack.header.version, document.getElementById("pack-version").value);
  currentPack.header.min_engine_version = updateVersion(currentPack.header.min_engine_version, document.getElementById("pack-me-version").value);
  
  currentPack.header.name = document.getElementById("pack-title").value;
  currentPack.header.description = document.getElementById("pack-desc").value;
  
  var packtype = (currentPack.modules[0].type == "data" ? "behavior_packs" : "resource_packs");
  var fileManifest = JSON.parse(JSON.stringify(currentPack));
  delete fileManifest.metadata.folder;
  masterzip.file(packtype + "/" + currentPack.metadata.folder + "/manifest.json", JSON.stringify(fileManifest, null, 3));
}

function processUplPack(zip){
  var filenames = Object.keys(zip.files);
  if(!filenames.includes("manifest.json")){
    alert("Uploaded pack does not include a manifest.json file."); return;
  }
  if(!filenames.includes("pack_icon.png")){
    alert("Uploaded pack does not include a pack_icon.png file."); return;
  }
  
  zip.file("manifest.json").async("text").then(function(manifestResult){
    manifestResult = JSON.parse(manifestResult);
    if(manifestResult.modules[0].type == "resources"){
      addUplPack(manifestResult.header.name, "resource_packs", zip, manifestResult);
    } else if(manifestResult.modules[0].type == "data") {
      addUplPack(manifestResult.header.name, "behavior_packs", zip, manifestResult);
    } else {
      alert("Unrecognized pack type.");
      return;
    }
  });
}

function addUplPack(name, type, zip, manifest){
  var filenames = Object.keys(zip.files);
  var path = type + "/" + name + "/";
  //Merge old zip with master zip (project)
  for(var i = 0; i < filenames.length; i++){
    if(zip.file(filenames[i])){
      const myFileName = filenames[i];
      if(filenames[i].endsWith(".png")){
        zip.file(filenames[i]).async("base64").then(function(fileresult){
          fileresult = fileresult.toString();
          masterzip.file(path + myFileName, fileresult, {base64: true});
        })
      } else {
        zip.file(filenames[i]).async("text").then(function(fileresult){
          fileresult = fileresult.toString();
          masterzip.file(path + myFileName, fileresult);
        })
      }
    }
  }
  
  //Add pack to world_*_packs.json
  masterzip.file("world_" + type + ".json").async("text").then(function(r){
    r = JSON.parse(r);
    r.push(
      {
        pack_id: manifest.header.uuid.toString(),
        version: JSON.parse(JSON.stringify(manifest.header.version))
      }
    );
    
    masterzip.file("world_" + type + ".json", JSON.stringify(r));
    doPacks();
  });
  //console.log(masterzip);
}

function deletePack(){
  var name = currentPack.metadata.folder;
  var packtype = (currentPack.modules[0].type == "data" ? "behavior_packs" : "resource_packs");
  if(confirm('Are you sure you want to delete "'+ name +'" from the world data? This action will delete the pack and all of its files, as well as remove references to it in the "world_'+ packtype +'.json" file.')){
    var path = packtype + "/" + name;
    masterzip.remove(path);
    
    getFile("world_"+ packtype +".json").then(function(response){
      response = JSON.parse(response);
      for(var i = 0; i < response.length; i++){
        if(response[i].pack_id == currentPack.header.uuid){
          response.splice(i, 1);
        }
      }
      
      masterzip.file("world_"+ packtype +".json", JSON.stringify(response));
      doPacks();
    })
  }
}

function confirmWipeData(){
  if(confirm("The following things will be deleted:\nBuilds, player data, inventories, scoreboards, portals, entities, anything that has been added since world generation.\nThe following things will NOT be deleted:\nWorld template mode, gamerules, world seed, add-ons.\n\nAre you sure you want to perform this action?")){
    masterzip.remove("db");
    
    var blankdatazip = new JSZip();
    
    fetch('https://cdn.glitch.global/17ff8eee-9239-4ba0-8a5c-9263261550b5/blank_worlddata.zip').then((result) => {
      blankdatazip.loadAsync(result.blob()).then(function(){
        for(let bfname of Object.keys(blankdatazip.files)){
          blankdatazip.file(bfname).async('blob').then((blankdatafile) => {
            masterzip.file(bfname, blankdatafile);
          });
        }
      });
    });
    
    document.getElementById("wipedata").style.display = "none";
  }
}

function downloadLevelDat(){
  var worldname = document.getElementById("file").files[0].name.split(".")[0];
  updateLevelDat();
  masterzip.file("level.dat").async("arraybuffer").then(function(inputfile){
    saveAs(new File([inputfile], worldname + " - level.dat"), worldname + " - level.dat");
  });
}

function activateWT(){
  if(confirm("Are you sure you want to activate World Template mode? This will make your project export as a .mctemplate file and it will include its own manifest.json file.")){
    masterzip.file("manifest.json", JSON.stringify(wt_template));
    readWT();
  }
}

function deleteWT(){
  if(confirm("Are you sure you want to turn off World Template mode? This will make your project export as a .mcworld file and it will delete the attached manifest.json file.")){
    document.getElementById("add-wt").style.display = "inline-block";
    document.getElementById("wt-settings").style.display = "none";
    document.getElementById("downloadworldbutton").innerHTML = "Download World";
    masterzip.remove("manifest.json");
  }
}

function readWT(){
  masterzip.file("manifest.json").async("text").then(function(result){
    result = JSON.parse(result);
    if(result.header.base_game_version){
      document.getElementById("wt-version").value = unifyVersion(result.header.base_game_version);
    } else {
      document.getElementById("wt-version").value = "1.10.0";
    }
    document.getElementById("wt-lock").checked = result.header.lock_template_options;
    document.getElementById("wt-title").value = result.header.name;
    document.getElementById("wt-desc").value = result.header.description;
    
    document.getElementById("add-wt").style.display = "none";
    document.getElementById("wt-settings").style.display = "block";
    document.getElementById("downloadworldbutton").innerHTML = "Download World Template";
  });
}

function writeWT(){
  masterzip.file("manifest.json").async("text").then(function(result){
    result = JSON.parse(result);
    if(!result.header.base_game_version){
      result.header.base_game_version = [1, 19, 0];
    }
    result.header.base_game_version = updateVersion(result.header.base_game_version, document.getElementById("wt-version").value);
    result.header.lock_template_options = document.getElementById("wt-lock").checked;
    result.header.name = document.getElementById("wt-title").value;
    result.header.description = document.getElementById("wt-desc").value;
    
    masterzip.file("manifest.json", JSON.stringify(result));
  });
}

function downloadProject(){
  var filename = document.getElementById("file").files[0].name.split(".")[0] + "-packaged " + new Date().toDateString();
  
  inForcedMode = true;
  document.getElementById("overlay").style.display = "block";
  document.getElementById("download-notice").style.display = "block";
  
  if(masterzip.file("manifest.json")){
    //Export as mctemplate
    masterzip.generateAsync({type:"blob"})
    .then(function (blob) {
      saveAs(blob, filename+".mctemplate");
      inForcedMode = false;
      closeEditors();
    });
  } else {
    //No manifest found, export as mcworld
    masterzip.generateAsync({type:"blob"})
    .then(function (blob) {
      saveAs(blob, filename + ".mcworld");
      inForcedMode = false;
      closeEditors();
    });
  }
}

//document.getElementById("pack-icon").src = "https://raw.githubusercontent.com/bedrock-dot-dev/packs/master/stable/resource/pack_icon.png";

inForcedMode = true;
document.getElementById("overlay").style.display = "block";
document.getElementById("upload-notice").style.display = "block";
