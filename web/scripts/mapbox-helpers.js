export const getFeatures = async (dataset, token) => {
    const data = JSON.parse(dataset);
    let features = [];

    data.forEach((item) => {
        let search_string = encodeURIComponent(item.postalCode.toLowerCase());

        const fetchPromise = fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${search_string}.json?access_token=${token}`);

        fetchPromise
            .then(response => { return response.json() })
            .then(data => features.push(data.features[0]))
    })

    return new Promise((resolve, reject) => {
        setTimeout(() => {
            if(data.length === features.length) {
                resolve(features)
            } else {
                reject({data, features})
            }
        }, 500)
    })
}

export const createGeoJSON = (features) => {
    return new Promise((resolve, reject) => {
        if(features && features.length > 0) {
            resolve({
                "features": features,
                "type": "FeatureCollection"
            })
        } else {
            reject(features)
        }
    })
}

export const createMarkers = (geoJSON, map, img) => {
    return new Promise((reslove, reject) => {
        if(geoJSON.features.length > 0) {
            let result = [];

            geoJSON.features.forEach((marker) => {
                const el = document.createElement('div');
                el.className = 'c-map__marker';
                el.style.backgroundImage = `url(${img})`
                let temp = new mapboxgl.Marker(el)
                            .setLngLat(marker.geometry.coordinates)
                            .addTo(map)
                
                result.push(temp)
            });

            reslove(result)
        }
        else {
            reject({
                geoJSON, map, length: geoJSON.features.length
            })
        }
    })
};

export const hideMarkers = (className) => {
    let markers = document.getElementsByClassName(className);
    for (let i = 0; i < markers.length; i++) {
        markers[i].style.visibility = "hidden";
    }
}

export const showMarkers = (className) => {
    let markers = document.getElementsByClassName(className);
    for (let i = 0; i < markers.length; i++) {
        markers[i].style.visibility = "visible";
    }
}