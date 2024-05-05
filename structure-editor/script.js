const nbt = require('prismarine-nbt');
const { Buffer } = require('buffer');

var importedData = '';

//Create node editor
let nodeEditor = new JSONEditor(document.querySelector("#node-editor"), {"mode": "tree"});
let itemNodeEditor = new JSONEditor(document.querySelector("#item-node-editor"), {"mode": "tree"});
nodeEditor.set({'hello': 'world'})

let data = {
  identifiers: {
    block: false,
    item: false,
    entity: false,
    tileentities: []
  },
  tiles: false,
  effects: false,
  potioneffects: false,
  enchantments: false,
  numeric_enchantments: false,
  allowedblocks: false,
  blockstates: {},
  conversion: {
    blocks: {
      b2j: false,
      j2b: false
    }
  },
  rendering: {
    texturedef: false,
    texturepaths: false,
    preview_texturedef: false,
    preview_texturepaths: false
  },
  armor_trims: {
    patterns: false,
    materials: false
  }
};

//Get data
async function getData(){
  //let old_identifiers = await fetch('https://raw.githubusercontent.com/bridge-core/editor-packages/main/packages/minecraftBedrock/schema/general/vanilla/identifiers.json').then(response => {return response.json()})
  let blockidentifiers = await fetch('https://raw.githubusercontent.com/Mojang/bedrock-samples/main/metadata/vanilladata_modules/mojang-blocks.json').then(response => {return response.json()})
  let itemidentifiers = await fetch('https://raw.githubusercontent.com/Mojang/bedrock-samples/main/metadata/vanilladata_modules/mojang-items.json').then(response => {return response.json()})
  let entityidentifiers = await fetch('https://raw.githubusercontent.com/Mojang/bedrock-samples/main/metadata/vanilladata_modules/mojang-entities.json').then(response => {return response.json()})
  
  let tiles = await fetch('https://mcbe-essentials.glitch.me/data/tile-entities-v2.json').then(response => {return response.json()})
  /*let potions = await fetch('https://mcbe-essentials.glitch.me/data/potion-types.json').then(response => {return response.json()})
  let effects = await fetch('https://mcbe-essentials.glitch.me/data/effects-list.json').then(response => {return response.json()})
  let enchantments = await fetch('https://mcbe-essentials.glitch.me/data/enchantments.json').then(response => {return response.json()})*/
  let general_data = await fetch('https://mcbe-essentials.glitch.me/data/general.json').then(response => {return response.json()})
  let allowedblocks = await fetch('https://raw.githubusercontent.com/PrismarineJS/minecraft-data/master/data/bedrock/1.20.0/blockStates.json').then(response => {return response.json()}) //Returns an array of all the possible blocks in the game (every blockstate combination) as NBT objects.
  let blocksj2b = await fetch('https://raw.githubusercontent.com/PrismarineJS/minecraft-data/master/data/bedrock/1.20.0/blocksJ2B.json').then(response => {return response.json()})
  let blocksb2j = await fetch('https://raw.githubusercontent.com/PrismarineJS/minecraft-data/master/data/bedrock/1.20.0/blocksB2J.json').then(response => {return response.json()})
  let texturedef = await fetch('https://raw.githubusercontent.com/Mojang/bedrock-samples/main/resource_pack/blocks.json').then(response => {return response.json()})
  let texturepaths = await fetch('https://raw.githubusercontent.com/Mojang/bedrock-samples/preview/resource_pack/textures/terrain_texture.json').then(async response => {return await response.text().then((str) => JSON.parse(sterilizeJSON(str)))})
  let preview_texturedef = await fetch('https://raw.githubusercontent.com/Mojang/bedrock-samples/main/resource_pack/blocks.json').then(response => {return response.json()})
  let preview_texturepaths = await fetch('https://raw.githubusercontent.com/Mojang/bedrock-samples/preview/resource_pack/textures/terrain_texture.json').then(async response => {return await response.text().then((str) => JSON.parse(sterilizeJSON(str)))})
  
  data.identifiers.block = blockidentifiers.data_items.map(item => item.name);
  data.identifiers.item = itemidentifiers.data_items.map(item => item.name);
  data.identifiers.entity = entityidentifiers.data_items.map(item => "minecraft:" + item.name);
  
  data.conversion.blocks.b2j = blocksb2j;
  data.conversion.blocks.j2b = blocksj2b;
  
  data.tiles = tiles;
  /*data.potioneffects = potions;
  data.effects = effects;
  data.enchantments = enchantments;*/
  data.potioneffects = general_data.potions.recipe_types;
  data.effects = general_data.effects;
  data.enchantments = general_data.enchantments;
  data.armor_trims = general_data.armor_trims;
  
  data.allowedblocks = allowedblocks;
  
  data.rendering.texturedef = texturedef;
  data.rendering.texturepaths = texturepaths;
  data.rendering.preview_texturedef = preview_texturedef;
  data.rendering.preview_texturepaths = preview_texturepaths;
  
  //Numeric enchantments
  data.numeric_enchantments = {};
  for(let enchdata of Object.keys(data.enchantments)){
    data.numeric_enchantments[data.enchantments[enchdata].numeric] = enchdata;
  }
  
  //Datalists
  function createDatalist(data, parentel, title = false){
    if(title) document.getElementById("upload-button-disabled").innerHTML = title;
    let fragment = new DocumentFragment();
    parentel.innerHTML = "";
    for(let entry of data){
      let optionel = document.createElement("option");
      optionel.value = entry;
      optionel.innerHTML = entry;
      fragment.append(optionel);
    }
    parentel.append(fragment)
  }
  
  //Blockstates list
  for(let allowedblock of allowedblocks){
    //Get block states
    for(let statename of Object.keys(allowedblock.states)){
      let statedata = allowedblock.states[statename];
      
      if(!Object.keys(data.blockstates).includes(statename)) data.blockstates[statename] = {values: [], type: statedata.type, blocks: []};
      if(!data.blockstates[statename].values.includes(statedata.value)) data.blockstates[statename].values.push(statedata.value)
      if(!data.blockstates[statename].blocks.includes(allowedblock.name)) data.blockstates[statename].blocks.push(allowedblock.name)
    }
  }
  
  //Tile entities identitifer list
  for(let tiledef of Object.keys(data.tiles)){
    if(data.tiles[tiledef].blocks){
      data.identifiers.tileentities = data.identifiers.tileentities.concat(data.tiles[tiledef].blocks);
    }
  }
  
  createDatalist(data.identifiers.entity, document.getElementById("ids-entity"));
  createDatalist(data.identifiers.item, document.getElementById("ids-item"));
  createDatalist(data.identifiers.block, document.getElementById("ids-block"));
  
  createDatalist(data.effects, document.getElementById("ids-effect"));
  createDatalist(Object.keys(data.enchantments), document.getElementById("ids-enchantment"));
  createDatalist(Object.keys(data.blockstates), document.getElementById("ids-blockstate"));
  
  createDatalist(data.armor_trims.patterns, document.getElementById("item-armor-trim-pattern"));
  createDatalist(data.armor_trims.materials, document.getElementById("item-armor-trim-material"));
  
  document.getElementById("tentity-cauldron-potion").innerHTML = "";
  for(let i = 0; i < data.potioneffects.length; i++){
    let optionel = document.createElement("option");
    optionel.value = i - 1;
    optionel.innerHTML = data.potioneffects[i];
    document.getElementById("tentity-cauldron-potion").appendChild(optionel);
  }
  
  document.getElementById("upload-button-disabled").style.display = "none";
  document.getElementById("upload-button-enabled").style.display = "block";
  //nodeEditor.set(data)
  
  //If a file is queued for launch, launch it
  if(window.awaitingLaunch){
    structureToEditor(window.awaitingLaunch)
  }
}

function openItemEditor(){
  currentItem = openedEditors[openedEditors.length-1].data;
  document.getElementById("item-editor").style.display = "block";
  document.getElementById("overlay").style.display = "block";
  
  let item = currentItem;
  
  //Get [tag] array
  let tags = (item.hasOwnProperty("tag") ? item.tag.value : {});
  let unbreakable = (tags.hasOwnProperty("Unbreakable") ? tags.Unbreakable.value : 0);
  
  //Render values in the editor
  document.getElementById("item-general-identifier").value = item.Name.value;
  document.getElementById("item-general-count").value = item.Count.value;
  document.getElementById("item-general-data").value = item.Damage.value;
  document.getElementById("item-general-damage").value = (tags.hasOwnProperty("Damage") ? tags.Damage.value : '');
  document.getElementById("item-general-unbreakable").checked = boolByte(unbreakable);
  document.getElementById("item-general-waspickedup").checked = boolByte(item.WasPickedUp.value);
  
  //Meta Tags section
  let repaircost = (tags.hasOwnProperty("RepairCost") ? tags.RepairCost.value : 0);
  let display = (tags.hasOwnProperty("display") ? tags.display.value : {});
  let name = (display.hasOwnProperty("Name") ? display.Name.value : '');
  let lore = (display.hasOwnProperty("Lore") ? display.Lore.value.value.join("\n") : '');
  document.getElementById("item-general-repaircost").value = repaircost;
  document.getElementById("item-general-display-name").value = name;
  document.getElementById("item-general-display-lore").value = lore;
  
  //GiveNBT section
  let itemlock = (tags.hasOwnProperty("minecraft:item_lock") ? tags["minecraft:item_lock"].value : 0);
  let keepondeath = (tags.hasOwnProperty("minecraft:keep_on_death") ? tags["minecraft:keep_on_death"].value : 0);
  let canplaceon = (item.hasOwnProperty("CanPlaceOn") ? item.CanPlaceOn.value.value.join("\n") : '')
  let candestroy = (item.hasOwnProperty("CanDestroy") ? item.CanDestroy.value.value.join("\n") : '')
  document.getElementById("item-general-itemlock").value = itemlock;
  document.getElementById("item-general-keepondeath").checked = boolByte(keepondeath);
  document.getElementById("item-general-canplaceon").value = canplaceon;
  document.getElementById("item-general-candestroy").value = candestroy;
  
  //Render enchantments in the editor
  document.getElementById("item-general-enchantments").innerHTML = "";

  let enchants = [];
  if(tags.ench){
    enchants = tags.ench.value.value;
  }
  for(let enchantdata of enchants){
    let enchantmentel = createEnchantmentItem(enchantdata);
    document.getElementById("item-general-enchantments").appendChild(enchantmentel);
  }
  
  //Block tab
  if(item.Block){
    document.getElementById("item-block-tab").style.display = "unset";
    
    document.getElementById("item-block-name").value = item.Block.value.name.value;
    //Render blockstates
    document.getElementById("item-block-states").innerHTML = "";
    let blockstates = item.Block.value.states.value;
    for(let statename of Object.keys(blockstates)){
      document.getElementById("item-block-states").appendChild(createBlockstateEntry({name: statename, data: blockstates[statename]}))
    }
    
    //Display pseudo-block button
    if(data.identifiers.tileentities.includes(item.Block.value.name.value) && item.hasOwnProperty("tag")){
      document.getElementById("item-block-openastile").style.display = "unset";
    } else {
      document.getElementById("item-block-openastile").style.display = "none";
    }
  } else {
    document.getElementById("item-block-tab").style.display = "none";
  }
  
  //Mob tab
  if(tags.identifier){
    document.getElementById("item-mob-tab").style.display = "unset";
    
    document.getElementById("item-mobbucket-useattributes").checked = boolByte(tags.AppendCustomName.value);
  } else {
    document.getElementById("item-mob-tab").style.display = "none";
  }
  
  //Map tab
  if(tags.map_uuid){
    document.getElementById("item-map-tab").style.display = "unset";
    
    document.getElementById("item-map-players").checked = boolByte(tags.map_display_players.value);
    document.getElementById("item-map-name").value = tags.map_name_index.value;
    document.getElementById("item-map-uuid").value = Number(datHandler.longTagValue(tags.map_uuid.value));
  } else {
    document.getElementById("item-map-tab").style.display = "none";
  }
  
  //Potion tab
  if(tags.wasJustBrewed){
    document.getElementById("item-potion-tab").style.display = "unset";
    
    document.getElementById("item-potion-wasjustbrewed").checked = boolByte(tags.wasJustBrewed.value);
  } else {
    document.getElementById("item-potion-tab").style.display = "none";
  }
  
  //Book tab
  if(tags.pages){
    document.getElementById("item-book-tab").style.display = "unset";
    
    bookEditor.setData(tags.pages.value.value)
  } else {
    document.getElementById("item-book-tab").style.display = "none";
  }
  
  //Crossbow tab
  if(tags.chargedItem){
    document.getElementById("item-crossbow-tab").style.display = "unset";
    document.getElementById("item-crossbow-chargeditem").innerHTML = "";
    document.getElementById("item-crossbow-chargeditem").appendChild(createItemElement(tags.chargedItem.value));
    mcitems.init();
  } else {
    document.getElementById("item-crossbow-tab").style.display = "none";
  }
  
  //Armor tab
  if(tags.Trim || tags.customColor){
    document.getElementById("item-armor-tab").style.display = "unset";
    if(tags.Trim) {
      document.getElementById("item-armor-trimgroup").style.display = "table-cell";
      document.getElementById("item-armor-trim-pattern").value = tags.Trim.value.Pattern.value;
      document.getElementById("item-armor-trim-material").value = tags.Trim.value.Material.value;
    } else {
      document.getElementById("item-armor-trimgroup").style.display = "none";
    }
    if(tags.customColor) {
      document.getElementById("item-armor-leathergroup").style.display = "table-cell";
      document.getElementById("item-armor-customcolor").value = datHandler.argb.intToHex(tags.customColor.value, true);
    } else {
      document.getElementById("item-armor-leathergroup").style.display = "none";
    }
    mcitems.init();
  } else {
    document.getElementById("item-armor-tab").style.display = "none";
  }
  
  //Item node editor
  itemNodeEditor.set(item);
}

function openBlockEditor(){
  currentBlock = openedEditors[openedEditors.length-1].data;
  document.getElementById("block-editor").style.display = "block";
  document.getElementById("overlay").style.display = "block";
  
  let block = currentBlock;

  document.getElementById("block-identifier").value = block.name.value;
  //Render blockstates
  document.getElementById("block-states").innerHTML = "";
  let blockstates = block.states.value;
  for(let statename of Object.keys(blockstates)){
    document.getElementById("block-states").appendChild(createBlockstateEntry({name: statename, data: blockstates[statename]}))
  }
}

