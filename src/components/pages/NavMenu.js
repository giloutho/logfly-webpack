    // ========================
    // WEB COMPONENT: NAVIGATION
    // ========================
import { router } from '../../renderer.js';

class NavMenu extends HTMLElement {
    constructor() {
        super();
    }

    connectedCallback() {
        this.render();
        this.setupEventListeners();
    }

    setupEventListeners() {
        this.addEventListener('click', this.handleNavClick.bind(this));
        window.addEventListener('popstate', () => this.updateActiveLink());
    }

    updateActiveLink() {
        const path = window.location.hash.slice(1) || '/';
        const links = this.querySelectorAll('a');
        
        links.forEach(link => {
            const linkPath = link.getAttribute('href').slice(1);
            link.classList.toggle('active', linkPath === path);
        });
    }

    handleNavClick(e) {
        if (e.target.tagName === 'A') {
            e.preventDefault();
            const href = e.target.getAttribute('href');
            window.location.hash = href;
            this.updateActiveLink();
            router.loadRoute();
        }
    }

    render() {
        this.innerHTML = `
            <nav class="navbar navbar-expand-md navbar-dark fixed-top bg-dark">
                <div class="container-fluid">
                    <a class="navbar-brand" href="#">Logfly 6.5</a>
                    <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarCollapse" aria-controls="navbarCollapse" aria-expanded="false" aria-label="Toggle navigation">
                    <span class="navbar-toggler-icon"></span>
                    </button>
                    <div class="collapse navbar-collapse" id="navbarCollapse">
                        <ul class="navbar-nav me-auto mb-2 mb-md-0">
                            <li class="nav-item">
                                <a class="nav-link" href="#/">Logbook</a>
                            </li>
                            <li class="nav-item">
                                <a class="nav-link" href="#/dbtest">Db Test</a>
                            </li>  
                            <li class="nav-item">
                                <a class="nav-link" href="#/track">Trace</a>
                            </li>                            
                            <li class="nav-item">
                                <a class="nav-link" href="#/import">Import</a>
                            </li>
                            <li class="nav-item">
                                <a class="nav-link" href="#/xcnav">XCnav</a>
                            </li>
                            <li class="nav-item">
                                <a class="nav-link" href="#/config">Configuration</a>
                            </li>
                        </ul>
                    </div>
                </div>
            </nav>
        `;
    }
}
customElements.define('nav-menu', NavMenu);