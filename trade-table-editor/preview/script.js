var preload = new Image();
preload.src = "https://github.com/bedrock-dot-dev/packs/raw/master/stable/resource/textures/ui/arrow_dark_right.png";
var mytable = {};

var tradeTemplate = {wants:[{item:"minecraft:string",quantity:20,price_multiplier:.05},{item:"minecraft:brick",quantity:1}],gives:[{item:"minecraft:emerald",quantity:1}],trader_exp:1,max_uses:6,reward_exp:true};

function addTier(tier){
  document.getElementById("list").appendChild(tier);
  mcitems.init();
}

function createTier(disableName){
  var index = (document.getElementById("list").children.length == 0 ? 1 : document.getElementById("list").children.length+1);
  var tierName = ((index-1) <= tierNames.length-1 ? tierNames[index-1] : tierNames[tierNames.length-1]);
  var tier = document.createElement("div");
  tier.classList = ["tier"];
  if(!disableName){
    tier.innerHTML = '<span>Level ' + index + ' - ' + tierName + '</span>';
  } else {
    tier.innerHTML = "<br>";
  }
  
  return tier;
}

function hasEnchants(item){
  if(!item.functions){
    return false;
  }
  
  for(let func of item.functions){
    if(func.function == "specific_enchants"){
      return true;
    }
  }
}

function addTrade(element, tradeData){
  if(!tradeData){
    var tradeData = tradeTemplate;
  }
  
  var wants0 = tradeData.wants[0];
  var wants1 = (tradeData.wants[1] ? tradeData.wants[1] : false);
  var gives = tradeData.gives[0];
  
  var trade = document.createElement("div");
  trade.classList = ["trade"];
  //trade.setAttribute("disabled","");
  var tradeHTML = '<div class="trade-inner">';
  
  tradeHTML += '<mcitem style="height:40px; width:40px;" '+ (hasEnchants(wants0) ? 'class="enchanted"' : '') +' identifier="' + wants0.item + '" count="'+ wants0.quantity +'"></mcitem>';
  if(wants1){
    tradeHTML += '<mcitem style="height:40px; width:40px;" '+ (hasEnchants(wants1) ? 'class="enchanted"' : '') +' identifier="' + wants1.item + '" count="'+ wants1.quantity +'"></mcitem>';
  } else {
    tradeHTML += '<mcitem style="height:40px;width:40px;visibility:hidden;" identifier="minecraft:air" count="1"></mcitem>';
  }
  tradeHTML += '<img class="trade-arrow" src="https://github.com/bedrock-dot-dev/packs/raw/master/stable/resource/textures/ui/arrow_dark_right.png">';
  tradeHTML += '<mcitem style="height:40px; width:40px;" '+ (hasEnchants(gives) ? 'class="enchanted"' : '') +' identifier="' + gives.item + '" count="'+ gives.quantity +'"></mcitem>';
  tradeHTML += '</div>';
  
  trade.innerHTML = tradeHTML;
  
  element.appendChild(trade);
}

function simulateTable(table){
  table = JSON.parse(JSON.stringify(correctImportedTable(table)));
  
  document.getElementById("list").innerHTML = "";

  for (var i = 0; i < table.tiers.length; i++) {
    var tier = table.tiers[i];
    var myTier = createTier((table.tiers.length > 1 ? false : true));
    for (var a = 0; a < tier.groups.length; a++) {
      var group = tier.groups[a];

      var trades = [];
      if (group.num_to_select && group.num_to_select > 0) {
        var alltrades = group.trades;
        for (var r = 0; r < group.num_to_select; r++) {
          var index = Math.floor(Math.random() * alltrades.length) + 0;
          trades.push(alltrades[index]);
          alltrades.splice(index, 1);
        }
      } else {
        trades = group.trades;
      }

      for (var b = 0; b < trades.length; b++) {
        var trade = trades[b];
        addTrade(myTier, trade);
      }
    }
    addTier(myTier);
  }
}

var tierNames = [
  "Novice",
  "Apprentice",
  "Journeyman",
  "Expert",
  "Master",
  /*"*Grand Master",
  "*Supreme Master",
  "*Lord",
  "*Demigod",
  "*Ultra-demigod",
  "*Godlike",
  "*Beyond Godlike",
  "*God."*/
  "*"
];

function correctImportedTable(table){
  var tiers = table.tiers;
  var choiceMessage = false;
  for(var i = 0; i < tiers.length; i++){
    //Make sure everything is sorted into groups
    if(tiers[i].hasOwnProperty("trades")){
      tiers[i].groups = [
        {
          trades: JSON.parse(JSON.stringify(tiers[i].trades))
        }
      ];
      delete tiers[i].trades;
    }
    
    var groups = tiers[i].groups;
    for(var a = 0; a < groups.length; a++){
      var trades = groups[a].trades;
      for(var b = 0; b < trades.length; b++){
        //Make sure the choice attribute doesn't exist
        var wants = trades[b].wants;
        var gives = trades[b].gives;
        if(!wants[0] || !gives[0]){
          alert("Your trade table is invalid: missing basic required wants/gives items.");
          location.reload();
        }
        
        if(wants[0].hasOwnProperty("choice")){
          choiceMessage = true;
          wants[0] = wants[0].choice[0];
        }
        
        if(wants[0].item.split(":").length != 2){
          if(wants[0].item.split(":").length == 1){
            wants[0].item = "minecraft:" + wants[0].item;
          } else {
            wants[0].item = wants[0].item.split(":")[0] +":"+ wants[0].item.split(":")[1];
          }
        }
        
        if(wants[1]){
          if(wants[1].hasOwnProperty("choice")){
            choiceMessage = true;
            wants[1] = wants[1].choice[0];
          }
          
          if(wants[1].item.split(":").length != 2){
            if(wants[1].item.split(":").length == 1){
              wants[1].item = "minecraft:" + wants[1].item;
            } else {
              wants[1].item = wants[0].item.split(":")[1] +":"+ wants[1].item.split(":")[1];
            }
          }
        }
        
        if(gives[0].hasOwnProperty("choice")){
          choiceMessage = true;
          gives[0] = gives[0].choice[0];
        }
        
        if(gives[0].item.split(":").length != 2){
          if(gives[0].item.split(":").length == 1){
            gives[0].item = "minecraft:" + gives[0].item;
          } else {
            gives[0].item = gives[0].item.split(":")[0] +":"+ gives[0].item.split(":")[1];
          }
        }
      }
    }
  }
  if(choiceMessage) alert("It seems that one or more trades in your trade table use the [choice] feature for either the wants[0], wants[1] or gives item. The choice feature is not supported by this program. The first item in the list has been selected to permanently apply instead. ");

  return table;
}

document.getElementById("file").addEventListener("change", function(){
  this.files[0];
  var fr = new FileReader();
  fr.onload = function(e){
    mytable = JSON.parse(e.target.result);
    document.getElementById("import").style.display = "none";
    document.getElementById("reroll").style.display = "inline";
    simulateTable(mytable);
  }
  fr.readAsText(this.files[0]);
});