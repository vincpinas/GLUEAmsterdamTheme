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
});

// map.scrollZoom.disable();
// map.dragPan.disable();

const mapState = new MapStateMachine(mapElement, mapboxgl.accessToken, map);
const mapMenu = new MapMenu();

mapState.createGeoJSON(mapElement.dataset.addresses)
    .then(geojson => mapState.createMarkers(geojson, map))

mapState.filterFeatures(mapState.routes[0])
    .then(result => mapState.getDirections(result))
    .then(data => mapState.addRoute(data.routes[0].geometry))
