import DataTable from 'datatables.net-bs5';
import 'datatables.net-bs5/css/dataTables.bootstrap5.min.css';
const trigo = require('../../../js/geo/trigo.js'); 

class ImpTable extends HTMLElement {

    constructor() {
        super();
        this.dataTableInstance = null; // Ajout pour stocker l'instance DataTable
        this.i18n = {} // Pour stocker les messages
    }

    async connectedCallback() {
        await this.langRequest();
        this.render();
        this.setupEventListeners();
    }

  render() {
    this.innerHTML = /*html */`  
                <style>
                  .importred, .importred td {
                    background-color: #FFA07A !important;
                  }
                  .importgreen, .importgreen td {
                    background-color: #5F9EA0  !important;
                  }
                </style>
                <div class="alert alert-info d-none" id='importmenu' role="alert" style="margin-top: 10px">
                    Display import options
                </div>
                <div id="accordionDiv"> 
                  <div id="div_table" style="display:none">

                    <div id="table-content">
                      <!-- Cette table servira à TOUS les imports : disk, usb et serie -->
                      <table id="tableimp" class="table table-striped table-bordered d-none" style="width:100%;">
                        <tbody></tbody>
                      </table>
                    </div>
                  </div>
                </div>     
    `;
    }



    async langRequest() {
      this.i18n = await window.electronAPI.langmsg();
      console.log('Overview -> '+this.i18n['Overview'])
    }

    setupEventListeners() {
        document.querySelector('imp-page').addEventListener('flights-import', (event) => {
            const importData = event.detail.importData;
            this.showImportMenu(importData);
            this.displayTable(importData.flights);
        });        
    //   document.addEventListener('com-updated', this.handleComUpdated);        
    //   document.addEventListener('glider-updated', this.handleGliderUpdated);   
    //   document.addEventListener('site-updated', this.handleSiteUpdated); 
    }

    async showImportMenu(importData) {
        // Calcule le nom de vol à importer  toInsert = true
        let totInsert = 0;
        for (const flight of importData.flights) {
            if (flight.toInsert == true) totInsert++;
        }
        let uncheckedButton = '<button type="button" class="btn btn-outline-success mr-4" style="margin-right: 10px" id="bt-unselect">'+this.gettext('Unselect')+'</button>'
        let statusData = `${importData.typeGps} : ${importData.flights.length} ${this.gettext('tracks decoded')}`
        statusData += '&nbsp;&nbsp;<strong>[&nbsp;'+this.gettext('Tracks to be added')+'&nbsp;:&nbsp;'
        statusData += `<span id="tracksToBeAdded">${totInsert}</span>`
        statusData += '&nbsp;]</strong>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;'
        let updateButton = '<button type="button" class="btn btn-danger btn-xs mr-2" id="bt-update">'+this.gettext('Logbook update')+'</button>'
        const menuElement = this.querySelector('#importmenu');
        menuElement.innerHTML = uncheckedButton+statusData+updateButton;
        menuElement.classList.remove('d-none');
        // Ajoute l'écouteur JS natif
        const unselectBtn = this.querySelector('#bt-unselect');
        if (unselectBtn) {
            unselectBtn.addEventListener('click', () => {
                this.uncheckTable();
            });
        }
        const updateBtn = this.querySelector('#bt-update');
        if (updateBtn) {
            updateBtn.addEventListener('click', () => this.updateLogbook());
        }
    }
 
