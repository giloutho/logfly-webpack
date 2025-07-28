// ========================
// Tracks import in logbook
// ========================
import '../partials/import/ImpTable.js';

class ImpPage extends HTMLElement {
    constructor() {
        super();
        this.dataTableInstance = null; // Ajout pour stocker l'instance DataTable
        this.i18n = {} // Pour stocker les messages
    }

    async connectedCallback() {
        await this.langRequest();
        this.render();
        this.setupEventListeners();
    }

    setupEventListeners() {
        const impGpsSky3 = this.querySelector('#imp-gps-sky3');
        if (impGpsSky3) {
            impGpsSky3.addEventListener('click', (e) => {
                e.preventDefault(); // si c'est un lien <a>
                this.callUsbGps('sky3');
            });
        }

        const impDisk = this.querySelector('#imp-disk');
        if (impDisk) {
            impDisk.addEventListener('click', (e) => {
                e.preventDefault(); // si c'est un lien <a>
                // pour debugging
              //  this.callUsbGps('xctracer');
                this.callUsbGps('sky3');
            });
        }
        const testPgearth = this.querySelector('#btn-test-pgearth');
        if (testPgearth) {
            testPgearth.addEventListener('click', (e) => {
                e.preventDefault(); // si c'est un lien <a>
                // pour debugging
                this.testPgearth()
            });
        }

    }

    render() {
        this.innerHTML = /*html */`
            <div class="container">
                <ul class="nav nav-pills">
                    <li class="nav-item dropdown">
                        <a class="nav-link dropdown-toggle" data-bs-toggle="dropdown" href="#" role="button" aria-expanded="false">Dropdown</a>
                        <ul class="dropdown-menu">
                        <li><a class="dropdown-item" id="imp-gps-sky3" href="#">Skytraxx 3/4/5</a></li>
                        <li><a class="dropdown-item" href="#">Another action</a></li>
                        <li><a class="dropdown-item" href="#">Something else here</a></li>
                        <li><hr class="dropdown-divider"></li>
                        <li><a class="dropdown-item" href="#">Separated link</a></li>
                        </ul>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link active" id="imp-disk" aria-current="page" href="#">Active</a>
                    </li>                
                    <li class="nav-item">
                        <a class="nav-link" id="test-pgearth" href="#">PG Earth</a>
                    </li>
                </ul> 
                <div class="alert alert-info d-none" id='status' role="alert" style="margin-top: 10px">
                    Display info about import status
                </div>
                <div class="my-3">
                    <label for="testLatitude" class="form-label">Latitude</label>
                    <input type="text" id="testLatitude" class="form-control" value="45.100">
                    <label for="testLongitude" class="form-label mt-2">Longitude</label>
                    <input type="text" id="testLongitude" class="form-control" value="1.255">
                    <button type="button" class="btn btn-danger mt-3" id="btn-test-pgearth">Test API</button>
                </div>                
                <imp-table></imp-table>                              
            </div>
        `;
    }

    async langRequest() {
        this.i18n = await window.electronAPI.langmsg();
        console.log('Overview -> '+this.i18n['Overview'])
    }

