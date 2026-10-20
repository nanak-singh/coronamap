// Pendo Track Event: map_visualization_loaded reports whether the country
// dataset loaded and every marker was plotted ('success'), or whether the fetch
// or plotting failed ('failure'). The map draws itself on load, so there is no
// control a Pendo Feature could tag. Fires at most once per page load.
let mapVisualizationLoadTracked = false;

function trackMapVisualizationLoaded(properties) {
    if (mapVisualizationLoadTracked) return;
    mapVisualizationLoadTracked = true;

    if (window.pendo && typeof window.pendo.track === 'function') {
        window.pendo.track('map_visualization_loaded', Object.assign({
            // Milliseconds since the page started loading.
            loadDurationMs: Math.round(performance.now())
        }, properties));
    }
}

async function getUsers() {
    let response = await fetch('https://corona.lmao.ninja/v2/countries?sort=cases');
    let data = await response.json()
    console.log(data);
    return data;
}

getUsers().then(data => {
    let markerCount = 0;

    data.forEach(item => {
        console.log(item.country, item.countryInfo.long, item.countryInfo.lat)
        let latitude = item.countryInfo.lat;
        let longitude = item.countryInfo.long;

        let cases = item.casesPerOneMillion;
        let x = item.testsPerOneMillion/cases;
        if (item.testsPerOneMillion/cases > 25) {
            color = "rgb(255, 0, 0)";
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
        markerCount++;
    })

    trackMapVisualizationLoaded({
        outcome: 'success',
        countryCount: data.length,
        markerCount: markerCount
    });
}).catch(err => {
    // A failed request, an unparseable response, or a plotting error (e.g. the
    // data arriving before mapbox-gl.js has loaded and `map` exists).
    console.error(err);
    trackMapVisualizationLoaded({
        outcome: 'failure',
        errorMessage: String((err && err.message) || err).slice(0, 100)
    });
});