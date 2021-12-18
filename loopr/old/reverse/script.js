var value, line, length;

function checkRadios() {
  var value = radioValue();
  var listelem = document.getElementById("loopList");
  /*if (value == "a") {
    listelem.style.display = "block";
  } else {
    listelem.style.display = "none";
  }*/
}

function radioValue() {
  var radios = document.getElementsByName("type");

  for (var i = 0, length = radios.length; i < length; i++) {
    if (radios[i].checked) {
      // do whatever you want with the checked radio
      return radios[i].value;
    }
  }
}

function runLoop() {
  if (radioValue() == "b") {
    var i = 0;
    var incode = document.getElementById("wantedOutput");
    var innum = document.getElementById("repeatTimes");
    var out = "";
    for (i = 0; i < parseInt(innum.value, 10); i++) {
      var val = incode.value;
      
      line = i;
      length = parseInt(innum.value, 10);
      
      val = dynamicParam(val, "<<value", ">>", "2");
      
      out += val;
      //out += incode.value;
      if (i != parseInt(innum.value, 10) - 1) {
        out += "\n";
      }
    }
    document.getElementById("output").value = out;
  } else if (radioValue() == "a") {
    var i = 0;
    var incode = document.getElementById("wantedOutput");
    var inval = document.getElementById("inval").value;
    var invals = inval.split("\n");
    var out = "";

    for (i = 0; i < invals.length; i++) {
      var val = incode.value;
      line = i;
      value = invals[i];
      length = invals.length;
      
      val = dynamicParam(val, "<<value", ">>", "2");
      
      out += val;
      //out += incode.value;
      if (i != invals.length - 1) {
        out += "\n";
      }
    }
    document.getElementById("output").value = out;
  }
}

function dynamicParam(dataVal, prefix, suffix, mode){
  var output = dataVal;
  output = output.split(prefix);
  for(var i = 0; i < output.length; i++){
    if(output[i].includes(suffix)){
      //This is a data value
      var splitVals = output[i].split(suffix);
      output.splice(i, 1);
      i--;
      for(var j = 0; j < splitVals.length; j++){
        output.splice(i + 1, 0, splitVals[j]);
        i++;
      }
        if(mode == "1"){
            //output[i-1] = "value";
        } else if(mode == "2"){
          output.splice(i-1, 1);
          i--;
        }
          //eval(output[i -1]);
    }
    //
  }
  
  output = output.join("");
  return output;
  //
}