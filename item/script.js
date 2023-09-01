//ReBrainer's Item Engine v1.2
//<minecraft-item identifier="minecraft:diamond_sword" count="2"></mcitem>
async function fetchData() {
  //Get vanilla item data
	mcitems.data.items = await fetch(
		'https://unpkg.com/minecraft-textures@1.20.0/dist/textures/json/1.20.id.json'
	).then((response) => response.json())
  //Get identifier mapping data
  mcitems.data.mapping = await fetch(
		'https://mcbe-essentials.glitch.me/item/data/mapping.json'
	).then((response) => response.json())
  
	mcitems.init()

	if (window.localStorage.customItems)
		mcitems.data.customitems = JSON.parse(window.localStorage.customItems)
  
  //Append tooltip element to page
  let tooltipel = document.createElement("div");
  tooltipel.style.display = "none";
  tooltipel.classList = ["tooltip"];
  tooltipel.innerHTML = '<span class="tooltip-name" style="display: block">Item Name</span><span class="tooltip-enchs" style="display: block">Efficiency V</span><span class="tooltip-lore" style="display: block">Lore</span><span class="tooltip-identifier">minecraft:identifier</span>';
  document.body.appendChild(tooltipel);
}

class MinecraftItem extends HTMLElement {
  static get observedAttributes(){
    return ['identifier', 'count', 'damage', 'width', 'height'];
  }
  
  constructor(){
    super();
    
    const shadow = this.attachShadow({mode: 'open'});
    
    const itemdata = mcitems.getData(this.getAttribute('identifier'), (this.hasAttribute('allowlist')	? this.getAttribute('allowlist') : false));
    
    const image = document.createElement('img');
    image.setAttribute('class', 'mcitemdisplay');
    image.src = itemdata.texture;
    image.setAttribute('data-title', itemdata.readable);
    //image.style.height = this.getAttribute("height");
    //image.style.width = this.getAttribute("width");
    image.draggable = false;
    
    const count = document.createElement('span');
    count.setAttribute('class', 'mcitemcount');
    //count.style.fontSize = this.style.fontSize;
    count.textContent = (parseFloat(this.getAttribute('count')) > 1	? this.getAttribute('count'): '');
    
    const style = document.createElement("style");
    style.textContent = `
      .mcitemdisplay {
        height: ${this.getAttribute("height")};
        width: ${this.getAttribute("width")};
        image-rendering: pixelated;
      }
      
      .mcitemcount {
        font-size: ${this.style.fontSize}
      }
    `;
    
    const stylesheet = document.createElement("link");
    stylesheet.rel = "stylesheet";
    stylesheet.href = "/item/style.css";
    
    const pagestyle = document.createElement("link");
    pagestyle.rel = "stylesheet";
    pagestyle.href = "style.css";
    
    let damage = false;
    if(this.hasAttribute('damage') && (Object.keys(mcitems.data.durabilities).includes(this.getAttribute('identifier')))){
      damage = document.createElement('progress');
      damage.setAttribute('class', 'mcitemdamage');
    }
    
    shadow.appendChild(stylesheet);
    shadow.appendChild(pagestyle);
    shadow.appendChild(style);
    shadow.appendChild(image);
    shadow.appendChild(count);
    if(damage !== false){
      shadow.appendChild(damage);
    }
    
    //this.style.position = 'relative';
  }
  
  attributeChangedCallback(name, oldValue, newValue){
    console.log('attributechanged', this)
    const shadow = this.shadowRoot;
    let style = shadow.querySelector("style");
    let count = shadow.querySelector(".mcitemcount");
    let image = shadow.querySelector(".mcitemdisplay");
    let damage = shadow.querySelector(".mcitemdamage");
    
    style.textContent = `
      .mcitemdisplay {
        height: ${this.getAttribute("height")};
        width: ${this.getAttribute("width")};
        image-rendering: pixelated;
      }
      
      .mcitemcount {
        font-size: ${this.style.fontSize}
      }
    `;
    
    const itemdata = mcitems.getData(this.getAttribute('identifier'), (this.hasAttribute('allowlist')	? this.getAttribute('allowlist') : false));
    
    image.setAttribute('class', 'mcitemdisplay');
    image.src = itemdata.texture;
    image.setAttribute('data-title', itemdata.readable);
    image.draggable = false;
    
    count.setAttribute('class', 'mcitemcount');
    count.textContent = (parseFloat(this.getAttribute('count')) > 1	? this.getAttribute('count'): '');
    
    if(damage){
      damage = document.createElement('progress');
      damage.setAttribute('class', 'mcitemdamage');
    }
  }
}

