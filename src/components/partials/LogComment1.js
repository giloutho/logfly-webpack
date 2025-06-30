import { Modal } from 'bootstrap';

class LogComment extends HTMLElement {
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
        this.querySelector('#validate-btn').onclick = () => this.updateComment();
        this.querySelector('#delete-btn').onclick = () => this.deleteComment();
    }

    async langRequest() {
      this.i18n = await window.electronAPI.langmsg();
    }

    open(rowData) {
        this.rowData = rowData;
        this.querySelector('#flightModalTitle').innerHTML = rowData.Day + ' ' + rowData.Hour;
        this.querySelector('#flight-comment').value = rowData.V_Commentaire || '';
        const deleteBtn = this.querySelector('#delete-btn');
        if (rowData.V_Commentaire && rowData.V_Commentaire.trim() !== '') {
            deleteBtn.classList.remove('d-none');
            deleteBtn.disabled = false;
        } else {
            deleteBtn.classList.add('d-none');
            deleteBtn.disabled = true;
        }
        this.modal.show();
    }

    updateComment() {
        const newComment = this.querySelector('#flight-comment').value;
        this.validate(newComment)
    }

    deleteComment() {
        // this.querySelector('#flight-comment').value = '';
        // this.querySelector('#delete-btn').classList.add('d-none');
        this.validate('')
    }

    validate(newComment) {
        this.dispatchEvent(new CustomEvent('row-updated', {
            detail: {
                V_ID: this.rowData.V_ID,
                V_Commentaire: newComment
            },
            bubbles: true,
            composed: true
        }));
        this.modal.hide();
    }    

    render() {
        this.innerHTML = `
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
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">${this.gettext('Cancel')}</button>
                        <button type="button" class="btn btn-danger d-none" id="delete-btn">${this.gettext('Delete')}</button>
                        <button type="button" class="btn btn-primary" id="validate-btn">${this.gettext('OK')}</button>
                    </div>
                </div>
                </div>
            </div>
        `;
    }
    
    gettext(key) {
      return this.i18n[key] || key;
    }
}

window.customElements.define('log-comment', LogComment);