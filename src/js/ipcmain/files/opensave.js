const {ipcMain} = require('electron')
const { dialog } = require('electron')
const fs = require('fs');

/* 
* La fonction appelante devra passer un objet args comportant à minima
*    properties: ['openFile'],
*    title: 'Sélectionner un fichier db',
*    filters: [
*        { name: 'Tous les fichiers db', extensions: ['db'] }
*    ]
* Dans la fonction handle, il faut déstructurer args pour passer  
* chaque propriété (comme filters, title, etc.) directement à showOpenDialog :
*/
ipcMain.handle('dialog:openFile', async (event,args) => {
    const result = await dialog.showOpenDialog({
        ...args
    });
    
    return result;
});

ipcMain.handle('file:read', async (event, args) => {
    const { filePath } = args;
    const result = await fs.promises.readFile(filePath, 'utf-8');
    return result;
});