function openEntityEditor(){
  currentEntity = openedEditors[openedEditors.length-1].data;
  document.getElementById("entity-editor").style.display = "block";
  document.getElementById("overlay").style.display = "block";
  
  let entity = currentEntity;
  //Find attributes
  let health = currentEntity.Health || false;
  let maxhealth = 0;
  if(health){
    health = health.value;
    maxhealth = health;
  } else {
    //Filter through attributes until an appropriate one is found
    if(currentEntity.Attributes){
      for(let attribute of currentEntity.Attributes.value.value){
        if(attribute.Name && attribute.Name.value == "minecraft:health"){
          health = attribute.Current.value;
          maxhealth = attribute.Max.value;
        }
      }
    }
  }
  if(!health){
    document.getElementById("entity-general-health-min").value = '';
    document.getElementById("entity-general-health-max").value = '';
    document.getElementById("entity-general-health-min").disabled = true;
    document.getElementById("entity-general-health-max").disabled = true;
  } else {
    document.getElementById("entity-general-health-min").value = health;
    document.getElementById("entity-general-health-max").value = maxhealth;
    document.getElementById("entity-general-health-min").disabled = false;
    document.getElementById("entity-general-health-max").disabled = false;
  }
  
  //Render values in the editor
  document.getElementById("entity-general-identifier").value = entity.identifier.value;
  document.getElementById("entity-general-pos-x").value = entity.Pos.value.value[0];
  document.getElementById("entity-general-pos-y").value = entity.Pos.value.value[1];
  document.getElementById("entity-general-pos-z").value = entity.Pos.value.value[2];
  document.getElementById("entity-general-rot-x").value = entity.Rotation.value.value[0];
  document.getElementById("entity-general-rot-y").value = entity.Rotation.value.value[1];
  //To do: Alternate name tags
  document.getElementById("entity-general-nametag").value = (entity.hasOwnProperty("CustomName") ? entity.CustomName.value : "");
  document.getElementById("entity-general-tags").value = entity.Tags.value.value.join("\n");
  
  //Render effects in the editor
  document.getElementById("entity-general-effects").innerHTML = "";

  let effects = [];
  if(entity.ActiveEffects){
    effects = entity.ActiveEffects.value.value;
  }
  for(let effectdata of effects){
    let effectel = createEffectItem(effectdata);
    document.getElementById("entity-general-effects").appendChild(effectel);
  }
  
  //Inventory slots
  if(currentEntity.ChestItems){
    document.getElementById("entity-inventory-node").style.display = "table-cell"
    //Entity has a valid inventory
    let slotcontainer = document.getElementById("entity-chestitems").querySelector("tr");
    slotcontainer.innerHTML = '';
    let chestitems = currentEntity.ChestItems.value.value;
    for(let i = 0; i < chestitems.length; i++){
      slotcontainer.appendChild(createItemSlot("currentEntity.ChestItems.value.value["+i+"]"))
    }
    
    //Fill slots
    fillItemSlots(chestitems, document.getElementById("entity-chestitems"))
  } else {
    //Hide inventory thing
    document.getElementById("entity-inventory-node").style.display = "none"
  }
  
  if(!currentEntity.ChestItems && !currentEntity.Armor && !currentEntity.Mainhand && !currentEntity.Offhand){
    //If no item interactivity is possible, hide equipment tab
    document.getElementById("entity-inventory-tab").style.display = "none";
  } else {
    document.getElementById("entity-inventory-tab").style.display = "unset";
  }
  
  //Inventory loot table fields
  let lootpath = (currentEntity.hasOwnProperty("LootTable") ? currentEntity.LootTable.value : '');
  let lootseed = (currentEntity.hasOwnProperty("LootTableSeed") ? currentEntity.LootTableSeed.value : '');
  document.getElementById("entity-inventory-loottable").value = lootpath;
  document.getElementById("entity-inventory-loottableseed").value = lootseed;
  
  //Equipment
  //Clear slots
  for(let slot of document.getElementById("entity-armor-slots").querySelectorAll("td")){
    slot.innerHTML = "";
  }
  document.getElementById("entity-mainhand-slot").innerHTML = "";
  document.getElementById("entity-offhand-slot").innerHTML = "";
  
  //Fill armor slots
  if(currentEntity.Armor){
    fillItemSlots(currentEntity.Armor.value.value, document.getElementById("entity-armor-slots"))
  }
  if(currentEntity.Mainhand){
    fillItemSlots(currentEntity.Mainhand.value.value, document.getElementById("entity-mainhand-slot"))
  }
  if(currentEntity.Offhand){
    fillItemSlots(currentEntity.Offhand.value.value, document.getElementById("entity-offhand-slot"))
  }
  
  //Render items
  mcitems.init()
  
  //Minecart tab
  let minecarts = [
    "minecraft:minecart",
    "minecraft:chest_minecart",
    "minecraft:hopper_minecart",
    "minecraft:tnt_minecart",
    "minecraft:command_block_minecart"
  ]
  if(minecarts.includes(currentEntity.identifier.value)){
    document.getElementById("entity-minecart-tab").style.display = "unset";
    //Render minecart values
    let customdisplaytoggle = (currentEntity.CustomDisplayTile ? currentEntity.CustomDisplayTile.value : 0);
    let customdisplayblock = (currentEntity.DisplayBlock ? currentEntity.DisplayBlock.value : {name: {value: ""}});
    let customdisplayoffset = (currentEntity.DisplayOffset ? currentEntity.DisplayOffset.value : 0);
    
    document.getElementById("entity-minecart-custom").checked = boolByte(customdisplaytoggle);
    document.getElementById("entity-minecart-custom-id").value = customdisplayblock.name.value;
    document.getElementById("entity-minecart-custom-offset").value = customdisplayoffset;
  } else {
    document.getElementById("entity-minecart-tab").style.display = "none";
  }
  
  //Dialogue tab
  if(currentEntity.identifier.value == "minecraft:npc"){
    document.getElementById("entity-dialogue-tab").style.display = "unset";
    //Render dialogue values
    document.getElementById("entity-dialogue-name").value = currentEntity.RawtextName.value;
    document.getElementById("entity-dialogue-interactivetext").value = currentEntity.InterativeText.value;
      
    //Render actions
    document.getElementById("entity-dialogue-actions").innerHTML = "";
    if(currentEntity.Actions){
      let actions = JSON.parse(currentEntity.Actions.value);
      for(let action of actions){
        document.getElementById("entity-dialogue-actions").appendChild(createNPCActionElement(action))
      }
    }
  } else {
    document.getElementById("entity-dialogue-tab").style.display = "none";
  }
  
  //Item tab
  if(currentEntity.identifier.value == "minecraft:item"){
    document.getElementById("entity-item-tab").style.display = "unset";
    //Render values
    document.getElementById("entity-item-age").value = currentEntity.Age.value;
    
    //Clear slots
    document.getElementById("entity-item-item").innerHTML = '<tr><td domain="currentEntity.Item.value" onclick="openEditItem(this.getAttribute(\'domain\'))"></td></tr>';
    
    //Fill slot
    fillItemSlots([currentEntity.Item.value], document.getElementById("entity-item-item"));
      
    //Render items
    mcitems.init()
  } else {
    document.getElementById("entity-item-tab").style.display = "none";
  }
}

function openPseudoTile(){
  //Opens the current item in the Tile Entity Editor, by creating a pseudo-tile entity
  //openEditTile('getValidTileEntities(getTileEntities(), 0)')
  
  let item = currentItem;
  
  //Find the appropriate ID for the pseudo-tile based off its block identifier
  let pseudoId = false;
  let blockid = item.Block.value.name.value;
  for(let tileEntryName of Object.keys(data.tiles)){
    if(data.tiles[tileEntryName].blocks && data.tiles[tileEntryName].blocks.includes(blockid)){
      pseudoId = tileEntryName;
    }
  }
  
  if(!pseudoId) return;
  
  let pseudotile = {
    data: {
      id: {type: 'string', value: pseudoId}
    },
    index: -1, 
    type: 'pseudo',
    original: currentItem //Pseudo-tiles' original data is currentItem
  };
  
  //Append data properties
  let tags = (item.hasOwnProperty("tag") ? item.tag.value : {})
  Object.assign(pseudotile.data, tags);
  
  openEditTile(pseudotile)
}

function createBlockPreview(src, number = false){
  let container = document.createElement("div");
  container.classList = ["image-preview"];
  let image = document.createElement("img");
  image.src = src;
  image.classList = ["block-preview"]
  image.draggable = false;
  container.appendChild(image);
  
  if(number){
    let label = document.createElement("span");
    label.innerHTML = number;
    container.appendChild(label);
  }
  
  return container;
}

function selectPaletteEntryElement(myel){
  Array.from(document.querySelectorAll(".palette-list > div > div")).forEach((el) => {
    el.classList.toggle("selected", false)
  })

  myel.classList.toggle("selected", true)
}

function createPaletteEntryElement(validpalettedata = {"name":"minecraft:air[]","image":"https://cdn.glitch.global/17ff8eee-9239-4ba0-8a5c-9263261550b5/0fa3c5fa-4760-4f85-babe-45b343605f9a.image.png","imageid":0,"data":{"name":{"type":"string","value":"minecraft:air"},"states":{"type":"compound","value":{}},"version":{"type":"int","value":17879555}}}, domain){
  let container = document.createElement("div");
  container.classList = ["app-inner-inner idlabel"];
  let image = createBlockPreview(validpalettedata.image, validpalettedata.imageid)
  container.appendChild(image);
  
  let label = document.createElement("span");
  label.innerHTML = validpalettedata.name;
  label.title = validpalettedata.name;
  label.classList = "palette-list-label"
  container.appendChild(label);
  
  let optgroup = document.createElement("div");
  optgroup.classList = ["minibuttongroup"];
  
  let optionsbutton = document.createElement("img");
  optionsbutton.classList = ["minibutton"]
  optionsbutton.src = "https://cdn.glitch.com/17ff8eee-9239-4ba0-8a5c-9263261550b5%2Ficon_setting.png";
  optionsbutton.onclick = function(){
    openEditBlock("getValidPalette(getPalette())["+ domain +"].data")
  }
  optgroup.appendChild(optionsbutton);
  
  let trashbutton = document.createElement("img");
  trashbutton.classList = ["minibutton"]
  trashbutton.src = "https://cdn.glitch.com/17ff8eee-9239-4ba0-8a5c-9263261550b5%2Ficon_trash.png";
  trashbutton.onclick = function(){
    getPalette().splice(domain, 1)
    //TODO: filter through all placed blocks and change previous instances to structure void, and -1 from each that are greater than the deleted entry
    prepareBlocksTab()
    //this.parentNode.parentNode.parentNode.removeChild(this.parentNode.parentNode);
  }
  //optgroup.appendChild(trashbutton);
  
  container.appendChild(optgroup);
  container.setAttribute("index", domain);
  container.onclick = function(){selectPaletteEntryElement(this)};
  
  return container;
}

function createEffectItem(effectdata = {"Ambient":{"type":"byte","value":0},"Amplifier":{"type":"byte","value":0},"DisplayOnScreenTextureAnimation":{"type":"byte","value":0},"Duration":{"type":"int","value":0},"DurationEasy":{"type":"int","value":0},"DurationHard":{"type":"int","value":0},"DurationNormal":{"type":"int","value":0},"FactorCalculationData":{"type":"compound","value":{"change_timestamp":{"type":"int","value":0},"factor_current":{"type":"float","value":0},"factor_previous":{"type":"float","value":0},"factor_start":{"type":"float","value":0},"factor_target":{"type":"float","value":1},"had_applied":{"type":"byte","value":1},"had_last_tick":{"type":"byte","value":0},"padding_duration":{"type":"int","value":0}}},"Id":{"type":"byte","value":0},"ShowParticles":{"type":"byte","value":1}}){
  //Responsible for creating a <div> element capable of being entered into an effect-list
  
  let effectel = document.createElement("div");
    
  let effecttrash = document.createElement("img")
  effecttrash.classList = ["minibutton"];
  effecttrash.src = "https://cdn.glitch.com/17ff8eee-9239-4ba0-8a5c-9263261550b5%2Ficon_trash.png";
  effecttrash.style = "height:100%";
  effecttrash.onclick = function(){
    this.parentNode.parentNode.removeChild(this.parentNode);
  }

  //Todo: Effect ID datalist
  let effectid = document.createElement("input");
  effectid.classList = ["app-input entity-general-effect-id"];
  effectid.style = "width: unset;";
  effectid.placeholder = "effect_identifier";
  effectid.setAttribute("list", "ids-effect");

  let effectstrength = document.createElement("input");
  effectstrength.classList = ["app-input entity-general-effect-strength"];
  effectstrength.type = "number";
  effectstrength.placeholder = "*";

  let effectduration = document.createElement("input");
  effectduration.classList = ["app-input entity-general-effect-duration"];
  effectduration.type = "number";
  effectduration.placeholder = "ticks";
  effectduration.style.width = "85px";

  let effectparticleslabel = document.createElement("label");
  effectparticleslabel.innerText = "Particles: ";
  let effectparticles = document.createElement("input");
  effectparticles.type = "checkbox";
  effectparticles.classList = ["entity-general-effect-particles"]
  effectparticleslabel.appendChild(effectparticles);

  effectid.value = data.effects[effectdata.Id.value - 1] || "";
  effectstrength.value = effectdata.Amplifier.value;
  effectduration.value = effectdata.Duration.value;
  effectparticles.checked = boolByte(effectdata.ShowParticles.value);

  effectel.appendChild(effecttrash);
  effectel.appendChild(effectid);
  effectel.appendChild(effectstrength);
  effectel.appendChild(effectduration);
  effectel.appendChild(effectparticleslabel);
  return effectel;
}

function createEnchantmentItem(enchantdata = {"id": {"type": "short","value": -1},"lvl": {"type": "short","value": 1}}){
  //Responsible for creating a <div> element capable of being entered into an effect-list
  let enchantel = document.createElement("div");
    
  let enchanttrash = document.createElement("img")
  enchanttrash.classList = ["minibutton"];
  enchanttrash.src = "https://cdn.glitch.com/17ff8eee-9239-4ba0-8a5c-9263261550b5%2Ficon_trash.png";
  enchanttrash.style = "height:100%";
  enchanttrash.onclick = function(){
    this.parentNode.parentNode.removeChild(this.parentNode);
  }

  let enchantid = document.createElement("input");
  enchantid.classList = ["app-input item-general-enchantment-id"];
  enchantid.style = "width: unset;";
  enchantid.placeholder = "protection";
  enchantid.setAttribute("list", "ids-enchantment");

  let enchantstar = document.createElement("span")
  enchantstar.innerHTML = "*"
  
  let enchantstrength = document.createElement("input");
  enchantstrength.classList = ["app-input item-general-enchantment-strength"];
  enchantstrength.type = "number";
  enchantstrength.placeholder = "1";

  enchantid.value = data.numeric_enchantments[enchantdata.id.value] || "";
  enchantstrength.value = enchantdata.lvl.value;

  enchantel.appendChild(enchanttrash);
  enchantel.appendChild(enchantid);
  enchantel.appendChild(enchantstar);
  enchantel.appendChild(enchantstrength);
  return enchantel;
}

function createItemSlot(domain, createlocation = false){
  let itemslot = document.createElement("td");
  itemslot.setAttribute("domain", domain);
  itemslot.setAttribute("onclick", 'openEditItem(this.getAttribute("domain"), this.getAttribute("createlocation"))');
  if(createlocation){
    itemslot.setAttribute("createlocation", createlocation);
  } else {
    itemslot.setAttribute("createlocation", "");
  }
  return itemslot;
}

function createItemElement(itemdata){
  if(!itemdata.Name) return document.createElement("empty");
  if(itemdata.Count && itemdata.Count.value < 1) return document.createElement("empty");
  
  let name = itemdata.Name.value;
  let count = itemdata.Count.value;
  let tags = (itemdata.hasOwnProperty("tag") ? itemdata.tag.value : {});
  let damage = (tags.Damage ? itemdata.Damage.value : false);
  let enchanted = tags.hasOwnProperty("ench"); //TODO: list enchantment data
  //TODO: item custom names, ect.
  
  let itemelement = document.createElement("mcitem");
  itemelement.setAttribute("identifier", name);
  itemelement.setAttribute("count", count);
  itemelement.setAttribute("width", "27px");
  itemelement.setAttribute("height", "27px");
  itemelement.classList = ["nohover hovertooltip"];
  itemelement.classList.toggle("enchanted", enchanted)
  itemelement.style.fontSize = "9pt";
  if(damage){
    itemelement.setAttribute("damage", damage);
  }
  
  return itemelement;
}

