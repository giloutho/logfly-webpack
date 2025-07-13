    // ========================
    // WEB COMPONENT: General menu Top navbar
    // ========================
import { router } from '../../renderer.js';

class NavMenu extends HTMLElement {
    constructor() {
        super();
        this.i18n = {} // Pour stocker les messages
    }

    async connectedCallback() {
        await this.langRequest();
        this.render();
        this.setupEventListeners();
    }

    async langRequest() {
      this.i18n = await window.electronAPI.langmsg();
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
        this.innerHTML = /*html */`
            <nav class="navbar navbar-expand-md top-navbar fixed-top">
                <div class="container-fluid">
                    <a class="navbar-brand text-white" href="#">Logfly 6.5</a>
                    <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarCollapse" aria-controls="navbarCollapse" aria-expanded="false" aria-label="Toggle navigation">
                    <span class="navbar-toggler-icon"></span>
                    </button>
                    <div class="collapse navbar-collapse" id="navbarCollapse">
                        <ul class="navbar-nav me-auto mb-2 mb-md-0">
                            <li class="nav-item">
                                <a class="nav-link text-white" style="font-size: 1.5rem;margin-left : 50px" href="#/"><i class="bi bi-journal-text me-1"></i></a>
                            </li>
                            <li class="nav-item">
                                <a class="nav-link text-white" style="font-size: 1.5rem;" href="#/dbtest"><i class="bi bi-bar-chart-line me-1"></i></a>
                            </li>  
                            <li class="nav-item">
                                <a class="nav-link text-white" style="font-size: 1.5rem;" href="#/track"><i class="bi bi-box-arrow-in-down me-1"></i></a>
                            </li>                            
                            <li class="nav-item">
                                <a class="nav-link text-white" style="font-size: 1.5rem;"href="#/import"><i class="bi bi-threads-fill me-1"></i></a>
                            </li>
                            <li class="nav-item">
                                <a class="nav-link text-white" style="font-size: 1.5rem;" href="#/xcnav"><i class="bi bi-graph-down me-1"></i></a>
                            </li>
                            <li class="nav-item">
                                <a class="nav-link text-white" style="font-size: 1.5rem;" href="#/config"><i class="bi bi-card-image me-1"></i></a>
                            </li>
                            <li class="nav-item">
                                <a class="nav-link text-white" style="font-size: 1.5rem;" href="#/"><i class="bi bi-geo-alt me-1"></i></a>
                            </li>
                            <li class="nav-item">
                                <a class="nav-link text-white" style="font-size: 1.5rem;" href="#/dbtest"><i class="bi bi-airplane me-1"></i></a>
                            </li>  
                            <li class="nav-item">
                                <a class="nav-link text-white" style="font-size: 1.5rem;" href="#/track"><i class="bi bi-person-gear me-1"></i></a>
                            </li>                            
                            <li class="nav-item">
                                <a class="nav-link text-white" style="font-size: 1.5rem;" href="#/import"><i class="bi bi-compass me-1"></i></a>
                            </li>
                            <li class="nav-item">
                                <a class="nav-link text-white" style="font-size: 1.5rem;" href="#/xcnav"><i class="bi bi-gear me-1"></i></a>
                            </li>
                            <li class="nav-item">
                                <a class="nav-link text-white" style="font-size: 1.5rem;" href="#/config"><i class="bi bi-telephon me-1"></i></a>
                            </li>        
                            <li class="nav-item">
                                <a class="nav-link text-white" style="font-size: 1.5rem;" href="#/config"><i class="bi bi-tools me-1"></i></a>
                            </li>                       
                        </ul>
                    </div>
                </div>
            </nav>
        `;
    }

    gettext(key) {
      return this.i18n[key] || key;
    }
}
customElements.define('nav-menu', NavMenu);