var mcitems = {
	data: {
		items: {},
		customitems: {},
		mapping: {},
		durabilities: {
			//Armor
			'minecraft:turtle_helmet': 275,
			'minecraft:leather_helmet': 55,
			'minecraft:golden_helmet': 77,
			'minecraft:chainmail_helmet': 165,
			'minecraft:iron_helmet': 165,
			'minecraft:diamond_helmet': 363,
			'minecraft:netherite_helmet': 407,
			'minecraft:leather_chestplate': 80,
			'minecraft:golden_chestplate': 112,
			'minecraft:chainmail_chestplate': 240,
			'minecraft:iron_chestplate': 240,
			'minecraft:diamond_chestplate': 528,
			'minecraft:netherite_chestplate': 592,
			'minecraft:leather_leggings': 75,
			'minecraft:golden_leggings': 105,
			'minecraft:chainmail_leggings': 225,
			'minecraft:iron_leggings': 225,
			'minecraft:diamond_leggings': 495,
			'minecraft:netherite_leggings': 555,
			'minecraft:leather_boots': 65,
			'minecraft:golden_boots': 91,
			'minecraft:chainmail_boots': 195,
			'minecraft:iron_boots': 195,
			'minecraft:diamond_boots': 429,
			'minecraft:netherite_boots': 481,

			//Tools
			'minecraft:golden_pickaxe': 32,
			'minecraft:wooden_pickaxe': 59,
			'minecraft:stone_pickaxe': 131,
			'minecraft:iron_pickaxe': 250,
			'minecraft:diamond_pickaxe': 1561,
			'minecraft:netherite_pickaxe': 2031,
			'minecraft:golden_axe': 32,
			'minecraft:wooden_axe': 59,
			'minecraft:stone_axe': 131,
			'minecraft:iron_axe': 250,
			'minecraft:diamond_axe': 1561,
			'minecraft:netherite_axe': 2031,
			'minecraft:golden_hoe': 32,
			'minecraft:wooden_hoe': 59,
			'minecraft:stone_hoe': 131,
			'minecraft:iron_hoe': 250,
			'minecraft:diamond_hoe': 1561,
			'minecraft:netherite_hoe': 2031,
			'minecraft:golden_shovel': 32,
			'minecraft:wooden_shovel': 59,
			'minecraft:stone_shovel': 131,
			'minecraft:iron_shovel': 250,
			'minecraft:diamond_shovel': 1561,
			'minecraft:netherite_shovel': 2031,
			'minecraft:golden_sword': 32,
			'minecraft:wooden_sword': 59,
			'minecraft:stone_sword': 131,
			'minecraft:iron_sword': 250,
			'minecraft:diamond_sword': 1561,
			'minecraft:netherite_sword': 2031,

			'minecraft:fishing_rod': 384,
			'minecraft:flint_and_steel': 64,
			'minecraft:carrot_on_a_stick': 25,
			'minecraft:shears': 238,
			'minecraft:shield': 336,
			'minecraft:bow': 384,
			'minecraft:trident': 250,
			'minecraft:elytra': 432,
			'minecraft:crossbow': 464,
			'minecraft:warped_fungus_on_a_stick': 100,
		},
	},

	init: function(){ 
    for(let item of document.querySelectorAll("mcitem")){
      item.innerHTML = "";
      const itemdata = mcitems.getData(item.getAttribute('identifier'), (item.hasAttribute('allowlist')	? item.getAttribute('allowlist') : false));

      const image = document.createElement('img');
      image.setAttribute('class', 'mcitemdisplay');
      image.src = itemdata.texture;
      image.setAttribute('data-title', itemdata.readable);
      image.style.height = item.getAttribute("height");
      image.style.width = item.getAttribute("width");
      image.draggable = false;

      const count = document.createElement('span');
      count.setAttribute('class', 'mcitemcount');
      count.style.fontSize = item.style.fontSize;
      count.textContent = (parseFloat(item.getAttribute('count')) > 1	? item.getAttribute('count'): '');

      let damage = false;
      if(item.hasAttribute('damage') && (Object.keys(mcitems.data.durabilities).includes(item.getAttribute('identifier')))){
        damage = document.createElement('progress');
        damage.setAttribute('class', 'mcitemdamage');
        damage.setAttribute('value', ((mcitems.data.durabilities[item.getAttribute('identifier')] - (parseFloat(item.getAttribute('damage')))) / mcitems.data.durabilities[item.getAttribute('identifier')]).toString());
      }
      
      item.appendChild(image);
      item.appendChild(count);
      if(damage !== false){
        item.appendChild(damage);
      }
      
      //Hover notes 
      if(item.classList.contains("hovertooltip")){
        item.onmouseover = function() {
          mcitems.tooltip.show(this);
        }

        item.addEventListener("mouseleave", (e) => {
          mcitems.tooltip.hide();
        })
      }
    }
    
    //Render dynamic slots
    mcitems.dynamicslots()
    
    //Fire afterfunction
    if(window.afterItemInit){
      window.afterItemInit()
    }
  },
  dynamicslots: function(){
    for(let dynamic of document.getElementsByClassName("dynamic-slot")){
      let bgUrl = dynamic.getAttribute("empty-url") || false;
      if(dynamic.childElementCount == 0 && bgUrl){
        dynamic.style.backgroundImage = "url("+ bgUrl +")"
      } else {
        dynamic.style.backgroundImage = ""
      }
    }
  },
	getData: function (identifier, allowlist) {
		var items = Object.keys(mcitems.data.items.items || {})
		var customitems = Object.keys(mcitems.data.customitems || {})
    //Default, 'failed' output
		var output = {
			texture:
				'https://github.com/Mojang/bedrock-samples/raw/main/resource_pack/textures/items/empty_armor_slot_shield.png',
			readable: 'Unknown',
		}

    identifier = mcitems.mapItemIdentifier(mcitems.parseItemIdentifier(identifier));
    
    if(typeof identifier === 'object'){
      //Identifier was mapped to a specific display name and not another identifier. Return the mapped data.
      return identifier;
    }
    
		try {
      //If tag uses a valid allowlist and identifier is not on it, output the 'failed' result.
			if (allowlist && eval(allowlist)) {
				if (!eval(allowlist).includes(identifier)) {
					return output
				}
			}
		} catch (e) {}
    
		if (items.includes(identifier)) {
			output = mcitems.data.items.items[identifier]
		} else if (customitems.includes(identifier)) {
			output = mcitems.data.customitems[identifier]
		} else if (identifier == 'null' || !identifier) {
			//No item to display, render partially transparent.
			output.texture =
				'https://github.com/Mojang/bedrock-samples/raw/main/resource_pack/textures/items/empty_armor_slot_chestplate.png'
			output.readable = 'No item'
		} else {
			//Invalid, take other data
			output.texture =
				'https://github.com/Mojang/bedrock-samples/raw/main/resource_pack/textures/items/empty_armor_slot_shield.png'
			output.readable = identifier
			//if(!identifier.includes("element")) console.log(identifier);
		}

		return output
	},
  mapItemIdentifier: function(identifier) {
    var baseIdentifier = identifier.namespace + ':' + identifier.identifier;
    if(Object.keys(mcitems.data.mapping).includes(baseIdentifier)){
      var mappedData = mcitems.data.mapping[baseIdentifier];
      if(mappedData.constructor == Array){
        //Mapping to a specific data value
        return mappedData[identifier.data];
      } else if(mappedData.constructor == String) {
        //Mapping to a specific identifier
        return mappedData;
      }
    }
    //If no match can be found, return the identifier without the data value
    return baseIdentifier;
  },
  parseItemIdentifier: function(string){
    var divided = string.split(":");
    
    var output = {
      "namespace": "minecraft",
      "identifier": "air",
      "data": 0
    }
    if(divided.length == 1){
      //Using default namespace and data
      output = {
        "namespace": "minecraft",
        "identifier": divided[0],
        "data": 0
      }
    } else if(divided.length == 2){
      //Either the identifier contains no namespace, or no data
      if(parseFloat(divided[1]).toString() === divided[1]){
        //Item is missing namespace, fill in 'minecraft'
        output.namespace = "minecraft";
        output.identifier = divided[0];
        output.data = parseFloat(divided[1]);
      } else {
        //Item is missing data, fill in 0
        output.namespace = divided[0];
        output.identifier = divided[1];
        output.data = 0;
      }
    } else if(divided.length == 3) {
      //Identifier contains all 3 components
      output = {
        "namespace": divided[0],
        "identifier": divided[1],
        "data": parseFloat(divided[2])
      };
    } else {
      //Not an identifier, contains too many properties
      return false;
    }
    return output;
  },
  tooltip: {
    hover: function(e) {
      let tooltip = document.querySelector('.tooltip');
      if(!tooltip) return;
      if(tooltip.style.display != 'none'){
        let tooltiprect = tooltip.getBoundingClientRect();
        let bodyrect = document.getElementsByTagName("html")[0].getBoundingClientRect()
        let x = e.pageX;
        let y = e.pageY;
        if(e.pageX + tooltiprect.width > bodyrect.width){
          x = bodyrect.width - tooltiprect.width - 10;
        }
        
        tooltip.style.left = x + 'px';
        tooltip.style.top = y + 'px';
      }
    },
    show: function(element){
      let tooltip = document.querySelector('.tooltip')

      var itemdata = JSON.parse(element.getAttribute("itemdata"));

      //let itemname = ((getFunction('set_name', 'name', itemdata) != false) ? getFunction('set_name', 'name', itemdata) : (element.children[0].getAttribute("data-title") != element.getAttribute("identifier") ? element.children[0].getAttribute("data-title") : "Unknown Name"));
      let itemname = (element.children[0].getAttribute("data-title") != element.getAttribute("identifier") ? element.children[0].getAttribute("data-title") : "Unknown Name");
      let customitemname = false;
      let itemenchs = false//doEnchantments(itemdata);
      let itemlore = false//((getFunction('set_lore', 'lore', itemdata) != false) ? getFunction('set_lore', 'lore', itemdata).join("<br>") : false)
      let itemid = element.getAttribute("identifier");

      document.querySelector('.tooltip-name').innerHTML = itemname;
      if(customitemname){
        document.querySelector('.tooltip-name').style.fontStyle = 'italic'
      } else {
        document.querySelector('.tooltip-name').style.fontStyle = 'unset'
      }

      if(itemenchs === false){
        document.querySelector('.tooltip-enchs').innerHTML = "";
      } else {
        document.querySelector('.tooltip-enchs').innerHTML = itemenchs;
      }

      if(itemlore === false){
        document.querySelector('.tooltip-lore').innerHTML = "";
      } else {
        document.querySelector('.tooltip-lore').innerHTML = itemlore;
      }
      document.querySelector('.tooltip-identifier').innerHTML = itemid;

      tooltip.style.display = 'block';  
    },
    hide: function(){
      document.querySelector('.tooltip').style.display = 'none';
    }
  }
}