function createNPCActionElement(actiondata = {"button_name":"","data":[{"cmd_line":"","cmd_ver":25}],"mode":0,"text":"","type":1}){
  //Creates a new NPC action element
  let row = document.createElement('tr');
  let trashContainer = document.createElement('td');
  let modeContainer = document.createElement('td');
  let cmdContainer = document.createElement('td');
  let labelContainer = document.createElement('td');
  
  let trashbtn = document.createElement("img")
  trashbtn.classList = ["minibutton"];
  trashbtn.src = "https://cdn.glitch.com/17ff8eee-9239-4ba0-8a5c-9263261550b5%2Ficon_trash.png";
  trashbtn.style = "height:100%";
  trashbtn.onclick = function(){
    this.parentNode.parentNode.parentNode.removeChild(this.parentNode.parentNode);
  }
  trashContainer.appendChild(trashbtn);
  
  let modebox = document.createElement("select");
  modebox.classList = ["app-input mode"];
  modebox.setAttribute("style", "width:12em; height:unset;")
  modebox.innerHTML = '<option value="0">Button</option><option value="2">Run on Open</option><option value="1">Run on Close</option></select>';
  modebox.value = actiondata.mode;
  modebox.addEventListener("input", function(){
    if(this.value != "0"){
      this.parentNode.parentNode.querySelector(".button-label").value = "";
      this.parentNode.parentNode.querySelector(".button-label").disabled = true;
      this.parentNode.parentNode.querySelector(".button-label").placeholder = "Only available for buttons";
    } else {
      this.parentNode.parentNode.querySelector(".button-label").disabled = false;
      this.parentNode.parentNode.querySelector(".button-label").placeholder = "Button Label";
    }
  })
  modeContainer.appendChild(modebox);
  
  let cmdbox = document.createElement("textarea");
  cmdbox.classList = ["cmd-text"];
  cmdbox.spellcheck = false;
  cmdbox.placeholder = "/say hello";
  cmdbox.value = actiondata.text;
  cmdContainer.appendChild(cmdbox);
  
  let labelbox = document.createElement("input");
  labelbox.classList = ["app-input button-label"];
  labelbox.style.width = "20em";
  labelbox.placeholder = "Button Label";
  labelbox.spellcheck = false;
  labelbox.value = actiondata.button_name;
  
  if(modebox.value != "0"){
    labelbox.value = "";
    labelbox.disabled = true;
    labelbox.placeholder = "Only available for buttons";
  }
  
  labelContainer.appendChild(labelbox);
  
  row.appendChild(trashContainer);
  row.appendChild(modeContainer);
  row.appendChild(cmdContainer);
  row.appendChild(labelContainer);
  
  return row;
}

function createBlockstateEntry(statedata = {name: "", data: {type: "string", value: ""}}, isPalette = false){
  //Creates a new NPC action element
  let row = document.createElement('tr');
  let trashContainer = document.createElement('td');
  let labelContainer = document.createElement('td');
  let typeContainer = document.createElement('td');
  typeContainer.style.width = "unset"; //Combat the NPC 3rd-width lengthening
  let valueContainer = document.createElement('td');
  
  let trashbtn = document.createElement("img")
  trashbtn.classList = ["minibutton"];
  trashbtn.src = "https://cdn.glitch.com/17ff8eee-9239-4ba0-8a5c-9263261550b5%2Ficon_trash.png";
  trashbtn.style = "height:100%";
  trashbtn.onclick = function(){
    this.parentNode.parentNode.parentNode.removeChild(this.parentNode.parentNode);
  }
  trashContainer.appendChild(trashbtn);
  
  let namebox = document.createElement("input");
  namebox.classList = ["app-input item-block-state-name"];
  namebox.style.width = "14em";
  namebox.spellcheck = false;
  namebox.placeholder = "age";
  namebox.value = statedata.name;
  namebox.setAttribute("list", "ids-blockstate");
  labelContainer.appendChild(namebox);
  
  let typebox = document.createElement("select");
  typebox.classList = ["app-input item-block-state-type"];
  typebox.style.height = "unset";
  typebox.style.width = "8em";
  typebox.innerHTML = '<option value="string">string</option><option value="int">integer</option><option value="byte">boolean</option>';
  typebox.value = statedata.data.type;
  typebox.oninput = function(){
    let valuebox = this.parentNode.parentNode.querySelector(".item-block-state-value");
    valuebox.classList.toggle("app-input", true)
    switch(this.value){
      default: {
        valuebox.type = "text";
        valuebox.placeholder = "string"
        break;
      }
      case 'int': {
        valuebox.type = "number";
        valuebox.placeholder = "0"
        break;
      }
      case 'byte': {
        valuebox.type = "checkbox";
        valuebox.classList.toggle("app-input", false)
        break;
      }
    }
  }
  typeContainer.appendChild(typebox);
  
  let value = document.createElement("input");
  value.classList = ["app-input item-block-state-value"];
  value.style.width = "14em";
  value.spellcheck = false;
  value.placeholder = "string";
  valueContainer.appendChild(value);
  
  value.classList.toggle("app-input", true)
  switch(statedata.data.type){
    default: {
      value.type = "text";
      value.placeholder = "string";
      value.value = statedata.data.value;
      break;
    }
    case 'int': {
      value.type = "number";
      value.placeholder = "0";
      value.value = statedata.data.value;
      break;
    }
    case 'byte': {
      value.type = "checkbox";
      value.classList.toggle("app-input", false);
      if(typeof statedata.data.value != "boolean"){
        value.checked = boolByte(statedata.data.value);
      } else {
        value.checked = statedata.data.value;
      }
      
      break;
    }
  }
  
  row.appendChild(trashContainer);
  row.appendChild(labelContainer);
  row.appendChild(typeContainer);
  row.appendChild(valueContainer);
  
  return row;
}

function createBeehiveEntity(entitydata = {identifier: 'minecraft:bee', ticksremaining: 1, occupantindex: document.getElementById("tentity-beehive-occupants").children.length}){
  //Creates a new NPC action element
  let row = document.createElement('tr');
  let trashContainer = document.createElement('td');
  let labelContainer = document.createElement('td');
  let ticksContainer = document.createElement('td');
  
  let trashbtn = document.createElement("img")
  trashbtn.classList = ["minibutton"];
  trashbtn.src = "https://cdn.glitch.com/17ff8eee-9239-4ba0-8a5c-9263261550b5%2Ficon_trash.png";
  trashbtn.style = "height:100%";
  trashbtn.onclick = function(){
    this.parentNode.parentNode.parentNode.removeChild(this.parentNode.parentNode);
  }
  //trashContainer.appendChild(trashbtn); Creation and destruction of entities is not currently supported
  
  let labelbox = document.createElement("span");
  labelbox.classList = ["idlabel"];
  labelbox.innerHTML = entitydata.identifier;
  labelbox.setAttribute("onclick", "openEditEntity('currentValidTile.data.Occupants.value.value["+ entitydata.occupantindex +"].SaveData.value')")
  labelContainer.appendChild(labelbox);
  
  let ticksbox = document.createElement("input");
  ticksbox.classList = ["app-input ticks-remaining-to-stay"];
  ticksbox.style.width = "5em";
  ticksbox.spellcheck = false;
  ticksbox.placeholder = "1";
  ticksbox.value = entitydata.ticksremaining;
  ticksContainer.appendChild(ticksbox);
  
  row.appendChild(trashContainer);
  row.appendChild(labelContainer);
  row.appendChild(ticksContainer);
  
  return row;
}

function applyDialogue(file){
  let filereader = new FileReader();
  filereader.onload = function(e){
    let data = e.target.result;
    data = sterilizeJSON(data);
    try { data = JSON.parse(data); } catch(e) { alert("It doesn't look like this is a valid JSON file."); return; }
    if(data.hasOwnProperty("minecraft:npc_dialogue") && data["minecraft:npc_dialogue"].hasOwnProperty("scenes") && data["minecraft:npc_dialogue"].scenes.length > 0){
      //It's a dialogue file, choose a scene
      let scenes = data["minecraft:npc_dialogue"].scenes;
      let scenetag = prompt("Which scene in this dialogue file would you like to apply?\n\nEnter its \"scene_tag\" attribute here.\nDon't forget to save your entity afterwards!", scenes[0].scene_tag);
      
      let appropriatescene = false;
      for(let scene of scenes){
        if(scene.scene_tag === scenetag){
          appropriatescene = scene;
          break;
        }
      }
      
      if(!appropriatescene){
        appropriatescene = scenes[0];
      }
      
      //Apply scene to entity editor
      let scenetitle = appropriatescene.npc_name || false;
      let text = appropriatescene.text;
      let onopen = appropriatescene.on_open_commands || false;
      let onclose = appropriatescene.on_close_commands || false;
      let buttons = appropriatescene.buttons || false;
      
      //Fix rawtext scenes
      if(typeof scenetitle === 'object') scenetitle = JSON.stringify(scenetitle);
      if(typeof text === 'object') text = JSON.stringify(text);
      
      if(scenetitle) document.getElementById("entity-dialogue-name").value = scenetitle;
      document.getElementById("entity-dialogue-interactivetext").value = text;
      document.getElementById("entity-dialogue-actions").innerHTML = "";
      
      for(let button of buttons){
        let buttonaction = {
          "button_name": (typeof button.name === 'object' ? JSON.stringify(button.name) : button.name),
          "mode": 0,
          "text": button.commands.join("\n"),
          "type": 1
        };
        document.getElementById("entity-dialogue-actions").appendChild(createNPCActionElement(buttonaction))
      }
      
      if(onopen){
        let openaction = {
          "button_name": '',
          "mode": 2,
          "text": onopen.join("\n"),
          "type": 1
        };
        document.getElementById("entity-dialogue-actions").appendChild(createNPCActionElement(openaction))
      }
      if(onclose){
        let closeaction = {
          "button_name": '',
          "mode": 1,
          "text": onclose.join("\n"),
          "type": 1
        };
        document.getElementById("entity-dialogue-actions").appendChild(createNPCActionElement(closeaction))
      }
      
      //saveEntity();
    } else {
      //It's not a dialogue file
      alert("It doesn't look like this is a valid NPC dialogue file: It's either missing the minecraft:npc_dialogue component, the scenes tag or is missing at least one scene.");
    }
  }
  filereader.readAsText(file);
  
  document.getElementById("dialogue-file").style.display = "none";
}

