// ========================
// https://fr.javascript.info/custom-elements
// ========================
import DataTable from 'datatables.net-bs5';
import 'datatables.net-bs5/css/dataTables.bootstrap5.min.css';
import 'datatables.net-select-bs5';
import 'datatables.net-select-bs5/css/select.bootstrap5.min.css';
// ========================
class DbPage extends HTMLElement {
  constructor() {
    super();
    this.dataTableInstance = null; // Ajout pour stocker l'instance DataTable
  }

    connectedCallback() {
        this.render();
        // iniTable() doit se trouver après le rendu du DOM, 
        // c'est-à-dire à la fin de la méthode render() ou dans connectedCallback() juste après this.render();
        //this.iniTable();
        this.setupEventListeners();
    }

    setupEventListeners() {
        this.querySelector('#bt-test').addEventListener('click', this.dbTest.bind(this));
        this.querySelector('#bt-open').addEventListener('click', this.dbCall.bind(this));
        this.querySelector('#bt-insert').addEventListener('click', this.dbInsert.bind(this));
        this.querySelector('#bt-table').addEventListener('click', this.dbTable.bind(this));
        this.querySelector('#bt-query').addEventListener('click', this.dbQuery.bind(this));
    }

    render() {
       // this.iniTable();
        this.innerHTML = `
            <div class="row mt-3">
                <button type="button" class="btn btn-primary col-sm-1 me-2" id="bt-test">Test db</button>
                <button type="button" class="btn btn-secondary col-sm-1 me-2" id="bt-open">Open db</button>
                <button type="button" class="btn btn-secondary col-sm-1 me-4" id="bt-insert">Insertion</button>
                <button type="button" class="btn btn-info col-sm-1" id="bt-table">Table</button>
            </div>  
            <div class="row mt-3">
                <textarea class="form-control" id="disp-result" rows="12">Pas de db sélectionnée</textarea>
            </div>   
            <div class="row mt-3 d-none" id="input-group">
                <div class="input-group">
                    <input type="text" class="form-control" aria-describedby="input-group-button-right" id="query-text">
                    <button type="button" class="btn btn-success" id="bt-query">Requête</button>
                </div>            
            </div> 
            <div class="row mt-3">
                <table id="table_id" class="table table-striped table-bordered">
                    <tbody>
                    </tbody>
                </table>
            </div>
        `;
    }

    testTable() {
        const table = this.querySelector('#example');
        if (table) {
            const dataTable = new DataTable(table, {
                paging: true,
                searching: true,
                ordering: true,
                info: true,
                lengthChange: true,
                pageLength: 2,  // Nombre de lignes par page                    
            })
        }
    }