fetchData()

//Tooltips
document.addEventListener('mousemove', mcitems.tooltip.hover, false);

/*
init: function () {
		for (
			var i = 0;
			i < document.getElementsByTagName('mcitem').length;
			i++
		) {
			document.getElementsByTagName('mcitem')[i].innerHTML =
				'<img class="mcitemdisplay" src="' +
				mcitems.getData(
					document
						.getElementsByTagName('mcitem')
						[i].getAttribute('identifier'),
					document
						.getElementsByTagName('mcitem')
						[i].hasAttribute('allowlist')
						? document
								.getElementsByTagName('mcitem')
								[i].getAttribute('allowlist')
						: false
				).texture +
				'" data-title="' +
				mcitems.getData(
					document
						.getElementsByTagName('mcitem')
						[i].getAttribute('identifier')
				).readable +
				'" style="' +
				(document.getElementsByTagName('mcitem')[i].style.height
					? 'height:' +
					  document.getElementsByTagName('mcitem')[i].style.height +
					  ';'
					: '') +
				(document.getElementsByTagName('mcitem')[i].style.width
					? 'width:' +
					  document.getElementsByTagName('mcitem')[i].style.width +
					  ';'
					: '') +
				'" draggable="false"><span class="mcitemcount" style="' +
				(document.getElementsByTagName('mcitem')[i].style.fontSize
					? 'font-size:' +
					  document.getElementsByTagName('mcitem')[i].style.fontSize
					: '') +
				'">' +
				(document
					.getElementsByTagName('mcitem')
					[i].getAttribute('count') > 1
					? document
							.getElementsByTagName('mcitem')
							[i].getAttribute('count')
					: '') +
				'</span>' +
				(Object.keys(mcitems.data.durabilities).includes(
					document
						.getElementsByTagName('mcitem')
						[i].getAttribute('identifier')
				) &&
				document
					.getElementsByTagName('mcitem')
					[i].hasAttribute('damage')
					? "<progress class='mcitemdamage' value='" +
					  (100 -
							(parseFloat(
								document
									.getElementsByTagName('mcitem')
									[i].getAttribute('damage')
							) /
								mcitems.data.durabilities[
									document
										.getElementsByTagName('mcitem')
										[i].getAttribute('identifier')
								]) *
								100) +
					  "' max='100'>" +
					  document
							.getElementsByTagName('mcitem')
							[i].getAttribute('damage') +
					  '</progress>'
					: '')
			document.getElementsByTagName('mcitem')[i].style.position =
				'relative'
		}
	}
*/