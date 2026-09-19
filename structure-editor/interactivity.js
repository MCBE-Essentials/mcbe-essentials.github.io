document.querySelectorAll(".tab").forEach((el) => {
  el.addEventListener("click", function(){
    let tabgroup = el.getAttribute("group") || 'group-base';
    
    const wasAlreadyOpen = el.classList.contains("selected");
    
    document.querySelectorAll(".tab").forEach((offel) => {
      let closeCallback = offel.getAttribute("close-callback") || false;
      if(offel.getAttribute("group") === tabgroup && offel !== el){
        if(offel.classList.contains("selected")){
          if(closeCallback) eval(closeCallback)
        }
        offel.classList.toggle("selected", false)
      }
    })
    
    if(!wasAlreadyOpen) el.classList.toggle("selected", true);
    let pageToOpen = el.getAttribute("open") || false;
    let openCallback = el.getAttribute("open-callback") || false;
    document.querySelectorAll('.' + tabgroup).forEach((offel) => {
      offel.classList.toggle("visible", false)
    })
    if(pageToOpen){
      document.getElementById(pageToOpen).classList.toggle("visible", true);
      if(openCallback && !wasAlreadyOpen) eval(openCallback)
    }
  })
})

function switchToTab(tabelement){
  tabelement.click();
}

const scrollContainer = document.querySelectorAll(".app-tabs");

scrollContainer.forEach((el) => {
  el.addEventListener("wheel", (evt) => {
    evt.preventDefault();
    el.scrollLeft += evt.deltaY;
  });
});

document.querySelectorAll(".horizontal-select > div").forEach((el) => {
  el.addEventListener("click", function(){    
    el.parentNode.querySelectorAll("*").forEach((offel) => {
      offel.classList.toggle("selected", false)
    })
    el.classList.toggle("selected", true);
    el.parentNode.setAttribute("value", el.getAttribute("value"));
    if(el.parentNode.oninput) el.parentNode.oninput()
  })
})

//PAINT EDITOR
const painteditor = document.getElementById("paint-editor-container");
let pos = { top: 0, left: 0, x: 0, y: 0 };

const mouseDownHandler = function (e) {
  // Change the cursor and prevent user from selecting the text
  painteditor.style.cursor = 'grabbing';
  painteditor.style.userSelect = 'none';
  
  pos = {
      // The current scroll
      left: painteditor.scrollLeft,
      top: painteditor.scrollTop,
      // Get the current mouse position
      x: e.clientX,
      y: e.clientY,
  };

  document.addEventListener('mousemove', mouseMoveHandler);
  document.addEventListener('mouseup', mouseUpHandler);
};

const mouseUpHandler = function () {
  document.removeEventListener('mousemove', mouseMoveHandler);
  document.removeEventListener('mouseup', mouseUpHandler);

  painteditor.style.cursor = 'grab';
  painteditor.style.removeProperty('user-select');
};

const mouseMoveHandler = function (e) {
  // How far the mouse has been moved
  const dx = e.clientX - pos.x;
  const dy = e.clientY - pos.y;

  // Scroll the element
  painteditor.scrollTop = pos.top - dy;
  painteditor.scrollLeft = pos.left - dx;
};

painteditor.addEventListener('mousedown', mouseDownHandler);

function openWith(url, str = structure){
  let altWindow = window.open(url);
  altWindow.addEventListener('DOMContentLoaded', function(){
    altWindow.window.importedData = JSON.stringify(structure);
    altWindow.window.parseImportedData(new File([JSON.stringify(str)], 'structure-editor-imported-file.json'));
    altWindow.snackbar('Sucessfully imported structure.');
  });
}

var currentPaintLayer = 0;
var editingWaterlogLayer = false;

function toggleEditMode() {
  // Reads the REAL state of the visual checkbox.
  const checkbox = document.getElementById("layer2-toggle");
  const label = document.getElementById("toggle-label");
  const warningMsg = document.getElementById("layer2-warning");

  if (!checkbox) return;

  // Synchronizes the global variable with the toggle's visual state.
  editingWaterlogLayer = checkbox.checked;

  if (editingWaterlogLayer) {
    label.innerText = "Layer 2";
    label.style.color = "#4a90e2";
    if (warningMsg) warningMsg.style.display = "block"; // Display the warning.
  } else {
    label.innerText = "Layer 1";
    label.style.color = ""; // Returns to default text color.
    if (warningMsg) warningMsg.style.display = "none"; // Hide the warning.
  }

  // Forces re-rendering to update visual overlays immediately.
  renderPaintEditor(currentPaintLayer);
}

