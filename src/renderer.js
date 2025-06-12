import '../node_modules/bootstrap/dist/css/bootstrap.min.css'
import '../node_modules/bootstrap-icons/font/bootstrap-icons.css'
import './index.css';
import 'bootstrap';
import './components/pages/Navmenu.js';
import './components/pages/LogPage.js';
import './components/pages/DbPage.js';
import './components/pages/TrackPage.js';
import './components/pages/ImpPage.js';
import './components/pages/XcnavPage.js';
import './components/pages/ConfPage.js';

const router = {
    routes: {
        '/': 'log-page',
        '/dbtest' : 'db-page',
        '/import': 'imp-page',
        '/track': 'track-page',
        '/xcnav': 'xcnav-page',
        '/config': 'conf-page'
    },
    
    loadRoute() {
        const path = window.location.hash.slice(1) || '/';
        const componentTag = this.routes[path] || 'error-404';
        
        const app = document.getElementById('app');
        app.innerHTML = '';
        
        // Création du composant directement avec son tag
        const pageElement = document.createElement(componentTag);
        app.appendChild(pageElement);
    }
};

// Export du router
export { router };

// ========================
// INITIALISATION DE L'APP
// ========================
window.addEventListener('DOMContentLoaded', () => {
    router.loadRoute();
    
    // Gestion du changement d'URL
    window.addEventListener('hashchange', () => {
        router.loadRoute();
    });
});

 