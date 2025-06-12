const {ipcMain} = require('electron')

// Exemple d'un handler pour exécuter une requête
ipcMain.handle('db:volbyid', async (event, flightId) => {
    console.log('db:volbyid called ')
    if (!db) {
        return { success: false, message: 'No database open' };
    }
    try {
        const stmt = db.prepare('SELECT * FROM Vol WHERE V_ID = ?')
        const selFlight = stmt.get(flightId)  
        if (!selFlight) {
            return { success: false, message: `No flight found with ID ${flightId}` };
        }
        const result = {
            V_ID: selFlight.V_ID,
            V_Date: selFlight.V_Date,
            V_Duree: selFlight.V_Duree,
            V_Heure: selFlight.V_Heure,
            V_Lieu: selFlight.V_Lieu,
            V_Type: selFlight.V_Type
        };
        console.log('Flight found:', result);           
        return { success: true, result };
    } catch (error) {
        return { success: false, message: error.message };
    }
});