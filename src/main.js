const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('node:path');
const fs = require('node:fs');
let langjson

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
  app.quit();
}

const createWindow = () => {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 1500,
    height: 900,
    webPreferences: {
      preload: MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY,
      sandbox: false,
      contentSecurityPolicy: "default-src 'self' 'unsafe-inline' data:; img-src 'self' data: blob: https://*.tile.openstreetmap.org;"
    },
  });

  // and load the index.html of the app.
  mainWindow.loadURL(MAIN_WINDOW_WEBPACK_ENTRY);

  // Open the DevTools.
 // mainWindow.webContents.openDevTools();

  // Most JS bundlers cannot handle dynamic require imports. 
  // Simple solution is to put them in an object:
  // let reqIpcmain = {
  //     opensave: require('./js/ipcmain/files/opensave.js'),
  //     // and so on
  // };
  loadMainProcesses()
  loadLanguage()
};



// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  createWindow();

  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });

});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

function loadLanguage() {
  let currLangFile = '../lang/'
  //let currLang = store.get('lang')
  let currLang = 'fr'
  try {    
    if (currLang != undefined && currLang != 'en') {
        //currLangFile += currLang+'.json'
        // currLangFile = path.join(__dirname, 'lang', currLang + '.json');
        // let content = fs.readFileSync(currLangFile);
        // Webpack va inclure ce fichier dans le bundle
        langjson = require(`./lang/${currLang}.json`);
     //   let langjson = JSON.parse(content);
    } else {
      langjson = {}
    }
  } catch (error) {
    console.error('[main.js] Error while loading : '+currLangFile+' error :'+error)
  }  
}

ipcMain.handle('lang:msg', async (event, args) => {
  return langjson
});

// Require each JS file in the ipcmain folder
function loadMainProcesses () {
  const ipcMainContext = require.context(
    './js/ipcmain',   // Chemin relatif au fichier actuel
    true,             // Inclure les sous-dossiers
    /\.js$/           // Filtre pour les fichiers .js
  );

  ipcMainContext.keys().forEach(modulePath => {
    // Charge le module
    const module = ipcMainContext(modulePath);
  });
}
