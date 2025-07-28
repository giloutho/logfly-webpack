const {ipcMain} = require('electron')
const fs = require('fs');
import { DatabaseSync } from 'node:sqlite';

let db = null;

ipcMain.handle('db:open', async (event, args) => {
    const dbPath = args.filePath;
    if (!fs.existsSync(dbPath)) {
        return { success: false, message: 'Database file does not exist' };
    }    
    try {
        db = new DatabaseSync(dbPath);
        const stmtVol = db.prepare(`SELECT name FROM sqlite_master WHERE type='table' AND name=?`)
        const resVol = stmtVol.get('Vol')
        if (resVol != undefined && resVol != null && resVol['name'] == 'Vol') {
            return { success: true, message: 'Database opened successfully' };
        } 
        return { success: false, message: 'Database is not valid' };
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
    const req = args.sqlquery;
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
            .map(value => `'${String(value).replace(/'/g, "''")}'`)
            .join(', ');

        // Assemblage final de la requête
        const sqlQuery = `INSERT INTO ${table} (${columns}) VALUES (${values})`;
        const stmt = db.prepare(sqlQuery)
        const result = stmt.run();
        // Sqlite statement.run returns an object with changes and lastInsertRowid properties
        // result = { changes: stmt.changes, lastInsertRowid: stmt.lastInsertRowid };
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

ipcMain.handle('db:update', async (event, args) => {
    console.log('db:update called with args:', args);
    if (!db) {
        return { success: false, message: 'No database open' };
    }
    try {
        const table = args.sqltable;
        const params = args.sqlparams; // objet {colonne: valeur}
        const where = args.sqlwhere;   // objet {colonne: valeur}
        // Construction de la clause SET
        const setClause = Object.keys(params)
            .map(col => `${col} = ?`)
            .join(', ');
        // Construction de la clause WHERE
        const whereClause = Object.keys(where)
            .map(col => `${col} = ?`)
            .join(' AND ');
        // Construction du tableau de valeurs
        const values = [...Object.values(params), ...Object.values(where)];
        // Requête SQL finale
        const sqlQuery = `UPDATE ${table} SET ${setClause} WHERE ${whereClause}`;
        console.log('Constructed SQL update:', sqlQuery, values);
        const stmt = db.prepare(sqlQuery);
        const result = stmt.run(...values);
        if (result.changes === 0) {
            throw new Error('No rows were updated');
        }
        return { success: true, result };
    } catch (error) {
        return { success: false, message: error.message };
    }
});
