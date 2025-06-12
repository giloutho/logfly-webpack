 
import 'leaflet/dist/leaflet.css';
import L from 'leaflet'; 

class LogMap extends HTMLElement {
    
    connectedCallback() {
        this.render();
        this.initMap();
    }

  render() {
    this.innerHTML = ` 
        <style>
            :host {
                display: block;
                height: 100%;
            }
            #geneva-map {
                width: 100%;
                height: 100% !important;
                min-height: 300px;
            }
        </style>           
         <div id="geneva-map"></div>       
        `;
    }

    initMap() {
    // Initialiser la carte centrée sur Genève
    const map = L.map('geneva-map').setView([46.2044, 6.1432], 13);
    
    // Ajouter la couche de tuiles OpenStreetMap
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(map);
}
}



customElements.define('log-map', LogMap);