    displayTable(flights) {
      const divTable = this.querySelector('#div_table');
      if (divTable) divTable.style.display = '';
      const table = this.querySelector('#tableimp');
      // Détruire l'ancienne instance DataTable si elle existe (ES6)
      if (this.dataTableInstance) {
          this.dataTableInstance.destroy();
          this.dataTableInstance = null;
      }
      //   this.attachCheckClic()
      //  currTypeGps = 'disk'. A voir si necessaire fait la difféfrence avec GPSDump dans L6
      let colorRed
      const dataTableOptions = {
        // width format see this http://live.datatables.net/zurecuzi/1/edit
        autoWidth: false,
        data: flights, 
        columns: [  
          {
            // display boolean as checkbox -> http://live.datatables.net/kovegexo/1/edit
            title : this.gettext('Logbook'),
            data: 'toInsert',
            width: '5%',
            render: function(data, type, row) {
              if (data === true && row.newflight === true) {
                return '<input type="checkbox" name="chkbx" class="editor-active" checked >';
              } else if (data === false && row.newflight === true) {
                return '<input type="checkbox" name="chkbx" class="editor-active">';
              } else {
                return '<img class="importgreen" src="../main_window/static/images/in_logbook.png" alt=""></img>';
              }
              return data;
            },
            className: "dt-body-center text-center"
          },      
          { 
            title : this.gettext('Date'), 
            data: 'date', width: '10%',
          },
          { title : this.gettext('Time'), data: 'startTime', width: '8%'},
          { title : this.gettext('File name') , data: 'file'},
          { title : this.gettext('Pilot name') , data: 'pilot'},        
          { title : this.gettext('Path') , data: 'path'},
          { title : this.gettext('New flight') , data: 'newflight'},
        {
          title : '',
          data: 'toInsert',
          width: '8%',
          render: function(data, type, row) {
            // action on the click is described below
            return '<button type="button" class="btn btn-outline-secondary btn-sm">'+
            'Map'+'</button>';
          },
          className: "dt-body-center text-center"
        },         
      ],       
      columnDefs : [
        { "targets": [ 5 ], "visible": false, "searchable": false}, // cache la colonne path
      ],         
      // change color according cell value -> http://live.datatables.net/tohehohe/1/edit
      'createdRow': function( row, data, dataIndex ) {
        if ( data['newflight'] === true ) {               
          row.classList.add('importred');
        } else {
          row.classList.add('importgreen');
        }
      },  
      destroy: true,
      bInfo : false,          // hide "Showing 1 to ...  row selected"
      lengthChange : false,   // hide "show x lines"  end user's ability to change the paging display length 
      searching : false,      // hide search abilities in table
      ordering: false,        // Sinon la table est triée et écrase le tri sql
      pageLength: 12,         // ce sera à calculer avec la hauteur de la fenêtre
      pagingType : 'full',
      language: {             // cf https://datatables.net/examples/advanced_init/language_file.html
        paginate: {
          first: '<<',
          last: '>>',
          next: '>', // or '→'
          previous: '<' // or '←' 
        }
      },     
      select: true             // Activation du plugin select
      }
      this.dataTableInstance = new DataTable(table, dataTableOptions);
      table.addEventListener('click', (event) => {
        const target = event.target;
        if (
            target.tagName === 'INPUT' &&
            target.type === 'checkbox' &&
            target.name === 'chkbx'
        ) {
            const row = target.closest('tr');
            const rowIndex = Array.from(table.rows).indexOf(row);

            // Récupère les données de la ligne via DataTable
            const dtRow = this.dataTableInstance.row(row).data();

            // Met à jour la propriété toInsert selon l'état de la checkbox
            dtRow.toInsert = target.checked;
            this.updateInsertCountStatus();
            // Récupère les données de la ligne (selon ta logique DataTable)
            // Exemple si tu utilises DataTable :
            // let dtRow = this.dataTableInstance.row(row).data();
            // console.log('rowindex', rowIndex);
            // const igcString = dtRow.igcFile;
            // displayOneFlight(igcString, 9999);

            // Si tu utilises un tableau flights :
            // const igcString = flights[rowIndex].igcFile;
            // displayOneFlight(igcString, 9999);

            // Adapte selon ta structure de données
        }
      });
      // $("#tableimp").on("click", "td input[type=checkbox]", function () {
      //   let isChecked = this.checked;
      //   // set the data item associated with the row to match the checkbox
      //   let dtRow = table.rows($(this).closest("tr"));
      //   dtRow.data()[0].forImport = isChecked;
      // })
    // example from https://datatables.net/examples/ajax/null_data_source.html
    // code bouton carte
    // $('#tableimp').on( 'click', 'button', function () {
    //   //$('#tableimp').off( 'click' )
    //   let dtRow = table.row( $(this).parents('tr') ).data();
    //   let rowIndex = table.row( $(this).parents('tr') ).index()
    //   // alert( 'Index '+rowIndex+'   '+dtRow['date']+"' ' "+dtRow['path']);
    //   // code original
    //   // displayOneFlight(dtRow['path'], 9999)
    //   console.log('rowindex '+rowIndex)
    // // console.log({dtRow})
    //   // nouveau code
    // // const igcString = igcForImport[rowIndex].igcFile    
    //   const igcString = dtRow.igcFile  
    //   displayOneFlight(igcString, 9999)
    // } );     
      table.classList.remove('d-none');     
    }    

  uncheckTable() {
    // Parcourt toutes les données, toutes pages confondues
    this.dataTableInstance.rows().every(function(rowIdx, tableLoop, rowLoop) {
      // Met à jour la propriété toInsert dans les données
      const rowData = this.data();
      if (rowData && rowData.toInsert === true) {
        rowData.toInsert = false;
      }
      // Si la ligne est affichée, décoche la case
      const rowNode = this.node();
      if (rowNode) {
        const checkbox = rowNode.querySelector('input[type="checkbox"][name="chkbx"]');
        if (checkbox) {
          checkbox.checked = false;
        }
      }
    });
    this.updateInsertCountStatus();
  }