    async callUsbGps(typeGps) {
        this.displayStatus(`${this.gettext('Search')} ${typeGps}`, true);
        try {
            const params = {    
                invoketype: 'gps:usb',  
                args :{   
                    typeGps : typeGps
                }
            }            
            const resultUsb = await window.electronAPI.invoke(params);
            if (resultUsb.success) {
                const msg = ' : OK ...'+this.gettext('Reading flights in progress');
                this.displayStatus(msg, false);
                console.log(`dossier flights trouvé (${resultUsb.pathFlights})`);
                const params = {    
                    invoketype: 'gps:impdisk',  
                args : {   
                        importPath : resultUsb.pathFlights
                    }
                }               
                const resImport = await window.electronAPI.invoke(params);
                if (resImport.success) {
                    // Calcule le nom de vol à importer  toInsert = true
                    let totInsert = 0;
                    for (const flight of resImport.result) {
                        if (flight.toInsert == true) totInsert++;
                    }
                    let statusReport = `${typeGps} : ${resImport.result.length} ${this.gettext('tracks decoded')}`
                    statusReport += '&nbsp;&nbsp;<strong>[&nbsp;'+this.gettext('Tracks to be added')+'&nbsp;:&nbsp;'
                    statusReport += totInsert
                    statusReport += '&nbsp;]</strong>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;'
                    this.displayStatus(statusReport, true);
                    console.log(`[ImpPage] Import successful: ${resImport.result.length} flights imported.`);
                    // Envoi des données à ImpTable
                    const importData = {
                        typeGps: typeGps,
                        flights: resImport.result
                    }
                    this.querySelector('#status').classList.add('d-none');
                    this.dispatchEvent(new CustomEvent('flights-import', {
                        detail: { importData: importData },
                        bubbles: true, // pour permettre la remontée dans le DOM
                        composed: true // pour traverser le shadow DOM si besoin
                    }));


                } else {
                    const msgError = this.gettext('Import failed') + ' : ' + resImport.message;
                    console.error(msgError);
                    this.displayStatus(msgError, true);
                }
            } else {
                this.displayStatus(resultUsb.message, true);
                console.warn('[ImpPage] Aucun résultat trouvé pour le GPS USB.');
            }
        } catch (error) {
            const msgError = this.gettext('Error calling USB GPS') + ': ' + error.message;
            this.displayStatus(msgError, true);
            console.error('[ImpPage] Error calling USB GPS:', error);
        }
    }

    async testPgearth() {
        // Récupération des valeurs des champs de latitude et longitude
        const latInput = this.querySelector('#testLatitude');
        const lngInput = this.querySelector('#testLongitude');
        let lat, lng;
        if (latInput && lngInput) {
            console.log('latInput: '+latInput.value+' lngInput: '+lngInput.value);
            lat = latInput.value;
            lng = lngInput.value;
            let alt = 1000
            const dbAddSite = await this.addNewSite(lat, lng, alt)
            if (dbAddSite.success) {                
                console.log('Actualiser le vol avec : '+dbAddSite.newFlightSite.name+' '+dbAddSite.newFlightSite.pays)
            } else {
                console.error('Error in AddNewSite :', dbAddSite.message);
            }            
        }
        if (!lat || !lng) {
            this.displayStatus('Veuillez entrer une latitude et une longitude valides.', true);
            return;
        }

        
    }

    async addNewSite(lat, lng, alt) {
        let dbPath = '../../assets/test.db';
        dbPath = new URL(dbPath, import.meta.url).pathname; // Convertit le chemin relatif en absolu
        try {
            const dbResult = await window.electronAPI.dbOpen(dbPath);
            if (dbResult.success) {
                const updateDate = new Date()
                const sqlDate = updateDate.getFullYear()+'-'+String((updateDate.getMonth()+1)).padStart(2, '0')+'-'+String(updateDate.getDate()).padStart(2, '0')                 
                const sqltable = 'Site';    
                let sqlparams = {
                    S_CP : '***', // Code postal inconnu, à compléter par l'utilisateur
                    S_Type : 'D',
                    S_Maj: sqlDate
                }        
                // First we try to find the takeoff site with the API ParaglidingEarth
                const result = await this.callPgearthAPI(lat, lng);
                if (result.success) {
                    // ouverrture de la base de données
                    // le site est ajouté à la table Sites de la base données
                    // le site est ajouté dans les caractéristiques du vol
                    console.log('Sites trouvés :', result.name, result.takeoff_altitude);
                    this.displayStatus('Sites trouvés : ' +result.name+' '+result.takeoff_altitude, true);
                    sqlparams.S_Nom = result.name;
                    sqlparams.S_Pays = result.countryCode;
                    sqlparams.S_Alti = result.takeoff_altitude;
                    sqlparams.S_Latitude = result.coordinates[1];
                    sqlparams.S_Longitude = result.coordinates[0];                       
                } else {
                    // Pas de site trouvé ou erreur retournée par l'API paraglidingEarth
                    console.log('Erreur retournée par l\'API PgEarth :', result.message);
                    // Search index of new blank site : 
                    const blanckIdx = await this.searchIdxBlankSite();
                    sqlparams.S_Nom = blanckIdx.siteName;
                    sqlparams.S_Pays = '';
                    sqlparams.S_Alti = alt;
                    sqlparams.S_Latitude = lat;
                    sqlparams.S_Longitude = lng;  
                }
                // New site is added to the database
                console.log('sqlparams:', sqlparams);
                const params = {
                    invoketype: 'db:insert',
                    args: { sqltable, sqlparams }
                };
                const dbAddSite = await window.electronAPI.invoke(params);
                if (dbAddSite.success) {
                    const newFlightSite = {
                        name : sqlparams.S_Nom,
                        pays : sqlparams.S_Pays
                    }
                    return { success: true, newFlightSite};
                } else {
                    console.error('Erreur lors de l\'ouverture de la base de données:', dbAddSite.message);
                    return { success: false, message: dbAddSite.message };
                }           
            } else {
                console.error('Erreur d\'ouverture de la base de données:', dbResult.message);
                return { success: false, message: dbResult.message };
            }
        } catch (error) {
                console.error('Error in addNewSite :', error);
                return { success: false, message: error };          
        }
    }

