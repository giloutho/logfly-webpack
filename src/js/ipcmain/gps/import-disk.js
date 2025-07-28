const {ipcMain} = require('electron')
const fs = require('fs');
const path = require('path');
const readline = require('readline');
import { DatabaseSync } from 'node:sqlite';
import tz_lookup from '@photostructure/tz-lookup';
import ZonedDateTime from "zoned-date-time";
import {zoneData} from "iana-tz-data";
import ReadLastLines from "read-last-lines"
const trigo = require('../../../js/geo/trigo.js'); 

let db = null;
// for debugging purposes
let dbPath = '../../../assets/test.db';
dbPath = new URL(dbPath, import.meta.url).pathname; // Convertit le chemin relatif en absolu
let result


ipcMain.handle('gps:impdisk', async (event, args) => {
    result = [];
    try {
        db = new DatabaseSync(dbPath);
        let igcFiles = searchIgc(args.importPath);
        if (igcFiles.length > 0) {
         //   console.log(`[gps:impdisk] found ${igcFiles.length} IGC files in ${args.importPath}`);
            const resultScan = await scanIGCFiles(igcFiles);
          //  console.log(`[gps:impdisk] scanning IGC files completed. result length: ${result.length}`);
            return { success: true, result };
        } else {
            return { success: false, message: `No track files found in ${args.importPath}`}
        }
    } catch (error) {
        console.log('Error opening database:', error);
        db = null;
        return { success: false, message: `Error opening database: ${error.message}` };
    }
})

function searchIgc(importPath) {
    let igcFiles = [];

    function scanDir(dir) {
        const entries = fs.readdirSync(dir, { withFileTypes: true });
        for (const entry of entries) {
            const fullPath = path.join(dir, entry.name);
            if (entry.isDirectory() && !entry.name.startsWith('.')) {
                scanDir(fullPath); // Recherche récursive dans le sous-dossier
            } else if (
                entry.isFile() &&
                fullPath.toLowerCase().endsWith('.igc') &&
                !entry.name.startsWith('._')
            ) {
                igcFiles.push(fullPath);
            }
        }
    }

    scanDir(importPath);
    return igcFiles;
}

async function scanIGCFiles(igcFiles) {
    for (const file of igcFiles) {
        const fisrtLines = await readUntilBLine(file);
    }
    // Tri du tableau result par date et heure de décollage décroissantes
    result.sort((a, b) => {
        // Concatène date et startTime, puis compare les timestamps
        const tsA = Date.parse(`${a.date}T${a.startTime}Z`);
        const tsB = Date.parse(`${b.date}T${b.startTime}Z`);
        return tsB - tsA; // décroissant
    });
}

async function readUntilBLine(file) {
    const lines = [];
    let flightDate = null;
    let flightPilot = null;
    let flightGlider = null;

    const stream = fs.createReadStream(file, { encoding: 'utf8' });
    const rl = readline.createInterface({ input: stream });

    for await (const line of rl) {
        lines.push(line); 
        let headerType = line.slice(2, 5);
        if (headerType === 'DTE') {    
            flightDate = parseDateHeader(line);
        }
        if (headerType === 'PLT') {
            flightPilot = parsePilot(line);
        }   
        if (headerType === 'GTY') {
            flightGlider = parseGlidertype(line);
        }     
        if (line.startsWith('B')) {
            rl.close();
            const firstFixe = parseBLine(line);
            const timestamp = Date.parse(`${flightDate}T${firstFixe.time}Z`);        
            const offsetUTC = await computeOffsetUTC(firstFixe.latitude, firstFixe.longitude, timestamp);
            const launchTime =  await computeLocalLaunchTime(timestamp, offsetUTC);
            const flightFound = await flightByTakeOff(firstFixe.latitude, firstFixe.longitude, timestamp, offsetUTC)    
            // from https://stackoverflow.com/questions/423376/how-to-get-the-file-name-from-a-full-path-using-javascript
            const filename = file.replace(/^.*[\\\/]/, '')    
            const lastTimestamp = await computeLastTime(file, flightDate);
            let duration = null;
            if (lastTimestamp !== null) {
                duration = Math.round((lastTimestamp - timestamp) / 1000); // Durée en secondes
            }
            const flight = {
                toInsert: !flightFound, // true if the flight is not found in the database
                newflight: !flightFound,
                date: flightDate,
                startTime: launchTime,
                file: filename,
                pilot: flightPilot,
                glider: flightGlider,
                path: file,
                latitude: firstFixe.latitude,
                longitude: firstFixe.longitude,
                altitude: firstFixe.altitude,
                duration: duration,
                offsetUTC: offsetUTC
            }
            result.push(flight);
           // console.log(`${filename} D ${flightDate} Start local : ${launchTime} ttoInsert : ${toInsert}`);   

            break;
        }

    }
    return lines;
}

