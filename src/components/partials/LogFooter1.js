import { Tooltip } from 'bootstrap';
import { Modal } from 'bootstrap';

class LogFooter extends HTMLElement {
    constructor() {
        super();
        this.i18n = {} // Pour stocker les messages
    }

    async connectedCallback() {
        await this.langRequest();
        this.render();
        this.initTooltips();    
        this.setupEventListeners();
    }

    disconnectedCallback() {
        //implementation
    }

    attributeChangedCallback(name, oldVal, newVal) {
        //implementation
    }

    adoptedCallback() {
        //implementation
    }

    render() {
        this.innerHTML = /*html */`
            <!-- Modal Bootstrap -->
            <div class="modal fade" id="flightModal" tabindex="-1" aria-labelledby="flightModalLabel" aria-hidden="true">
                <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                    <h5 class="modal-title" id="flightModalTitle">Détail du vol</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                    <textarea id="flight-comment" class="form-control" rows="5" placeholder="Ajouter un commentaire..."></textarea>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Annuler</button>
                        <button type="button" class="btn btn-danger d-none" id="delete-btn">Delete</button>
                        <button type="button" class="btn btn-primary" id="validate-btn">Valider</button>
                    </div>
                </div>
                </div>
            </div>        
            <nav class="navbar navbar-expand-lg bottom-navbar">
                <div class="container-fluid">                
                    <ul class="navbar-nav me-auto mb-2 mb-md-0">                        
                        <li class="nav-item" id="bt-comment">
                            <img src="../main_window/static/images/log-comment.png" 
                                alt="comment"
                                data-bs-toggle="tooltip"
                                data-bs-placement="top"
                                title="${this.gettext('Comment')}" />
                        </li>
                        <li class="nav-item">
                            <img src="../main_window/static/images/log-glider.png" 
                                alt="atterrissage"
                                data-bs-toggle="tooltip"
                                data-bs-placement="top"
                                title="${this.gettext('Change glider')}" />                                
                        </li>
                        <li class="nav-item">
                            <img src="../main_window/static/images/log-site.png" 
                                alt="atterrissage"
                                data-bs-toggle="tooltip"
                                data-bs-placement="top"
                                title="${this.gettext('Site')}" />   
                        </li>
                        <li class="nav-item">
                            <img src="../main_window/static/images/log-glider-time.png" 
                                alt="atterrissage"
                                data-bs-toggle="tooltip"
                                data-bs-placement="top"
                                title="${this.gettext('Glider flight time')}" />   
                        </li>
                        <li class="nav-item">
                            <img src="../main_window/static/images/log-multicount.png" 
                                alt="atterrissage"
                                data-bs-toggle="tooltip"
                                data-bs-placement="top"
                                title="${this.gettext('Totals for the selection')}" />                                   
                        </li>
                        <li class="nav-item">
                            <img src="../main_window/static/images/log-camera.png" 
                                alt="atterrissage"
                                data-bs-toggle="tooltip"
                                data-bs-placement="top"
                                title="${this.gettext('Photo of the day')}" />                                                              
                        </li>
                        <li class="nav-item">
                            <img src="../main_window/static/images/log-tag.png" 
                                alt="atterrissage"
                                data-bs-toggle="tooltip"
                                data-bs-placement="top"
                                title="${this.gettext('Tag/Untag the flight')}" />                                                                   
                        </li>
                        <li class="nav-item">
                            <img src="../main_window/static/images/log-delete.png" 
                                alt="atterrissage"
                                data-bs-toggle="tooltip"
                                data-bs-placement="top"
                                title="${this.gettext('Delete')}" />   
                        </li>
                        <li class="nav-item">
                            <img src="../main_window/static/images/log-export-igc.png" 
                                alt="atterrissage"
                                data-bs-toggle="tooltip"
                                data-bs-placement="top"
                                title="${this.gettext('IGC export')}" />                                   
                        </li>
                        <li class="nav-item">
                            <img src="../main_window/static/images/log-export-gpx.png" 
                                alt="atterrissage"
                                data-bs-toggle="tooltip"
                                data-bs-placement="top"
                                title="${this.gettext('GPX export')}" />                                   
                        </li>
                        <li class="nav-item">
                            <img src="../main_window/static/images/log-merge.png" 
                                alt="atterrissage"
                                data-bs-toggle="tooltip"
                                data-bs-placement="top"
                                title="${this.gettext('Merge flights')}" />                                                                
                        </li>
                        <li class="nav-item">
                            <img src="../main_window/static/images/log-duplicate.png" 
                                alt="atterrissage"
                                data-bs-toggle="tooltip"
                                data-bs-placement="top"
                                title="${this.gettext('Edit/Duplicate')}" />                                                                  
                        </li>
                    </ul>
                    <span class="navbar-brand mb-0 text-white ms-auto" id="flight-label">14/05/2025</span>
                </div>
            </nav>
        `;
    }


