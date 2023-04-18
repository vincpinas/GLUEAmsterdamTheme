import { createGeoJSON, createMarkers, getFeatures, hideMarkers, showMarkers } from "./mapbox-helpers.js";

const mapElement = document.getElementById("map")

mapboxgl.accessToken = mapElement.dataset.token;

let map = new mapboxgl.Map({
    container: 'map',
    style: mapElement.dataset.styles,
    center: [
        4.897070,
        52.373956,
    ],
    zoom: 12,
});

// map.scrollZoom.disable();
// map.dragPan.disable();

getFeatures(mapElement.dataset.addresses, mapboxgl.accessToken)
    .then(features => createGeoJSON(features))
    .then(geojson => createMarkers(geojson, map, mapElement.dataset.markerImg))

console.log(mapElement.dataset)