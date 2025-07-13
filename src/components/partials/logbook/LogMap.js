 
import 'leaflet/dist/leaflet.css';
import L from 'leaflet'; 

class LogMap extends HTMLElement {

    constructor() {
        super();
        this.map = null; // Initialiser la variable map
    }
    
    connectedCallback() {
        this.render();
        this.initMap();
    }

  render() {
    this.innerHTML = /*html */ ` 
        <style>
            #geneva-map {
                width: 100%;
                height: 100% !important;
                margin-top: 10px;
                margin-bottom: 10px;
                min-height: 85vh;
            }
        </style>           
         <div id="geneva-map"></div>       
        `;
    }

    initMap() {
        // Initialiser la carte centrée sur Genève
        this.map = L.map('geneva-map').setView([46.2044, 6.1432], 13);
        
        // Ajouter la couche de tuiles OpenStreetMap
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        }).addTo(this.map);    

    }

    showMarker(markerId, coord, msg) {
        // Ajoutez ici le code pour afficher le marker
      //  alert('Afficher marker ' + markerId);
        // Par exemple, this.map.addMarker(markerId);        
        let violetIcon = new L.Icon({
            iconUrl: '../main_window/static/images/marker-icon-violet.png',
            shadowUrl: '../main_window/static/images/marker-shadow.png',
            iconSize: [25, 41],
            iconAnchor: [12, 41],
            popupAnchor: [1, -34],
            shadowSize: [41, 41]
        });
        const marker = L.marker(coord,{icon: violetIcon}).addTo(this.map)
            .bindPopup(msg)
            .openPopup();
    }
}



customElements.define('log-map', LogMap);