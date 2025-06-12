// ========================
// https://fr.javascript.info/custom-elements
// ========================
import '../../components/partials/logmap.js';
import '../../components/partials/logtable.js';

class LogPage extends HTMLElement {

    connectedCallback() {
        this.render();
    }

    render() {
        this.innerHTML = `
            <div class="row g-4 h-100">
              <div class="col-lg-8 h-100">
                <log-map class="h-100"></log-map>
              </div>
              <div class="col-lg-4 h-100">
                <log-table class="h-100"></log-table>
              </div>
            </div>
        `;
    }

}
customElements.define('log-page', LogPage);