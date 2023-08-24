export default class MapStateMachine {
    constructor(mapElement, token, map) {
        this.mapElement = mapElement;
        this.markerStyles = JSON.parse(mapElement.dataset.markerStyles)
        this.markers = [];
        this.geoJSON = {};
        this.filterMethod = "address";
        this.token = token;
        this.mapRef = map;
        this.currentRoute = null;
        this.currentPos = null;
        this.sliderTimer = null;
        this.sliderTimeOut = this.markerStyles.hubSlideDuration
        this.hubsCollection = [];
        this.hubMinimumCount = JSON.parse(mapElement.dataset.hubMinimumCount)
        this.city = mapElement.dataset.city
    }




    // Save a GeoJSON object in memory for later use
    createGeoJSON = async (dataset) => {
        const datasetParse = JSON.parse(dataset);
        let features = [];

        datasetParse.forEach((item) => {
            let search_string = encodeURIComponent(`${item.address.toUpperCase()}, ${this.city}`);
            const fetchPromise = fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${search_string}.json?access_token=${this.token}`);
            fetchPromise.then(response => { return response.json() })
                .then(data => {
                    data.features[0].cPost = item.postalCode;
                    data.features[0].cStreet = item.street;
                    data.features[0].cAddress = item.address;

                    return data;
                })
                .then(result => { features.push(result.features[0]) })
        });

        return new Promise((resolve, reject) => {
            let interval = setInterval(() => {
                if (datasetParse.length === features.length) {
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


                if (this.currentPos) {
                    const currentPosMarker = document.createElement('div');
                    currentPosMarker.className = 'c-map__marker c-map__currentPos'
                    currentPosMarker.style.width = `${this.markerStyles.size}px`
                    currentPosMarker.style.height = `${this.markerStyles.size}px`
                    currentPosMarker.style.background = "green"
                    currentPosMarker.style.borderRadius = "100%"

                    if (route) result.push(new mapboxgl.Marker(currentPosMarker).setLngLat(this.currentPos).addTo(map))
                }

                // Get all features postal codes in array and filter to find out which ones are the same and belong to a "HUB"
                if (this.hubsCollection.length <= 0) {
                    const featureLocations = []
                    let duplicates;

                    switch (this.filterMethod) {
                        case "post":
                            features.forEach(feature => featureLocations.push(feature.cPost))
                            duplicates = this.toFindDuplicates(featureLocations)
                            duplicates.forEach(duplicate => {
                                const temp = this.filterFeaturesUsingPost(features, duplicate)
                                this.hubsCollection.push(temp)
                            })
                            break;
                        case "street":
                            features.forEach(feature => featureLocations.push(feature.cStreet))
                            duplicates = this.toFindDuplicates(featureLocations)
                            duplicates.forEach(duplicate => {
                                const temp = this.filterFeaturesUsingStreet(features, duplicate)
                                this.hubsCollection.push(temp)
                            })
                            break;
                        case "address":
                            features.forEach(feature => featureLocations.push(feature.cAddress))
                            duplicates = this.toFindDuplicates(featureLocations)
                            duplicates.forEach(duplicate => {
                                const temp = this.filterFeaturesUsingAddress(features, duplicate)
                                this.hubsCollection.push(temp)
                            })
                            break;
                        default:
                            break;
                    }
                }

                // Marker creation
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
                        let popupInfo

                        switch (this.filterMethod) {
                            case "post":
                                popupInfo = JSON.parse(this.mapElement.dataset.addresses).filter(
                                    address => marker.cPost.toUpperCase().includes(address.postalCode.toUpperCase())
                                )[0]
                                break;
                            case "street":
                                popupInfo = JSON.parse(this.mapElement.dataset.addresses).filter(
                                    address => marker.cStreet.toUpperCase().includes(address.street.toUpperCase())
                                )[0]
                                break;
                            case "address":
                                popupInfo = JSON.parse(this.mapElement.dataset.addresses).filter(
                                    address => marker.cAddress.toUpperCase().includes(address.address.toUpperCase())
                                )[0]
                                break;
                            default:
                                break;
                        }

                        if (!popupInfo) return;

                        // // Check if marker is a hub to prevent a double marker from being made.
                        let inHub = false;
                        this.hubsCollection.forEach((hub) => {
                            hub.indexOf(marker) > -1 ? inHub = true : false
                        })
                        if (inHub) return;

                        if (popupInfo.founder) el.style.backgroundImage = `url(${this.markerStyles.founderIcon})`;
                        else if (popupInfo.specialProgram) el.style.backgroundImage = `url(${this.markerStyles.specialProgramIcon})`;
                        else el.style.backgroundImage = `url(${this.markerStyles.locationsIcon})`;

                        let popup = new mapboxgl.Popup({ offset: 15, maxWidth: "300px" })
                            .setHTML(
                                `<div class="c-map__popupImgWrapper">
                                    <div class="c-map__popupImgTextWrapper">
                                        <p class="c-map__popupImgText c-map__popupImgTitle">${popupInfo.fullName}</p>
                                        <p class="c-map__popupImgText c-map__popupImgAddress">${popupInfo.address}</p>
                                    </div>
                                    <div class="c-map__popupImgOverlay"></div>
                                    <img class="c-map__popupImg" src="${popupInfo.thumbnail}"></img>
                                </div>
                                <span class="c-map__popupLinks">
                                    <a class="c-map__popupLink" target="_blank" href="/${popupInfo.fullName.replace(/\s/g, "-")}">More Info</a>
                                    <a class="c-map__popupLink" target="_blank" href="https://www.google.nl/maps/place/${popupInfo.address}">Display on map</a>
                                </span>
                                </div>`
                            )
                        temp = new mapboxgl.Marker(el).setLngLat(marker.geometry.coordinates).setPopup(popup).addTo(map)
                        temp.cId = popupInfo.id;
                        temp.hub = false;
                        temp.cLngLat = marker.geometry.coordinates
                    }

                    result.push(temp)
                });

                // Create hub markers
                if (!route) {
                    this.hubsCollection.forEach((hub) => {
                        if (hub.length <= 0) return;
                        let currentMarker;
                        let count = 0;
                        let popup = new mapboxgl.Popup({ offset: 15 })
                        let popupSlides = "";
                        let popupDots = "";
                        const el = document.createElement('div');
                        el.className = 'c-map__marker';
                        el.style.width = `${this.markerStyles.size}px`
                        el.style.height = `${this.markerStyles.size * 1.3}px`
                        if (hub.length < this.hubMinimumCount) el.style.backgroundImage = `url(${this.markerStyles.collectiveIcon})`
                        else el.style.backgroundImage = `url(${this.markerStyles.hubIcon})`;
                        currentMarker = new mapboxgl.Marker(el);
                        currentMarker.cLngLat = hub[0].geometry.coordinates
                        currentMarker.hub = true;
                        currentMarker.setLngLat(hub[0].geometry.coordinates)

                        hub.forEach(expo => {
                            let popupFilter = JSON.parse(this.mapElement.dataset.addresses).filter(address => expo.cAddress.toUpperCase().includes(address.postalCode.toUpperCase()))
                            let popupInfo = popupFilter[count]
                            if (!popupInfo) return;
                            currentMarker.cId = popupInfo.id;

                            if (popupInfo.isHub) popupSlides = this.createPopupSlide(popupInfo) + popupSlides;
                            else popupSlides += this.createPopupSlide(popupInfo);

                            popupDots += `<figure class='c-map__popupSliderDot' data-index=${count}></figure>`
                            count++
                        })

                        el.addEventListener("click", () => {
                            if (this.activePopUp && this.activePopUp._popup.isOpen()) this.activePopUp.togglePopup();
                            currentMarker.togglePopup();
                            this.activePopUp = currentMarker
                            const lngLat = currentMarker.cLngLat
                            if (currentMarker.hub && this.activePopUp && this.activePopUp._popup.isOpen()) this.animateSlider(currentMarker.cId)
                            const bounds = new mapboxgl.LngLatBounds(lngLat, lngLat);
                            this.mapRef.fitBounds(bounds, { padding: 50, duration: 1200, zoom: 14, offset: [0, 50] })
                        })

                        popup.setHTML(`
                            <div class="c-map__popupSlider c-map__popupSlider-${currentMarker.cId}">
                                <ul class="c-map__popupSliderTrack">
                                    ${popupSlides}
                                </ul>
                            </div>
                            <span class="c-map__popupSliderDots">
                                ${popupDots}
                            </span>
                        `)
                        currentMarker.setPopup(popup)
                        currentMarker.addTo(map)
                        result.push(currentMarker)
                    })
                }

                // Popup toggle through menu buttons and markers
                if (!route) {
                    document.querySelectorAll(".c-map__locationButtonWrapper").forEach(location => {
                        let marker = result.filter(marker => marker.cId == location.dataset.cId)[0];

                        if (!marker) return;

                        marker._popup.on("close", () => { this.centerMap(); })

                        location.addEventListener("click", () => {
                            if (this.activePopUp && this.activePopUp._popup.isOpen()) this.activePopUp.togglePopup();
                            marker.togglePopup();
                            this.activePopUp = marker
                            const lngLat = marker.cLngLat
                            if (marker.hub && this.activePopUp && this.activePopUp._popup.isOpen()) this.animateSlider(marker.cId)
                            const bounds = new mapboxgl.LngLatBounds(lngLat, lngLat);
                            this.mapRef.fitBounds(bounds, { padding: 50, duration: 1200, zoom: 14, offset: [0, 50] })
                        })
                    })
                }

                this.markers = result;
                reslove(result)
            }
            else {
                reject({ geoJSON, map, length: geoJSON.features.length })
            }
        })
    };



    createPopupSlide = (popupInfo) => {
        return `
        <li class="c-map__popupSlide">
            <div class="c-map__popupImgWrapper">
                <div class="c-map__popupImgTextWrapper">
                    <p class="c-map__popupImgText c-map__popupImgTitle">${popupInfo.fullName}</p>
                    <p class="c-map__popupImgText c-map__popupImgAddress">${popupInfo.address}</p>
                </div>
                <div class="c-map__popupImgOverlay"></div>
                <img class="c-map__popupImg" src="${popupInfo.thumbnail}"></img>
            </div>
            <span class="c-map__popupLinks">
                <a class="c-map__popupLink" target="_blank" href="/${popupInfo.fullName.replace(/\s/g, "-")}">More Info</a>
                <a class="c-map__popupLink" target="_blank" href="https://www.google.nl/maps/place/${popupInfo.address}">Display on map</a>
            </span>
        </li>`
    }



    animateSlider = (sliderId) => {
        const track = document.querySelector(`.c-map__popupSlider-${sliderId} .c-map__popupSliderTrack`)
        const slides = document.querySelectorAll(`.c-map__popupSlider-${sliderId} .c-map__popupSlide`);
        const dots = document.querySelectorAll('.c-map__popupSliderDot');
        let i;

        const createInterval = (dur) => {
            return setInterval(() => {
                if (i === dots.length - 1) i = 0
                else i++

                slideTo(i)
            }, dur)
        }

        const resetDots = () => dots.forEach((dot) => dot.classList.remove('active'));

        const slideTo = (n) => {
            track.style.transform = `translateX(-${n * slides[0].offsetWidth}px)`;
            resetDots();
            dots[n].classList.add('active');
        }

        const activateDots = (e) => {
            i = e.target.dataset.index;
            slideTo(i);
            if (this.sliderTimer) clearInterval(this.sliderTimer)
            this.sliderTimer = createInterval(this.sliderTimeOut)
        }

        function activate(e) {
            e.target.matches('.c-map__popupSliderDot') && activateDots(e);
        }

        function initSlider(n, classObj) {
            i = n;
            slideTo(n);
            if (classObj.sliderTimer) clearInterval(classObj.sliderTimer)
            classObj.sliderTimer = createInterval(classObj.sliderTimeOut)
        }

        document.addEventListener('click', activate, false);
        initSlider(0, this)
    }



    // Remove all markers from the map.
    removeMarkers = () => {
        if (this.markers.length <= 0) return;
        for (let i = 0; i < this.markers.length; i++) {
            this.markers[i].remove()
        }
    }



    toFindDuplicates(arry) {
        const uniqueElements = new Set(arry);
        const filteredElements = arry.filter(item => {
            if (uniqueElements.has(item)) {
                uniqueElements.delete(item);
            } else {
                return item.toUpperCase();
            }
        });

        return filteredElements
    }


    // Filter features in the GeoJSON object saved in memory to find all features related to the addresses in the array provided.
    filterFeatures = (route) => {
        let directions = [];

        return new Promise((resolve, reject) => {
            route.forEach((item) => {
                let temp = this.geoJSON.features.filter(location => location.place_name.includes(item.postalCode.toUpperCase()));
                if (temp && temp.length > 0) directions.push(temp[0].center);
            });

            if (directions.length > 0) {
                resolve(directions)
            } else {
                reject({ directions })
            }
        })
    }



    // Filter through selected features object using postal code
    filterFeaturesUsingPost = (features, postalCode) => {
        return features.filter(feature => feature.cPost.toUpperCase() === postalCode.toUpperCase())
    }

    filterFeaturesUsingStreet = (features, street) => {
        return features.filter(feature => feature.cStreet.toUpperCase() === street.toUpperCase())
    }

    filterFeaturesUsingAddress = (features, address) => {
        return features.filter(feature => feature.cAddress.toUpperCase() === address.toUpperCase())
    }



    getDirections = (coordinates) => {
        let coordinate_string = "";
        let coordinates_geoJSON = [];

        return new Promise((resolve, reject) => {

            coordinates.forEach((coordinate, index) => {
                coordinates_geoJSON.push({ geometry: { type: "Point", coordinates: coordinate } })

                if (index === coordinates.length - 1) {
                    coordinate_string += `${coordinate[0]},${coordinate[1]};`;
                    // Adds first point as last point to make sure the mapbox route ends where it started.
                    coordinate_string += `${coordinates[0][0]},${coordinates[0][1]}`;
                }
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
                'line-cap': 'square'
            },
            'paint': {
                'line-color': '#0525d3',
                'line-width': 4,
                'line-opacity': 1,
                'line-dasharray': [2, 2],
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




    resetMap() {
        this.removeMarkers();
        this.removeRoute();
        this.createMarkers(this.geoJSON.features, this.mapRef, false);
        this.centerMap();
    }



    getLocation = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition((position) => {
                this.currentPos = { lng: position.coords.longitude, lat: position.coords.latitude }
            });
        } else {
            console.error("Geolocation is not supported by this browser.")
        }
    }
}