function openTileEntityEditor(){
  document.getElementById("tileentity-editor").style.display = "block";
  document.getElementById("overlay").style.display = "block";
  
  //Reset current valid tile
  if(openedEditors[openedEditors.length-1].data.constructor != Array){
    currentValidTile = openedEditors[openedEditors.length-1].data;
  } else {
    currentValidTile = openedEditors[openedEditors.length-1].data[openedEditors[openedEditors.length-1].selectedIndex];
  }
  
  let tileEntity = currentValidTile.data;
  //Render values in the editor
  //Overview tab
  if(!tileEntity.x && !tileEntity.y && !tileEntity.z){
    document.getElementById("tentity-general-tab").style.display = "none";
    document.getElementById("tentity-pseudo-tab").style.display = "unset";
    
    document.getElementById("tentity-pseudo-customname").value = currentValidTile.data.hasOwnProperty("CustomName") ? currentValidTile.data.CustomName.value : "";
  } else {
    document.getElementById("tentity-general-tab").style.display = "unset";
    document.getElementById("tentity-pseudo-tab").style.display = "none";
    
    document.getElementById("tentity-general-pos-x").innerHTML = tileEntity.x.value;
    document.getElementById("tentity-general-pos-y").innerHTML = tileEntity.y.value;
    document.getElementById("tentity-general-pos-z").innerHTML = tileEntity.z.value;
    //TODO: calculate relative position as well

    document.getElementById("tentity-general-ismovable").checked = boolByte(tileEntity.isMovable.value);
    document.getElementById("tentity-general-customname").value = currentValidTile.data.hasOwnProperty("CustomName") ? currentValidTile.data.CustomName.value : "";
  }
  
  
  let blockdef = data.tiles[tileEntity.id.value] || {type: false}
  let blocktype = getBlockDefinitionType(blockdef.type, tileEntity);
  
  switch(blocktype){
    default: {
      break;
    }
    case 'commandblock': {
      //Command block tab
      document.getElementById("tentity-commandblock-command").value = tileEntity.Command.value;
      document.getElementById("tentity-commandblock-tickdelay").value = tileEntity.TickDelay.value;
      document.getElementById("tentity-commandblock-trackoutput").checked = boolByte(tileEntity.TrackOutput.value);
      document.getElementById("tentity-commandblock-conditional").checked = boolByte(tileEntity.conditionalMode.value);
      document.getElementById("tentity-commandblock-conditionmet").checked = boolByte(tileEntity.conditionMet.value);
      document.getElementById("tentity-commandblock-powered").checked = boolByte(tileEntity.powered.value);
      document.getElementById("tentity-commandblock-auto").value = tileEntity.auto.value;
      document.getElementById("tentity-commandblock-executeonfirsttick").checked = boolByte(tileEntity.ExecuteOnFirstTick.value);
      break;
    };
    case 'legacy-sign': {
      //Sign tab
      document.getElementById("tentity-legacy-sign-text").value = tileEntity.Text.value;
      document.getElementById("tentity-legacy-sign-ignorelighting").checked = (tileEntity.hasOwnProperty("IgnoreLighting") ? boolByte(tileEntity.IgnoreLighting.value) : false);
      let tilbr = tileEntity.TextIgnoreLegacyBugResolved || {value: 0} //Might not exist if it's truly a legacy sign
      document.getElementById("tentity-legacy-sign-textignorelegacybugresolved").checked = !boolByte(tilbr.value);
      document.getElementById("tentity-legacy-sign-persistformatting").checked = (tileEntity.hasOwnProperty("PersistFormatting") ? boolByte(tileEntity.PersistFormatting.value) : true);
      break;
    }
    case 'sign': {
      //Sign tab
      let fronttext = tileEntity.FrontText.value;
      let backtext = tileEntity.BackText.value;
      
      let frontcolor = datHandler.argb.intToHex(fronttext.SignTextColor.value, true);
      document.getElementById("tentity-sign-front-text").value = fronttext.Text.value;
      document.getElementById("tentity-sign-front-ignorelighting").checked = boolByte(fronttext.IgnoreLighting.value);
      document.getElementById('tentity-sign-front-text').classList.toggle('glowing', boolByte(fronttext.IgnoreLighting.value))
      document.getElementById("tentity-sign-front-persistformatting").checked = boolByte(fronttext.PersistFormatting.value);
      document.getElementById("tentity-sign-front-color").value = frontcolor;
      document.getElementById("tentity-sign-front-text").style.color = frontcolor;
      
      let backcolor = datHandler.argb.intToHex(backtext.SignTextColor.value, true);
      document.getElementById("tentity-sign-back-text").value = backtext.Text.value;
      document.getElementById("tentity-sign-back-ignorelighting").checked = boolByte(backtext.IgnoreLighting.value);
      document.getElementById('tentity-sign-back-text').classList.toggle('glowing', boolByte(backtext.IgnoreLighting.value))
      document.getElementById("tentity-sign-back-persistformatting").checked = boolByte(backtext.PersistFormatting.value);
      document.getElementById("tentity-sign-back-color").value = backcolor;
      document.getElementById("tentity-sign-back-text").style.color = backcolor;
      
      document.getElementById("tentity-sign-waxed").checked = boolByte(tileEntity.IsWaxed.value);
      
      //Figure out the wood type of the sign
      getBlockDataOfBlockEntity(currentValidTile.index).name.value
      
      break;
    }
    case 'container': {
      //Container tab
      let slots = data.tiles[tileEntity.id.value].slots || 27
      
      //Find domain
      let itemslist = false;
      let domain = false;
      let createlocation = false;
      if(tileEntity.Items){
        itemslist = tileEntity.Items.value.value;
        domain = "findItem(currentValidTile.data.Items.value.value, *)";
      } else if(tileEntity.Item) {
        itemslist = [tileEntity.Item.value];
        domain = "currentValidTile.data.Item.value"
      } else if(tileEntity.RecordItem) {
        itemslist = [tileEntity.RecordItem.value];
        domain = "currentValidTile.data.RecordItem.value"
      } else {
        itemslist = [];
        domain = blockdef.domain;
        createlocation = blockdef.createlocation;
      }
      
      //Fill with appropriate amount of slots
      document.getElementById("tentity-container-items").innerHTML = "<tbody><tr></tr></tbody>";
      for(let i = 0; i < slots; i++) document.getElementById("tentity-container-items").querySelector("tr").appendChild(createItemSlot(domain.replaceAll("*", i), createlocation));
      if(slots == 9 || slots == 6){
        document.getElementById("tentity-container-items").style.maxWidth = "94px";
      } else {
        document.getElementById("tentity-container-items").style.maxWidth = "280px";
      }
      
      //Fill slots      
      fillItemSlots(itemslist, document.getElementById("tentity-container-items"))
      
      //Render items
      mcitems.init()
      
      //Loot tables and findable values
      document.getElementById("tentity-container-loottable").value = currentValidTile.data.hasOwnProperty("LootTable") ? currentValidTile.data.LootTable.value : "";
      document.getElementById("tentity-container-loottableseed").value = currentValidTile.data.hasOwnProperty("LootTableSeed") ? currentValidTile.data.LootTableSeed.value : "";
      if(tileEntity.Findable){
        document.getElementById("tentity-container-findable").checked = boolByte(tileEntity.Findable.value);
        document.getElementById("tentity-container-findable").disabled = false;
      } else {
        document.getElementById("tentity-container-findable").checked = false;
        document.getElementById("tentity-container-findable").disabled = true;
      }
      break;
    }
    case 'campfire': {
      //Render values
      document.getElementById("tentity-campfire-itemtime1").value = tileEntity.ItemTime1.value;
      document.getElementById("tentity-campfire-itemtime2").value = tileEntity.ItemTime2.value;
      document.getElementById("tentity-campfire-itemtime3").value = tileEntity.ItemTime3.value;
      document.getElementById("tentity-campfire-itemtime4").value = tileEntity.ItemTime4.value;
      
      //Item slots
      for(let slot of document.getElementsByClassName("campfire-slot")){
        slot.innerHTML = "";
      }
      
      //Fill slots
      if(tileEntity.Item1){
        document.getElementById("tentity-campfire-item1").appendChild(createItemElement(tileEntity.Item1.value))
      }
      if(tileEntity.Item2){
        document.getElementById("tentity-campfire-item2").appendChild(createItemElement(tileEntity.Item2.value))
      }
      if(tileEntity.Item3){
        document.getElementById("tentity-campfire-item3").appendChild(createItemElement(tileEntity.Item3.value))
      }
      if(tileEntity.Item4){
        document.getElementById("tentity-campfire-item4").appendChild(createItemElement(tileEntity.Item4.value))
      }
      
      //Render items
      mcitems.init()
      break;
    }
    case 'hopper': {
      //Render values
      document.getElementById("tentity-hopper-transfercooldown").value = tileEntity.TransferCooldown.value;
      
      //Item slots
      for(let slot of document.getElementById("tentity-hopper-items").querySelectorAll("td")){
        slot.innerHTML = "";
      }
      
      //Fill slots
      if(tileEntity.Items){
        fillItemSlots(tileEntity.Items.value.value, document.getElementById("tentity-hopper-items"))
      }
      
      //Render items
      mcitems.init()
      break;
    }
    case 'structureblock': {
      //Structure Block tab
      document.getElementById("tentity-structure-showboundingbox").checked = boolByte(tileEntity.showBoundingBox.value);
      document.getElementById("tentity-structure-ignoreentities").checked = boolByte(tileEntity.ignoreEntities.value);
      document.getElementById("tentity-structure-removeblocks").checked = boolByte(tileEntity.removeBlocks.value);
      document.getElementById("tentity-structure-includeplayers").checked = boolByte(tileEntity.includePlayers.value);
      document.getElementById("tentity-structure-ispowered").checked = boolByte(tileEntity.isPowered.value);
      document.getElementById("tentity-structure-structurename").value = tileEntity.structureName.value;
      document.getElementById("tentity-structure-size-x").value = tileEntity.xStructureSize.value;
      document.getElementById("tentity-structure-size-y").value = tileEntity.yStructureSize.value;
      document.getElementById("tentity-structure-size-z").value = tileEntity.zStructureSize.value;
      document.getElementById("tentity-structure-offset-x").value = tileEntity.xStructureOffset.value;
      document.getElementById("tentity-structure-offset-y").value = tileEntity.yStructureOffset.value;
      document.getElementById("tentity-structure-offset-z").value = tileEntity.zStructureOffset.value;
      document.getElementById("tentity-structure-redstoneSaveMode").value = tileEntity.redstoneSaveMode.value;
      document.getElementById("tentity-structure-rotation").value = tileEntity.rotation.value;
      document.getElementById("tentity-structure-mirror").value = tileEntity.mirror.value;
      document.getElementById("tentity-structure-integrity").value = tileEntity.integrity.value;
      document.getElementById("tentity-structure-seed").value = datHandler.longTagValue(tileEntity.seed.value);
      document.getElementById("tentity-structure-animationmode").value = (tileEntity.hasOwnProperty("animationMode") ? tileEntity.animationMode.value : 0);
      document.getElementById("tentity-structure-animationSeconds").value = (tileEntity.hasOwnProperty("animationSeconds") ? tileEntity.animationSeconds.value : 0);;
      break;
    }
    case 'jigsaw': {
      //Jigsaw tab
      document.getElementById("tentity-jigsaw-name").value = tileEntity.name.value;
      document.getElementById("tentity-jigsaw-target").value = tileEntity.target.value;
      document.getElementById("tentity-jigsaw-targetpool").value = tileEntity.target_pool.value;
      document.getElementById("tentity-jigsaw-finalstate").value = tileEntity.final_state.value;
      document.getElementById("tentity-jigsaw-joint").value = tileEntity.joint.value;
      break;
    }
    case 'spawner': {
      document.getElementById("tentity-spawner-identifier").value = tileEntity.EntityIdentifier.value;
      document.getElementById("tentity-spawner-delay").value = tileEntity.Delay.value;
      document.getElementById("tentity-spawner-delay-min").value = tileEntity.MinSpawnDelay.value;
      document.getElementById("tentity-spawner-delay-max").value = tileEntity.MaxSpawnDelay.value;
      document.getElementById("tentity-spawner-spawncount").value = tileEntity.SpawnCount.value;
      document.getElementById("tentity-spawner-maxnearbyentities").value = tileEntity.MaxNearbyEntities.value;
      document.getElementById("tentity-spawner-requiredplayerrange").value = tileEntity.RequiredPlayerRange.value;
      document.getElementById("tentity-spawner-spawnrange").value = tileEntity.SpawnRange.value;
      document.getElementById("tentity-spawner-display-width").value = tileEntity.DisplayEntityWidth.value;
      document.getElementById("tentity-spawner-display-height").value = tileEntity.DisplayEntityHeight.value;
      document.getElementById("tentity-spawner-display-scale").value = tileEntity.DisplayEntityScale.value;
      break;
    }
    case 'noteblock': {
      document.getElementById("tentity-noteblock-note").value = tileEntity.note.value;
      break;
    }
    case 'banner': {
      document.getElementById("tentity-banner-type").checked = tileEntity.Type.value;
      document.getElementById("tentity-banner-base").value = tileEntity.Base.value;
      break;
    }
    case 'flowerpot': {
      document.getElementById("tentity-flowerpot-name").value = tileEntity.hasOwnProperty("PlantBlock") ? tileEntity.PlantBlock.value.name.value : '';
      //TODO: Flowerpot BLockstates
      break;
    }
    case 'netherreactor': {
      document.getElementById("tentity-netherreactor-isinitialized").checked = boolByte(tileEntity.IsInitialized.value);
      document.getElementById("tentity-netherreactor-hasfinished").checked = boolByte(tileEntity.HasFinished.value);
      document.getElementById("tentity-netherreactor-progress").value = tileEntity.Progress.value;
      break;
    }
    case 'endgateway': {
      document.getElementById("tentity-endgateway-age").value = tileEntity.Age.value;
      document.getElementById("tentity-endgateway-exitportal-x").value = tileEntity.ExitPortal.value.value[0];
      document.getElementById("tentity-endgateway-exitportal-y").value = tileEntity.ExitPortal.value.value[1];
      document.getElementById("tentity-endgateway-exitportal-z").value = tileEntity.ExitPortal.value.value[2];
      break;
    }
    case 'furnace': {
      //Render values
      document.getElementById("tentity-furnace-burntime").value = tileEntity.BurnTime.value;
      document.getElementById("tentity-furnace-burnduration").value = tileEntity.BurnDuration.value;
      document.getElementById("tentity-furnace-cooktime").value = tileEntity.CookTime.value;
      document.getElementById("tentity-furnace-storedxpint").value = tileEntity.StoredXPInt.value;
      
      //Empty slots
      for(let slot of document.getElementById("tentity-furnace-items").querySelectorAll(".itemgrid td")){
        slot.innerHTML = "";
      }
      
      //Fill slots
      let itemslist = tileEntity.Items.value.value;
      fillItemSlots(itemslist, document.getElementById("tentity-furnace-items"), ".itemgrid td")
      
      //Render items
      mcitems.init()
      
      break;
    }
    case 'brewing': {
      //Render values
      document.getElementById("tentity-brewing-fuelamount").value = tileEntity.FuelAmount.value;
      document.getElementById("tentity-brewing-fueltotal").value = tileEntity.FuelTotal.value;
      document.getElementById("tentity-brewing-cooktime").value = tileEntity.CookTime.value;
      
      //Empty slots
      for(let slot of document.getElementById("tentity-brewing-items").querySelectorAll("td")){
        slot.innerHTML = "";
      }
      
      //Fill slots
      let itemslist = tileEntity.Items.value.value;
      
      fillItemSlots(itemslist, document.getElementById("tentity-brewing-items"))
      
      //Render items
      mcitems.init()
            
      break;
    }
    case 'lectern': {
      //Render values
      document.getElementById("tentity-lectern-hasbook").checked = boolByte(tileEntity.hasBook.value);
      document.getElementById("tentity-lectern-page").value = tileEntity.page.value;
      document.getElementById("tentity-lectern-maxpages").value = tileEntity.totalPages.value;
      
      //Fill item slot
      document.getElementById("tentity-lectern-item").querySelector("td").innerHTML = "";
      if(tileEntity.book){
        document.getElementById("tentity-lectern-item").querySelector("td").appendChild(createItemElement(tileEntity.book.value))
      }
      
      //Render items
      mcitems.init()
      
      break;
    }
    case 'beehive': {
      document.getElementById("tentity-beehive-shouldspawnbees").checked = boolByte(tileEntity.ShouldSpawnBees.value);
      
      //Render entity list
      document.getElementById("tentity-beehive-occupants").innerHTML = "";
      let occupants = (tileEntity.Occupants ? tileEntity.Occupants.value.value : []);
      for(let i = 0; i < occupants.length; i++){
        let occupant = occupants[i];
        document.getElementById("tentity-beehive-occupants").appendChild(createBeehiveEntity(
          {
            'identifier': occupant.SaveData.value.identifier.value,
            'ticksremaining': occupant.TicksLeftToStay.value,
            'occupantindex': i
          }
        ))
      }
      break;
    }
    case 'itemframe': {
      document.getElementById("tentity-itemframe-rotation").value = tileEntity.ItemRotation.value;
      document.getElementById("tentity-itemframe-dropchance").value = tileEntity.ItemDropChance.value;
      
      //Fill item slot
      document.getElementById("tentity-itemframe-item").innerHTML = "";
      if(tileEntity.Item){
        document.getElementById("tentity-itemframe-item").appendChild(createItemElement(tileEntity.Item.value))
      }
      
      //Render items
      mcitems.init();
      break;
    }
    case 'cauldron': {
      document.getElementById("tentity-cauldron-potion").value = tileEntity.PotionId.value;
      document.getElementById("tentity-cauldron-potiontype").value = tileEntity.PotionType.value;
      
      if(tileEntity.hasOwnProperty("CustomColor")){
        document.getElementById("tentity-cauldron-colorlabel").style.display = "unset";
        document.getElementById("tentity-cauldron-color").value = datHandler.argb.intToHex(tileEntity.CustomColor.value, true);
      } else {
        document.getElementById("tentity-cauldron-colorlabel").style.display = "none";
      }
      break;
    }
    case 'decoratedpot': {
      let sherds = tileEntity.sherds.value.value;
      
      document.getElementById("tentity-decoratedpot-sherd0").value = sherds[0];
      document.getElementById("tentity-decoratedpot-sherd1").value = sherds[1];
      document.getElementById("tentity-decoratedpot-sherd2").value = sherds[2];
      document.getElementById("tentity-decoratedpot-sherd3").value = sherds[3];
      break;
    }
    case 'brushable': {
      document.getElementById("tentity-brushable-type").value = tileEntity.type.value;
      
      document.getElementById("tentity-brushable-brushcount").value = tileEntity.brush_count.value;
      document.getElementById("tentity-brushable-brushdirection").value = tileEntity.brush_direction.value;
      document.getElementById("tentity-brushable-loottable").value = tileEntity.LootTable.value;
      document.getElementById("tentity-brushable-loottableseed").value = tileEntity.LootTableSeed.value;
      
      break;
    }
  }
}

function fillItemSlots(itemslist, slotcontainer, selector = "td"){
  //Fills item slots with items
  for(let i = 0; i < itemslist.length; i++){
    let currentlisteditem = itemslist[i];
    let appropriateindex = i;
    if(currentlisteditem.Slot){
      appropriateindex = currentlisteditem.Slot.value;
    }

    let slot = slotcontainer;
    if(slotcontainer.tagName !== "TD"){
      slot = slotcontainer.querySelectorAll(selector)[appropriateindex]
    }
    if(currentlisteditem.Name && currentlisteditem.Name.value != ''){
      slot.appendChild(createItemElement(currentlisteditem))
    }
  }
}

function closeEditors(){
  document.getElementById("item-editor").style.display = "none";
  document.getElementById("entity-editor").style.display = "none";
  document.getElementById("tileentity-editor").style.display = "none";
  document.getElementById("block-editor").style.display = "none";
  document.getElementById("overlay").style.display = "none";
  
  //Hide the Item Editor's Node Editor warning
  document.getElementById('item-node-warning').style.display='none';
  
  //Delete last entry of openededitors
  openedEditors.splice(openedEditors.length-1, 1);
  
  //Reset opened page of book editor
  bookEditor.currentPage = 0;
  
  //If there is another opened editor, open it
  if(openedEditors.length > 0){
    openEditor();
  }
}

function closeAllEditors(){
  while(openedEditors.length > 0){
    closeEditors();
  }
}

