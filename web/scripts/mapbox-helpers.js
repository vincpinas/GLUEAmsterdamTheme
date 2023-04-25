export default class MapStateMachine {
    constructor(mapElement, token, map) {
        this.mapElement = mapElement;
        this.markerStyles = JSON.parse(mapElement.dataset.markerStyles)
        this.markers = [];
        this.geoJSON = {};
        this.token = token;
        this.mapRef = map;
        this.currentRoute = null;
    }

    // Save a GeoJSON object in memory for later use
    createGeoJSON = async (dataset) => {
        const data = JSON.parse(dataset);
        let features = [];

        data.forEach((item) => {
            let search_string = encodeURIComponent(item.postalCode.toLowerCase());
            const fetchPromise = fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${search_string}.json?access_token=${this.token}`);
            fetchPromise.then(response => { return response.json() }).then(data => features.push(data.features[0]))
        });

        return new Promise((resolve, reject) => {
            let interval = setInterval(() => {
                if (data.length === features.length) {
                    this.geoJSON = { "features": features, "type": "FeatureCollection" };
                    resolve(this.geoJSON);
                    clearInterval(interval);
                }
            }, 100)
        })
    }

    // Create and add HTML markers on the map using the GeoJSON object
    createMarkers = (features, map, route = false) => {
        return new Promise((reslove, reject) => {
            if (features.length > 0) {
                let result = [];

                features.forEach((marker, i) => {
                    let temp;
                    const el = document.createElement('div');
                    el.className = 'c-map__marker';
                    el.style.width = `${this.markerStyles.size}px`
                    el.style.height = `${this.markerStyles.size * 1.3}px`
                    if (route) {
                        el.innerHTML = i + 1;
                        el.style.backgroundImage = `url(${this.markerStyles.routeIcon})`
                        temp = new mapboxgl.Marker(el).setLngLat(marker.geometry.coordinates).addTo(map)
                    } else {
                        el.style.backgroundImage = `url(${this.markerStyles.locationsIcon})`
                        temp = new mapboxgl.Marker(el).setLngLat(marker.geometry.coordinates).addTo(map)
                    }

                    result.push(temp)
                });

                this.markers = result;
                reslove(result)
            }
            else {
                reject({ geoJSON, map, length: geoJSON.features.length })
            }
        })
    };

    // Remove all markers from the map.
    removeMarkers = () => {
        if (this.markers.length <= 0) return;
        for (let i = 0; i < this.markers.length; i++) {
            this.markers[i].remove()
        }
    }

    // Filter features in the GeoJSON object saved in memory to find all features related to the addresses in the array provided.
    filterFeatures = (route) => {
        let directions = [];

        return new Promise((resolve, reject) => {
            route.forEach((item) => {
                let temp = this.geoJSON.features.filter(location => location.place_name.includes(item.postalCode));
                if (temp) directions.push(temp[0].center);
            });

            if (directions.length === route.length) {
                resolve(directions)
            } else {
                reject({ directions })
            }
        })
    }

    getDirections = (coordinates) => {
        let coordinate_string = "";
        let coordinates_geoJSON = [];

        return new Promise((resolve, reject) => {

            coordinates.forEach((coordinate, index) => {
                coordinates_geoJSON.push({ geometry: { type: "Point", coordinates: coordinate } })

                if (index === coordinates.length - 1) coordinate_string += `${coordinate[0]},${coordinate[1]}`;
                else coordinate_string += `${coordinate[0]},${coordinate[1]};`;
            })

            fetch(`https://api.mapbox.com/directions/v5/mapbox/walking/${coordinate_string}?geometries=geojson&access_token=${this.token}`)
                .then(response => { return response.json() })
                .then(data => this.currentRoute = data)
                .then(result => resolve({ routeCoords: result, markerCoords: coordinates_geoJSON }))
                .catch(e => reject(e))
        })
    }

    addRoute = (coords, markerCoords) => {
        // If a route is already loaded, remove it
        if (this.mapRef.getSource('route')) {
            this.mapRef.removeLayer('route');
            this.mapRef.removeSource('route');
        }

        this.removeMarkers();
        this.createMarkers(markerCoords, this.mapRef, true)

        this.mapRef.addLayer({
            'id': 'route',
            'type': 'line',
            'source': {
                'type': 'geojson',
                'data': {
                    'type': 'Feature',
                    'properties': {},
                    'geometry': coords
                }
            },
            'layout': {
                'line-join': 'round',
                'line-cap': 'round'
            },
            'paint': {
                'line-color': '#0525d3',
                'line-width': 4,
                'line-opacity': 1
            }
        });


        const bounds = new mapboxgl.LngLatBounds(coords.coordinates[0], coords.coordinates[0]);

        for (const coord of coords.coordinates) {
            bounds.extend(coord)
        }

        this.mapRef.fitBounds(bounds, {
            padding: 50,
            duration: 1200,
        })
    }

    removeRoute = () => {
        if (!this.mapRef.getSource('route')) return;
        this.mapRef.removeLayer('route');
        this.mapRef.removeSource('route');
    }

    centerMap = () => {
        const center = {
            center: [4.897070, 52.373956,],
            zoom: JSON.parse(this.mapElement.dataset.zoom),
            pitch: 0,
            bearing: 0
        };

        this.mapRef.flyTo({
            ...center,
            duration: 1200,
            essential: true
        });
    }
}