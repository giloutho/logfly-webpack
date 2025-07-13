// ========================
// Tracks import in logbook
// ========================
import { api } from '../../js/testapi.js';

class ImpPage extends HTMLElement {
    constructor() {
        super();
    }

    async connectedCallback() {
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
                    <a class="nav-link" href="#">Link</a>
                </li>
                </ul>               
            </div>
        `;
    }

    async callUsbGps(typeGps) {
        try {
            const params = {    
                invoketype: 'gps:usb',  
                args :{   
                    typeGps : typeGps
                }
            }            
            const resultUsb = await window.electronAPI.invoke(params);
            if (resultUsb) {
                console.log(`dossier flights trouvé (${resultUsb.pathFlights})`);
                const params = {    
                    invoketype: 'gps:impdisk',  
                args : {   
                        importPath : resultUsb.pathFlights
                    }
                }               
                const resImport = await window.electronAPI.invoke(params);
                if (resImport.success) {
                    console.log(`[ImpPage] Import successful: ${resImport.result.length} flights imported.`);
                    // You can handle the result here, e.g., update the UI or store the data
                } else {
                    console.error(`[ImpPage] Import failed: ${resImport.message}`);
                }
            } else {
                console.warn('[ImpPage] Aucun résultat trouvé pour le GPS USB.');
            }
        } catch (error) {
            console.error('[ImpPage] Error calling USB GPS:', error);
        }
    }
}
customElements.define('imp-page', ImpPage);