    async searchIdxBlankSite() {
        // The name of an unknown site is : Site No XX to rename
        // We search last index XX
        const lastStr = this.gettext('To rename');
        const siteArg = 'Site No%';
        const reqSQL = `SELECT Count(S_ID) as count FROM Site WHERE S_Nom LIKE '${siteArg}'`;
        const params = {
            invoketype: 'db:query',
            args: { sqlquery: reqSQL }
        };
        const resDb = await window.electronAPI.invoke(params);
        let blanckIdx = {
            newSiteIdx : '',
            siteName :'Unknown site'
        }
        if (resDb.success) {
            if (resDb.result.length === 0 || resDb.result[0].count === 0) {
                blanckIdx.newSiteIdx = 1;
                blanckIdx.siteName = `Site No ${blanckIdx.newSiteIdx} (${lastStr})`;
                console.log('Prochain site :', blanckIdx.siteName);
            } else  if (resDb.result.length > 0) {
                blanckIdx.newSiteIdx = resDb.result[0].count + 1;
                blanckIdx.siteName = `Site No ${blanckIdx.newSiteIdx} (${lastStr})`;
                console.log('Prochain site :', blanckIdx.siteName);
            }
        } else {
            console.error('Erreur lors de la requête:', resDb.message);
        }

        return blanckIdx        
    }

    async callPgearthAPI(lat, lng) {
        // On fait comme si on le ramenait d'un paramètrage
        let pgurl = 'https://www.paraglidingearth.com/api/geojson/getAroundLatLngSites.php?distance=1';
        pgurl += `&lat=${encodeURIComponent(lat)}&lng=${encodeURIComponent(lng)}`;
       // const url = `http://www.paraglidingearth.com/api/getAroundLatLngSites.php?lat=${encodeURIComponent(lat)}&lng=${encodeURIComponent(lng)}&distance=5&limit=2`;
        try {
            const params = {
                invoketype: 'api:pgearth',
                args: pgurl 
            };
            return await window.electronAPI.invoke(params);
        } catch (err) {
            return { success: false, message: err.message };
        }
    }

    displayStatus(message, updateDisplay) {
        const statusElement = this.querySelector('#status');
        const textElement = statusElement.textContent;
        if (updateDisplay){
            statusElement.innerHTML = message;
        } else {
            statusElement.innerHTML = textElement+message;
        }
        statusElement.classList.remove('d-none');
    }
    
    gettext(key) {
      return this.i18n[key] || key;
    }        
}
customElements.define('imp-page', ImpPage);