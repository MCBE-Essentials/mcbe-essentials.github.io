var colors = {
  "0": "#000000",
  "1": "#0000aa",
  "2": "#00aa00",
  "3": "#00aaaa",
  "4": "#aa0000",
  "5": "#aa00aa",
  "6": "#ffaa00",
  "7": "#aaaaaa",
  "8": "#555555",
  "9": "#5555ff",
  "a": "#55ff55",
  "b": "#55ffff",
  "c": "#ff5555",
  "d": "#ff55ff",
  "e": "#ffff55",
  "f": "#ffffff",
  "g": "#ddd605",
};

var currentScore, currentSelector, currentTranslation;

function colorElements(){
  for(var i = 0; i < document.getElementsByTagName("color").length; i++){
    document.getElementsByTagName("color")[i].style.backgroundColor = colors[document.getElementsByTagName("color")[i].getAttribute("colorcode")];
  }
}

function openColorPicker(){
  closeSpecialPicker();
  document.getElementById("colorpicker").style.display = 'block';
}

function openSpecialPicker(){
  closeColorPicker();
  document.getElementById("specialpicker").style.display = 'block';
}

function openScoreEditor(scoreElement){
  currentScore = scoreElement;
  document.getElementById("overlay").style.display = "block";
  document.getElementById("score-editor").style.display = "block";
  
  document.getElementById("scoreScore").value = currentScore.getAttribute("score");
  document.getElementById("scoreSelector").value = currentScore.getAttribute("selector");
}

function openSelectorEditor(selectorElement){
  currentSelector = selectorElement;
  document.getElementById("overlay").style.display = "block";
  document.getElementById("selector-editor").style.display = "block";
  
  document.getElementById("selSelector").value = currentSelector.getAttribute("selector");
}

function openTranslationEditor(tElement){
  currentTranslation = tElement;
  document.getElementById("overlay").style.display = "block";
  document.getElementById("translation-editor").style.display = "block";
  
  if(currentTranslation.hasAttribute("key")){
    document.getElementById("translateKey").value = currentTranslation.getAttribute("key");
  }
  var translateText = false;
  try {
    translateText = JSON.stringify(JSON.parse(currentTranslation.getAttribute("with")), null, 3);
  } catch(e){}
  if(translateText){
    document.getElementById("translateText").value = translateText;
  }
  
  if(!currentTranslation.hasAttribute("with")){
    document.getElementById("translateText").value = "";
  }
}

function closeColorPicker(){
  document.getElementById("colorpicker").style.display = 'none';
  document.getElementById("cpickercontainer").onmouseleave = undefined;
}

function closeSpecialPicker(){
  document.getElementById("specialpicker").style.display = 'none';
  document.getElementById("spickercontainer").onmouseleave = undefined;
}

function closeEditors(){
  document.getElementById("overlay").style.display = "none";
  document.getElementById("score-editor").style.display = "none";
  document.getElementById("selector-editor").style.display = "none";
  document.getElementById("translation-editor").style.display = "none";
}

var editor = document.getElementById("editor");
function changeColor(colorcode){  
  /*var start = window.getSelection().baseOffset;
  var length = window.getSelection().extentOffset - window.getSelection().baseOffset;
  var end = window.getSelection().extentOffset;
  editor.textContent;*/
  if(colorcode != "r"){
    document.execCommand("foreColor", false, colors[colorcode]);
  } else {
    document.execCommand("removeFormat", false);
  }
  
  closeColorPicker();
}

function bold(){
  document.execCommand("bold", false);
  editor.normalize();
}

function italic(){
  document.execCommand("italic", false);
  editor.normalize();
}

function obfuscate(){
  document.execCommand("strikeThrough", false);
  editor.normalize();
}

function addScore(){
  var element = document.createElement("special");
  element.innerHTML = "* -> *";
  element.setAttribute("contenteditable","false");
  element.setAttribute("score","*");
  element.setAttribute("selector","*");
  element.setAttribute("stype","score");
  element.setAttribute("onclick","openScoreEditor(this)");
  if(document.activeElement != editor) editor.focus()
  document.execCommand("insertHTML", false, element.outerHTML);
}

