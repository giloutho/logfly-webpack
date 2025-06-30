// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts

/*
* Au départ on a tarvaillé sur cette base de code :
*   // from https://medium.com/developer-rants/opening-system-dialogs-in-electron-from-the-renderer-6daf49782fd8
    openFile: () => ipcRenderer.invoke('dialog:openFile'), 
* On trouvé ce squelette générique pour le preload.js :
    const electron = require("electron");
    electron.contextBridge.exposeInMainWorld("ipcRenderer", {
        on(...args) {
        const [channel, listener] = args;
        return electron.ipcRenderer.on(channel, (event, ...args2) => listener(event, ...args2));
        },
        off(...args) {
        const [channel, ...omit] = args;
        return electron.ipcRenderer.off(channel, ...omit);
        },
        send(...args) {
        const [channel, ...omit] = args;
        return electron.ipcRenderer.send(channel, ...omit);
        },
        invoke(...args) {
        const [channel, ...omit] = args;
        return electron.ipcRenderer.invoke(channel, ...omit);
        }
        // You can expose other APTs you need here.
        // ...
    });
* que l'on a décidé d'adopter. Pour l'instant on s'est limité à invoke 
*/


const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('electronAPI', {
    // from https://medium.com/developer-rants/opening-system-dialogs-in-electron-from-the-renderer-6daf49782fd8
    openFile: () => ipcRenderer.invoke('dialog:openFile'),

    dbOpen: async (filePath) => {
        const params = {
            invoketype: 'db:open',
            args: { filePath }
        };
        return await ipcRenderer.invoke('db:open', params.args);
    },    

    langmsg: () => ipcRenderer.invoke('lang:msg'),
    
    invoke: (params) => {
        const channel = params.invoketype
        const args = params.args 
        console.log('invoke called with channel:', channel, 'and args:', args);
        return ipcRenderer.invoke(channel, args);
    }
});

