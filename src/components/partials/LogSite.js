import { Modal } from 'bootstrap';

class LogSite extends HTMLElement {
    constructor() {
        super();
        this.i18n = {} // Pour stocker les messages
        this.modal = null;
        this.rowData = null;
        this.newSite = null
        this.siteDetail = {
            V_Site : null,
            V_LatDeco : null,
            V_LongDeco : null,
            V_AltDeco : null,
            V_Pays : null
        }
    }

    async connectedCallback() {
        await this.langRequest();        
        this.render(); // Le DOM est maintenant présent
        this.modal = new Modal(this.querySelector('.modal'));

        // Maintenant seulement, tu peux sélectionner les éléments
        const renameBtn = this.querySelector('#rename-btn');
        if (renameBtn) renameBtn.onclick = () => this.renameSite();

        const changeBtn = this.querySelector('#change-btn');
        if (changeBtn) changeBtn.onclick = () => this.validate();

        const newValue = this.querySelector('#newvalue');
        if (newValue) newValue.innerHTML = this.gettext('No value entered');
    }

    async langRequest() {
      this.i18n = await window.electronAPI.langmsg();
    }

    open(rowData) {
        this.rowData = rowData;

        this.newSite = null;

        // Reset des champs
        this.querySelector('#newname').value = '';
        this.querySelector('#flight-site').selectedIndex = 0;
    

        const changeBtn = this.querySelector('#change-btn');
        changeBtn.disabled = true;

        this.dbOpen(); // Ouverture de la base de données    
        this.querySelector('#flightModalTitle').innerHTML = rowData.V_Site+'  ->  '
        const newValueDiv = this.querySelector('#newvalue');
        newValueDiv.innerHTML = '';
        const newNameInput = this.querySelector('#newname');
        const flightSiteSelect = this.querySelector('#flight-site');

        // Fonction utilitaire pour activer/désactiver le bouton
        const updateChangeBtnState = () => {
            changeBtn.disabled = !this.newSite || this.newSite.trim() === '';
        };

        // Saisie dans newname (toujours en majuscule)
        newNameInput.addEventListener('input', () => {
            newNameInput.value = newNameInput.value.toUpperCase();
            newValueDiv.innerHTML = newNameInput.value;
            this.siteDetail.V_Site = newNameInput.value;
            // Active le bouton si au moins 3 caractères
            if (newNameInput.value.length >= 3) {
                changeBtn.disabled = false;
            } else {
                changeBtn.disabled = true;
            }
        });


        // Sélection dans flight-site
        flightSiteSelect.addEventListener('change', () => {
            const selectedText = flightSiteSelect.options[flightSiteSelect.selectedIndex]?.textContent || '';
            this.newSite = selectedText.trim().toUpperCase();
            this.querySelector('#newvalue').innerHTML = this.newSite;
            updateChangeBtnState();
            this.changeSite()
        });

        // Initialisation du bouton à l'ouverture
        updateChangeBtnState();
        this.modal.show();
    }

    // Un site existant a été choisi dans la liste déroulante
    // On récupère les infos du site pour les injecter dans le vol en cours de modification
    async changeSite() {
        const select = this.querySelector('#flight-site');
        const selectedText = select.options[select.selectedIndex]?.textContent || '';
        this.querySelector('#newvalue').innerHTML = selectedText
        const siteId = select.value
        this.siteDetail = {
            V_Site : selectedText,
            V_LatDeco : null,
            V_LongDeco : null,
            V_AltDeco : null,
            V_Pays : null
        }
        const reqSQL = 'SELECT * FROM Site WHERE S_ID = ?';
        try {
            const params = {
                invoketype: 'db:oneparam',
                args: { sqlquery: reqSQL, sqlparam: siteId }
            };
            const resDb = await window.electronAPI.invoke(params);
            if (resDb.success) {
                this.siteDetail.V_Site = resDb.result.S_Nom
                this.siteDetail.V_LatDeco = resDb.result.S_Latitude;
                this.siteDetail.V_LongDeco = resDb.result.S_Longitude;
                this.siteDetail.V_AltDeco = resDb.result.S_Alti;
                this.siteDetail.V_Pays = resDb.result.S_Pays;
                this.newSite = resDb.result.S_Nom
                console.log(this.siteDetail.V_Site+' '+this.siteDetail.V_LatDeco+' '+this.siteDetail.V_LongDeco+' '+this.siteDetail.V_AltDeco)
            } else {
                console.log(`\n-> Erreur requête : ${resDb.message}`);
            }
        } catch (err) {
            console.error('Erreur lors de l\'exécution de la requête:', err);
            console.log(`\n-> Erreur exécution : ${err.message}`);
        }        
    }

