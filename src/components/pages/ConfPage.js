// ========================
// WEB COMPONENT: PAGE CONTACT
// ========================
class ConfPage extends HTMLElement {
    connectedCallback() {
        this.render();
        this.setupForm();
    }

    setupForm() {
        const form = this.querySelector('#contactForm');
        const submitBtn = this.querySelector('#submitBtn');
        const successMessage = this.querySelector('#successMessage');
        
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            
            submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2" role="status"></span> Envoi en cours...';
            submitBtn.disabled = true;
            
            setTimeout(() => {
                successMessage.classList.remove('d-none');
                form.reset();
                
                submitBtn.innerHTML = '<i class="bi bi-send me-2"></i> Envoyer le message';
                submitBtn.disabled = false;
                
                // Cacher le message après 5 secondes
                setTimeout(() => {
                    successMessage.classList.add('d-none');
                }, 5000);
            }, 1500);
        });
    }

    render() {
        this.innerHTML = `
            <div class="page">
                <div class="container py-5">
                    <div class="text-center mb-5">
                        <h2 class="fw-bold">Contactez-nous</h2>
                        <p class="lead">Nous sommes à votre écoute pour répondre à vos questions</p>
                    </div>
                    
                    <div class="row g-4">
                        <div class="col-lg-6">
                            <div class="card border-0 shadow-sm h-100">
                                <div class="card-body p-4">
                                    <h3 class="card-title mb-4">Informations de contact</h3>
                                    
                                    <div class="d-flex mb-4">
                                        <div class="contact-icon">
                                            <i class="bi bi-geo-alt"></i>
                                        </div>
                                        <div>
                                            <h4>Adresse</h4>
                                            <p>123 Avenue des Développeurs, 75000 Paris</p>
                                        </div>
                                    </div>
                                    
                                    <div class="d-flex mb-4">
                                        <div class="contact-icon">
                                            <i class="bi bi-telephone"></i>
                                        </div>
                                        <div>
                                            <h4>Téléphone</h4>
                                            <p>+33 1 23 45 67 89</p>
                                        </div>
                                    </div>
                                    
                                    <div class="d-flex mb-4">
                                        <div class="contact-icon">
                                            <i class="bi bi-envelope"></i>
                                        </div>
                                        <div>
                                            <h4>Email</h4>
                                            <p>contact@spa-bootstrap.fr</p>
                                        </div>
                                    </div>
                                    
                                    <div class="d-flex">
                                        <div class="contact-icon">
                                            <i class="bi bi-clock"></i>
                                        </div>
                                        <div>
                                            <h4>Horaires</h4>
                                            <p>Lun-Ven: 9h00-18h00</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <div class="col-lg-6">
                            <div class="card border-0 shadow-sm h-100">
                                <div class="card-body p-4">
                                    <h3 class="card-title mb-4">Envoyez-nous un message</h3>
                                    
                                    <form id="contactForm">
                                        <div class="mb-3">
                                            <label for="name" class="form-label">Nom complet</label>
                                            <input type="text" class="form-control form-control-lg" id="name" required>
                                        </div>
                                        
                                        <div class="mb-3">
                                            <label for="email" class="form-label">Adresse email</label>
                                            <input type="email" class="form-control form-control-lg" id="email" required>
                                        </div>
                                        
                                        <div class="mb-3">
                                            <label for="service" class="form-label">Service concerné</label>
                                            <select class="form-select form-select-lg" id="service" required>
                                                <option value="">Sélectionnez un service</option>
                                                <option value="developpement">Développement Web</option>
                                                <option value="design">Design UI/UX</option>
                                                <option value="seo">Optimisation SEO</option>
                                                <option value="maintenance">Maintenance</option>
                                            </select>
                                        </div>
                                        
                                        <div class="mb-4">
                                            <label for="message" class="form-label">Message</label>
                                            <textarea class="form-control form-control-lg" id="message" rows="4" required></textarea>
                                        </div>
                                        
                                        <button id="submitBtn" type="submit" class="btn btn-primary btn-lg w-100 py-2">
                                            <i class="bi bi-send me-2"></i> Envoyer le message
                                        </button>
                                        
                                        <div id="successMessage" class="alert alert-success mt-3 mb-0 d-none">
                                            <i class="bi bi-check-circle me-2"></i> Votre message a été envoyé avec succès !
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
}
customElements.define('conf-page', ConfPage);