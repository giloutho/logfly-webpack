class LogFooter extends HTMLElement {
    constructor() {
        super();
    }

    connectedCallback() {
        this.render();
      //  this.setupEventListeners();
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
        this.innerHTML = `
            <footer class="footer mt-auto py-3 bg-dark text-white">
                <div class="container">
                    <span class="text-muted">Logfly 6.5 - © 2023</span>
                    <span class="text-muted float-end">
                        <a href="github.com/your-repo/logfly" class="text-white">GitHub</a>
                    </span>
                </div>
            </footer>
        `;
    }

}

window.customElements.define('log-footer', LogFooter);