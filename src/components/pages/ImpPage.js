// ========================
// WEB COMPONENT: PAGE SERVICES
// ========================

import { api } from '../../js/testapi.js';
import { router } from '../../renderer.js';

class ImpPage extends HTMLElement {
    constructor() {
        super();
        this.services = [];
    }

    async connectedCallback() {
        this.renderLoading();
        this.services = await api.getServices();
        this.render();
        this.setupEventListeners();
    }

    renderLoading() {
        this.innerHTML = `
            <div class="page">
                <div class="container py-5 text-center">
                    <h2 class="mb-4 fw-bold">Nos Services</h2>
                    <div class="d-flex justify-content-center py-5">
                        <div class="spinner-border text-primary" role="status">
                            <span class="visually-hidden">Chargement...</span>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    setupEventListeners() {
        this.querySelectorAll('.service-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                window.location.hash = '/contact';
                router.loadRoute();
            });
        });
    }

    render() {
        this.innerHTML = `
            <div class="page">
                <div class="container py-5">
                    <div class="text-center mb-5">
                        <h2 class="fw-bold">Nos Services</h2>
                        <p class="lead">Découvrez notre gamme complète de solutions</p>
                    </div>
                    
                    <div class="row row-cols-1 row-cols-md-2 g-4 mb-5">
                        ${this.services.map(service => `
                            <div class="col">
                                <div class="card service-card h-100 border-0 shadow-sm">
                                    <div class="card-body p-4">
                                        <div class="d-flex align-items-center mb-3">
                                            <div class="bg-primary bg-opacity-10 p-3 rounded-circle me-3">
                                                <i class="bi bi-${service.icon} fs-2 text-primary"></i>
                                            </div>
                                            <h3 class="card-title mb-0">${service.name}</h3>
                                        </div>
                                        <p class="card-text mb-4">${service.description}</p>
                                        <button class="btn btn-outline-primary service-btn">
                                            <i class="bi bi-info-circle me-2"></i> En savoir plus
                                        </button>
                                    </div>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                    
                    <div class="card border-0 shadow-sm">
                        <div class="card-header bg-primary text-white">
                            <h3 class="mb-0">Nos Tarifs</h3>
                        </div>
                        <div class="card-body p-0">
                            <div class="table-responsive">
                                <table class="table table-hover mb-0">
                                    <thead class="table-light">
                                        <tr>
                                            <th>Service</th>
                                            <th>Description</th>
                                            <th>Tarif</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            <td>Site Vitrine</td>
                                            <td>Site web de présentation (5 pages)</td>
                                            <td class="fw-bold text-primary">1 500 €</td>
                                        </tr>
                                        <tr>
                                            <td>Application Web</td>
                                            <td>Application monopage (SPA) interactive</td>
                                            <td class="fw-bold text-primary">À partir de 5 000 €</td>
                                        </tr>
                                        <tr>
                                            <td>Refonte de site</td>
                                            <td>Modernisation d'un site existant</td>
                                            <td class="fw-bold text-primary">2 500 €</td>
                                        </tr>
                                        <tr>
                                            <td>Maintenance</td>
                                            <td>Support technique mensuel</td>
                                            <td class="fw-bold text-primary">300 €/mois</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
}
customElements.define('imp-page', ImpPage);