function addSelector(){
  var element = document.createElement("special");
  element.innerHTML = "@s";
  element.setAttribute("selector","@s");
  element.setAttribute("contenteditable","false");
  element.setAttribute("stype","selector");
  element.setAttribute("onclick","openSelectorEditor(this)");
  if(document.activeElement != editor) editor.focus()
  document.execCommand("insertHTML", false, element.outerHTML);
}

function addTranslation(){
  var element = document.createElement("special");
  element.innerHTML = "my.translation.string";
  element.setAttribute("key","my.translation.string");
  element.setAttribute("with",'{"rawtext": [{"text": ""}]}');
  element.setAttribute("contenteditable","false");
  element.setAttribute("stype","translation");
  element.setAttribute("onclick","openTranslationEditor(this)");
  if(document.activeElement != editor) editor.focus()
  document.execCommand("insertHTML", false, element.outerHTML);
}

colorElements();

function updateScore(){
  var fullSelector = document.getElementById("scoreSelector").value;
  var selector = fullSelector.replaceAll("\n", "").replaceAll(" ", "");
  if(selector.includes("[")){
    var l = selector.split("[")[0];
    selector = l;
  }
  var score = document.getElementById("scoreScore").value;
  currentScore.innerHTML = selector + " -> " + score;
  currentScore.setAttribute("selector", fullSelector);
  currentScore.setAttribute("score", score);
}

function updateSelector(){
  var fullSelector = document.getElementById("selSelector").value;
  var selector = fullSelector.replaceAll("\n", "").replaceAll(" ", "");
  if(selector.includes("[")){
    var l = selector.split("[")[0];
    selector = l;
  }
  currentSelector.innerHTML = selector;
  currentSelector.setAttribute("selector", fullSelector);
}

function updateTranslation(){
  var key = document.getElementById("translateKey").value;
  var tWith;
  if(document.getElementById("translateText").value != "" && document.getElementById("translateText").value != " "){
    try {
      tWith = JSON.stringify(JSON.parse(document.getElementById("translateText").value));
    } catch(e) {
      tWith = undefined;
    }
  } else {
    tWith = undefined;
  }
  currentTranslation.innerHTML = key;
  currentTranslation.setAttribute("key", key);
  if(tWith != undefined){
    currentTranslation.setAttribute("with", tWith);
  } else {
    currentTranslation.removeAttribute("with");
  }
}

function deleteSelector(){
  currentSelector.parentNode.removeChild(currentSelector);
  closeEditors();
}

function deleteScore(){
  currentScore.parentNode.removeChild(currentScore);
  closeEditors();
}

function deleteTranslation(){
  currentTranslation.parentNode.removeChild(currentTranslation);
  closeEditors();
}

/*document.querySelector('div[contenteditable]').onkeydown = function(e) {
    // trap the return key being pressed
    if (e.keyCode === 13) {
        // insert 2 br tags (if only one br tag is inserted the cursor won't go to the next line)
        document.execCommand('insertHTML', false, '<br><br>');
        // prevent the default behaviour of return key pressed
        return false;
    }
};*/

function parseContent(){
  editor.normalize();
  //html = editor.innerHTML;
  //Get elements & subnodes
  var instructions = [];
  for(var i = 0; i < editor.childNodes.length; i++){
    instructions = instructions.concat(parseAs(editor.childNodes[i]));
  }
  
  //Parse
  var output = "";
  var jsonText = {"rawtext": []};
  var currentFormats = [];
  for(let instruction of instructions){
    let value = instruction.value || null;
    switch (instruction.type) {
      default: {
        console.log('unknown instruction:', instruction);
        break;
      }
      case 'text': {
        jsonText.rawtext.push({"text": value})
        break;
      }
      case 'format': {
        if(instruction.mode == 'add'){
          if(currentFormats.indexOf(value) === -1){
            currentFormats.push(value);
            jsonText.rawtext.push({"text": value})
          } 
        } else {
          if(currentFormats.indexOf(value) !== -1){
            currentFormats.splice(currentFormats.indexOf(value), 1);
            jsonText.rawtext.push({"text": "§r" + currentFormats.join("")})
          }
        }
        break;
      }
      case 'score': {
        jsonText.rawtext.push(
          {
            "score": {
              "name": instruction.selector,
              "objective": instruction.score
            }
          }
        )
        break;
      };
      case 'selector': {
        jsonText.rawtext.push(
          {
            "selector": value
          }
        )
        break;
      };
      case 'translation': {
        var translationobj = {
          "translate": value
        };
        if(instruction.withText){
          translationobj.with = JSON.parse(instruction.withText);
        }
        jsonText.rawtext.push(translationobj);
        break;
      }
    }
  }
  
  //Shorten text elements
  for(var i = 0; i < jsonText.rawtext.length; i++){
    if(i > 0 && jsonText.rawtext[i]/* && jsonText.rawtext[i-1]*/){
      if(jsonText.rawtext[i-1].hasOwnProperty("text") && jsonText.rawtext[i].hasOwnProperty("text")){
        jsonText.rawtext[i-1].text += jsonText.rawtext[i].text;
        jsonText.rawtext.splice(i, 1);
        i--;
      }
    }
  }
  
  return jsonText;
}

