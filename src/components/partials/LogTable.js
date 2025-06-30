import DataTable from 'datatables.net-bs5';
import 'datatables.net-bs5/css/dataTables.bootstrap5.min.css';
import 'datatables.net-select-bs5';
import 'datatables.net-select-bs5/css/select.bootstrap5.min.css';

class LogTable extends HTMLElement {

    constructor() {
        super();
        this.dataTableInstance = null; // Ajout pour stocker l'instance DataTable
        this.i18n = {} // Pour stocker les messages
    }

    async connectedCallback() {
        await this.langRequest();
        this.render();
        // this.querySelector('#show-marker-btn').addEventListener('click', () => {
        //     this.dispatchEvent(new CustomEvent('show-marker', {
        //         bubbles: true, // Permet à l'événement de remonter dans le DOM
        //         detail: { markerId: 1, coord : [46.2044, 6.1432], msg : '<b>Yes...</b><br>Genève' } // Vous pouvez passer des infos ici
        //     }));
        // });
        this.dbOpen(); // Ouverture de la base de données    
        this.setupEventListeners();
    }

  render() {
    this.innerHTML = `
                <div class="sidebar">
                    <table id="table_id" class="table table-striped table-bordered">
                        <tbody>
                        </tbody>
                    </table>
                </div>            
    `;
  }

    async langRequest() {
      this.i18n = await window.electronAPI.langmsg();
      console.log('Overview -> '+this.i18n['Overview'])
    }

    setupEventListeners() {
      document.addEventListener('com-updated', this.handleComUpdated);        
      document.addEventListener('glider-updated', this.handleGliderUpdated);   
      document.addEventListener('site-updated', this.handleSiteUpdated); 
    }

    async dbOpen() {
      let dbPath = '../../assets/test.db';
      dbPath = new URL(dbPath, import.meta.url).pathname; // Convertit le chemin relatif en absolu
      try {
          const result = await window.electronAPI.dbOpen(dbPath);
          if (result.success) {
              console.log(`-> ${result.message}`);  
              this.dbTable();
          } else {
              console.error(`\n-> ${result.message}`);
          }
      } catch (err) {
          console.error('Erreur lors de l\'ouverture de la base de données:', err);
      }        
    } 

    handleComUpdated = async (event) => {
        const { V_ID, V_Commentaire } = event.detail;
        console.log('row-updated : ' + V_ID + ' ' + V_Commentaire);
        // Met à jour la base de données via IPC
        const params = {
            invoketype: 'db:update',
            args: {
                sqltable: 'Vol',
                sqlparams: {
                    V_Commentaire: V_Commentaire
                },
                sqlwhere: {
                    V_ID: V_ID
                }
            }
        };
        const result = await window.electronAPI.invoke(params);
        if (result.success) {
            // Recharge la table
            this.dbTable();
        } else {
            console.error('Erreur lors de la mise à jour :', result.message);
        }
    }    

    handleGliderUpdated = async (event) => {
      const { V_Engin } = event.detail;
      let rows = this.dataTableInstance.rows('.selected');
      const selectedRowsData = rows.data().toArray();
      console.log('multi-updated : ' + V_Engin + ' ' + selectedRowsData.length + ' lignes à modifier');

      for (const rowData of selectedRowsData) {
          try {
              const flightId = rowData.V_ID;
              const params = {
                  invoketype: 'db:update',
                  args: {
                      sqltable: 'Vol',
                      sqlparams: {
                          V_Engin: V_Engin
                      },
                      sqlwhere: {
                          V_ID: flightId
                      }
                  }
              };
              const result = await window.electronAPI.invoke(params);
              if (result.success) {
                  // Met à jour la cellule dans la table affichée
                  const rowIdx = this.dataTableInstance.row(function(idx, data) {
                      return data.V_ID === flightId;
                  }).index();
                  if (rowIdx !== undefined) {
                      this.dataTableInstance.cell({row: rowIdx, column: 6}).data(V_Engin);
                  }
              } else {
                  console.error('Erreur lors de la mise à jour :', result.message);
              }
          } catch (error) {
              console.error('Error during flight update ' + error);
          }
      }
    }       

