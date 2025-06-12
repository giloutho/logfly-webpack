// ========================
// https://fr.javascript.info/custom-elements
// ========================
class TrackPage extends HTMLElement {
    connectedCallback() {
        this.render();
        this.setupEventListeners();
    }

    setupEventListeners() {
        // this.querySelector('#bt-test').addEventListener('click', this.testDb.bind(this));
        // this.querySelector('#bt-open').addEventListener('click', this.callDb.bind(this));
        // this.querySelector('#bt-query').addEventListener('click', this.queryDb.bind(this));
    }

    render() {
        this.innerHTML = `
            <div class="row mt-3">
                <button type="button" class="btn btn-primary col-sm-1 me-2" id="bt-test">Test igc</button>
                <button type="button" class="btn btn-secondary col-sm-1" id="bt-open">Open Igc</button>
            </div>       
        `;
    }
}
customElements.define('track-page', TrackPage);