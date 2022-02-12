//ReBrainer's Item Editor
//<mcitem identifier="minecraft:diamond_sword" count="2"></mcitem>
async function fetchData() {
  mcitems.data.items = await fetch(
    "https://unpkg.com/minecraft-textures@1.18.0/dist/textures/json/1.18.id.json"
  ).then(response => response.json());
  mcitems.init();
  
  if(window.localStorage.customItems) mcitems.data.customitems = JSON.parse(window.localStorage.customItems);
}

var mcitems = {
  data: {
    items: {},
    customitems: {},
    mapping: {
      "minecraft:record_11": "minecraft:music_disc_11",
      "minecraft:record_13": "minecraft:music_disc_13",
      "minecraft:record_blocks": "minecraft:music_disc_blocks",
      "minecraft:record_cat": "minecraft:music_disc_cat",
      "minecraft:record_chirp": "minecraft:music_disc_chirp",
      "minecraft:record_far": "minecraft:music_disc_far",
      "minecraft:record_mall": "minecraft:music_disc_mall",
      "minecraft:record_mellohi": "minecraft:music_disc_mellohi",
      "minecraft:record_otherside": "minecraft:music_disc_otherside",
      "minecraft:record_pigstep": "minecraft:music_disc_pigstep",
      "minecraft:record_stal": "minecraft:music_disc_stal",
      "minecraft:record_strad": "minecraft:music_disc_strad",
      "minecraft:record_wait": "minecraft:music_disc_wait",
      "minecraft:record_ward": "minecraft:music_disc_ward",
      "minecraft:horsearmordiamond": "minecraft:diamond_horse_armor",
      "minecraft:horsearmoriron": "minecraft:iron_horse_armor",
      "minecraft:horsearmorgold": "minecraft:gold_horse_armor",
      "minecraft:horsearmorleather": "minecraft:leather_horse_armor",
      "minecraft:totem": "minecraft:totem_of_undying",
      "minecraft:reeds": "minecraft:sugar_cane",
      "minecraft:sapling": "minecraft:oak_sapling",
      "minecraft:dye": "minecraft:white_dye",
      "minecraft:coral_block": "minecraft:brain_coral_block",
      //Java -> Bedrock
      "minecraft:small_dripleaf_block": "minecraft:small_dripleaf",
      "minecraft:acacia_standing_sign": "minecraft:acacia_sign",
      "minecraft:acacia_wall_sign": "minecraft:acacia_sign",
      "minecraft:azalea_leaves_flowered": "minecraft:flowering_azalea_leaves",
      "minecraft:bamboo_sapling": "minecraft:bamboo",
      "minecraft:brewingstandblock": "minecraft:brewing_stand",
      "minecraft:brick_block": "minecraft:bricks",
      "minecraft:banner": "minecraft:white_banner",
      "minecraft:red_flower": "minecraft:poppy",
      "minecraft:yellow_flower": "minecraft:dandelion",
      "minecraft:tallgrass": "minecraft:tall_grass",
      "minecraft:waterlily": "minecraft:lily_pad",
      "minecraft:dirt_with_roots": "minecraft:rooted_dirt",
      "minecraft:turtle_shell_piece": "minecraft:scute",
      "minecraft:fish": "minecraft:cod",
      "minecraft:cooked_fish": "minecraft:cooked_cod",
      "minecraft:clownfish": "minecraft:tropical_fish",
      "minecraft:boat": "minecraft:oak_boat"
    },
    durabilities: {
      //Armor
      "minecraft:turtle_helmet": 275,
      "minecraft:leather_helmet": 55,
      "minecraft:golden_helmet": 77,
      "minecraft:chainmail_helmet": 165,
      "minecraft:iron_helmet": 165,
      "minecraft:diamond_helmet": 363,
      "minecraft:netherite_helmet": 407,
      "minecraft:leather_chestplate": 80,
      "minecraft:golden_chestplate": 112,
      "minecraft:chainmail_chestplate": 240,
      "minecraft:iron_chestplate": 240,
      "minecraft:diamond_chestplate": 528,
      "minecraft:netherite_chestplate": 592,
      "minecraft:leather_leggings": 75,
      "minecraft:golden_leggings": 105,
      "minecraft:chainmail_leggings": 225,
      "minecraft:iron_leggings": 225,
      "minecraft:diamond_leggings": 495,
      "minecraft:netherite_leggings": 555,
      "minecraft:leather_boots": 65,
      "minecraft:golden_boots": 91,
      "minecraft:chainmail_boots": 195,
      "minecraft:iron_boots": 195,
      "minecraft:diamond_boots": 429,
      "minecraft:netherite_boots": 481,
      
      //Tools
      "minecraft:golden_pickaxe": 32,
      "minecraft:wooden_pickaxe": 59,
      "minecraft:stone_pickaxe": 131,
      "minecraft:iron_pickaxe": 250,
      "minecraft:diamond_pickaxe": 1561,
      "minecraft:netherite_pickaxe": 2031,
      "minecraft:golden_axe": 32,
      "minecraft:wooden_axe": 59,
      "minecraft:stone_axe": 131,
      "minecraft:iron_axe": 250,
      "minecraft:diamond_axe": 1561,
      "minecraft:netherite_axe": 2031,
      "minecraft:golden_hoe": 32,
      "minecraft:wooden_hoe": 59,
      "minecraft:stone_hoe": 131,
      "minecraft:iron_hoe": 250,
      "minecraft:diamond_hoe": 1561,
      "minecraft:netherite_hoe": 2031,
      "minecraft:golden_shovel": 32,
      "minecraft:wooden_shovel": 59,
      "minecraft:stone_shovel": 131,
      "minecraft:iron_shovel": 250,
      "minecraft:diamond_shovel": 1561,
      "minecraft:netherite_shovel": 2031,
      "minecraft:golden_sword": 32,
      "minecraft:wooden_sword": 59,
      "minecraft:stone_sword": 131,
      "minecraft:iron_sword": 250,
      "minecraft:diamond_sword": 1561,
      "minecraft:netherite_sword": 2031,
      
      "minecraft:fishing_rod": 384,
      "minecraft:flint_and_steel": 64,
      "minecraft:carrot_on_a_stick": 25,
      "minecraft:shears": 238,
      "minecraft:shield": 336,
      "minecraft:bow": 384,
      "minecraft:trident": 250,
      "minecraft:elytra": 432,
      "minecraft:crossbow": 464,
      "minecraft:warped_fungus_on_a_stick": 100
      
    }
  },

  init: function() {
    for (var i = 0; i < document.getElementsByTagName("mcitem").length; i++) {
      if(Object.keys(mcitems.data.mapping).includes(document.getElementsByTagName("mcitem")[i].getAttribute("identifier"))){
        document.getElementsByTagName("mcitem")[i].setAttribute("identifier",
          mcitems.data.mapping[document.getElementsByTagName("mcitem")[i].getAttribute("identifier")]
        )
      }
    
      document.getElementsByTagName("mcitem")[i].innerHTML =
        '<img class="mcitemdisplay" src="' +
        mcitems.getData(
          document.getElementsByTagName("mcitem")[i].getAttribute("identifier")
        ).texture +
        '" title="' +
        mcitems.getData(
          document.getElementsByTagName("mcitem")[i].getAttribute("identifier")
        ).readable +
        '" style="'+
        (document.getElementsByTagName("mcitem")[i].style.height
          ? "height:" +
            document.getElementsByTagName("mcitem")[i].style.height + ";"
          : "") + (document.getElementsByTagName("mcitem")[i].style.width
          ? "width:" +
            document.getElementsByTagName("mcitem")[i].style.width + ";"
          : "") 
        +'" draggable="false"><span class="mcitemcount" style="' +
        (document.getElementsByTagName("mcitem")[i].style.fontSize
          ? "font-size:" +
            document.getElementsByTagName("mcitem")[i].style.fontSize
          : "") +
        '">' +
        (document.getElementsByTagName("mcitem")[i].getAttribute("count") > 1
          ? document.getElementsByTagName("mcitem")[i].getAttribute("count")
          : "") +
        "</span>"+
        (Object.keys(mcitems.data.durabilities).includes(document.getElementsByTagName("mcitem")[i].getAttribute("identifier")) && document.getElementsByTagName("mcitem")[i].hasAttribute("damage") ?
        "<progress class='mcitemdamage' value='"+ (100 - ((parseFloat(document.getElementsByTagName("mcitem")[i].getAttribute("damage")) / mcitems.data.durabilities[document.getElementsByTagName("mcitem")[i].getAttribute("identifier")]) * 100)) +"' max='100'>"+document.getElementsByTagName("mcitem")[i].getAttribute("damage") + "</progress>"
        : "");
      document.getElementsByTagName("mcitem")[i].style.position = "relative";
    }
  },
  getData: function(identifier) {
    identifier = identifier;
    var items = Object.keys(mcitems.data.items.items);
    var customitems = Object.keys(mcitems.data.customitems);
    var output = {
      texture:
        "https://github.com/bedrock-dot-dev/packs/raw/master/stable/resource/textures/items/empty_armor_slot_shield.png",
      readable: "Unknown"
    };

    if (items.includes(identifier)) {
      output = mcitems.data.items.items[identifier];
    } else if (customitems.includes(identifier)) {
      output = mcitems.data.customitems[identifier];
    } else if(identifier == "null" || !identifier) {
      //No item to display, render partially transparent.
      output.texture =
        "https://github.com/bedrock-dot-dev/packs/raw/master/stable/resource/textures/items/empty_armor_slot_chestplate.png";
      output.readable = "No item";
    } else {
      //Invalid, take other data
      output.texture =
        "https://github.com/bedrock-dot-dev/packs/raw/master/stable/resource/textures/items/empty_armor_slot_shield.png";
      output.readable = identifier;
      //if(!identifier.includes("element")) console.log(identifier);
    }

    return output;
  }
};

fetchData();