    handleSiteUpdated = async (event) => {
      const siteUpdate = event.detail;
      let rows = this.dataTableInstance.rows('.selected');
      const selectedRowsData = rows.data().toArray();
      console.log('multi-updated : ' + siteUpdate.V_Site + ' ' + selectedRowsData.length + ' lignes à modifier');
      let args =  {
                    sqltable: 'Vol',
                    sqlparams: null,
                    sqlwhere: {
                        V_ID: flightId
                    }
                  }
      if (siteUpdate.V_LatDeco == null && siteUpdate.V_LongDeco == null) {
                sqlparams: {
                          V_Engin: V_Engin
                      },
      }
      for (const rowData of selectedRowsData) {
          try {
              const flightId = rowData.V_ID;
              const params = {
                  invoketype: 'db:update',
                  args: {
                      sqltable: 'Vol',
                      sqlparams: {
                          V_Engin: V_Engin
                      },
                      sqlwhere: {
                          V_ID: flightId
                      }
                  }
              };
              const result = await window.electronAPI.invoke(params);
              if (result.success) {
                  // Met à jour la cellule dans la table affichée
                  const rowIdx = this.dataTableInstance.row(function(idx, data) {
                      return data.V_ID === flightId;
                  }).index();
                  if (rowIdx !== undefined) {
                      this.dataTableInstance.cell({row: rowIdx, column: 6}).data(V_Engin);
                  }
              } else {
                  console.error('Erreur lors de la mise à jour :', result.message);
              }
          } catch (error) {
              console.error('Error during flight update ' + error);
          }
      }
    }           

    async dbTable() {
        let reqSQL = 'SELECT V_ID, strftime(\'%d-%m-%Y\',V_date) AS Day, strftime(\'%H:%M\',V_date) AS Hour, replace(V_sDuree,\'mn\',\'\') AS Duree, V_Site, V_Engin, V_Commentaire, V_Duree, V_Tag,'
        reqSQL += 'CASE WHEN (V_Photos IS NOT NULL AND V_Photos !=\'\') THEN \'Yes\' END Photo '  
        reqSQL += 'FROM Vol ORDER BY V_Date DESC'
        try {
            const params = {
                invoketype: 'db:query',
                args: { sqlquery: reqSQL }
            };
            const resDb = await window.electronAPI.invoke(params);
            if (resDb.success) {
                // Debugging
                // resDb.result.forEach((row, idx) => {
                //     console.log(`Résultat ${idx + 1}:`, row.Day, row.Duree);
                // });
                this.displayTable(resDb.result); // Réinitialise la table DataTable
            } else {
                console.error(`\n-> Erreur requête : ${resDb.message}`);
            }
        } catch (err) {
            console.error('Erreur lors de l\'exécution de la requête:', err);
        }
    }

