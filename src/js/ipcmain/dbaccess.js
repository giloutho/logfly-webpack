const {ipcMain} = require('electron')
import { DatabaseSync } from 'node:sqlite';

let db = null;

ipcMain.handle('db:open', async (event, args) => {
    const dbPath = args.filePath;
    try {
        db = new DatabaseSync(dbPath);
        console.log('Database opened successfully');
        return { success: true, message: 'Database opened successfully' };
    } catch (error) {
        console.log('Error opening database:', error);
        db = null;
        return { success: false, message: `Error opening database: ${error.message}` };
    }
});

// Exemple d'un handler pour exécuter une requête
// Il faudra supprimer les antislash dans la requête envoyée
// en écrivant la requête dans une chaîne entre guillemets doubles ("), 
// on peut utiliser les apostrophes simples (') sans les échapper :
// const sql = "SELECT V_ID, strftime('%d-%m-%Y',V_date) AS Day, strftime('%H:%M',V_date) AS Hour FROM Vol ORDER BY V_Date DESC";
ipcMain.handle('db:query', async (event, args) => {
    console.log('db:query called ')
    const req = args.sqlquery;
    console.log('db:query called with args:', req);
    if (!db) {
        return { success: false, message: 'No database open' };
    }
    try {
        const query = db.prepare(req);
        // Execute the prepared statement and log the result set.        
        const result = query.all();
        return { success: true, result };
    } catch (error) {
        return { success: false, message: error.message };
    }
});

// Exemple d'un handler pour réaliser une insertion
ipcMain.handle('db:insert', async (event, args) => {
    console.log('db:insert called with args:', args);
    if (!db) {
        return { success: false, message: 'No database open' };
    }
    try {
        // Récupération des composants de la requête
        const table = args.sqltable;
        const params = args.sqlparams;
        // Construction des clauses
        const columns = Object.keys(params).join(', ');
        // Échappement des quotes simples dans les valeurs
        const values = Object.values(params)
            .map(value => `'${value.replace(/'/g, "''")}'`)  // Échappement des quotes simples
            .join(', ');

        // Assemblage final de la requête
        const sqlQuery = `INSERT INTO ${table} (${columns}) VALUES (${values})`;
        console.log('Constructed SQL query:', sqlQuery);
        const stmt = db.prepare(sqlQuery)
        const result = stmt.run();
        // Log the result of the insertion
       // const result = { changes: stmt.changes, lastInsertRowid: stmt.lastInsertRowid };
        // Return the result of the insertion
        if (result.changes === 0) {
            throw new Error('No rows were inserted');
        }
        // Log the result of the insertion          
        console.log('Insert result:', result);
        return { success: true, result };
    } catch (error) {
        return { success: false, message: error.message };
    }
});