function renderPaintEditor(layer = 0) {
  let editor = document.getElementById("paint-editor");
  editor.innerHTML = "";
  let dimensions = structure.value.size.value.value;
  
  // 1. Hybrid Logic V1/V2 (Reads reliably regardless of version)
  const layersRaw = structure.value.structure.value.block_indices.value.value;
  const isV1 = layersRaw.length > 0 && layersRaw[0].type !== undefined;
  
  const getLayerArray = (idx) => {
    if (!layersRaw[idx] || layersRaw[idx].type === "end") return null;
    return isV1 ? layersRaw[idx].value : layersRaw[idx];
  };

  const mainLayer = getLayerArray(0);  // Layer 1: Main Blocks
  const waterLayer = getLayerArray(1); // Layer 2: Secondary (waterlog, flower, etc.)

  let fragment = new DocumentFragment();

  for (let z = 0; z < dimensions[2]; z++) {
    let row = document.createElement("tr");
    for (let x = 0; x < dimensions[0]; x++) {
      let cell = document.createElement("td");
      cell.style.position = "relative"; // Required for the overlay to function.

      let blockindex = getStructureBlockIndex(dimensions, [x, layer, z]);

      // Get the block from the main layer.
      let mainPaletteIdx = mainLayer ? mainLayer[blockindex] : -1;
      let paletteEntry = (mainPaletteIdx !== -1 && getValidPalette(getPalette())[mainPaletteIdx])
        ? getValidPalette(getPalette())[mainPaletteIdx]
        : { name: '[void]', image: '/assets/empty.png', imageid: -1 };

      function createPrev(pEntry, pIndex) {
        let prev = false;
        if (pEntry.name === 'minecraft:air[]' || pEntry.name === 'minecraft:air') {
          let belowlayer = ((layer - 1) >= 0 ? (layer - 1) : 0);
          let belowindex = getStructureBlockIndex(dimensions, [x, belowlayer, z]);
          let belowPaletteIdx = mainLayer ? mainLayer[belowindex] : -1;
          let belowPaletteEntry = (belowPaletteIdx !== -1 && getValidPalette(getPalette())[belowPaletteIdx])
            ? getValidPalette(getPalette())[belowPaletteIdx]
            : { name: '[void]', image: '/assets/empty.png', imageid: -1 };
          prev = createBlockPreview(belowPaletteEntry.image, 0);
          prev.classList.toggle("below-layer", true);
        } else {
          prev = createBlockPreview(pEntry.image, pEntry.imageid);
        }

        prev.title = pEntry.name + "@" + getStructureBlockCoords(dimensions, [x, layer, z]).join(",");
        prev.style.width = "100%";
        prev.style.height = "100%";
        prev.setAttribute("index", pIndex);
        
        prev.onclick = function () {
          let selblockindex = parseFloat(this.getAttribute("index"));
          let selectedpaletteelement = document.querySelector(".palette-list > div > div.selected");
          
          // Decide which layer to edit based on the toggle.
          let targetLayer = editingWaterlogLayer ? waterLayer : mainLayer;
          
          if (selectedpaletteelement.hasAttribute("pickblock")) {
            let pickedindex = targetLayer ? targetLayer[selblockindex] : -1;
            for (let potentialelm of document.querySelectorAll(".palette-list > div > div")) {
              if (parseFloat(potentialelm.getAttribute("index")) === pickedindex) {
                selectPaletteEntryElement(potentialelm);
                potentialelm.scrollIntoView({ behavior: "smooth", block: "end", inline: "nearest" });
                break;
              }
            }
            return;
          } else if (!selectedpaletteelement.hasAttribute("index")) {
            return;
          }
          
          let paletteindex = parseFloat(selectedpaletteelement.getAttribute("index"));
          
          
  
  
  // ============================================================
  //  Create Layer 2 on demand (V2)
  // ============================================================
  if (editingWaterlogLayer && !targetLayer) {
    const dimensions = structure.value.size.value.value;
    const totalBlocks = dimensions[0] * dimensions[1] * dimensions[2];
    
    if (!isV1) {
      // Format V2: creates the direct array filled with -1
      structure.value.structure.value.block_indices.value.value[1] = 
        new Array(totalBlocks).fill(-1);
      
      // Reload the reference for the edit to work.
      targetLayer = structure.value.structure.value.block_indices.value.value[1];
      console.warn("[WYPNT-DEV] Layer 2 criada sob demanda (V2) com", totalBlocks, "slots.");
    } else {
      // Format V1: creates in nested format (for safety, although V1 always has Layer 2)
      structure.value.structure.value.block_indices.value.value[1] = {
        type: "list",
        value: { type: "int", value: new Array(totalBlocks).fill(-1) }
      };
      targetLayer = structure.value.structure.value.block_indices.value.value[1].value;
      console.warn("[DEV] Layer 2 created on demand (V1) with", totalBlocks, "slots.");
    }
  }
  
          // Apply the change to the correct layer (Layer 1 or Layer 2).
          if (targetLayer) {
            targetLayer[selblockindex] = paletteindex;
          }

          let newEntry = getValidPalette(getPalette())[paletteindex] || { name: '[void]', image: '/assets/empty.png', imageid: -1 };
          
          // Re-renders the visual
          if (editingWaterlogLayer) {
            // If you are editing Layer 2, only the overlay will be updated.
            let overlayPreview = createBlockPreview(newEntry.image, newEntry.imageid);
            overlayPreview.style.position = "absolute";
            overlayPreview.style.top = "0";
            overlayPreview.style.left = "0";
            overlayPreview.style.width = "100%";
            overlayPreview.style.height = "100%";
            
            // Cut in half (Shows the BOTTOM half) 
            overlayPreview.style.clipPath = "inset(50% 0 0 0)";
            
            overlayPreview.style.opacity = "0.9";
            overlayPreview.style.pointerEvents = "auto";
            overlayPreview.setAttribute("index", selblockindex);
            
            let oldOverlay = this.parentNode.querySelector('[style*="position: absolute"]');
            if (oldOverlay) oldOverlay.remove();
            this.parentNode.appendChild(overlayPreview);
          } else {
            // If you are editing Layer 1, replace the base block normally.
            this.parentNode.appendChild(createPrev(newEntry, selblockindex));
            this.parentNode.removeChild(this);
          }
        };

        prev.onmouseover = function () {
          document.getElementById("paint-editor-pos").innerHTML = getStructureBlockCoords(dimensions, [x, layer, z]).join(", ");
        };

        return prev;
      }

      // Renders the main block (Layer 1)
      let preview = createPrev(paletteEntry, blockindex);
      cell.appendChild(preview);

      //  Render the Layer 2 visual overlay (if it exists).
      if (waterLayer) {
        let waterPaletteIdx = waterLayer[blockindex];
        
        if (waterPaletteIdx !== -1) {
          let waterEntry = getValidPalette(getPalette())[waterPaletteIdx];
          
          if (waterEntry && waterEntry.name !== 'minecraft:air' && waterEntry.name !== 'minecraft:air[]') {
            // It only creates the overlay if one doesn't already exist.
            if (!cell.querySelector('[style*="position: absolute"]')) {
              let waterPreview = createBlockPreview(waterEntry.image, waterEntry.imageid);
              waterPreview.style.position = "absolute";
              waterPreview.style.top = "0";
              waterPreview.style.left = "0";
              waterPreview.style.width = "100%";
              waterPreview.style.height = "100%";
              
              // Cut in half for the initial overlay.
              waterPreview.style.clipPath = "inset(50% 0 0 0)"; 
              
              waterPreview.style.opacity = "0.9";
              waterPreview.style.pointerEvents = editingWaterlogLayer ? "auto" : "none";
              waterPreview.setAttribute("index", blockindex);
              
              // Rotate only the number, if it exists. 
              let numberLabel = waterPreview.querySelector("span");
              if (numberLabel) {
                numberLabel.style.display = "inline-block";
                numberLabel.style.transform = "rotate(90deg)";
              }
              
              cell.appendChild(waterPreview);
            }
          }
        }
      }

      row.appendChild(cell);
    }
    fragment.appendChild(row);
  }

  document.getElementById("paint-current-page").innerHTML = layer + 1;
  document.getElementById("paint-total-pages").innerHTML = dimensions[1];
  
  editor.append(fragment);
}

function renderPaletteEntries(){
  let list = document.getElementById("palette-list");
  list.innerHTML = "";
  
  let palette = getValidPalette(getPalette())
  if(!palette) return;
  
  for(let i = 0; i < palette.length; i++){
    let entry = palette[i];
    element = createPaletteEntryElement(entry, i);
    element.setAttribute("searchable", entry.name)
    list.appendChild(element)
  }
}

function renderPaintLayerUp(){
  let dimensions = structure.value.size.value.value;
  let maxheight = dimensions[1];
  if((currentPaintLayer + 1) < (maxheight)){
    currentPaintLayer += 1;
    renderPaintEditor(currentPaintLayer);
  }
}

function renderPaintLayerDown(){
  if((currentPaintLayer - 1) >= 0){
    currentPaintLayer -= 1;
    renderPaintEditor(currentPaintLayer);
  }
}

function newPaletteEntry(){
  getPalette().push({"name":{"type":"string","value":"minecraft:air"},"states":{"type":"compound","value":{}},"version":{"type":"int","value":17959425}});
  renderPaletteEntries()
  
  let domain = (getValidPalette(getPalette()).length - 1);
  
  openEditBlock("getValidPalette(getPalette())["+ domain +"].data")
}