function openEditor(){
  //Close all open editors
  document.getElementById("item-editor").style.display = "none";
  document.getElementById("entity-editor").style.display = "none";
  document.getElementById("tileentity-editor").style.display = "none";
  document.getElementById("block-editor").style.display = "none";
  document.getElementById("overlay").style.display = "none";
  
  //Open lowest level of openedEditors
  let editorentry = openedEditors[openedEditors.length-1];
  if(!editorentry) return;
  
  switch(editorentry.editor) {
    case 'entity-editor': {
      openEntityEditor();
      break;
    }
    case 'tentity-editor': {
      //Apply correct tab configuration
      let validtabs = editorentry.validtabs || [];
      for(let tab of document.getElementById("tile-entity-tabs").getElementsByClassName("tab")){
        if(validtabs.includes(tab.getAttribute("open"))){
          tab.style.display = "inline-block"
        } else {
          tab.style.display = "none"
        }
      }

      //Find the appropriate tab to switch to if the editor isn't open yet
      if(document.getElementById("tileentity-editor").style.display == "none"){
        //Hide the selected tab if it shouldn't be visible
        let selectedtab = document.getElementById("tile-entity-tabs").querySelector(".selected");
        if(selectedtab.style.display === "none"){
          selectedtab.classList.toggle("selected", false)
          document.querySelector(".group-tentity.visible").classList.toggle("visible", false)
        }

        //Switch to the visible non-overview tab
        for(let potentialtab of document.getElementById("tile-entity-tabs").querySelectorAll(".tab")){
          if(potentialtab.getAttribute("open") != "tentity-general" && potentialtab.style.display != "none"){
            potentialtab.classList.toggle("selected", true);
            document.getElementById(potentialtab.getAttribute("open")).classList.toggle("visible", true);
            document.getElementById("tile-entity-tabs").children[0].classList.toggle("selected", false)
            document.querySelector(".group-tentity#tentity-general").classList.toggle("visible", false)
            break;
          }
        }
      }
      
      openTileEntityEditor();
      break;
    }
    case 'item-editor': {
      openItemEditor();
      break;
    }
    case 'block-editor': {
      openBlockEditor();
      break;
    }
  }
  
  //Render the opened editors count
  let editorcount = openedEditors.length;
  if(editorcount > 1){
    document.getElementById("open-editors").innerHTML = editorcount + " open editors";
    document.getElementById("open-editors").style.display = "unset";
  } else {
    document.getElementById("open-editors").innerHTML = ""
    document.getElementById("open-editors").style.display = "none";
  }
}

function openEditEntity(domain){
  //let entity = getEntities()[index]
  let entity = eval(domain)
  openedEditors.push({type: 'entity', editor: 'entity-editor', data: entity})
  
  //Switch to the overview tab if the editor was previously closed
  if(document.getElementById("entity-editor").style.display == "none"){
    //Deselect the selected tab if it shouldn't be visible
    let selectedtab = document.getElementById("entity-tabs").querySelector(".selected");
    selectedtab.classList.toggle("selected", false);
    document.querySelector(".group-entity.visible").classList.toggle("visible", false);
    document.getElementById("entity-tabs").children[0].classList.toggle("selected", true)
    document.querySelector(".group-entity#entity-general").classList.toggle("visible", true)
  }
  
  openEditor()
}

const templateitem = {
  "Count": {
    "type": "byte",
    "value": 1
  },
  "Damage": {
    "type": "short",
    "value": 0
  },
  "Name": {
    "type": "string",
    "value": ""
  },
  "WasPickedUp": {
    "type": "byte",
    "value": 0
  }
};

function openEditItem(domain, createlocation = false){
  let itemdata = false;
  try {
    itemdata = eval(domain)
  } catch(e) {
    if(createlocation){
      eval(createlocation);
      itemdata = eval(domain)
    }
  }
  openedEditors.push({type: 'item', editor: 'item-editor', data: itemdata})
  
  //Switch to the overview tab
  let selectedtab = document.getElementById("item-tabs").querySelector(".selected");
  //if(document.getElementById("item-editor").style.display == "none"){
    //Deselect the selected tab if it shouldn't be visible
    selectedtab.classList.toggle("selected", false);
    document.querySelector(".group-item.visible").classList.toggle("visible", false);
    document.getElementById("item-tabs").children[0].classList.toggle("selected", true)
    document.querySelector(".group-item#item-general").classList.toggle("visible", true)
  //}
  
  mcitems.tooltip.hide()
  
  openEditor()
}

function openEditBlock(domain){
  let blockdata = eval(domain);
  openedEditors.push({type: 'block', editor: 'block-editor', data: blockdata})
  
  openEditor()
}

function openEditTile(domain){
  let tile = eval(domain); //Tile must be a valid tile entity
  let editorentry = {type: 'tile-entity', editor: 'tentity-editor', data: tile};

  //currentTile = getTileEntities()[index];
  
  //Is this tile entity grouped?
  let validgroupitem = false;
  function isGrouped(){
    let validList = getValidTileEntities(getTileEntities())
    for(let validitem of validList){
      if(validitem.constructor == Array){
        //Current item is a group, check if it contains the thing
        for(let groupitem of validitem){
          if(groupitem.index == tile.index){
            validgroupitem = groupitem
            console.log('group found', groupitem)
            return validitem;
          }
        }
      }
    }
    return false
  }
  
  let group = isGrouped();
  currentTileGroup = group
  if(group){
    editorentry.data = group;
    editorentry.selectedIndex = group.indexOf(validgroupitem);
    document.getElementById("tentity-page-selector").style.visibility = "visible";
    document.getElementById("tentity-current-page").innerHTML = group.indexOf(validgroupitem) + 1;
    document.getElementById("tentity-total-pages").innerHTML = group.length;
    //Is group not already open?
    if(openedEditors.length == 0 || JSON.stringify(openedEditors[openedEditors.length-1].data) != JSON.stringify(group)){
      openedEditors.push(editorentry);
    } else {
      openedEditors[openedEditors.length-1].selectedIndex = editorentry.selectedIndex;
    }
  } else {
    document.getElementById("tentity-page-selector").style.visibility = "hidden";
    openedEditors.push(editorentry);
  }
  
  if(openedEditors[openedEditors.length-1].data.constructor != Array){
    currentValidTile = openedEditors[openedEditors.length-1].data;
  } else {
    currentValidTile = openedEditors[openedEditors.length-1].data[openedEditors[openedEditors.length-1].selectedIndex];
  }
  
  let tileEntity = currentValidTile.data;
  
  //Essential values
  let id = tileEntity.id.value;
  let definition = data.tiles[id] || {type: 'missing'};
  
  //Find which tabs are appropriate
  let validtabs = [
    "tentity-general",
    "tentity-" + getBlockDefinitionType(definition.type, tileEntity)
  ]
  editorentry.validtabs = validtabs;
  
  openEditor()
}

function openPreviousTile(){
  let currentTileGroupItemIndex = openedEditors[openedEditors.length-1].selectedIndex || false;
  if(currentTileGroupItemIndex-1 < 0) return false;
  openEditTile('currentTileGroup['+ (currentTileGroupItemIndex - 1) +']')
}

function openNextTile(){
  let currentTileGroupItemIndex = openedEditors[openedEditors.length-1].selectedIndex || false;
  if(currentTileGroupItemIndex+1 > currentTileGroup.length-1) return false;
  openEditTile('currentTileGroup['+ (currentTileGroupItemIndex + 1) +']')
}

function selectEntityItem(){
  closeEditors()
  openItemEditor()
}

function searchList(inputel, listid, query = false){
  let listel = document.getElementById(listid);
  if(!listel) return;
  
  let term = inputel.value;
  let searchgroup = query ? listel.querySelectorAll(query) : listel.children;
  
  for(let el of listel.children){
    let searchdomain = el.getAttribute("searchable") || el.innerHTML;
    if((searchdomain.toLowerCase().includes(term.toLowerCase()) && Array.from(searchgroup).includes(el)) || term === ""){
      el.style.display = "block";
    } else {
      el.style.display = "none";
    }
  }
}

function upgradeSign(){
  saveTileEntity()
  let tileEntity = currentValidTile.data;
  tileEntity.FrontText = {type: 'compound', value: {
    IgnoreLighting: JSON.parse(JSON.stringify(tileEntity.IgnoreLighting)),
    PersistFormatting: JSON.parse(JSON.stringify(tileEntity.PersistFormatting)),
    SignTextColor: JSON.parse(JSON.stringify(tileEntity.SignTextColor)),
    Text: JSON.parse(JSON.stringify(tileEntity.Text)),
    TextOwner: JSON.parse(JSON.stringify(tileEntity.TextOwner))
  }};
  
  tileEntity.BackText = {type: 'compound', value: {
    IgnoreLighting: nbt.byte(0),
    PersistFormatting: nbt.byte(1),
    SignTextColor: nbt.int(-16777216),
    Text: nbt.string(''),
    TextOwner: nbt.string('')
  }};
  
  delete tileEntity.IgnoreLighting;
  delete tileEntity.PersistFormatting;
  delete tileEntity.SignTextColor;
  delete tileEntity.Text;
  delete tileEntity.TextOwner;
  delete tileEntity.TextIgnoreLegacyBugResolved;
  
  tileEntity.IsWaxed = nbt.byte(1) //Legacy Signs are not editable so they should be waxed by default
  
  closeEditors()
}