    displayTable(dbFlights) {
        console.log('Initialisation de la table DataTable');
        const table = this.querySelector('#table_id');
        // Détruire l'ancienne instance DataTable si elle existe (ES6)
        if (this.dataTableInstance) {
            this.dataTableInstance.destroy();
            this.dataTableInstance = null;
        }
        // Définir les options de la table
        const tableLines = 8
        const dataTableOptions = {
          data: dbFlights, 
          autoWidth : false,
          columns: [
              {
                title : '',
                data: 'Photo',
                render: function(data, type, row) {
                  if (data == 'Yes') {
                    return '<img src="../main_window/static/images/Camera.png" alt="" width="12px" height="12px">&nbsp;<span></img>'
                  } 
                  return data
                },          
                className: "dt-body-center text-center"
              },  
              {
                title : '',
                data: 'V_Tag',
                render: function(data, type, row) {
                  switch (data) {
                    case 1 :
                      return '<img src="../main_window/static/images/tag_red.png" alt="" width="10px" height="10px"></img>'
                      break;
                    case 2 :
                      return '<img src="../main_window/static/images/tag_orange.png" alt="" width="10px" height="10px"></img>'
                      break;      
                    case 3 :
                      return '<img src="../main_window/static/images/tag_gold.png" alt="" width="10px" height="10px"></img>'
                      break;
                    case 4 :
                      return '<img src="../main_window/static/images/tag_lime.png" alt="" width="10px" height="10px"></img>'
                      break;      
                    case 5 :
                      return '<img src="../main_window/static/images/tag_blue.png" alt="" width="10px" height="10px"></img>'
                      break;                                                             
                  }
                  return data
                },          
                className: "dt-body-center text-center"
              },                     
              { title : this.gettext('Date'), data: 'Day' },
            // { title : i18n.gettext('Time').substring(0,3), data: 'Hour' },
              { title : '', data: 'Hour' },
              { title : this.gettext('Duration').substring(0,3), data: 'Duree' },
              { title : 'Site', data: 'V_Site' },
              { title : this.gettext('Glider'), data: 'V_Engin' },     
              { title : 'Comment', data: 'V_Commentaire' },  
              { title : 'Id', data: 'V_ID' },
              { title : 'Seconds', data: 'V_Duree' }  
          ],      
          columnDefs : [
              { "width": "4%", "targets": 0, "bSortable": false },
              { "width": "2%", "targets": 1, "bSortable": false },
              // { "width": "14%", "targets": 1, "orderData": [ [ 1, 'asc' ], [ 2, 'desc' ] ] },
              // { "width": "6%", "targets": 2, "orderData": [[ 1, 'asc' ],[ 2, 'desc' ] ] },
              // { "width": "14%", "targets": 1, "orderData": [ 1, 2 ] },
              // { "width": "6%", "targets": 2, "orderData": 1 },
              // { "width": "14%", "targets": 1, "bSortable": false},
              // { "width": "6%", "targets": 2, "bSortable": false },
              { "width": "17%", "targets": 2},
              { "width": "7%", "targets": 3 },
              { "width": "8%", "targets": 4 },    // Duree
              { "width": "30%", className: "text-nowrap", "targets": 5 },
              { "width": "24%", "targets": 6 },
              { "targets": 7, "visible": false, "searchable": false },     // On cache la colonne commentaire
              { "targets": 8, "visible": false, "searchable": false },     // On cache la première colonne, celle de l'ID
              { "targets": 9, "visible": false, "searchable": false },     // On cache la colonne de la durée en secondes
          ],      
          bInfo : false,          // hide "Showing 1 to ...  row selected"
          lengthChange : false,   // hide "show x lines"  end user's ability to change the paging display length 
          //searching : false,      // hide search abilities in table
          ordering: false,        // Sinon la table est triée et écrase le tri sql
          pageLength: tableLines,         // ce sera à calculer avec la hauteur de la fenêtre
          pagingType : 'full',
          dom: 'lrtip',
          language: {             // cf https://datatables.net/examples/advanced_init/language_file.html
              paginate: {
              first: '<<',
              last: '>>',
              next: '>', // or '→'
              previous: '<' // or '←' 
              }
          },     
          select: true,            // Activation du plugin select
          // Line coloring if there is a comment. 
          'createdRow': function( row, data, dataIndex ) {
            if( data['V_Commentaire'] != null && data['V_Commentaire'] !=''){
              console.log('Color : '+data['V_Commentaire'])
              //  old code -> $(row).addClass('table-warning') 
              row.classList.add('table-warning');          
            }
          },
        }

        // Créer la nouvelle instance DataTable
        this.dataTableInstance = new DataTable(table, dataTableOptions);
        this.dataTableInstance.on('select', (e, dt, type, indexes) => {
            if (type === 'row') {
                const rowData = dt.row(indexes).data();
                const rowIndex = indexes
                this.dispatchEvent(new CustomEvent('row-selected', {
                    detail: { rowIndex, rowData },
                    bubbles: true, // pour permettre la remontée dans le DOM
                    composed: true // pour traverser le shadow DOM si besoin
                }));

                // // Affiche la date dans la modale
                // this.querySelector('#flight-date').textContent = `Date du vol : ${rowData.Day}`;
                // // Affiche la modale Bootstrap
                // const modal = new Modal(this.querySelector('#flightModal'));
                // modal.show();

                // // Gestion du bouton Valider
                // this.querySelector('#validate-btn').onclick = () => {
                //     const comment = this.querySelector('#flight-comment').value;
                //     console.log('Commentaire saisi :', comment);
                //     // Tu peux ensuite traiter ou sauvegarder ce commentaire ici
                //     modal.hide();
                // };
            }
        });
        this.dataTableInstance.row(':eq(0)').select()    // Sélectionne la première lmigne

    }    

    gettext(key) {
      return this.i18n[key] || key;
    }
}
customElements.define('log-table', LogTable);