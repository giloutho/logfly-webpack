
class LogTable extends HTMLElement {

    connectedCallback() {
        this.render();
        this.querySelector('#show-marker-btn').addEventListener('click', () => {
            this.dispatchEvent(new CustomEvent('show-marker', {
                bubbles: true, // Permet à l'événement de remonter dans le DOM
                detail: { markerId: 1, coord : [46.2044, 6.1432], msg : '<b>Yes...</b><br>Genève' } // Vous pouvez passer des infos ici
            }));
        });
    }

  render() {
    this.innerHTML = `
                <style>
                    :host {
                        flex: 1;
                        min-height: 0;
                        display: block;
                        overflow: auto;
                    }

                </style>       
                <div class="sidebar">
                    <h3 class="mt-5 mb-4 border-bottom pb-2">Progression</h3>
                    <button id="show-marker-btn" class="btn btn-primary mb-3">Afficher un marker</button>
                    <div class="mb-3">
                        <p class="mb-1">Intégration des fonctionnalités</p>
                        <div class="progress mb-4" style="height: 8px;">
                            <div class="progress-bar" role="progressbar" style="width: 85%;"></div>
                        </div>
                        
                        <p class="mb-1">Adoption par les entreprises</p>
                        <div class="progress mb-4" style="height: 8px;">
                            <div class="progress-bar" role="progressbar" style="width: 72%;"></div>
                        </div>
                        
                        <p class="mb-1">Déploiement international</p>
                        <div class="progress" style="height: 8px;">
                            <div class="progress-bar" role="progressbar" style="width: 65%;"></div>
                        </div>
                    </div>
                </div>
            
    `;
  }
}
customElements.define('log-table', LogTable);