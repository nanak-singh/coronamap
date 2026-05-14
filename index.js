async function getUsers() {
    let response = await fetch('https://disease.sh/v3/covid-19/countries?sort=cases');
    if (!response.ok) {
        throw new Error('API returned status ' + response.status);
    }
    let data = await response.json();
    console.log(data);
    return data;
}

getUsers().then(data => {
    try {
        data.forEach(item => {
            console.log(item.country, item.countryInfo.long, item.countryInfo.lat);
            let latitude = item.countryInfo.lat;
            let longitude = item.countryInfo.long;

            let cases = item.casesPerOneMillion;
            let x = cases > 0 ? item.testsPerOneMillion / cases : 0;
            let color;
            if (x > 25) {
                color = "rgb(255, 0, 0)";
            } else {
                color = "rgb(" + Math.min(Math.round(x * 20), 255) + ", " + Math.min(Math.round(x * 20), 255) + ", 0)";
            }

            // Mark on the map
            new mapboxgl.Marker({
                draggable: false,
                color: color
            }).setLngLat([longitude, latitude])
                .addTo(map);
        });

        pendo.track('covid_data_loaded', { countriesCount: data.length });
    } catch (err) {
        console.error('Error rendering markers:', err);
        var overlay = document.getElementById('error-overlay');
        if (overlay) {
            overlay.textContent = 'Unable to display COVID-19 data. Please try again later.';
            overlay.style.display = 'block';
        }
    }
}).catch(err => {
    console.error('Error fetching COVID-19 data:', err);
    var overlay = document.getElementById('error-overlay');
    if (overlay) {
        overlay.textContent = 'Unable to load COVID-19 data. Please try again later.';
        overlay.style.display = 'block';
    }
});