  updateInsertCountStatus() {
    let count = 0;
    this.dataTableInstance.rows().data().toArray().forEach(row => {
      if (row.toInsert === true) {
        count++;
      }
    });
    const tracksSpan = this.querySelector('#tracksToBeAdded');
    if (tracksSpan) {
      tracksSpan.textContent = count; 
    }
    const updateBtn = this.querySelector('#bt-update');
    if (updateBtn) {
      if (count === 0) {
        updateBtn.disabled = true;
      } else {
        updateBtn.disabled = false;
      } 
    }
  }

  async updateLogbook() {
      // Affiche un symbole d'attente
      const updateBtn = this.querySelector('#bt-update');
      if (updateBtn) {
        updateBtn.disabled = true;
        updateBtn.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> ' + this.gettext('Logbook update');
      }    
      // Ouvre la base de données et attends le retour
      const dbResult = await this.dbOpen();
      if (!dbResult || !dbResult.success) {
        this.displayStatus(this.gettext('Database connection failed') + ' : ' + dbResult.message, 'error');
        if (updateBtn) {
          updateBtn.disabled = false;
          updateBtn.innerHTML = this.gettext('Logbook update');
        }
        return;
      }
      let data = [];
      let nbToInsert = 0;
      this.dataTableInstance.rows().data().toArray().forEach(row => {
        if (row.toInsert === true) {
          data.push(row);
          nbToInsert++;
        }
      });
      let nbInserted = 0;
      // Boucle asynchrone séquentielle
      for (const element of data) {
        try {
          const result = await this.dbAddflight(element);
          if (result.success) {
            nbInserted++;            
          } else {
            // A archiver dans le journal de log
            console.log('Error adding flight: ' + result.message);
          }
        } catch (error) {
          // A archiver dans le journal de log
          console.log('Error adding flight: ' + error.message);
        }
      }
      // Réactive le bouton et remet le texte
      if (updateBtn) {
        updateBtn.disabled = false;
        updateBtn.innerHTML = this.gettext('Logbook update');
      }
      // On fera un alert et un retour au carnet comme dans L6
      this.displayStatus(nbInserted+' / '+nbToInsert+' '+this.gettext('flights inserted'), 'success');
      const divTable = this.querySelector('#div_table');
      if (divTable) divTable.style.display = 'none';
    }

    /* ******** Database functions ******** */
    async dbOpen() {
      let dbPath = '../../../assets/test.db';
      dbPath = new URL(dbPath, import.meta.url).pathname; // Convertit le chemin relatif en absolu
      try {
          const result = await window.electronAPI.dbOpen(dbPath);
          if (result.success) {
              console.log(`${dbPath} -> ${result.message}`);
          } else {
              console.error(`\n-> ${result.message}`);
          }
          return result;
      } catch (err) {
          console.error('Erreur lors de l\'ouverture de la base de données:', err);
      }      
    } 

