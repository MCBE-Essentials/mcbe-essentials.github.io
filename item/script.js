//ReBrainer's Item Engine v1.2
//<minecraft-item identifier="minecraft:diamond_sword" count="2"></mcitem>
async function fetchData() {
  //Get vanilla item data
	mcitems.data.items = await fetch(
		'https://unpkg.com/minecraft-textures@1.21.11/dist/textures/json/1.21.11.id.json'
	).then((response) => response.json())
  //Get identifier mapping data
  mcitems.data.mapping = await fetch(
		'/item/data/mapping.json'
	).then((response) => response.json())
	
	mcitems.data.durabilities = await fetch(
    '/item/data/durabilities.json'
  ).then((response) => response.json());
  
  mcitems.data.enchantments = await fetch(
    '/data/general.json'  
  ).then((response) => response.json());
  
  if (window.localStorage.customItems) {
    mcitems.data.customitems = JSON.parse(window.localStorage.customItems);
    
    // INJECT the durabilities of customized items into the global map.
    for (let id in mcitems.data.customitems) {
      let customItem = mcitems.data.customitems[id];
      if (customItem.durability && customItem.durability > 0) {
        mcitems.data.durabilities[id] = parseInt(customItem.durability);
      }
    }
  }
  
	mcitems.init()
	
  
  //Append tooltip element to page
  let tooltipel = document.createElement("div");
  tooltipel.style.display = "none";
  tooltipel.classList = ["tooltip"];
  tooltipel.innerHTML = '<span class="tooltip-name" style="display: block">Item Name</span><span class="tooltip-enchs" style="display: block">Efficiency V</span><span class="tooltip-description" style="display: block; color: #aaaaaa;"></span><span class="tooltip-lore" style="display: block">Lore</span><span class="tooltip-identifier">minecraft:identifier</span>';
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
		durabilities: {},
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

    // Default fallback
    var output = {
        texture: 'https://github.com/Mojang/bedrock-samples/raw/main/resource_pack/textures/items/empty_armor_slot_shield.png',
        readable: 'Unknown',
        description: false
    }

    let parsed = mcitems.parseItemIdentifier(identifier);
    if (!parsed) return output;

    let baseIdentifier = parsed.namespace + ':' + parsed.identifier;
    let dataValue = parsed.data || 0;

    // Top priority: custom items from localStorage
    if (customitems.includes(baseIdentifier)) {
        let custom = mcitems.data.customitems[baseIdentifier];
        return {
            texture: custom.texture || output.texture,
            readable: custom.readable || baseIdentifier,
            description: custom.description || false
        };
    }

    // Try mapping (mapping.json)
    let mapped = null;
    if (Object.keys(mcitems.data.mapping).includes(baseIdentifier)) {
        let mappedData = mcitems.data.mapping[baseIdentifier];

        if (Array.isArray(mappedData)) {
            let variantValue = mappedData[dataValue];

            if (typeof variantValue === 'string') {
                // Simple string = redirect to another vanilla identifier
                let redirectId = variantValue;
                let vanillaRedirect = mcitems.data.items.items[redirectId] || {};
                mapped = vanillaRedirect;
            } else if (typeof variantValue === 'object' && variantValue !== null) {
                // Object → merge with base (index 0)
                let baseMapped = mappedData[0] || {};
                mapped = {
                    readable: variantValue.readable || baseMapped.readable,
                    texture: variantValue.texture || baseMapped.texture,
                    description: variantValue.description || baseMapped.description
                };
            } else {
                mapped = mappedData[0] || {};
            }
        } else if (typeof mappedData === 'object' && mappedData !== null) {
            mapped = mappedData;
        } else if (typeof mappedData === 'string') {
            // Redirect global
            let vanillaRedirect = mcitems.data.items.items[mappedData] || {};
            mapped = vanillaRedirect;
        }
    }

    // 3. Vanilla
    let vanillaData = mcitems.data.items.items[baseIdentifier] || {};

    // Final merge
    output = {
        readable: mapped?.readable || vanillaData.readable || output.readable,
        texture: mapped?.texture || vanillaData.texture || output.texture,
        description: mapped?.description || vanillaData.description || false
    };
    
    if (identifier == 'null' || !identifier) {
        output.texture = 'https://github.com/Mojang/bedrock-samples/raw/main/resource_pack/textures/items/empty_armor_slot_chestplate.png';
        output.readable = 'No item';
    } else if (!items.includes(baseIdentifier) && !customitems.includes(baseIdentifier) && !mapped) {
        output.readable = baseIdentifier;
    }

    return output;
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
  formatMinecraftText: function(text) {
    if (!text) return "";

    const colorMap = {
      '0': '#000000', '1': '#0000AA', '2': '#00AA00', '3': '#00AAAA',
      '4': '#AA0000', '5': '#AA00AA', '6': '#FFAA00', '7': '#C6C6C6',
      '8': '#555555', '9': '#5555FF', 'a': '#55FF55', 'b': '#55FFFF',
      'c': '#FF5555', 'd': '#FF55FF', 'e': '#FFFF55', 'f': '#FFFFFF',
      'g': '#DDD605', 'h': '#E3D4D1', 'i': '#CECACA', 'j': '#443A3B',
      'm': '#971607', 'n': '#B4684D', 'p': '#DEB12D', 'q': '#119F36',
      's': '#2CBAA8', 't': '#21497B', 'u': '#9A5CC6', 'v': '#EB7114'
    };

    let html = "";
    let currentFormats = {
        color: null,
        bold: false,
        italic: false,
        obfuscated: false // This is our STRIKE / §k
    };

    const parts = text.split(/§/);
    
    // Initial text without formatting.
    if (parts[0]) html += `<span>${parts[0]}</span>`;

    for (let i = 1; i < parts.length; i++) {
        let part = parts[i];
        if (part.length === 0) continue;

        let code = part.charAt(0).toLowerCase();
        let content = part.substring(1);
        
        if (colorMap[code]) {
            currentFormats.color = colorMap[code];
        } else if (code === 'l') {
            currentFormats.bold = true;
        } else if (code === 'o') {
            currentFormats.italic = true;
        } else if (code === 'k') {
            currentFormats.obfuscated = true;
        } else if (code === 'r') {
            currentFormats.color = null;
            currentFormats.bold = false;
            currentFormats.italic = false;
            currentFormats.obfuscated = false;
        }

        // Applies classes based on active flags
        let classes = [];
        if (currentFormats.bold) classes.push("mc-bold");
        if (currentFormats.italic) classes.push("mc-italic");
        if (currentFormats.obfuscated) classes.push("mc-obfuscated");

        let style = currentFormats.color ? `style="color: ${currentFormats.color}"` : "";
        let classAttr = classes.length > 0 ? `class="${classes.join(' ')}"` : "";

        html += `<span ${classAttr} ${style}>${content}</span>`;
    }

    return html;
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
    show: function(element) {
    let tooltip = document.querySelector('.tooltip');
    let itemid = element.getAttribute("identifier");
    let allowlist = element.hasAttribute('allowlist') ? element.getAttribute('allowlist') : false;
    
    var itemdata = mcitems.getData(itemid, allowlist);

    let itemname = element.getAttribute("custom-name") || (element.querySelector('img').getAttribute("data-title") !== itemid ? element.querySelector('img').getAttribute("data-title") : "Unknown Name");
    let itemDescription = itemdata.description || false;
    let enchStr = element.getAttribute("enchantments");
  let itemEnchs = [];
  if (enchStr) {
    try {
      const rawEnchants = JSON.parse(enchStr);  // ex: [{id:1, level:3}, {id:9, level:1}]

      itemEnchs = rawEnchants.map(ench => {
        let enchName = `Unknown Enchant (${ench.id})`;  // fallback
        let isCurse = false; // Variable to control whether it's a curse

        // Search for the name by numeric ID in the loaded list.
        const enchMap = mcitems.data.enchantments?.enchantments || {};
        for (const key in enchMap) {
          if (enchMap[key].numeric === ench.id) {
            enchName = enchMap[key].name;
            if (enchMap[key].curse === true) {
                isCurse = true;
            }
            break;
          }
        }

        // Converts level to Roman numerals
        const numerals = mcitems.data.enchantments?.numerals || ["0","I","II","III","IV","V"];
        const roman = numerals[ench.level] || ench.level.toString();

        let colorCode = isCurse ? "§c" : "§7";

        return mcitems.formatMinecraftText(colorCode + enchName + " " + roman);
      });
      } catch (err) {
      console.warn("Error parsing enchantments:", err);
      itemEnchs = [];
    }
  }
    let itemlore = false;  // Lore logic, currently disabled

    // Update Name
    document.querySelector('.tooltip-name').innerHTML = mcitems.formatMinecraftText(itemname);
    document.querySelector('.tooltip-name').style.fontStyle = 'unset';

    // Update the Description
    let descEl = document.querySelector('.tooltip-description');

    if (itemDescription) {
        // If it's an array, format each line individually. If it's a string, format the entire string.
        if (Array.isArray(itemDescription)) {
            let formattedLines = itemDescription.map(line => mcitems.formatMinecraftText(line));
            descEl.innerHTML = formattedLines.join("<br>");
        } else {
            descEl.innerHTML = mcitems.formatMinecraftText(itemDescription);
        }
        descEl.style.display = 'block';
    } else {
        descEl.style.display = 'none';
    }
    
    let enchEl = document.querySelector('.tooltip-enchs');
    if (itemEnchs.length > 0) {
        enchEl.innerHTML = itemEnchs
            .map(line => mcitems.formatMinecraftText("§b" + line)) 
            .join("<br>"); // <br> It's the line break in tooltips.
        enchEl.style.display = 'block';
    } else {
        enchEl.style.display = 'none';
    }
    document.querySelector('.tooltip-lore').innerHTML = itemlore || "";
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
