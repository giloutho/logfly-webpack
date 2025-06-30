import { Modal } from 'bootstrap';

class LogGlider extends HTMLElement {
    constructor() {
        super();
        this.i18n = {} // Pour stocker les messages
        this.modal = null;
        this.rowData = null;
    }

    async connectedCallback() {
        await this.langRequest();
        this.render();
        this.modal = new Modal(this.querySelector('.modal'));
        this.querySelector('#validate-btn').onclick = () => this.updateGlider();

        // Force la saisie en majuscule dans le champ newglider
        const newGliderInput = this.querySelector('#newglider');
        newGliderInput.addEventListener('input', function() {
            this.value = this.value.toUpperCase();
        });        
    }

    async langRequest() {
      this.i18n = await window.electronAPI.langmsg();
    }

    open(rowData) {
        this.rowData = rowData;
        this.dbOpen(); // Ouverture de la base de données    
        this.querySelector('#flightModalTitle').innerHTML = this.gettext('Change glider');
        this.modal.show();
    }

    updateGlider() {
        const newGlider = this.querySelector('#newglider').value.trim();
        let selectedGlider = '';
        if (newGlider !== '') {
            selectedGlider = newGlider;
        } else {
            selectedGlider = this.querySelector('#flight-glider').value;
        }
        this.validate(selectedGlider);
    }

    validate(selectedGlider) {
        this.dispatchEvent(new CustomEvent('glider-updated', {
            detail: {
                V_Engin: selectedGlider
            },
            bubbles: true,
            composed: true
        }));
        this.modal.hide();
    }    

    render() {
        this.innerHTML = /*html */`
            <div class="modal fade" id="flightModal" tabindex="-1" aria-labelledby="flightModalLabel" aria-hidden="true">
                <div class="modal-dialog">
                    <div class="modal-content">
                        <div class="modal-header">
                        <h5 class="modal-title" id="flightModalTitle">Détail du vol</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div class="modal-body" style="display: flex; flex-direction: column; gap: 1.2rem;">
                            <div class="alert alert-info"><h5>${this.gettext('Choose an existant glider')}</h5></div>
                            <select id="flight-glider" class="form-select"></select>
                            <div class="alert alert-info"><h5>${this.gettext('Or new glider')}</h5></div>
                            <input type="text" id="newglider" class="form-control" placeholder="${this.gettext('Enter new glider name')}">
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">${this.gettext('Cancel')}</button>                        
                            <button type="button" class="btn btn-primary" id="validate-btn">${this.gettext('OK')}</button>
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
              this.dbGliders()
          } else {
              console.error(`\n-> ${result.message}`);
          }
      } catch (err) {
          console.error('Erreur lors de l\'ouverture de la base de données:', err);
      }        
    }    
    
    async dbGliders() {
        let reqSQL = "SELECT DISTINCT V_Engin FROM Vol WHERE V_Engin IS NOT NULL AND V_Engin != '' ORDER BY upper(V_Engin)";
        try {
            const params = {
                invoketype: 'db:query',
                args: { sqlquery: reqSQL }
            };
            const resDb = await window.electronAPI.invoke(params);
            if (resDb.success) {
                const select = this.querySelector('#flight-glider');
                select.innerHTML = '';
                resDb.result.forEach(row => {
                    const option = document.createElement('option');
                    option.value = row.V_Engin;
                    option.textContent = row.V_Engin;
                    select.appendChild(option);
                });
                // Pré-sélectionne la valeur actuelle si présente
                if (this.rowData && this.rowData.V_Engin) {
                    select.value = this.rowData.V_Engin;
                }
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

window.customElements.define('log-glider', LogGlider);