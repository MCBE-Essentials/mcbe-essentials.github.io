function generateUUID(){
  var chars = [1,2,3,4,5,6,7,8,9,0,"a","b","c","d","e","f"];
  var template = "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx";
  for(var i = 0; i < template.length; i++){
    if(template[i] == "x"){
      template = template.replaceAt(i, chars[Math.floor(Math.random() * chars.length)]+ "");
    }
  }
  
  return template;
}

String.prototype.replaceAt = function(index, replacement) {
    return this.substr(0, index) + replacement + this.substr(index + replacement.length);
}