    initTooltips() {
        // Initialise tous les tooltips du composant
        const tooltipTriggerList = this.querySelectorAll('[data-bs-toggle="tooltip"]');
        tooltipTriggerList.forEach(el => {
            new Tooltip(el);
        });
    }

    async langRequest() {
      this.i18n = await window.electronAPI.langmsg();
    }

    setupEventListeners() {
        document.querySelector('log-table').addEventListener('row-selected', (event) => {
            const rowData = event.detail.rowData;
            this.selectedRowData = rowData;
            this.rowIndex = event.detail.rowIndex;
            document.getElementById('flight-label').innerHTML = rowData.Day + ' ' + rowData.Hour + ' ' + rowData.V_Site;

            // Changement d'aspect de l'icône commentaire
            const commentImg = this.querySelector('#bt-comment img');
            if (rowData.V_Commentaire && rowData.V_Commentaire.trim() !== '') {
                commentImg.src = "../main_window/static/images/log-comment-ye.png";
            } else {
                commentImg.src = "../main_window/static/images/log-comment.png";
            }
        });
        this.querySelector('#bt-comment').addEventListener('click', this.fn_comment.bind(this));
    }

    fn_comment() {
    if (this.selectedRowData) {
        let comment = this.selectedRowData.V_Commentaire != null ? this.selectedRowData.V_Commentaire : '';
        // Affiche la date dans la modale
        this.querySelector('#flightModalTitle').innerHTML = this.selectedRowData.Day + ' ' + this.selectedRowData.Hour;
        // Pré-remplit le textarea avec le commentaire existant
        this.querySelector('#flight-comment').value = comment;

        // Affiche ou cache le bouton Delete
        const deleteBtn = this.querySelector('#delete-btn');
        if (comment.trim() !== '') {
            deleteBtn.classList.remove('d-none');
            deleteBtn.disabled = false;
        } else {
            deleteBtn.classList.add('d-none');
            deleteBtn.disabled = true;
        }

        // Affiche la modale Bootstrap
        const modal = new Modal(this.querySelector('#flightModal'));
        modal.show();

        // Gestion du bouton Valider
        this.querySelector('#validate-btn').onclick = () => {
            const newComment = this.querySelector('#flight-comment').value;
            this.dispatchEvent(new CustomEvent('row-updated', {
                detail: {
                    V_ID: this.selectedRowData.V_ID,
                    V_Commentaire: newComment
                },
                bubbles: true,
                composed: true
            }));
            modal.hide();
        };

        // (optionnel) Gestion du bouton Delete
        deleteBtn.onclick = () => {
            // Ajoute ici le comportement de suppression du commentaire
            this.querySelector('#flight-comment').value = '';
            deleteBtn.classList.add('d-none');
        };
    } else {
        alert('Aucune ligne sélectionnée');
    }
    }

    gettext(key) {
      return this.i18n[key] || key;
    }

}

window.customElements.define('log-footer', LogFooter);