function parseDateHeader(line) {
    const RE_HFDTE = /^HFDTE(?:DATE:)?(\d{2})(\d{2})(\d{2})(?:,?(\d{2}))?/;
    let match = line.match(RE_HFDTE);
    if (!match) {
      throw new Error(`Invalid DTE header at line ${this.lineNumber}: ${line}`);
    }
    let lastCentury = match[3][0] === '8' || match[3][0] === '9';
    let date = `${lastCentury ? '19' : '20'}${match[3]}-${match[2]}-${match[1]}`;

    return date
}

function parsePilot(line) {
    const underscoreReplacement = ' '
    const RE_PLT_HEADER = /^H(\w)PLT(?:.{0,}?:(.*)|(.*))$/;
    let match = line.match(RE_PLT_HEADER);
    if (!match) {
      throw new Error(`Invalid ${headerType} header at line ${this.lineNumber}: ${line}`);
    }
    return (match[2] || match[3] || '').replace(/_/g, underscoreReplacement).trim();
  }

function parseGlidertype(line) {
    const underscoreReplacement = ' '    
    const RE_GTY_HEADER = /^H(\w)GTY(?:.{0,}?:(.*)|(.*))$/;
    let match = line.match(RE_GTY_HEADER);
    if (!match) {
      throw new Error(`Invalid ${headerType} header at line ${this.lineNumber}: ${line}`);
    }
    return (match[2] || match[3] || '').replace(/_/g, underscoreReplacement).trim();
  }

  function parseBLine(line) {
    const RE_B = /^B(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})(\d{3})([NS])(\d{3})(\d{2})(\d{3})([EW])([AV])(-\d{4}|\d{5})(-\d{4}|\d{5})/;
    let match = line.match(RE_B);
    if (!match) {
        throw new Error(`Invalid B record at line ${this.lineNumber}: ${line}`);
    }
    let time = `${match[1]}:${match[2]}:${match[3]}`;
    let latitude = parseLatitude(match[4], match[5], match[6], match[7]);
    let longitude = parseLongitude(match[8], match[9], match[10], match[11]);
    let gpsAltitude = match[14] === '00000' ? null : parseInt(match[14], 10);
    const fixe = {
        time: time,
        latitude: latitude,
        longitude: longitude,
        altitude: gpsAltitude
    };

    return fixe;
  }

// Il faut calculer la durée du vol sans décoder entièrement le fichier IGC
// on va donc chercher la dernière ligne B de la trace IGC
async function computeLastTime(file, flightDate) {
    const lastLines = await ReadLastLines.read(file, 20);
    const lastLinesArray = lastLines.split('\n');
    for (let i = lastLinesArray.length - 1; i >= 0; i--) {
        const line = lastLinesArray[i];
        if (line.startsWith('B')) {
            // Traitement de la ligne B trouvée
            const lastFixe = parseBLine(line);
            const timestamp = Date.parse(`${flightDate}T${lastFixe.time}Z`);
            //console.log(`flightDate : ${flightDate} lastFixe : ${lastFixe.time} gives timestamp : ${timestamp}  `);
            return timestamp;
        }
    }
    return null; // Si aucune ligne B n'est trouvée                  
}  

function parseLatitude(dd, mm, mmm, ns) {
    
    let degrees = parseInt(dd, 10) + parseFloat(`${mm}.${mmm}`) / 60;
    return (ns === 'S') ? -degrees : degrees;
  }

 function parseLongitude(ddd, mm, mmm, ew) {
    let degrees = parseInt(ddd, 10) + parseFloat(`${mm}.${mmm}`) / 60;
    return (ew === 'W') ? -degrees : degrees;
  }

