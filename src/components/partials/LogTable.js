
class LogTable extends HTMLElement {

    connectedCallback() {
        this.render();
    }

  render() {
    this.innerHTML = `

                <div class="sidebar">
                    <h3 class="mt-5 mb-4 border-bottom pb-2">Progression</h3>
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