    displayTable(dataSites) {
        console.log('Initialisation de la table DataTable');
        const table = this.querySelector('#table_id');
        // Détruire l'ancienne instance DataTable si elle existe (ES6)
        if (this.dataTableInstance) {
            this.dataTableInstance.destroy();
            this.dataTableInstance = null;
        }

        // Créer la nouvelle instance DataTable
        this.dataTableInstance = new DataTable(table, {
          data: dataSites || [], // Si dataSites est fourni, l'utilise, sinon utilise un tableau vide
          autoWidth : false,
          columns: [
              {
                  title : '',
                  data: 'S_Type',
                  render: function(data, type, row) {
                      let iconType
                    //   let iconPath = '../../assets/leaflet/';
                    //   iconPath = new URL(iconPath, import.meta.url).pathname; // Convertit le chemin relatif en absolu
                      let iconPath = '../../assets/leaflet/';                      
                      switch (data) {
                          case 'D':                                
                                iconType = '<img src="../main_window/static/images/windsock22.png" alt="atterrissage"></img>';
                              break
                          case 'A' :
                              iconType = '<img src="../main_window/static/images/arrivee22.png" alt="atterrissage"></img>';
                              break                    
                          default:
                              iconType = data
                              break
                      }
                      return iconType
                  },          
                  className: "dt-body-center text-center"
              },             
              { title : 'Name', data: 'S_Nom' },
              { title : 'Locality', className: "text-nowrap", data: 'S_Localite' },
              { title : 'ZIP', data: 'S_CP' },
              { title : 'Alt', data: 'S_Alti' },
              { title : 'Orientation', data: 'S_Orientation' },     
              { title : 'Type', data: 'S_Type' },  
              { title : 'Lat', data: 'S_Latitude' },
              { title : 'Long', data: 'S_Longitude' },
              { title : 'Comment', data: 'S_Commentaire' }, 
              { title : 'id', data: 'S_ID' }
          ],      
          columnDefs : [
              { "width": "3%", "targets": 0 },
              { "width": "28%", "targets": 1 },
              { "width": "29%", "targets": 2 },
              { "width": "8%", "targets": 3 },
              { "width": "8%", "targets": 4 },
              { "width": "24%", "targets": 5 },
              { "targets": 6, "visible": false, "searchable": false },     
              { "targets": 7, "visible": false, "searchable": false },   
              { "targets": 8, "visible": false, "searchable": false },   
              { "targets": 9, "visible": false, "searchable": false },   
              { "targets": 10, "visible": false, "searchable": false },  
          ],      
          bInfo : false,          // hide "Showing 1 to ...  row selected"
          lengthChange : false,   // hide "show x lines"  end user's ability to change the paging display length 
         // searching : false,      // hide search abilities in table
          dom: 'lptir',
         // ordering: false,        // Sinon la table est triée et écrase le tri sql mais ds ce cas addrow le met à la fin
          order: [[ 1, 'asc' ]],
          pageLength: 5,         // ce sera à calculer avec la hauteur de la fenêtre
          pagingType : 'full',
          language: {             // cf https://datatables.net/examples/advanced_init/language_file.html
              paginate: {
              first: '<<',
              last: '>>',
              next: '>', // or '→'
              previous: '<' // or '←' 
              }
          },     
          select: true,            // Activation du plugin select
          });
        this.dataTableInstance.on( 'select', function ( e, dt, type, indexes ) {
            if ( type === 'row' ) {
                let currIdSite = dt.row(indexes).data().S_ID
                console.log('Selected site ID:', currIdSite);             
            }        
        } );

    }
    
    dbTest() {
        let dbTestPath = '../../assets/test.db';
        dbTestPath = new URL(dbTestPath, import.meta.url).pathname; // Convertit le chemin relatif en absolu
        console.log('Test db path:', dbTestPath);
        this.dbOpen(dbTestPath);
    }

    async dbCall() {
        try {
            const params = {    
                invoketype: 'dialog:openFile',  
                args :{   
                    properties: ['openFile'],
                    title: 'Sélectionner un fichier db',
                    filters: [
                        { name: 'Tous les fichiers db', extensions: ['db'] }
                    ]
                }
            }
            const result = await window.electronAPI.invoke(params);
            const dispResult = this.querySelector('#disp-result');
            if (result.canceled) {                
                dispResult.value = 'Aucun fichier sélectionné.';
            } else {              
                this.dbOpen(result.filePaths[0]);
            }
        } catch (err) {
            console.error('Erreur lors de l\'ouverture du dialogue:', err);
            dispResult.value = `'Erreur lors de l\'ouverture du dialogue : ${err}`;
        }
    }

