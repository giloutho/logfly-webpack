// ========================
// WEB COMPONENT: PAGE À PROPOS
// ========================
import { api } from '../../js/testapi.js';
import { router } from '../../renderer.js';

class XcnavPage extends HTMLElement {
    constructor() {
        super();
        this.teamMembers = [];
    }

    async connectedCallback() {
        this.renderLoading();
        this.teamMembers = await api.getTeamMembers();
        this.render();
    }

    renderLoading() {
        this.innerHTML = `
            <div class="page">
                <div class="container py-5 text-center">
                    <h2 class="mb-4 fw-bold">À propos de nous</h2>
                    <div class="d-flex justify-content-center py-5">
                        <div class="spinner-border text-primary" role="status">
                            <span class="visually-hidden">Chargement...</span>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    render() {
        this.innerHTML = `
            <div class="page">
                <div class="container py-5">
                    <div class="text-center mb-5">
                        <h2 class="fw-bold">À propos de nous</h2>
                        <p class="lead">Découvrez notre histoire et notre équipe passionnée</p>
                    </div>
                    
                    <div class="row">
                        <div class="col-lg-8 mx-auto">
                            <div class="card border-0 shadow-sm mb-5">
                                <div class="card-body p-4">
                                    <p class="card-text fs-5 mb-3">
                                        Nous sommes une équipe passionnée de développeurs et designers spécialisés dans la création d'applications web modernes et performantes. Notre mission est de fournir des solutions innovantes qui répondent aux besoins spécifiques de nos clients.
                                    </p>
                                    <p class="card-text fs-5 mb-3">
                                        Fondée en 2018, notre entreprise a grandi pour devenir une référence dans le développement d'applications monopages (SPA) en Vanilla JavaScript. Nous croyons en l'utilisation des technologies web natives pour créer des expériences rapides, accessibles et sécurisées.
                                    </p>
                                    <p class="card-text fs-5">
                                        Notre approche se base sur les Web Components pour créer des applications modulaires, maintenables et évolutives. Chaque projet est l'occasion d'explorer de nouvelles techniques et de repousser les limites du possible avec les technologies web modernes.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="row row-cols-1 row-cols-md-3 g-4 mb-5">
                        <div class="col">
                            <div class="card text-center border-0 shadow-sm h-100">
                                <div class="card-body p-4">
                                    <div class="display-4 fw-bold text-primary mb-2">5+</div>
                                    <div class="fs-5 fw-medium">Ans d'expérience</div>
                                </div>
                            </div>
                        </div>
                        
                        <div class="col">
                            <div class="card text-center border-0 shadow-sm h-100">
                                <div class="card-body p-4">
                                    <div class="display-4 fw-bold text-primary mb-2">120+</div>
                                    <div class="fs-5 fw-medium">Projets réalisés</div>
                                </div>
                            </div>
                        </div>
                        
                        <div class="col">
                            <div class="card text-center border-0 shadow-sm h-100">
                                <div class="card-body p-4">
                                    <div class="display-4 fw-bold text-primary mb-2">98%</div>
                                    <div class="fs-5 fw-medium">Clients satisfaits</div>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <h3 class="text-center mb-4 fw-bold">Notre équipe</h3>
                    
                    <div class="row row-cols-1 row-cols-md-3 g-4">
                        ${this.teamMembers.map(member => `
                            <div class="col">
                                <div class="card team-member border-0 shadow-sm h-100">
                                    <div class="card-header bg-primary text-white py-3">
                                        <h4 class="card-title mb-0">${member.name}</h4>
                                        <p class="card-subtitle mb-0 opacity-75">${member.role}</p>
                                    </div>
                                    <div class="card-body">
                                        <p class="card-text">${member.bio}</p>
                                    </div>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;
    }
}
customElements.define('xcnav-page', XcnavPage);