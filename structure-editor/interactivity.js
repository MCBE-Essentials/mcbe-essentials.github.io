document.querySelectorAll(".tab").forEach((el) => {
  el.addEventListener("click", function(){
    let tabgroup = el.getAttribute("group") || 'group-base';
    
    document.querySelectorAll(".tab").forEach((offel) => {
      if(offel.getAttribute("group") === tabgroup)
      offel.classList.toggle("selected", false)
    })
    el.classList.toggle("selected", true);
    let pageToOpen = el.getAttribute("open") || false;
    document.querySelectorAll('.' + tabgroup).forEach((offel) => {
      offel.classList.toggle("visible", false)
    })
    if(pageToOpen){
      document.getElementById(pageToOpen).classList.toggle("visible", true);
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

function renderPaintEditor(layer = 0){
  let editor = document.getElementById("paint-editor");
  editor.innerHTML = ""
  let dimensions = structure.value.size.value.value;
  let blockslist = getBlockList()
  
  let fragment = new DocumentFragment()
  
  for(let z = 0; z < dimensions[2]; z++){
    let row = document.createElement("tr");
    for(let x = 0; x < dimensions[0]; x++){
      let cell = document.createElement("td");
      let blockindex = getStructureBlockIndex(dimensions, [x, layer, z]);
      let paletteEntry = getValidPalette(getPalette())[blockslist[blockindex]] || 
          {
            name: '[void]', 
            image: 'https://cdn.glitch.global/17ff8eee-9239-4ba0-8a5c-9263261550b5/0fa3c5fa-4760-4f85-babe-45b343605f9a.image.png',
            imageid: -1
          }
      //let identifier = paletteEntry ? paletteEntry.data.name.value : 'minecraft:air'
      
      function createPrev(paletteEntry){
        let prev = false;
        if(paletteEntry.name === 'minecraft:air[]'){
          //Get preview of block below
          let belowlayer = ((layer-1) >= 0 ? (layer-1) : 0);
          let belowindex = getStructureBlockIndex(dimensions, [x, belowlayer, z]);
          let belowPaletteEntry = getValidPalette(getPalette())[blockslist[belowindex]] || 
            {
              name: '[void]', 
              image: 'https://cdn.glitch.global/17ff8eee-9239-4ba0-8a5c-9263261550b5/0fa3c5fa-4760-4f85-babe-45b343605f9a.image.png',
              imageid: -1
            }
          prev = createBlockPreview(belowPaletteEntry.image, 0);
          prev.classList.toggle("below-layer", true);
        } else {
          prev = createBlockPreview(paletteEntry.image, paletteEntry.imageid)
        }
        
        prev.title = paletteEntry.name + "@" + getStructureBlockCoords(dimensions, blockindex).join(",");
        prev.style.width = "100%";
        prev.setAttribute("index", blockindex);
        prev.onclick = function(){
          let selblockindex = parseFloat(this.getAttribute("index"));
          let selectedpaletteelement = document.querySelector(".palette-list > div > div.selected");
          if(selectedpaletteelement.hasAttribute("pickblock")){
            let pickedindex = blockslist[selblockindex];
            
            for(let potentialelm of document.querySelectorAll(".palette-list > div > div")){
              if(parseFloat(potentialelm.getAttribute("index")) === pickedindex){
                selectPaletteEntryElement(potentialelm);
                potentialelm.scrollIntoView({behavior: "smooth", block: "end", inline: "nearest"});
                break;
              } 
            }
            
            return;
          } else if(!selectedpaletteelement.hasAttribute("index")){
            return;
          } 
          let paletteindex = parseFloat(selectedpaletteelement.getAttribute("index"));

          blockslist[selblockindex] = paletteindex;
          
          let newEntry = getValidPalette(getPalette())[paletteindex] || 
          {
            name: '[void]', 
            image: 'https://cdn.glitch.global/17ff8eee-9239-4ba0-8a5c-9263261550b5/0fa3c5fa-4760-4f85-babe-45b343605f9a.image.png',
            imageid: -1
          };
          
          this.parentNode.appendChild(createPrev(newEntry))
          this.parentNode.removeChild(this);
        }
        prev.onmouseover = function(){
          document.getElementById("paint-editor-pos").innerHTML = getStructureBlockCoords(dimensions, parseFloat(this.getAttribute("index"))).join(", ");
        }
        
        return prev;
      }
      
      let preview = createPrev(paletteEntry);
      
      //cell.setAttribute("index", blockindex);
      cell.appendChild(preview)
      row.appendChild(cell)
    }
    fragment.appendChild(row)
  }
  
  document.getElementById("paint-current-page").innerHTML = layer + 1;
  document.getElementById("paint-total-pages").innerHTML = dimensions[1];
  
  editor.append(fragment)
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