    async dbOpen(filePath) {
        let resultText = '';
        const dispResult = this.querySelector('#disp-result');
        resultText = `-> ${filePath}\n`;
        dispResult.value = resultText;
        
        try {
            const params = {
                invoketype: 'db:open',
                args: { filePath }
            };
            const result = await window.electronAPI.invoke(params);
            if (result.success) {
                const inputReq = document.querySelector('#input-group');
                inputReq.classList.remove('d-none');
                dispResult.value += `-> ${result.message}`;            


                // const sqlquery = 'SELECT V_Date, V_Duree FROM Vol';
                // const paramsReq = {
                //     invoketype: 'db:query',
                //     args: { sqlquery }
                // };
                // const resDb = await window.electronAPI.invoke(paramsReq);
                // if (resDb.success) {
                //     //dispResult.value += `\n-> Requête réussie : ${JSON.stringify(resDb.result)}`;
                //         resDb.result.forEach((row, idx) => {
                //            // console.log(`Résultat ${idx + 1}:`, row.V_Date, row.V_Duree);
                //             dispResult.value += `\n-> Résultat ${idx + 1}: ${row.V_Date} - ${row.V_Duree}`;
                //         });
                // } else {
                //     dispResult.value += `\n-> Erreur requête : ${resDb.message}`;
                // }

                // let flightId = 1; // Exemple d'ID de vol
                // const paramsFlight = {  
                //     invoketype: 'db:volbyid',
                //     args: flightId
                // };      
                // const flightResult = await window.electronAPI.invoke(paramsFlight);
                // if (flightResult.success) {
                //     dispResult.value += `\n-> Vol trouvé : ${JSON.stringify(flightResult.result)}`;
                // } else {
                //     dispResult.value += `\n-> Erreur recherche vol : ${flightResult.message}`;
                // }   
            } else {
                dispResult.value += `\n-> ${result.message}`;
            }
        } catch (err) {
            console.error('Erreur lors de l\'ouverture de la base de données:', err);
            dispResult.value += `-> Erreur ouverture : ${err.message}`;
        }
    } 
    
    async dbQuery() {
        const dispResult = this.querySelector('#disp-result');
        const queryText = this.querySelector('#query-text').value.trim();
        try {
            const params = {
                invoketype: 'db:query',
                args: { sqlquery: queryText }
            };
            const resDb = await window.electronAPI.invoke(params);
            if (resDb.success) {
                resDb.result.forEach((row, idx) => {
                    // console.log(`Résultat ${idx + 1}:`, row.V_Date, row.V_Duree);
                    dispResult.value += `\n${JSON.stringify(row)}`;
                });
            } else {
                dispResult.value += `\n-> Erreur requête : ${resDb.message}`;
            }
        } catch (err) {
            console.error('Erreur lors de l\'exécution de la requête:', err);
            dispResult.value += `\n-> Erreur exécution : ${err.message}`;
        }
    }

    async dbInsert() {
        const dispResult = this.querySelector('#disp-result');
        const sqltable = 'Site';
        const sqlparams = { S_Nom: 'LE SIRE', S_Localite: 'CHAMBERY' };
        dispResult.value += `\n-> Insertion dans la table ${sqltable} avec les paramètres : ${JSON.stringify(sqlparams)}`;
        try {
            const params = {
                invoketype: 'db:insert',
                args: { sqltable, sqlparams }
            };
            const resDb = await window.electronAPI.invoke(params);
            if (resDb.success) {
                dispResult.value += `\n-> Insertion réussie : ${JSON.stringify(resDb.result)}`;
            } else {
                dispResult.value += `\n-> Erreur insertion : ${resDb.message}`;
            }
        } catch (err) {
            console.error('Erreur lors de l\'insertion dans la base de données:', err);
            dispResult.value += `\n-> Erreur insertion : ${err.message}`;
        }
    }   
    
    async dbTable() {
        const dispResult = this.querySelector('#disp-result');
        const queryText = 'SELECT * FROM Site ORDER BY S_Nom'
        try {
            const params = {
                invoketype: 'db:query',
                args: { sqlquery: queryText }
            };
            const resDb = await window.electronAPI.invoke(params);
            if (resDb.success) {
                resDb.result.forEach((row, idx) => {
                    // console.log(`Résultat ${idx + 1}:`, row.V_Date, row.V_Duree);
                    dispResult.value += `\n${JSON.stringify(row)}`;
                });
                this.displayTable(resDb.result); // Réinitialise la table DataTable
            } else {
                dispResult.value += `\n-> Erreur requête : ${resDb.message}`;
            }
        } catch (err) {
            console.error('Erreur lors de l\'exécution de la requête:', err);
            dispResult.value += `\n-> Erreur exécution : ${err.message}`;
        }
    }

}
customElements.define('db-page', DbPage);