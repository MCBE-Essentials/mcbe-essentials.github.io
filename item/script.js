//ReBrainer's Item Editor
//<mcitem identifier="minecraft:diamond_sword" count="2"></mcitem>
async function fetchData() {
  mcitems.data.items = await fetch(
    "https://unpkg.com/minecraft-textures@1.18.0/dist/textures/json/1.18.id.json"
  ).then(response => response.json());
  mcitems.init();
}

var mcitems = {
  data: {
    items: {}
  },

  init: function() {
    for (var i = 0; i < document.getElementsByTagName("mcitem").length; i++) {
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
        "</span>";
      document.getElementsByTagName("mcitem")[i].style.position = "relative";
    }
  },
  getData: function(identifier) {
    identifier = identifier;
    var items = Object.keys(mcitems.data.items.items);
    var output = {
      texture:
        "https://github.com/bedrock-dot-dev/packs/raw/master/stable/resource/textures/items/empty_armor_slot_shield.png",
      readable: "Unknown"
    };

    if (items.includes(identifier)) {
      output = mcitems.data.items.items[identifier];
    } else {
      //Invalid, take other data
      output.texture =
        "https://github.com/bedrock-dot-dev/packs/raw/master/stable/resource/textures/items/empty_armor_slot_shield.png";
      output.readable = identifier;
    }

    return output;
  }
};

fetchData();