function saveTileEntity(){  
  let tileEntity = currentValidTile.data;
  //Update values based off inputs
  
  //Overview tab
  if(tileEntity.x && tileEntity.y && tileEntity.z){
    tileEntity.isMovable.value = boolByte(document.getElementById("tentity-general-ismovable").checked);
    if(document.getElementById("tentity-general-customname").value != ""){
      currentValidTile.data.CustomName = {
        "type": "string",
        "value": document.getElementById("tentity-general-customname").value
      }
    } else {
      delete currentValidTile.data.CustomName;
    }
  } else {
    if(document.getElementById("tentity-pseudo-customname").value != ""){
      currentValidTile.data.CustomName = {
        "type": "string",
        "value": document.getElementById("tentity-pseudo-customname").value
      }
    } else {
      delete currentValidTile.data.CustomName;
    }
  }
  
  let blockdef = data.tiles[tileEntity.id.value] || {type: false}
  let blocktype = getBlockDefinitionType(blockdef.type, tileEntity)
  //Update other values based off blocktype and inputs
  switch(blocktype){
    default: {
      break;
    }
    case 'commandblock': {
      //Command block tab
      tileEntity.Command.value = document.getElementById("tentity-commandblock-command").value;
      tileEntity.TickDelay.value = parseFloat(document.getElementById("tentity-commandblock-tickdelay").value);
      tileEntity.TrackOutput.value = boolByte(document.getElementById("tentity-commandblock-trackoutput").checked);
      tileEntity.conditionalMode.value = boolByte(document.getElementById("tentity-commandblock-conditional").checked);
      tileEntity.conditionMet.value = boolByte(document.getElementById("tentity-commandblock-conditionmet").checked);
      tileEntity.powered.value = boolByte(document.getElementById("tentity-commandblock-powered").checked);
      tileEntity.auto.value = parseFloat(document.getElementById("tentity-commandblock-auto").value);
      tileEntity.ExecuteOnFirstTick.value = boolByte(document.getElementById("tentity-commandblock-executeonfirsttick").checked);
      break;
    };
    case 'legacy-sign': {
      //Sign tab
      tileEntity.Text.value = document.getElementById("tentity-legacy-sign-text").value;
      tileEntity.IgnoreLighting = {type: 'byte', value: boolByte(document.getElementById("tentity-legacy-sign-ignorelighting").checked)};
      tileEntity.TextIgnoreLegacyBugResolved = {
        type: "byte",
        value: !boolByte(document.getElementById("tentity-legacy-sign-textignorelegacybugresolved").checked)
      };
      tileEntity.PersistFormatting = {type: 'byte', value: boolByte(document.getElementById("tentity-legacy-sign-persistformatting").checked)};
      break;
    }
    case 'sign': {
      //Sign tab
      let backtext = tileEntity.BackText.value;
      
      tileEntity.FrontText = {type: 'compound', value: {
        IgnoreLighting: nbt.byte(boolByte(document.getElementById("tentity-sign-front-ignorelighting").checked)),
        PersistFormatting: nbt.byte(boolByte(document.getElementById("tentity-sign-front-persistformatting").checked)),
        SignTextColor: nbt.int(datHandler.argb.hexToInt(document.getElementById("tentity-sign-front-color").value, true)),
        Text: nbt.string(document.getElementById("tentity-sign-front-text").value),
        TextOwner: nbt.string('')
      }};
      
      tileEntity.BackText = {type: 'compound', value: {
        IgnoreLighting: nbt.byte(boolByte(document.getElementById("tentity-sign-back-ignorelighting").checked)),
        PersistFormatting: nbt.byte(boolByte(document.getElementById("tentity-sign-back-persistformatting").checked)),
        SignTextColor: nbt.int(datHandler.argb.hexToInt(document.getElementById("tentity-sign-back-color").value, true)),
        Text: nbt.string(document.getElementById("tentity-sign-back-text").value),
        TextOwner: nbt.string('')
      }};
      
      tileEntity.IsWaxed = nbt.byte(boolByte(document.getElementById("tentity-sign-waxed").checked));
      
      break;
    }
    case 'container': {
      //Loot tables and findable values
      if(document.getElementById("tentity-container-loottable").value != ""){
        currentValidTile.data.LootTable = {
          "type": "string",
          "value": document.getElementById("tentity-container-loottable").value
        }
      } else {
        delete currentValidTile.data.LootTable;
      }
      
      if(document.getElementById("tentity-container-loottable").value != ""){
        currentValidTile.data.LootTableSeed = {
          "type": "int",
          "value": parseFloat(document.getElementById("tentity-container-loottableseed").value)
        }
      } else {
        delete currentValidTile.data.LootTableSeed;
      }
      
      if(tileEntity.Findable){
        tileEntity.Findable.value = boolByte(document.getElementById("tentity-container-findable").checked);
      }
      break;
    }
    case 'campfire': {
      currentValidTile.data.ItemTime1.value = parseFloat(document.getElementById("tentity-campfire-itemtime1").value);
      currentValidTile.data.ItemTime2.value = parseFloat(document.getElementById("tentity-campfire-itemtime2").value);
      currentValidTile.data.ItemTime3.value = parseFloat(document.getElementById("tentity-campfire-itemtime3").value);
      currentValidTile.data.ItemTime4.value = parseFloat(document.getElementById("tentity-campfire-itemtime4").value);
      break;
    }
    case 'hopper': {
      currentValidTile.data.TransferCooldown.value = parseFloat(document.getElementById("tentity-hopper-transfercooldown").value);
      break;
    }
    case 'structureblock': {
      //Structure Block tab
      tileEntity.showBoundingBox.value = {type: 'byte', value: boolByte(document.getElementById("tentity-structure-showboundingbox").checked)};
      tileEntity.ignoreEntities.value = {type: 'byte', value: boolByte(document.getElementById("tentity-structure-ignoreentities").checked)};
      tileEntity.removeBlocks.value = {type: 'byte', value: boolByte(document.getElementById("tentity-structure-removeblocks").checked)};
      tileEntity.includePlayers.value = {type: 'byte', value: boolByte(document.getElementById("tentity-structure-includeplayers").checked)};
      tileEntity.isPowered.value = {type: 'byte', value: boolByte(document.getElementById("tentity-structure-ispowered").checked)};
      tileEntity.structureName.value = {type: 'string', value: document.getElementById("tentity-structure-structurename").value};
      tileEntity.xStructureSize.value = {type: 'int', value: parseFloat(document.getElementById("tentity-structure-size-x").value)};
      tileEntity.yStructureSize.value = {type: 'int', value: parseFloat(document.getElementById("tentity-structure-size-y").value)};
      tileEntity.zStructureSize.value = {type: 'int', value: parseFloat(document.getElementById("tentity-structure-size-z").value)};
      tileEntity.xStructureOffset.value = {type: 'int', value: parseFloat(document.getElementById("tentity-structure-offset-x").value)};
      tileEntity.yStructureOffset.value = {type: 'int', value: parseFloat(document.getElementById("tentity-structure-offset-y").value)};
      tileEntity.zStructureOffset.value = {type: 'int', value: parseFloat(document.getElementById("tentity-structure-offset-z").value)};
      tileEntity.redstoneSaveMode = {type: 'int', value: parseFloat(document.getElementById("tentity-structure-redstoneSaveMode").value)};
      tileEntity.rotation = {type: 'byte', value: parseFloat(document.getElementById("tentity-structure-rotation").value)};
      tileEntity.mirror = {type: 'byte', value: parseFloat(document.getElementById("tentity-structure-mirror").value)};
      tileEntity.integrity = {type: 'float', value: parseFloat(document.getElementById("tentity-structure-integrity").value)};
      tileEntity.seed = {type: 'long', value: datHandler.generateLongTag(BigInt(document.getElementById("tentity-structure-seed").value))};
      tileEntity.animationMode = {type: 'byte', value: parseFloat(document.getElementById("tentity-structure-animationmode").value)};
      tileEntity.animationSeconds = {type: 'float', value: parseFloat(document.getElementById("tentity-structure-animationSeconds").value)};
      break;
    }
    case 'jigsaw': {
      //Jigsaw tab
      tileEntity.name.value = document.getElementById("tentity-jigsaw-name").value;
      tileEntity.target.value = document.getElementById("tentity-jigsaw-target").value;
      tileEntity.target_pool.value = document.getElementById("tentity-jigsaw-targetpool").value;
      tileEntity.final_state.value = document.getElementById("tentity-jigsaw-finalstate").value;
      tileEntity.joint.value = document.getElementById("tentity-jigsaw-joint").value;
      break;
    }
    case 'spawner': {
      document.getElementById("tentity-spawner-identifier").value = tileEntity.EntityIdentifier.value;
      document.getElementById("tentity-spawner-delay").value = parseFloat(tileEntity.Delay.value);
      document.getElementById("tentity-spawner-delay-min").value = parseFloat(tileEntity.MinSpawnDelay.value);
      document.getElementById("tentity-spawner-delay-max").value = parseFloat(tileEntity.MaxSpawnDelay.value);
      document.getElementById("tentity-spawner-spawncount").value = parseFloat(tileEntity.SpawnCount.value);
      document.getElementById("tentity-spawner-maxnearbyentities").value = parseFloat(tileEntity.MaxNearbyEntities.value);
      document.getElementById("tentity-spawner-requiredplayerrange").value = parseFloat(tileEntity.RequiredPlayerRange.value);
      document.getElementById("tentity-spawner-spawnrange").value = parseFloat(tileEntity.SpawnRange.value);
      document.getElementById("tentity-spawner-display-width").value = parseFloat(tileEntity.DisplayEntityWidth.value);
      document.getElementById("tentity-spawner-display-height").value = parseFloat(tileEntity.DisplayEntityHeight.value);
      document.getElementById("tentity-spawner-display-scale").value = parseFloat(tileEntity.DisplayEntityScale.value);
      break;
    }
    case 'noteblock': {
      tileEntity.note.value = parseFloat(document.getElementById("tentity-noteblock-note").value);
      break;
    }
    case 'banner': {
      tileEntity.Type.value = boolByte(document.getElementById("tentity-banner-type").checked);
      tileEntity.Base.value = parseFloat(document.getElementById("tentity-banner-base").value);
      break;
    }
    case 'flowerpot': {
      //document.getElementById("tentity-flowerpot-name").value = tileEntity.hasOwnProperty("PlantBlock") ? tileEntity.PlantBlock.value.name.value : '';
      //TODO: save flowerpot
      break;
    }
    case 'netherreactor': {
      tileEntity.IsInitialized.value = boolByte(document.getElementById("tentity-netherreactor-isinitialized").checked);
      tileEntity.HasFinished.value = boolByte(document.getElementById("tentity-netherreactor-hasfinished").checked);
      tileEntity.Progress.value = parseFloat(document.getElementById("tentity-netherreactor-progress").value);
      break;
    }
    case 'endgateway': {
      tileEntity.Age.value = parseFloat(document.getElementById("tentity-endgateway-age").value);
      tileEntity.ExitPortal.value.value[0] = parseFloat(document.getElementById("tentity-endgateway-exitportal-x").value);
      tileEntity.ExitPortal.value.value[1] = parseFloat(document.getElementById("tentity-endgateway-exitportal-y").value);
      tileEntity.ExitPortal.value.value[2] = parseFloat(document.getElementById("tentity-endgateway-exitportal-z").value);
      break;
    }
    case 'furnace': {
      currentValidTile.data.BurnTime.value = parseFloat(document.getElementById("tentity-furnace-burntime").value);
      currentValidTile.data.BurnDuration.value = parseFloat(document.getElementById("tentity-furnace-burnduration").value);
      currentValidTile.data.CookTime.value = parseFloat(document.getElementById("tentity-furnace-cooktime").value);
      currentValidTile.data.StoredXPInt.value = parseFloat(document.getElementById("tentity-furnace-storedxpint").value);      
      break;
    }
    case 'brewing': {
      currentValidTile.data.FuelAmount.value = parseFloat(document.getElementById("tentity-brewing-fuelamount").value);
      currentValidTile.data.FuelTotal.value = parseFloat(document.getElementById("tentity-brewing-fueltotal").value);
      currentValidTile.data.CookTime.value = parseFloat(document.getElementById("tentity-brewing-cooktime").value);
      break;
    }
    case 'lectern': {
      //Render values
      currentValidTile.data.hasBook.value = boolByte(document.getElementById("tentity-lectern-hasbook").checked);
      currentValidTile.data.page.value = parseFloat(document.getElementById("tentity-lectern-page").value);
      currentValidTile.data.totalPages.value = parseFloat(document.getElementById("tentity-lectern-maxpages").value);
      break;
    }
    case 'beehive': {
      currentValidTile.data.ShouldSpawnBees.value = boolByte(document.getElementById("tentity-beehive-shouldspawnbees").checked);
      
      //Save ticks remaining of entities
      for(let i = 0; i < document.getElementById("tentity-beehive-occupants").children.length; i++){
        let row = document.getElementById("tentity-beehive-occupants").children[i];
        let occupantdata = currentValidTile.data.Occupants.value.value[i];
        occupantdata.TicksLeftToStay = {'type': 'int', 'value': row.querySelector(".ticks-remaining-to-stay").value};
        occupantdata.ActorIdentifier = row.querySelector(".idlabel").innerHTML;
      }
      break;
    }
    case 'itemframe': {
      tileEntity.ItemRotation = {type: 'float', value: document.getElementById("tentity-itemframe-rotation").value};
      tileEntity.ItemDropChance = {type: 'float', value: document.getElementById("tentity-itemframe-dropchance").value};
      break;
    }
    case 'cauldron': {
      tileEntity.PotionId = nbt.short(document.getElementById("tentity-cauldron-potion").value);
      tileEntity.PotionType = nbt.short(document.getElementById("tentity-cauldron-potiontype").value);
      
      if(document.getElementById("tentity-cauldron-colorlabel").style.display === "unset"){
        tileEntity.CustomColor = nbt.int(datHandler.argb.hexToInt(document.getElementById("tentity-cauldron-color").value, true))
      } else {
        delete tileEntity.CustomColor;
      }
      break;
    }
    case 'decoratedpot': {      
      tileEntity.sherds = nbt.list(nbt.string([
        document.getElementById("tentity-decoratedpot-sherd0").value,
        document.getElementById("tentity-decoratedpot-sherd1").value,
        document.getElementById("tentity-decoratedpot-sherd2").value,
        document.getElementById("tentity-decoratedpot-sherd3").value
      ]))
      
      break;
    }
    case 'brushable': {
      tileEntity.type = nbt.string(document.getElementById("tentity-brushable-type").value);
      
      tileEntity.brush_count = nbt.int(parseFloat(document.getElementById("tentity-brushable-brushcount").value));
      tileEntity.brush_direction = nbt.byte(parseFloat(document.getElementById("tentity-brushable-brushdirection").value));
      
      tileEntity.LootTable = nbt.string(document.getElementById("tentity-brushable-loottable").value);
      tileEntity.LootTableSeed = nbt.int(parseFloat(document.getElementById("tentity-brushable-loottableseed").value));
      break;
    }
  }
  
  //Handle pseudo-tiles
  if(currentValidTile.type && currentValidTile.type === 'pseudo'){
    let truedata = Object.assign({}, currentValidTile.data);
    delete truedata.id;
    
    currentValidTile.original.tag = {
      "type": "compound",
      "value": truedata
    }
    snackbar("Your pseudo tile entity has been saved.")
  } else {
    snackbar("Your tile entity has been saved.")
  }
  
  openTileEntityEditor()
  generateTileEntitiesList() //Update list in case a sherd changed
}

function saveEntity(){  
  let entity = currentEntity;
  //Set health
  let hashealth = currentEntity.hasOwnProperty("Health") || false;
  if(hashealth){
    currentEntity.Health.value = document.getElementById("entity-general-health-min").value;
  } else {
    //Filter through attributes until an appropriate one is found
    if(currentEntity.Attributes){
      for(let attribute of currentEntity.Attributes.value.value){
        if(attribute.Name && attribute.Name.value == "minecraft:health"){
          attribute.Current.value = document.getElementById("entity-general-health-min").value;
          attribute.Max.value = document.getElementById("entity-general-health-max").value;
        }
      }
    }
  }
  
  //Render values in the editor
  entity.identifier.value = document.getElementById("entity-general-identifier").value;
  entity.Pos.value.value = [
    document.getElementById("entity-general-pos-x").value,
    document.getElementById("entity-general-pos-y").value,
    document.getElementById("entity-general-pos-z").value
  ];
  entity.Rotation.value.value = [
    document.getElementById("entity-general-rot-x").value,
    document.getElementById("entity-general-rot-y").value
  ];
  if(document.getElementById("entity-general-nametag").value != ""){
    entity.CustomName = {
      "type": "string",
      "value": document.getElementById("entity-general-nametag").value
    }
  } else {
    delete entity.CustomName;
  }
  
  if(document.getElementById("entity-general-tags").value != ""){
    entity.Tags.value = {
      "type": "string",
      "value": document.getElementById("entity-general-tags").value.split("\n")
    }
  } else {
    entity.Tags.value = {
      "type": "end",
      "value": []
    }
  }
  
  //Parse through rendered effects
  let effects = document.getElementById("entity-general-effects").children;
  
  function getId(value){
    if(Number(value) == value){
      return Number(value) + 1;
    } else {
      return (data.effects.indexOf(value) + 1)
    }
  }
  
  if(effects.length != 0){
    entity.ActiveEffects = {
      "type": "list",
      "value": {
        "type": "compound",
        "value": []
      }
    };
    for(let effectel of effects){
      //Re-render effect data
      let neweffect = {
        "Ambient":{"type":"byte","value":0},
        "Amplifier":{"type":"byte","value": effectel.querySelector(".entity-general-effect-strength").value },
        "DisplayOnScreenTextureAnimation":{"type":"byte","value":0},
        "Duration":{"type":"int","value": effectel.querySelector(".entity-general-effect-duration").value },
        "DurationEasy":{"type":"int","value": effectel.querySelector(".entity-general-effect-duration").value },
        "DurationHard":{"type":"int","value": effectel.querySelector(".entity-general-effect-duration").value },
        "DurationNormal":{"type":"int","value": effectel.querySelector(".entity-general-effect-duration").value },
        "FactorCalculationData":{"type":"compound","value":{
          "change_timestamp":{"type":"int","value":0},"factor_current":{"type":"float","value":0},"factor_previous":{"type":"float","value":0},"factor_start":{"type":"float","value":0},"factor_target":{"type":"float","value":1},"had_applied":{"type":"byte","value":1},"had_last_tick":{"type":"byte","value":0},"padding_duration":{"type":"int","value":0}}},
        "Id":{"type":"byte","value": getId(effectel.querySelector(".entity-general-effect-id").value) },
        "ShowParticles":{"type":"byte","value": boolByte(effectel.querySelector(".entity-general-effect-particles").checked) }
      };
      entity.ActiveEffects.value.value.push(neweffect);
    }
  } else {
    delete entity.ActiveEffects;
  }
  
  //Inventory tab
  if(currentEntity.ChestItems){
    if(document.getElementById("entity-inventory-loottable").value != ""){
      currentEntity.LootTable = {type: 'string', value: document.getElementById("entity-inventory-loottable").value};
    } else {
      delete currentEntity.LootTable;
    }
    if(document.getElementById("entity-inventory-loottableseed").value != ""){
      currentEntity.LootTableSeed = {type: 'int', value: parseFloat(document.getElementById("entity-inventory-loottableseed").value)};
    } else {
      delete currentEntity.LootTableSeed;
    }
  }
  
  
  //Minecart tab
  let minecarts = [
    "minecraft:minecart",
    "minecraft:chest_minecart",
    "minecraft:hopper_minecart",
    "minecraft:tnt_minecart",
    "minecraft:command_block_minecart"
  ]
  if(minecarts.includes(currentEntity.identifier.value)){
    //Save minecart values
    currentEntity.CustomDisplayTile = {type: 'byte', value: boolByte(document.getElementById("entity-minecart-custom").checked)};
    if(document.getElementById("entity-minecart-custom-id").value != ""){
      currentEntity.DisplayBlock = {
        "name": {
          "type": "string",
          "value": document.getElementById("entity-minecart-custom-id").value
        },
        "states": {
          "type": "compound",
          "value": {}
        },
        "version": {
          "type": "int",
          "value": 17959425
        }
      };
    } else {
      delete currentEntity.DisplayBlock;
    }
    
    if(document.getElementById("entity-minecart-custom-offset").value != ""){
      currentEntity.DisplayOffset = {
        "type": "int",
        "value": parseFloat(document.getElementById("entity-minecart-custom-offset").value)
      };
    } else {
      delete currentEntity.DisplayOffset;
    }
  }
  
  //Dialogue tab
  if(currentEntity.identifier.value == "minecraft:npc"){
    //Save dialogue values
    currentEntity.RawtextName.value = document.getElementById("entity-dialogue-name").value;
    currentEntity.InterativeText.value = document.getElementById("entity-dialogue-interactivetext").value;
      
    //Reparse actions
    let actionels = document.getElementById("entity-dialogue-actions").children;
    let actions = []
    for(let actionel of actionels){
      let jsonaction = {
        "button_name": actionel.querySelector(".button-label").value,
        "mode": parseFloat(actionel.querySelector(".mode").value),
        "text": actionel.querySelector(".cmd-text").value,
        "type": 1,
        "data": []
      };
      for(let line of jsonaction.text.split("\n")){
        if(line != ""){
          jsonaction.data.push({
            "cmd_line": line,
            "cmd_ver": 25
          })
        }
      }
      if(jsonaction.data.length == 0){
        jsonaction.data = null;
      }
      actions.push(jsonaction)
    }
    
    currentEntity.Actions = {
      "type": "string",
      "value": JSON.stringify(actions)
    }
  }
  
  //Item tab
  if(currentEntity.identifier.value == "minecraft:item"){
    //Save values
    currentEntity.Age.value = document.getElementById("entity-item-age").value;
  }
  
  snackbar("Your entity has been saved.")
  openEntityEditor()
}

function removeItemTag(propertyname){
  saveItem()
  let item = currentItem;
  delete item.tag.value[propertyname];
  closeEditors()
}

