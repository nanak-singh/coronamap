// Status code of the COVID data response, sent with covid_map_data_load_failed.
// Stays undefined if no response arrives (e.g. a network error).
let covidDataHttpStatus;

async function getUsers() {
    let response = await fetch('https://corona.lmao.ninja/v2/countries?sort=cases');
    covidDataHttpStatus = response.status;
    let data = await response.json()
    console.log(data);
    return data;
}

// Used to measure loadDurationMs for covid_map_data_loaded.
let covidDataLoadStartedAt = Date.now();

getUsers().then(data => {
    let highTestRatioCount = 0;

    data.forEach(item => {
        console.log(item.country, item.countryInfo.long, item.countryInfo.lat)
        let latitude = item.countryInfo.lat;
        let longitude = item.countryInfo.long;

        let cases = item.casesPerOneMillion;
        let x = item.testsPerOneMillion/cases;
        if (item.testsPerOneMillion/cases > 25) {
            color = "rgb(255, 0, 0)";
            highTestRatioCount++;
        }

        else {
            color = `rgb(${x*20}, ${x*20}, 0)`;
        }

        // Mark on the map
        new mapboxgl.Marker({
            draggable: false,
            color: color
        }).setLngLat([longitude, latitude])
            .addTo(map);
    })

    // Pendo Track Event: every country has a marker, so the COVID map is filled in.
    pendo.track('covid_map_data_loaded', {
        countryCount: data.length,
        highTestRatioCount: highTestRatioCount,
        loadDurationMs: Date.now() - covidDataLoadStartedAt
    });
}).catch(error => {
    console.error('Failed to load COVID map data:', error);

    // Pendo Track Event: the COVID data could not be fetched, parsed or plotted.
    pendo.track('covid_map_data_load_failed', {
        // Truncated to keep the event under Pendo's property size limit.
        errorMessage: String(error.message || error).slice(0, 200),
        httpStatus: covidDataHttpStatus,
        dataSource: 'corona.lmao.ninja/v2/countries'
    });
});