export default class MapMenu {
    constructor(mapStateMachine) {
        this.menuRoutes = [];
        this.mapState = mapStateMachine;
        this.menuLocations = null;
        this.activeMenuItem = null;
        this.lastId = 1;

        this.init();
    }

    init = () => {
        const routes = document.querySelectorAll(".c-map__menuRoute")
        const locations = document.querySelector(".c-map__menuLocations")

        this.menuRoutes = routes;
        this.menuLocations = locations;
        this.lastId = routes.length + 1;


        routes.forEach((route, i) => {
            route.addEventListener("click", () => this.openRoute(JSON.parse(route.dataset.route), route, i + 1));
        });

        locations.addEventListener("click", () => this.openLocations(locations));

        this.openLocations(locations, false)
    }

    openRoute = (route, element, id) => {
        if(JSON.parse(element.dataset.locked)) return;
        this.closeMenuItem()

        this.mapState.filterFeatures(route.pois)
            .then(result => this.mapState.getDirections(result))
            .then(data => this.mapState.addRoute(data.routeCoords.routes[0].geometry, data.markerCoords))

        if(element) element.classList.add('c-map__menuTabActive')

        const routeOverview = document.createElement("div");
        routeOverview.className = `c-map__routeOverview c-map__menuItem-${id} c-map__menuItem active`;

        const routeList = document.createElement("ul");
        const routeOverviewTitleContainer = document.createElement("li")
        const routeOverviewTitle = document.createElement("h2");
        routeOverviewTitle.innerHTML = route.routeName;
        routeOverviewTitleContainer.appendChild(routeOverviewTitle)
        routeList.appendChild(routeOverviewTitleContainer)
        routeList.appendChild(document.createElement("li"))

        let googleRouteHref = "https://www.google.nl/maps/dir/";

        route.pois.forEach((poi, i) => {
            let li = document.createElement("li");
            let a = document.createElement("a");
            
            a.innerHTML = `${i + 1}. <span></span> ${poi.fullName}`;
            a.target = "_blank";
            a.href = `/account/${poi.username}`;
            googleRouteHref += `${poi.postalCode}/`

            li.appendChild(a);
            routeList.appendChild(li);
        });

        const googleRouteButton = document.createElement("a");
        googleRouteButton.target = "_blank";
        googleRouteButton.href = googleRouteHref;
        googleRouteButton.className = "c-map__menuGoogleButton"
        googleRouteButton.innerHTML = "Open in Google maps";
        

        routeOverview.appendChild(routeList);
        routeOverview.appendChild(googleRouteButton);

        element.insertAdjacentHTML('afterend', this.getHTML(routeOverview, true));
    }

    openLocations = (element, reset = true) => {
        if (reset) {
            this.mapState.removeMarkers();
            this.mapState.removeRoute();
            this.closeMenuItem()
            this.mapState.createMarkers(this.mapState.geoJSON.features, this.mapState.mapRef);
            this.mapState.centerMap();
        }

        if(element) element.classList.add('c-map__menuTabActive')

        const locationsOverview = document.createElement("div");
        locationsOverview.className = `c-map__locationsOverview c-map__menuItem-${this.lastId} c-map__menuItem active`;
        
        const locationsTitle = document.createElement("h2");
        locationsTitle.innerHTML = "Locations"
        locationsOverview.appendChild(locationsTitle);

        const locationsList = document.createElement("ol");

        JSON.parse(this.mapState.mapElement.dataset.addresses).forEach((address) => {
            const li = document.createElement("li");
            const a = document.createElement("a");
            a.innerHTML = `${address.fullName} <ion-icon name="chevron-forward-sharp"></ion-icon>`
            a.href = `/account/${address.username}`;
            a.className = "c-map__locationButton"

            li.appendChild(a);
            locationsList.appendChild(li);
        })
        locationsOverview.appendChild(locationsList);

        element.insertAdjacentHTML('afterend', this.getHTML(locationsOverview, true));
    }

    closeMenuItem = () => {
        const active = document.querySelector(".c-map__menuItem.active");
        const activeTab = document.querySelector(".c-map__menuTabActive");

        if (active) active.remove();
        if(activeTab) activeTab.classList.remove('c-map__menuTabActive');
    }

    getHTML = (who, deep) => {
        if (!who || !who.tagName) return '';
        var txt, ax, el = document.createElement("div");
        el.appendChild(who.cloneNode(false));
        txt = el.innerHTML;
        if (deep) {
            ax = txt.indexOf('>') + 1;
            txt = txt.substring(0, ax) + who.innerHTML + txt.substring(ax);
        }
        el = null;
        return txt;
    }
}