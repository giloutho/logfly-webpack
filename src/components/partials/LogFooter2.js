import { Tooltip } from 'bootstrap';
import '../../components/partials/LogComment.js';
import '../../components/partials/LogGlider.js';
import '../../components/partials/LogSite.js';


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
            <log-comment></log-comment>
            <log-glider></log-glider>
            <log-site></log-site>
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
                        <li class="nav-item" id="bt-glider">
                            <img src="../main_window/static/images/log-glider.png" 
                                alt="atterrissage"
                                data-bs-toggle="tooltip"
                                data-bs-placement="top"
                                title="${this.gettext('Change glider')}" />                                
                        </li>
                        <li class="nav-item" id="bt-site">
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
        this.querySelector('#bt-glider').addEventListener('click', this.fn_glider.bind(this));
        this.querySelector('#bt-site').addEventListener('click', this.fn_site.bind(this));
    }

    fn_comment() {
        this.querySelector('log-comment').open(this.selectedRowData);
        this.querySelector('log-comment').addEventListener('comment-validated', (e) => {
            // Traitement de la validation du commentaire
            // e.detail.V_ID, e.detail.V_Commentaire
        });
    }

    fn_glider() {
        this.querySelector('log-glider').open(this.selectedRowData);
    }

    fn_site() {
        this.querySelector('log-site').open(this.selectedRowData);
    }

    gettext(key) {
      return this.i18n[key] || key;
    }

}

window.customElements.define('log-footer', LogFooter);