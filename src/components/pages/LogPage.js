// ========================
// https://fr.javascript.info/custom-elements
// ========================
import '../../components/partials/logmap.js';
import '../../components/partials/logtable.js';

class LogPage extends HTMLElement {

    connectedCallback() {
        this.render();
        this.setupEventListeners();
    }

    render() {
        this.innerHTML = `


                <div class="row">
                    <div class="col-lg-8 h-100">
                         <log-map class="h-100" id="logMap"></log-map>
                    </div>
                    <div class="col-lg-4 h-100">
                        <log-table class="h-100"></log-table>
                    </div>
                </div>

        `;
    }

    setupEventListeners() {
        this.querySelector('log-table').addEventListener('show-marker', (event) => {
           // const markerId = event.detail.markerId;
           // console.log(`Marker ID: ${markerId}`);
            // Ici, vous pouvez ajouter la logique pour afficher le marker sur la carte
            // Par exemple, en utilisant une méthode de LogMap pour afficher le marker
            const logMap = this.querySelector('log-map');
            //logMap.showMarker(markerId);
            logMap.showMarker(event.detail.markerId, event.detail.coord, event.detail.msg);
        });
    }

}
customElements.define('log-page', LogPage);