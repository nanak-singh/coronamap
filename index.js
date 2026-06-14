async function getUsers() {
    let response = await fetch('https://disease.sh/v3/covid-19/countries?sort=cases');
    if (!response.ok) throw new Error('API returned ' + response.status);
    let data = await response.json()
    console.log(data);
    return data;
}

getUsers().then(data => {
    data.forEach(item => {
        console.log(item.country, item.countryInfo.long, item.countryInfo.lat)
        let latitude = item.countryInfo.lat;
        let longitude = item.countryInfo.long;

        let cases = item.casesPerOneMillion;
        let x = item.testsPerOneMillion/cases;
        let color;
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

    pendo.track('covid_data_loaded', { countriesCount: data.length });
}).catch(error => {
    document.getElementById('map').innerHTML = '<div style="color:white;text-align:center;padding-top:45vh;">Unable to load COVID-19 data. Please try again later.</div>';
    pendo.track('covid_data_load_failed', { errorMessage: error.message, errorType: error.name });
});