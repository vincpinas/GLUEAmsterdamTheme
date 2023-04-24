import MapStateMachine from "./mapbox-helpers.js";
import MapMenu from "./mapbox-menu.js";

const mapElement = document.getElementById("map")

mapboxgl.accessToken = mapElement.dataset.token;

const map = new mapboxgl.Map({
    container: 'map',
    style: mapElement.dataset.styles,
    center: [
        4.897070,
        52.373956,
    ],
    zoom: JSON.parse(mapElement.dataset.zoom),
    pitch: JSON.parse(mapElement.dataset.pitch),
    bearing: JSON.parse(mapElement.dataset.bearing)
});

// map.scrollZoom.disable();
// map.dragPan.disable();

const mapState = new MapStateMachine(mapElement, mapboxgl.accessToken, map);
new MapMenu(mapState);

mapState.createGeoJSON(mapElement.dataset.addresses)
    .then(geojson => mapState.createMarkers(geojson.features, map))