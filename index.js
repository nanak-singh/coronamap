async function getUsers() {
    let response = await fetch('https://corona.lmao.ninja/v2/countries?sort=cases');
    if (!response.ok) {
        let err = new Error('API request failed');
        err.httpStatus = response.status;
        throw err;
    }
    let data = await response.json()
    console.log(data);
    return data;
}

getUsers().then(data => {
    let highRiskCount = 0;

    data.forEach(item => {
        console.log(item.country, item.countryInfo.long, item.countryInfo.lat)
        let latitude = item.countryInfo.lat;
        let longitude = item.countryInfo.long;

        let cases = item.casesPerOneMillion;
        let x = item.testsPerOneMillion/cases;
        if (item.testsPerOneMillion/cases > 25) {
            color = "rgb(255, 0, 0)";
            highRiskCount++;
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

    pendo.track("corona_data_loaded", {
        country_count: data.length,
        high_risk_country_count: highRiskCount
    });

}).catch(function(err) {
    pendo.track("corona_data_fetch_failed", {
        error_message: (err.message || "unknown").substring(0, 100),
        http_status: err.httpStatus || 0
    });
});