function saveItem(){  
  let item = currentItem;
  
  //Save values from editor
  item.Name.value = document.getElementById("item-general-identifier").value;
  item.Count.value = document.getElementById("item-general-count").value;
  item.Damage.value = document.getElementById("item-general-data").value;
  item.WasPickedUp.value = boolByte(document.getElementById("item-general-waspickedup").checked);
  
  //Save tag values
  let tag = item.tag || {"type": "compound", value: {}};
  let tags = tag.value;
  
  if(document.getElementById("item-general-damage").value != ''){
    tags.Damage = {"type": "int", "value": parseFloat(document.getElementById("item-general-damage").value)}
  } else {
    delete tags.Damage;
  }
  
  if(document.getElementById("item-general-unbreakable").checked){
    tags.Unbreakable = {"type": "byte", "value": boolByte(document.getElementById("item-general-unbreakable").checked)}
  } else {
    delete tags.Unbreakable;
  }
  
  //Meta Tags section
  if(document.getElementById("item-general-repaircost").value != "" && document.getElementById("item-general-repaircost").value != "0"){
    tags.RepairCost = {type: 'int', value: parseFloat(document.getElementById("item-general-repaircost").value)}
  } else {
    delete tags.RepairCost;
  }
  
  if(document.getElementById("item-general-display-name").value != "" || document.getElementById("item-general-display-lore").value != ""){
    tags.display = {type: 'compound', value: {}}
    if(document.getElementById("item-general-display-name").value != ""){
      tags.display.value.Name = {type: 'string', value: document.getElementById("item-general-display-name").value}
    } else {
      delete tags.display.Name;
    }
    
    if(document.getElementById("item-general-display-lore").value != ""){
      tags.display.value.Lore = {type: "list", value: {"type": "string", "value": document.getElementById("item-general-display-lore").value.split("\n")} }
    } else {
      delete tags.display.Lore;
    }
  } else {
    delete tags.display;
  }
  
  //GiveNBT section
  if(document.getElementById("item-general-itemlock").value != '0'){
    tags['minecraft:item_lock'] = {type: 'byte', value: parseFloat(document.getElementById("item-general-itemlock").value)}
  } else {
    delete tags['minecraft:item_lock'];
  }
  
  if(document.getElementById("item-general-keepondeath").checked){
    tags['minecraft:keep_on_death'] = {type: 'byte', value: 1}
  } else {
    delete tags['minecraft:keep_on_death'];
  }
  
  if(document.getElementById("item-general-canplaceon").value != ""){
    item.CanPlaceOn = {"type": "list", "value": { "type": "string", "value": document.getElementById("item-general-canplaceon").value.split("\n") } }
  } else {
    delete item.CanPlaceOn;
  }
  
  if(document.getElementById("item-general-candestroy").value != ""){
    item.CanDestroy = {"type": "list", "value": { "type": "string", "value": document.getElementById("item-general-candestroy").value.split("\n") } }
  } else {
    delete item.CanDestroy;
  }
  
  function getId(value){
    if(Number(value) == value){
      return Number(value);
    } else {
      return parseFloat(Object.keys(data.numeric_enchantments).find(key => data.numeric_enchantments[key] === value))
    }
  }
  
  //Enchantment section
  let enchants = document.getElementById("item-general-enchantments").children;
  if(enchants.length != 0){
    tags.ench = {
      "type": "list",
      "value": {
        "type": "compound",
        "value": []
      }
    };
    for(let enchel of enchants){
      //Re-render effect data
      let enchid = getId(enchel.querySelector(".item-general-enchantment-id").value);
      let newench = {
        id: {
          type: 'short', 
          value: enchid
        },
        lvl: {type: 'short', value: parseFloat(enchel.querySelector(".item-general-enchantment-strength").value)},
      };
      if(!isNaN(enchid)) tags.ench.value.value.push(newench);
    }
  } else {
    delete tags.ench;
  }
  
  //Block tab
  if(item.Block){
    let block = item.Block.value;
    //Autocorrect version number to whatever is in the data
    block.version = { "type": "int", "value": data.allowedblocks[0].version };
    block.name = {"type": "string", "value": document.getElementById("item-block-name").value};
    block.states = {"type": "compound", "value": {}};
    let blockstates = block.states.value;
    
    //Handle saved blockstates
    for(let entry of document.getElementById("item-block-states").children){
      let newstate = {
        type: entry.querySelector(".item-block-state-type").value,
        value: entry.querySelector(".item-block-state-value").value
      };
      
      if(entry.querySelector(".item-block-state-type").value == 'int'){
        newstate.value = parseFloat(newstate.value)
      } else if(entry.querySelector(".item-block-state-type").value == 'byte') {
        newstate.value = boolByte(entry.querySelector(".item-block-state-value").checked)
      }
      
      blockstates[entry.querySelector(".item-block-state-name").value] = newstate;
    }
  }
  
  //Mob tab
  if(tags.identifier){
    tags.AppendCustomName = {type: 'byte', value: boolByte(document.getElementById("item-mobbucket-useattributes").checked)};
  }
  
  //Map tab
  if(tags.map_uuid){    
    tags.map_display_players = {type: 'byte', value: boolByte(document.getElementById("item-map-players").checked)};
    tags.map_name_index = {type: 'int', value: document.getElementById("item-map-name").checked};
    tags.map_uuid = {type: 'long', value: datHandler.generateLongTag(BigInt(document.getElementById("item-map-uuid").value))};
  }
  
  //Potion tab
  if(tags.wasJustBrewed){
    tags.wasJustBrewed = {type: 'byte', value: boolByte(document.getElementById("item-potion-wasjustbrewed").checked)};
  }
  
  //Book tab
  if(tags.pages){
    tags.pages = {
      "type": "list",
      "value": {
        "type": "compound",
        "value": bookEditor.getData()
      }
    };
  }
  
  //Armor trim
  if(tags.Trim){
    tags.Trim = {
      "type": "compound",
      "value": {
        "Material": {
          "type": "string",
          "value": document.getElementById("item-armor-trim-material").value
        },
        "Pattern": {
          "type": "string",
          "value": document.getElementById("item-armor-trim-pattern").value
        }
      }
    }
  }
  
  //Leather color
  if(tags.customColor){
    tags.customColor = {
      "type": "int",
      "value": datHandler.argb.hexToInt(document.getElementById("item-armor-customcolor").value, true)
    }
  }
  
  //Fix tags
  if(!item.tag) item.tag = tag;
  
  snackbar("Your item has been saved.")
  openItemEditor()
}

function saveBlock(){  
  let block = currentBlock;
  
  //Autocorrect version number to whatever is in the data
  //block.version = { "type": "int", "value": data.allowedblocks[0].version };
  block.name = {"type": "string", "value": document.getElementById("block-identifier").value};
  block.states = {"type": "compound", "value": {}};
  let blockstates = block.states.value;

  //Handle saved blockstates
  for(let entry of document.getElementById("block-states").children){
    let newstate = {
      type: entry.querySelector(".item-block-state-type").value
    };

    if(entry.querySelector(".item-block-state-type").value === 'int'){
      newstate.value = parseFloat(entry.querySelector(".item-block-state-value").value)
    } else if(entry.querySelector(".item-block-state-type").value === 'byte') {
      newstate.value = Boolean(entry.querySelector(".item-block-state-value").checked);
      console.log(Boolean(entry.querySelector(".item-block-state-value").checked), newstate.value)
    } else {
      newstate.value = entry.querySelector(".item-block-state-value").value
    }

    blockstates[entry.querySelector(".item-block-state-name").value] = newstate;
  }
  
  console.log(blockstates, currentBlock)
  
  snackbar("Your palette entry has been saved.")
  openBlockEditor()
  renderPaletteEntries()
  //prepareBlocksTab()
}

function saveNode(){
  let updatedcode = false;
  try {
    updatedcode = nodeEditor.get();
  } catch(e) {
    snackbar('The text editor contains invalid JSON. Fix it before saving the structure.');
  }
  if(!updatedcode) return;
  
  structure = updatedcode;
  snackbar('Your structure has been saved.');
  nodeEditor.set(structure);
}

function revealNode(path){
  if(nodeEditor.getMode() === 'tree'){
    let paths = [];
    for(let i = 0; i < path.length; i++){
      let newpath = [];
      if(i != 0){
        newpath = JSON.parse(JSON.stringify(paths[i-1]))
      }
      newpath.push(path[i])
      paths.push(newpath);
    }
    for(let path of paths){
      nodeEditor.expand({path: path, isExpand: true, recursive: false})
    }

    document.querySelector(".jsoneditor-tree").scrollTop = 336 + (24 * (path[path.length-1] + 1))
  }
  
}

var bookEditor = {
  nextPage: function(){
    bookEditor.currentPage += 2;
    if(bookEditor.currentPage > bookEditor.data.length-1){
      bookEditor.addPage(bookEditor.data.length, true);
      bookEditor.addPage(bookEditor.data.length, true);
    } 
    
    bookEditor.render()
  },
  previousPage: function(){
    bookEditor.currentPage -= 2;
    if(bookEditor.currentPage < 0) bookEditor.currentPage = 0;
    bookEditor.render()
  },
  moveBack: function(pageindex){
    if((pageindex - 1) < 0) return;
    bookEditor.data.splice(pageindex - 1, 0, bookEditor.data.splice(pageindex, 1)[0]);
    bookEditor.render();
  },
  moveForward: function(pageindex){
    if((pageindex + 1) > bookEditor.data.length-1) return;
    bookEditor.data.splice(pageindex + 1, 0, bookEditor.data.splice(pageindex, 1)[0]);
    bookEditor.render();
  },
  addPage: function(pageindex, skiprender = false){
    newpage = {
      "photoname": {
        "type": "string",
        "value": ""
      },
      "text": {
        "type": "string",
        "value": ""
      }
    };
    
    bookEditor.data.splice(pageindex, 0, newpage);
    
    if(!skiprender) bookEditor.render();
  },
  deletePage: function(pageindex){
    bookEditor.data.splice(pageindex, 1);
    
    if(bookEditor.currentPage > bookEditor.data.length-1){
      bookEditor.currentPage = bookEditor.data.length - 1;
      if(bookEditor.currentPage % 2 === 1){
        bookEditor.currentPage -= 1;
      }
    }
    
    bookEditor.render();
  },
  duplicatePage: function(pageindex){
    newpage = JSON.parse(JSON.stringify(bookEditor.data[pageindex]));
    
    bookEditor.data.splice(pageindex, 0, newpage);
    
    bookEditor.render();
  },
  
  render: function(){    
    let maxpages = bookEditor.data.length;
    
    document.getElementById("item-book-page1-label").innerHTML = "Page " + (bookEditor.currentPage + 1) + " of " + maxpages;
    document.getElementById("item-book-page1").value = bookEditor.data[bookEditor.currentPage].text.value;
    
    if((bookEditor.currentPage + 1) <= (bookEditor.data.length - 1)){
      document.getElementById("item-book-page2").disabled = false;
      document.getElementById("item-book-page2").value = bookEditor.data[bookEditor.currentPage + 1].text.value;
      document.getElementById("item-book-page2-label").innerHTML = "Page " + (bookEditor.currentPage + 2) + " of " + maxpages;
    } else {
      document.getElementById("item-book-page2").disabled = true;
      document.getElementById("item-book-page2").value = '';
      document.getElementById("item-book-page2-label").innerHTML = "";
    }
  },
  update: function(){
    let currentPageData = bookEditor.data[bookEditor.currentPage];
    let currentPageData2 = ((bookEditor.currentPage + 1) <= (bookEditor.data.length - 1) ? bookEditor.data[bookEditor.currentPage+1] : false);
    
    currentPageData.text.value = document.getElementById("item-book-page1").value;
    if(currentPageData2) currentPageData2.text.value = document.getElementById("item-book-page2").value;
    
    bookEditor.render();
  },
  
  setData: function(data){
    bookEditor.data = JSON.parse(JSON.stringify(data)); //Data should be an array of NBT pages.
    bookEditor.trueData = data;
    
    //Set current page to 0
    //bookEditor.currentPage = 0;
    if(bookEditor.currentPage > bookEditor.data.length - 1){
      
    }
    
    bookEditor.render();
  },
  getData: function(){
    return JSON.parse(JSON.stringify(bookEditor.data));
  },
  
  data: [], //The NBT data of the current edited book
  trueData: [],
  currentPage: 0 //Represents the current displayed page on the left.
};

var structure = {};
var unparsedStructure = {};
var structuresize = [];
var currentTile, currentValidTile, currentTileGroup; //currentTile and currentTileGroup are deprecated 
var currentEntity;
var currentItem;
var currentBlock;
var openedEditors = [
  /* {type: 'entity', editor: 'entity-editor', data: currentData} */
];
var filenameprefix = 'mystructuretest';
function parseImportedData(file){
  function attemptLaunch(f){
    if(JSON.stringify(data.rendering) == '{"texturedef":false,"texturepaths":false,"preview_texturedef":false,"preview_texturepaths":false}'){
      console.log('waiting to launch')
      window.awaitingLaunch = f;
    } else {
      console.log(JSON.parse(JSON.stringify(data.rendering)));
      structureToEditor(f);
    }
  }
  
  filenameprefix = file.name.split(".")[0];
  if(file.name.endsWith('.json')){
    structure = JSON.parse(importedData);
    attemptLaunch(file);
  } else {
    nbt.parse(Buffer.from(importedData)).then(function(data){
      structure = data.parsed;
      unparsedStructure = data.metadata.buffer;
      //console.log(data);

      if(structure.value.entities){
        console.log(structure)
        javaToBedrock();
      }
      
      attemptLaunch(file);
    });
  }
}

function structureToEditor(file = false){
  structuresize = structure.value.size.value.value;
  
  //Unlock editor options
  if(document.getElementById("upload-tab").style.display != "none"){
    document.getElementById("edit-group").style.display = "unset";
    document.getElementById("edit-overview-tab").classList.toggle("selected", true);
    document.getElementById("edit-overview").classList.toggle("visible", true);
    document.getElementById("upload-tab").classList.toggle("selected", false);
    document.getElementById("upload-tab").style.display = "none";
    document.getElementById("edit-upload").classList.toggle("visible", false);
  }
  
  //Add file information
  if(file){
    document.getElementById("file-info-name").innerHTML = file.name;
    document.getElementById("file-info-type").innerHTML = (file.name.endsWith('.mcstructure') ? "Bedrock Structure" : (file.name.endsWith('.nbt') ? "Java Structure" : (file.name.endsWith('.json') ? "JSON Structure" : (file.name.endsWith('#importedfile') ? "Developer Test File" : "Unknown"))));
    document.getElementById("file-info-size").innerHTML = (Math.ceil(file.size / 100) / 10) + "KB";
    document.getElementById("file-info-date").innerHTML = file.lastModifiedDate.toDateString();
  }
  
  document.getElementById("file-stats-entities").innerHTML = (getEntities() ? getEntities.length : 0);
  document.getElementById("file-stats-blocks").innerHTML = structure.value.size.value.value[0] * structure.value.size.value.value[1] * structure.value.size.value.value[2];
  document.getElementById("file-stats-tileentities").innerHTML = Object.keys(getTileEntities()).length;
  document.getElementById("file-stats-uniqueblocks").innerHTML = (structure.value.structure.value.palette.value.hasOwnProperty("default") ? structure.value.structure.value.palette.value.default.value.block_palette.value.value.length : '0');
  document.getElementById("file-stats-size").innerHTML = structure.value.size.value.value.join(", ")
  
  generateEntitiesList();
  generateTileEntitiesList();
  
  //Blocks tab
  prepareBlocksTab()
  
  nodeEditor.set(structure)
}

function prepareBlocksTab(){
  //Detect layer size. If more than 200 blocks have to be rendered, display warning instead.
  let dimensions = structure.value.size.value.value;
  let singlelayer = dimensions[0] * dimensions[2];
  if(singlelayer >= 500){
    document.getElementById("paint-editor").innerHTML = '<tr><td style="background-color: var(--app-inner-inner-background);width: 100%;height: 32px;text-align: center;"><br><a href="javascript:void(0)" onclick="this.innerHTML = \'Loading...\'; renderPaintEditor()">Render blocks</a></td></tr>';
  } else {
    renderPaintEditor()
  }
  
  renderPaletteEntries()
}

