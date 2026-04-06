var fetchStartTime;
var apiEndpoint = 'https://corona.lmao.ninja/v2/countries?sort=cases';

async function getUsers() {
    fetchStartTime = Date.now();
    let response = await fetch(apiEndpoint);
    let data = await response.json()
    console.log(data);
    return data;
}

getUsers().then(data => {
    var hasErrors = false;
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
    })

    // Track successful COVID data load and map marker rendering
    if (typeof pendo !== 'undefined') {
        pendo.track("covid_data_loaded", {
            countriesCount: data.length,
            fetchDurationMs: Date.now() - fetchStartTime,
            apiEndpoint: apiEndpoint,
            hasErrors: hasErrors
        });
    }

}).catch(function(err) {
    // Track failed data load
    if (typeof pendo !== 'undefined') {
        pendo.track("covid_data_loaded", {
            countriesCount: 0,
            fetchDurationMs: Date.now() - fetchStartTime,
            apiEndpoint: apiEndpoint,
            hasErrors: true
        });
    }
});