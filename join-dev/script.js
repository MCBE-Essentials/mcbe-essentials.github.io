if(window.location.href != "https://mcbe-essentials.glitch.me/join-dev/"){
  window.location.href = "https://mcbe-essentials.glitch.me/join-dev/";
}

if(window.localStorage.isDev){
  if(confirm("Do you want to leave development mode?")){
    delete window.localStorage.isDev;
  } 
} else {
  if(confirm("Do you want enter development mode? This will grant you access to the glitch.me domain of the site, which includes very experimental features.")){
    window.localStorage.isDev = "true";
  }
}
window.location.href = "//mcbe-essentials.glitch.me/";