    async dbAddflight(flightData) {      
        // Mise en forme des champs requis pour l'insertion
        const pDate = `${flightData.date} ${flightData.startTime}`;  // INSERT INTO Vol (V_Date
        const pDuree = flightData.duration;  //V_Duree
        let totalSeconds = flightData.duration
        let hours = Math.floor(totalSeconds / 3600)
        totalSeconds %= 3600
        let minutes = Math.floor(totalSeconds / 60)
        const pSduree = String(hours).padStart(2, "0")+'h'+String(minutes).padStart(2, "0")+'mn' // V_sDuree
        const pLatDeco = flightData.latitude;  // V_LatDeco 
        const pLongDeco = flightData.longitude;  // V_LongDeco
        const pAltDeco = flightData.altitude;  // V_AltDeco
        const pUTC = flightData.offsetUTC;  // UTC
        const pEngin = flightData.glider;   // V_Engin 
        // Lecture du fichier IGC via IPC, 
        // pas d'accès direct au fichier dans le renderer process
        // pour insertion dans V_IGC 
        let pIGC = null; 
        let pSite = null
        let pPays = null     
        try {
            pIGC = await window.electronAPI.readFile({ filePath: flightData.path });
            if (pIGC) {
              // recherche du site de décollage       
              let searchSite = await this.searchSiteInDb(pLatDeco, pLongDeco);
              if (searchSite != null || searchSite != '') {
                  let fullSite = searchSite.split('*')
                  if (fullSite.length > 0) {
                      pSite = fullSite[0]
                      pPays = fullSite[1]
                  } else {
                      pSite = fullSite
                      pPays = '***'
                  }
              }    
              // Préparartion des paramètres pour l'insertion         
              const sqltable = 'Vol';
              const sqlparams = {
                    V_Date: pDate,
                    V_Duree: pDuree,
                    V_sDuree: pSduree,
                    V_LatDeco: pLatDeco,
                    V_LongDeco: pLongDeco,
                    V_AltDeco: pAltDeco,
                    V_Site: pSite,
                    V_Pays: pPays,
                    V_IGC: pIGC,
                    UTC: pUTC,
                    V_Engin: pEngin
              }
              console.log(`${sqlparams.V_Date} ${sqlparams.V_sDuree} ${sqlparams.V_LatDeco} ${sqlparams.V_AltDeco} ${sqlparams.UTC} ${sqlparams.V_Engin} ${sqlparams.V_Site} ${sqlparams.V_Pays}`);
              const params = {
                invoketype: 'db:insert',
                args: { sqltable, sqlparams }
              };
              const result = await window.electronAPI.invoke(params);
              if (result.success) {
                // // Met à jour l'état d'insertion
                // flightData.toInsert = false;
                // // Met à jour la classe CSS de la ligne dans la DataTable
                // const rowIdx = this.dataTableInstance.rows().indexes().toArray().find(idx => {
                //   return this.dataTableInstance.row(idx).data() === flightData;
                // });
                // if (rowIdx !== undefined) {
                //   const rowNode = this.dataTableInstance.row(rowIdx).node();
                //   if (rowNode) {
                //     rowNode.classList.remove('importred');
                //     rowNode.classList.add('importgreen');
                //     // // Remplace la checkbox par l'image dans la première cellule
                //     const firstCell = rowNode.querySelector('td');
                //     if (firstCell) {
                //       firstCell.innerHTML = '<img class="importgreen" src="../main_window/static/images/in_logbook.png" alt=""></img>';
                //     }                    
                //   }
                // }
                // // Met à jour le compteur
                // this.updateInsertCountStatus();                
                return { success: true, message: 'Flight added successfully' };
              } else {
                  return { success: false, message: result.message };
              }
            }
        } catch (err) {
            pIGC = null;
            const errMsg = this.gettext('Error reading IGC file') + ': ' + err.message;
            return { success: false, message: errMsg };
        }
    }

  async searchSiteInDb(pLat, pLong) {
      // in Logfly 5, distance mini is stored in settings but we never changed the value of 300 m
      let distMini = 300;            
      /*
      * NOTE : under our latitudes, second decimal give a search perimeter of 1,11km. 
      * third decimal, perimeter is 222 meters ...      
      */
      const arrLat = Math.ceil(pLat*1000)/1000;
      const arrLong = Math.ceil(pLong*1000)/1000;
      const sLatMin = (arrLat - 0.01).toFixed(4).toString();
      const sLatMax = (arrLat + 0.01).toFixed(4).toString();
      const sLongMin = (arrLong - 0.01).toFixed(4).toString();
      const sLongMax = (arrLong + 0.01).toFixed(4).toString();
      // In old versions, search is limited to launching sites, but this information can be absent
      // landing sites are excluded
      let selectedSite = null
      try {
          const reqSQL = `SELECT S_ID,S_Nom,S_Latitude,S_Longitude,S_Alti,S_Localite,S_Pays FROM Site WHERE S_Latitude >'${sLatMin}' AND S_Latitude < '${sLatMax}' AND S_Longitude > '${sLongMin}' AND S_Longitude < '${sLongMax}' AND S_Type <> 'A' ` 
          const params = {
              invoketype: 'db:query',
              args: { sqlquery: reqSQL }
          };
          const surroundingSites = await window.electronAPI.invoke(params);
          if (surroundingSites.success) {
            for (const site of surroundingSites.result) {
              let carnetLat = site.S_Latitude;
              let carnetLong = site.S_Longitude;
              let distSite = Math.abs(trigo.distance(pLat,pLong,carnetLat,carnetLong, "K") * 1000)   
              if (distSite < distMini)  {
                distMini = distSite;
                selectedSite = site.S_Nom+'*'+site.S_Pays;  // since V3, we add the country
              }    
            }
          } else {
              console.error(`\n-> Erreur requête : ${surroundingSites.message}`);
          }
      } catch (err) {
          console.error('Erreur lors de l\'exécution de la requête:', err);
      }

      return selectedSite;
  }    

    /* ******** End of database functions ******** */

    displayStatus(message, typeMsg) {
        const statusElement = this.querySelector('#importmenu');
        let msg
        switch (typeMsg) {
          case 'error':
            msg = '<span class="badge bg-danger">' + message + '</span>';
            break;
          case 'success':
            msg = '<span class="badge bg-success">' + message + '</span>';
            break;
          default:
            break;
        }
        statusElement.innerHTML = msg;
        statusElement.classList.remove('d-none');
    }    

    gettext(key) {
      return this.i18n[key] || key;
     }
}
customElements.define('imp-table', ImpTable);