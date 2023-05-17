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

const mobile = (() => {
    if (navigator.userAgent.match(/Android/i)
        || navigator.userAgent.match(/webOS/i)
        || navigator.userAgent.match(/iPhone/i)
        || navigator.userAgent.match(/iPad/i)
        || navigator.userAgent.match(/iPod/i)
        || navigator.userAgent.match(/BlackBerry/i)
        || navigator.userAgent.match(/Windows Phone/i)) {
        return true;
    } else {
        return false;
    }
})()

if (mobile) {
    map.scrollZoom.disable();
    map.dragPan.disable();
}


const mapState = new MapStateMachine(mapElement, mapboxgl.accessToken, map);
new MapMenu(mapState);

mapState.createGeoJSON(mapElement.dataset.addresses)
    .then(geojson => mapState.createMarkers(geojson.features, map))