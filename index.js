async function getUsers() {
    var fetchStart = Date.now();
    try {
        let response = await fetch('https://corona.lmao.ninja/v2/countries?sort=cases');
        if (!response.ok) {
            pendo.track("covid_data_load_failed", {
                errorType: "http_error",
                errorMessage: "HTTP " + response.status + " " + response.statusText,
                httpStatusCode: response.status,
                apiUrl: "corona.lmao.ninja/v2/countries"
            });
            throw new Error("HTTP " + response.status);
        }
        let data = await response.json();
        console.log(data);
        data._fetchDurationMs = Date.now() - fetchStart;
        return data;
    } catch (err) {
        if (err.message && err.message.indexOf("HTTP ") !== 0) {
            pendo.track("covid_data_load_failed", {
                errorType: err.name || "network_error",
                errorMessage: (err.message || "Unknown error").substring(0, 100),
                apiUrl: "corona.lmao.ninja/v2/countries"
            });
        }
        throw err;
    }
}

getUsers().then(data => {
    var highTestingRatioCount = 0;
    var lowTestingRatioCount = 0;
    var topCountryByCases = "";
    var topCases = 0;

    data.forEach(item => {
        console.log(item.country, item.countryInfo.long, item.countryInfo.lat)
        let latitude = item.countryInfo.lat;
        let longitude = item.countryInfo.long;

        let cases = item.casesPerOneMillion;
        let x = item.testsPerOneMillion/cases;
        if (item.testsPerOneMillion/cases > 25) {
            color = "rgb(255, 0, 0)";
            highTestingRatioCount++;
        }

        else {
            color = `rgb(${x*20}, ${x*20}, 0)`;
            lowTestingRatioCount++;
        }

        if (item.cases > topCases) {
            topCases = item.cases;
            topCountryByCases = item.country;
        }

        // Mark on the map
        new mapboxgl.Marker({
            draggable: false,
            color: color
        }).setLngLat([longitude, latitude])
            .addTo(map);
    })

    pendo.track("covid_data_loaded", {
        countriesCount: data.length,
        fetchDurationMs: data._fetchDurationMs || 0,
        topCountryByCases: topCountryByCases,
        highTestingRatioCount: highTestingRatioCount,
        lowTestingRatioCount: lowTestingRatioCount
    });

}).catch(function(err) {
    console.error("Failed to load COVID data:", err);
});