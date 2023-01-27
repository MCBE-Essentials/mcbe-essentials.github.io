/* This file connects MCBE Essentials to the bridge. iframe API. 
   This script is auto-appended to the page when:
   - The page has datahandler.js defined
   - The page is in an iframe (window != window.parent)
   - The window has loaded completely
*/
import { Channel } from "https://cdn.skypack.dev/bridge-iframe-api/"

function bImport(filedata, filereference, filepath){
  console.log(filedata)
  //const filedata = await iapi.trigger('fs.readFile', path);
  
  /*if(window.location.href.endsWith("structure-editor/")) {
    document.getElementById("loading2").style.display="block";
    document.getElementById("upload2").style.display="none";
  }*/
  
  importFile(new File([filedata], 'file'), 'importedData', document.getElementById("dataFileInput").getAttribute("readertype"), parseImportedData);
  window.bridge.openedFile = filereference;
  window.bridge.openedPath = filepath;
}

const iapi = new Channel()
window.iapi = iapi;

await iapi.connect()

iapi.on('app.buildInfo', (data) => {
  console.log(data)
  window.bridge.connected = true;
  window.changeExportButton();
})

iapi.on('themeManager.themeChange', (data) => {
  console.log(data)
})

/*iapi.on('openFile', async ({ fileReference }) => {
  const str = bImport(await iapi.trigger('fs.readTextFile', fileReference))
})*/

iapi.on('tab.openFile', async (data) => {
  bImport(await iapi.trigger('fs.readFile', data.fileReference), data.fileReference, data.filePath)
})