function generateEntitiesList(){
  //Visually generates a list of entities in the Entities tab.
  let entities = getEntities();
  document.getElementById("edit-entities-list").innerHTML = "";
  if(entities !== false && entities.length > 0){ //Entities exist!
    for(let i = 0; i < entities.length; i++){
      let identifier = entities[i].identifier.value || 'unknown'
      let name = /*(entities[i].RawtextName ? entities[i].RawtextName.value : (entities[i].CustomName ? entities[i].CustomName.value : (entities[i].Item ? entities[i].Item.value.Name.value : '<i>' + identifier + '</i>')));*/ identifier;
      let searchable = [identifier];
      
      if(entities[i].RawtextName){
        searchable.push(entities[i].RawtextName.value);
      }
      if(entities[i].CustomName){
        searchable.push(entities[i].CustomName.value);
      }
      if(entities[i].InterativeText){
        searchable.push(entities[i].InterativeText.value);
      }
      
      let namelabel = document.createElement("span");
      if(entities[i].Item){
        let itempreview = createItemElement(entities[i].Item.value);
        itempreview.setAttribute("width", "16px");
        itempreview.setAttribute("height", "16px");
        itempreview.setAttribute("style", "vertical-align: middle; margin-right: 5px; font-size: 6pt;");
        namelabel.appendChild(itempreview);
        
        searchable.push(entities[i].Item.value.Name.value);
        searchable.push("*" + entities[i].Item.value.Count.value);
      }
      namelabel.innerHTML += name;
      
      let newlabel = document.createElement("span");
      newlabel.classList = ["idlabel"];
      newlabel.setAttribute("index", i);
      newlabel.setAttribute("onclick", "openEditEntity('getEntities()["+i+"]')");
      newlabel.setAttribute("searchable", searchable.join(" "))
      newlabel.appendChild(namelabel);
      
      document.getElementById("edit-entities-list").appendChild(newlabel);
    }
    mcitems.init()
  } else {
    document.getElementById("edit-entities-list").innerHTML = "There are no entities in this structure.<br>Try adding one in the Node Editor!";
  }
}

function generateTileEntitiesList(){
  //Visually generates a list of tile entities in the Entities tab. 
  document.getElementById("edit-tile-entities-list").innerHTML = "There are no valid tile entities in this structure.<br>Try adding one in the Node Editor!"
  
  //First, filter out valid tile entities and arrange them into an array.
  let rawlist = getValidTileEntities(getTileEntities())
  if(rawlist === false || rawlist.length == 0) return false; //Abort if valids are empty
  document.getElementById("edit-tile-entities-list").innerHTML = ""
  
  //Generate labels labels
  for(let entry of rawlist){
    if(entry.constructor == Array){
      let labelgroup = document.createElement("span");
      labelgroup.classList = ["labelgroup"]
      
      let searchable = [
        "Command",
        "Block"
      ]
      
      for(let subentry of entry){
        let identifier = subentry.data.id.value || 'unknown';
        let cmdsrcs = {
          "minecraft:command_block": "https://github.com/Mojang/bedrock-samples/raw/main/resource_pack/textures/blocks/command_block_back_mipmap.png",
          "minecraft:chain_command_block": "https://github.com/Mojang/bedrock-samples/raw/main/resource_pack/textures/blocks/chain_command_block_back_mipmap.png",
          "minecraft:repeating_command_block": "https://github.com/Mojang/bedrock-samples/raw/main/resource_pack/textures/blocks/repeating_command_block_back_mipmap.png",
        }
        let imagedata = "<img src='" + cmdsrcs[subentry.blockname] + "' class='idlabel-icon'>";

        let newlabel = document.createElement("span");
        newlabel.classList = ["idlabel"];
        newlabel.setAttribute("index", subentry.index);
        newlabel.setAttribute("onclick", "openEditTile('getValidTileEntities(getTileEntities(), "+subentry.index+")')");
        newlabel.innerHTML = imagedata + " " + identifier;

        labelgroup.appendChild(newlabel);
        
        //Identify search terms
        if(subentry.data.Command){
          searchable.push(subentry.data.Command.value)
        }
        if(subentry.data.CustomName){
          searchable.push(subentry.data.CustomName.value)
        }
        
        searchable.push(subentry.blockname)
      }
      
      labelgroup.setAttribute("searchable", searchable.join(" "));
      
      document.getElementById("edit-tile-entities-list").appendChild(labelgroup)
    } else {
      let identifier = entry.data.id.value || 'unknown'
      let searchable = [
        identifier
      ];

      let newlabel = document.createElement("span");
      newlabel.classList = ["idlabel"];
      newlabel.setAttribute("index", entry.index);
      newlabel.setAttribute("onclick", "openEditTile('getValidTileEntities(getTileEntities(), "+entry.index+")')");
      
      newlabel.appendChild(document.createTextNode(identifier));
      
      if(entry.data.sherds){
        newlabel.appendChild(document.createTextNode(" ("));
        for(let sherdid of entry.data.sherds.value.value){
          let itempreview = createItemElement({Name:nbt.string(sherdid),Count:nbt.int(1)});
          itempreview.setAttribute("width", "16px");
          itempreview.setAttribute("height", "16px");
          itempreview.setAttribute("style", "vertical-align: middle; margin-right: 1px; font-size: 6pt;");
          newlabel.appendChild(itempreview);

          searchable.push(sherdid);
        }
        newlabel.appendChild(document.createTextNode(")"));
      }

      document.getElementById("edit-tile-entities-list").appendChild(newlabel);
      
      if(entry.data.Command){
        searchable.push(entry.data.Command.value)
      }
      if(entry.data.CustomName){
        searchable.push(entry.data.CustomName.value)
      }
      if(entry.data.Text){
        searchable.push(entry.data.Text.value)
      }
      if(entry.data.FrontText && entry.data.FrontText.value.Text){
        searchable.push(entry.data.FrontText.value.Text.value)
      }
      if(entry.data.BackText && entry.data.BackText.value.Text){
        searchable.push(entry.data.BackText.value.Text.value)
      }
      if(data.tiles[identifier]){
        searchable.push(getBlockDefinitionType(data.tiles[identifier].type, entry.data))
      }
      newlabel.setAttribute("searchable", searchable.join(" "));
    }
  }
  mcitems.init()
}

//Ability to download

function download(){
  //Get download parameters
  let parameters = {
    'tiles': document.getElementById("structure-download-tiles").checked,
    'air': document.getElementById("structure-download-air").checked,
    'waterlog': document.getElementById("structure-download-waterlog").checked,
    'blockstates': document.getElementById("structure-download-blockstates").checked,
    'tilecontainerloot': document.getElementById("structure-download-tilecontainerloot").checked,
    'entities': document.getElementById("structure-download-entities").checked,
    'entityrot': document.getElementById("structure-download-entityrot").checked,
    'entityloot': document.getElementById("structure-download-entityloot").checked,
    'filetype': document.getElementById("structure-download-filetype").value
  };
  
  //Shallow-copy the structure data 
  let newstructure = Object.assign({}, structure);
  
  //TODO: Separate pieces off the cloned data according to the parameters
  if(!parameters.tiles){
    newstructure.value.structure.value.palette = {"type": "compound","value": {}};
    newstructure.value.structure.value.block_indicies = {
      "type": "list",
      "value": {
        "type": "list",
        "value": [
          { "type": "end", "value": [] },
          { "type": "end", "value": [] }
        ]
      }
    };
  } else {
    if(!parameters.air){
      //Find the palette entry for air
      let airpaletteindex = findPaletteIndex('minecraft:air');
      if(airpaletteindex && newstructure.value.structure.value.block_indices.value.value[0].type !== "end"){
        //structure.value.default.value.block_palette.value.value[airpaletteindex];
        //Clear air blocks in the non-waterlog layer
        let blockslist = newstructure.value.structure.value.block_indices.value.value[0].value;
        for(let i = 0; i < blockslist.length; i++){
          if(blockslist[i] === airpaletteindex){
            blockslist[i] = -1;
          } 
        }
      }
    }
    if(!parameters.waterlog){
      //Find the palette entry for air
      if(newstructure.value.structure.value.block_indices.value.value[1].type !== "end"){
        //Replace waterlog palette with an array of -1 exactly equal to the index[0] array
        let blockslist = newstructure.value.structure.value.block_indices.value.value[0].value;
        newstructure.value.structure.value.block_indices.value.value[1].value = [];
        let waterlogslist = newstructure.value.structure.value.block_indices.value.value[1].value;
        for(let i = 0; i < blockslist.length; i++){
          waterlogslist.push(-1);
        }
      }
    }
    if(!parameters.blockstates){
      //Check if palette exists
      if(newstructure.value.structure.value.palette.value.hasOwnProperty("default")){
        let palette = newstructure.value.structure.value.palette.value.default.value.block_palette.value.value;
        for(let entry of palette){
          entry.states = {};
        }
      }
    }
    if(!parameters.tilecontainerloot){
      //Check if palette exists
      if(newstructure.value.structure.value.palette.value.hasOwnProperty("default")){
        newstructure.value.structure.value.palette.value.default.value.block_position_data = {
          "type": "compound",
          "value": {}
        };
      }
    }
  }
  
  if(!parameters.entities){
    newstructure.value.structure.value.entities = {"type": "list","value": {"type": "end","value": []}};
  } else {
    if(!parameters.entityrot){
      //Filter through all entities
      let entities = newstructure.value.structure.value.entities.value.value
      for(let entity of entities){
        if(entity.hasOwnProperty("Rotation")){
          entity.Rotation = {
            "type": "list",
            "value": {
              "type": "float",
              "value": [
                0,
                0
              ]
            }
          };
        }
      }
    }
    if(!parameters.entityloot){
      //Filter through all entities
      let entities = newstructure.value.structure.value.entities.value.value;
      let allowedKeys = [ "Chested", "Color", "Color2", "FallDistance", "Health", "Invulnerable", "IsAngry", "IsAutonomous", "IsBaby", "IsEating", "IsGliding", "IsGlobal", "IsIllagerCaptain", "IsOrphaned", "IsOutOfControl", "IsRoaring", "IsScared", "IsStunned", "IsSwimming", "IsTamed", "IsTrusting", "Item", "LootDropped", "MarkVariant", "OnGround", "OwnerID", "OwnerNew", "PortalCooldown", "Pos", "Rotation", "Saddled", "Sheared", "ShowBottom", "Sitting", "SkinID", "Strength", "StrengthMax", "Tags", "UniqueID", "Variant", "definitions", "identifier", "Attributes" ];
      for(let i = 0; i < entities.length; i++){
        //Discard all non-essential properties
        let entity = entities[i];
        entities[i] = Object.fromEntries(Object.entries(entity).filter(([key]) => allowedKeys.includes(key)));
      }
    }
  }
  
  //Export the file according to the selected filetype
  filenameprefix = prompt("What do you want your filename to be?", filenameprefix);
  if(!filenameprefix || filenameprefix === null || filenameprefix === "") return;
  switch(parameters.filetype){
    default: {
      //Do nothing
      break;
    }
    case 'json': {
      exportFile(new File([JSON.stringify(newstructure)], filenameprefix+'.json'), filenameprefix+'.json');
      break;
    }
    case 'mcstructure': {
      exportFile(new File([nbt.writeUncompressed(newstructure, 'little')], filenameprefix+'.mcstructure'), filenameprefix+'.mcstructure');
      break;
    }
    case 'nbt': {
      exportFile(
        new File(
          [Buffer.from(gzipjs.zip(nbt.writeUncompressed(bedrockToJava(newstructure), 'big'), {level: 1})).buffer],
          filenameprefix+'.nbt'
        ), 
        filenameprefix+'.nbt');
      break;
    }
    case 'mcfunction': {
      /*exportFile(
        new File(
          [await structureToFunction(true, true, true, true, true, true, true, true, newstructure)],
          filenameprefix+'.mcfunction'
        ), 
        filenameprefix+'.mcfunction'
      );*/
      openWith('/structure-to-function/', newstructure)
      break;
    }
    case 'mcpack': {
      let packzip = new JSZip();
      packzip.file('manifest.json', JSON.stringify({"format_version":2,"header":{"name":"My .mcstructure pack","description":"Generated with Structure Editor at https://mcbe-essentials.github.io","uuid":generateUUID(),"version":[1,0,0],"min_engine_version":[1,18,0]},"modules":[{"type":"data","description":"Generated with Structure Editor at https://mcbe-essentials.github.io","uuid":generateUUID(),"version":[1,0,0]}]}))
      packzip.file('structures/' + filenameprefix + '.mcstructure', nbt.writeUncompressed(newstructure, 'little'));
      
      packzip.generateAsync({type:"blob"})
      .then(function(content) {
        exportFile(content, filenameprefix + '.mcpack');
      });
      break;
    }
    case 'json#loot-table': {
      let itementities = [];
      //Find all thrown item entities in the structure
      for(let entity of getEntities()){
        if(getEntities()[0].identifier && getEntities()[0].identifier.value === "minecraft:item") itementities.push(entity)
      }
      
      //Abort if there are no item entities
      if(itementities.length == 0){
        snackbar('There are no item entities in the structure with which to create a loot table.');
        return;
      }
      
      //Otherwise, create loot tables
      let table = {pools:[]};
      for(let entity of itementities){
        table.pools.push({
          rolls: 1,
          entries: [
            {
              type: "item",
              name: entity.Item.value.Name.value,
              "functions": [
                {
                  "function": "set_count",
                  "count": {
                    "min": entity.Item.value.Count.value,
                    "max": entity.Item.value.Count.value
                  }
                }
              ]
            }
          ]
        });
      }
      
      exportFile(
        new File(
          [JSON.stringify(table)],
          filenameprefix+'.json'
        ), 
        filenameprefix+'.json')
      
      break;
    }
  }
}

function checkDownloadParameters(){
  let parameters = {
    'tiles': document.getElementById("structure-download-tiles").checked,
    'air': document.getElementById("structure-download-air").checked,
    'waterlog': document.getElementById("structure-download-waterlog").checked,
    'blockstates': document.getElementById("structure-download-blockstates").checked,
    'tilecontainerloot': document.getElementById("structure-download-tilecontainerloot").checked,
    'entities': document.getElementById("structure-download-entities").checked,
    'entityrot': document.getElementById("structure-download-entityrot").checked,
    'entityloot': document.getElementById("structure-download-entityloot").checked,
    'filetype': document.getElementById("structure-download-filetype").value
  };
  
  //Display the appropriate filetype warning
  let warningelement = document.getElementById("structure-download-warning-" + parameters.filetype) || false;
  for(let warning of document.querySelectorAll(".structure-download-warning")){
    warning.style.display = "none";
  }
  if(warningelement){
    warningelement.style.display = 'block';
  }
  
  //Tiles group
  if(!parameters.tiles){
    document.getElementById("structure-download-air").disabled = true;
    document.getElementById("structure-download-waterlog").disabled = true;
    document.getElementById("structure-download-blockstates").disabled = true;
    document.getElementById("structure-download-tilecontainerloot").disabled = true;
  } else {
    document.getElementById("structure-download-air").disabled = false;
    document.getElementById("structure-download-waterlog").disabled = false;
    document.getElementById("structure-download-blockstates").disabled = false;
    document.getElementById("structure-download-tilecontainerloot").disabled = false;
  }
  
  //Entities group
  if(!parameters.entities){
    //document.getElementById("structure-download-entityrot").checked = false;
    //document.getElementById("structure-download-entityloot").checked = false;
    document.getElementById("structure-download-entityrot").disabled = true;
    document.getElementById("structure-download-entityloot").disabled = true;
  } else {
    document.getElementById("structure-download-entityrot").disabled = false;
    document.getElementById("structure-download-entityloot").disabled = false;
  }
}

getData()