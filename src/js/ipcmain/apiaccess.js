const {ipcMain} = require('electron')

let db = null;

ipcMain.handle('api:pgearth', async (event, pgurl) => {
    return await callPgearthAPI(pgurl);
});

async function callPgearthAPI(pgurl) {
    let result = { success: false };
    try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 5000); // 5s timeout
        const response = await fetch(pgurl, { signal: controller.signal });
        clearTimeout(timeout);
        if (!response.ok) throw new Error('Erreur API : ' + response.status);        
        const json = await response.json();
        if (
            json &&
            json.features &&
            Array.isArray(json.features) &&
            json.features.length > 0
        ) {
            const feature = json.features[0];
            const props = feature.properties || {};
            const coords = feature.geometry?.coordinates || [];

            if (props.place === "paragliding takeoff") {
                result = {
                    success: true,
                    name: props.name,
                    place: props.place,
                    distance: props.distance,
                    countryCode: props.countryCode,
                    takeoff_altitude: props.takeoff_altitude,
                    takeoff_description: props.takeoff_description,
                    coordinates: coords
                };
                console.log('Paragliding takeoff site found:', result.name);
            } else {
                result = {
                    success: false,
                    message: 'Le site trouvé n\'est pas un décollage parapente.'
                };
            }
        } else {
            result = {
                success: false,
                message: 'Aucun site trouvé dans la réponse.'
            };
        }
    } catch (error) {
        console.error('Erreur fetch:', error);
        result = {
            success: false,
            message: error.message
        };
    }
    return result;
}