    validate(selectedGlider) {
        this.dispatchEvent(new CustomEvent('site-updated', {
            detail: this.siteDetail,
            bubbles: true,
            composed: true
        }));
        this.modal.hide();
    }    

    render() {
        this.innerHTML = /*html */`
            <div class="modal fade" id="flightModal" tabindex="-1" aria-labelledby="flightModalLabel" aria-hidden="true">
                <div class="modal-dialog modal-lg">
                    <div class="modal-content">
                        <div class="modal-header">
                     
                            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div class="modal-body" style="display: flex; flex-direction: column; gap: 1.2rem;">
                                
                            <div style="display: flex; align-items: center; gap: 1rem;">
                                   <span style="min-width: 320px; display: inline-block;">
                                        <b>${this.gettext('Option 1')}</b> : ${this.gettext('Change the name')}
                                    </span>
                                    <input type="text" id="newname" class="form-control" style="min-width: 350px; max-width: 100%;" placeholder="${this.gettext('Enter new site name')}">
                            </div>
                            <div style="display: flex; align-items: center; gap: 1rem;">
                                 <span style="min-width: 320px; display: inline-block;">
                                    <b>${this.gettext('Option 2')}</b> : ${this.gettext('Assign an existing site')}
                                </span>
                                <select id="flight-site" class="form-select" style="min-width: 350px; max-width: 100%;"></select>
                            </div>
                            <div style="display: flex; align-items: center;">
                                <div id="flightModalTitle">Détail du vol</div>
                                <span id="newvalue" style="margin-left: 20px;">No data</span>
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-success" id="change-btn">${this.gettext('Confirm')}</button>
                        </div>                        
                    </div>
                </div>
            </div>
        `;
    }

    async dbOpen() {
      let dbPath = '../../assets/test.db';
      dbPath = new URL(dbPath, import.meta.url).pathname; // Convertit le chemin relatif en absolu
      try {
          const result = await window.electronAPI.dbOpen(dbPath);
          if (result.success) {
              console.log(`-> ${result.message}`);  
              this.dbSites()
          } else {
              console.error(`\n-> ${result.message}`);
          }
      } catch (err) {
          console.error('Erreur lors de l\'ouverture de la base de données:', err);
      }        
    }    
    
    async dbSites() {
        let reqSQL = "SELECT S_ID, S_Nom, S_Localite FROM Site WHERE S_Type = \'D\' ORDER BY S_Nom";
        try {
            const params = {
                invoketype: 'db:query',
                args: { sqlquery: reqSQL }
            };
            const resDb = await window.electronAPI.invoke(params);
            if (resDb.success) {
                const select = this.querySelector('#flight-site');
                select.innerHTML = '';
                resDb.result.forEach(row => {
                    const option = document.createElement('option');
                    option.value = row.S_ID;
                    option.textContent = row.S_Nom;
                    select.appendChild(option);
                });
            } else {
                console.error(`\n-> Erreur requête : ${resDb.message}`);
            }
        } catch (err) {
            console.error('Erreur lors de l\'exécution de la requête:', err);
        }                   
    }

    gettext(key) {
      return this.i18n[key] || key;
    }
}

window.customElements.define('log-site', LogSite);