function parseAs(element){
  var output = [];
  if(element.constructor == Text){
    output.push(
      {
        "type": "text",
        "value": element.wholeText
      }
    );
  } else if(element.constructor == HTMLBRElement){
    if(!(element.parentNode == editor && !(element.nextSibling))){
      output.push(
        {
          "type": "text",
          "value": "\n"
        }
      );
    }
  } else if(element.tagName == "SPECIAL"){
    if(element.getAttribute("stype") == "score"){
      output.push({
        "type": "score",
        "selector": element.getAttribute("selector"),
        "score": element.getAttribute("score")
      });
    } else if(element.getAttribute("stype") == "selector"){
      output.push({
        "type": "selector",
        "value": element.getAttribute("selector")
      });
    } else if(element.getAttribute("stype") == "translation"){
      var value = {
        "type": "translation",
        "value": element.getAttribute("key")
      };
      if(element.getAttribute("with")){
        value.withText = element.getAttribute("with");
      }
      output.push(value);
    }
  } else {
    if(element.tagName == "B"){
      output.push(
        {"type": "format", "value": "§l", "mode": "add"}
      );
    } else if(element.tagName == "I"){
      output.push(
        {"type": "format", "value": "§o", "mode": "add"}
      );
    } else if(element.tagName == "STRIKE"){
      output.push(
        {"type": "format", "value": "§k", "mode": "add"}
      );
    } else if(element.tagName == "FONT"){
      output.push(
        {
          "type": "format", 
           "value": "§" + Object.keys(colors).find(key => colors[key] === element.color), 
           "mode": "add"
        }
      );
    }
    
    for(var i = 0; i < element.childNodes.length; i++){
      output = output.concat(parseAs(element.childNodes[i]));
    }
    
    if(element.tagName == "B"){
      output.push(
        {"type": "format", "value": "§l", "mode": "remove"}
      );
    } else if(element.tagName == "I"){
      output.push(
        {"type": "format", "value": "§o", "mode": "remove"}
      );
    } else if(element.tagName == "STRIKE"){
      output.push(
        {"type": "format", "value": "§k", "mode": "remove"}
      );
    } else if(element.tagName == "FONT"){
      output.push(
        {
          "type": "format", 
           "value": "§" + Object.keys(colors).find(key => colors[key] === element.color), 
           "mode": "remove"
        }
      );
    }
  }
  return output;
}

function generateTellraw(){
  /*var selector = prompt("What selector do you want to make the tellraw command execute on?", "@s");
  if(!selector || selector == undefined || selector == "" || selector == " "){
    selector = "@s";
  }*/
  var selector = document.getElementById("cselector").value;
  
  var rawtext = JSON.stringify(parseContent());
  document.getElementById("output").value = (document.getElementById("messagetype").value.replaceAll("@$", selector)) + rawtext;
}

/* 
  Instructions object:
  [
    {
      "type": "format",
      "action": "add",
      "value": "§a"
    },
    {
      "type": "text",
      "value": "Hello "
    },
    {
      "type": "format",
      "action": "add",
      "value": "§l"
    },
    {
      "type": "text",
      "value": "There, "
    },
    {
      "type": "format",
      "action": "remove",
      "value": "§l"
    },
    {
      "type": "text",
      "value": "World"
    },
    {
      "type": "format",
      "action": "remove",
      "value": "§a"
    },
    {
      "type": "text",
      "value": "!"
    }
  ]
  
  returns "§aHello §lThere, §r§aWorld§r!"
*/