async function computeLocalLaunchTime(timestamp, offsetUTC) {
    /**
     * IMPORTANT : when a date oject is requested from the timestamp, 
     * the time difference is returned with the local configuration of the computer. 
     * So if I take a flight from Argentina in January it will return UTC+1, in July UTC+2.
     * it's necessary to request an UTC date object 
     */
    // offsetUTC is in minutes, original timestamp in milliseconds
    const startLocalTimestamp = timestamp + (offsetUTC*60000)
   // console.log(`computeLocalLaunchTime with timestamp ${timestamp} and offsetUTC ${offsetUTC} gives startLocalTimestamp ${startLocalTimestamp}`);
    // Convertir le timestamp en date locale
    const isoLocalStart = new Date(startLocalTimestamp).toISOString()
    const dateLocal = new Date(isoLocalStart.slice(0, -1))
//   // pas compris usage  this.dateStart = dateLocal
    const startLocalTime = String(dateLocal.getHours()).padStart(2, '0')+':'+String(dateLocal.getMinutes()).padStart(2, '0')+':'+String(dateLocal.getSeconds()).padStart(2, '0')  

    return startLocalTime
}

async function computeOffsetUTC(lat, lon, timestamp) {
    // Récupère le fuseau horaire
    const timezone = tz_lookup(lat, lon); 

    // normally returns something like // ['America/Los_Angeles'] or['Asia/Shanghai', 'Asia/Urumqi']
    // but sometimes it returns something like [ 'America/Argentina/Tucuman' ] we need the three parts
    const arrZone = timezone.toString().split('/')
    let dateFirstPoint = new Date(timestamp)
  // https://github.com/rxaviers/zoned-date-time
    let zdt
    if (arrZone.length == 3) {
        zdt = new ZonedDateTime(dateFirstPoint, zoneData[arrZone[0]][arrZone[1]][arrZone[2]])    
    } else {
        zdt = new ZonedDateTime(dateFirstPoint, zoneData[arrZone[0]][arrZone[1]])
    }
    let rawOffset = zdt.getTimezoneOffset()
    // The direction is reversed. getTimezoneOffset gives us the operation to be carried out to obtain the UTC time.
    // For France getTimezoneOffset result is -120mn.
    let offsetUTC = -1 * rawOffset	

    return offsetUTC
}

async function flightByTakeOff(flLat, flLng, timestamp, offsetUTC) {
  let maxDist = 300
  let maxDelay = 120
  let flFound = false
  if (db.isOpen) {
    let startLocalTimestamp = timestamp + (offsetUTC * 60000);
    // Convertir le timestamp en date locale
    const isoLocalStart = new Date( startLocalTimestamp).toISOString()
    const date = new Date(isoLocalStart.slice(0, -1))
    let strDate =  date.getFullYear()+'-'+('0' + (date.getMonth()+1)).slice(-2) + '-'+('0' + date.getDate()).slice(-2)      
    let dateStart = strDate+' 00:00:00'
    let dateEnd = strDate+' 23:59:59'
    // Javascript unixtimestamp is in milliseconds, conversion needed
    startLocalTimestamp = startLocalTimestamp /+ 1000
    // Are there any flights on that day ?
    // With strftime('%s', V_Date)  result is directly a timestamp in seconds
//    console.log('flightByTakeOff avec dayDayte : '+dayDate+'acec strDate : '+strDate+' donne de '+dateStart+' à '+dateEnd)
    const flightsOfDay = db.prepare(`SELECT strftime('%s', V_Date) AS tsDate,V_Duree,V_LatDeco,V_LongDeco FROM Vol WHERE V_Date >= '${dateStart}' and V_Date <= '${dateEnd}'`)
    for (const fl of flightsOfDay.iterate()) {      
      let logLat = fl.V_LatDeco
      let logLng = fl.V_LongDeco
      let logDate = fl.tsDate
      let distLogToFl = Math.abs(trigo.distance(logLat, logLng, flLat, flLng, "K") * 1000)   
      if (isNaN(distLogToFl)) distLogToFl = 0
   //   console.log(fl.tsDate+' '+fl.V_Duree+' '+logLat+' '+logLng+' '+flLat+' '+flLng+' '+distLogToFl)  
      // We start by examining whether take-offs are confined to a 500m radius
      if (distLogToFl < maxDist) {
        // Compute difference between the respective take-off times
        let diffSeconds = Math.abs(logDate - startLocalTimestamp)       
        if (diffSeconds < maxDelay) {
          flFound = true;
          break;  // exit possible https://github.com/JoshuaWise/better-sqlite3/blob/master/docs/api.md#iteratebindparameters---iterator
        }
      }
    }
  }
  
  return flFound

}
