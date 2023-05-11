export default class MapMenu {
    constructor(mapStateMachine) {
        this.menuRoutes = [];
        this.mapState = mapStateMachine;
        this.menuLocations = null;
        this.activeMenuItem = null;
        this.activePopUp = null;

        this.init();
    }

    init = () => {
        const directionButtons = document.querySelectorAll(".c-map__menuDirectionButton")
        const directionCloseButtons = document.querySelectorAll(".c-map__menuDirectionCloseButton")
        const routes = document.querySelectorAll(".c-map__menuRoute")

        this.menuRoutes = routes;

        directionButtons.forEach((button) => {
            button.addEventListener("click", () => this.openDirectionTab(button, button.dataset.i));
        })

        directionCloseButtons.forEach((button, i) => {
            button.addEventListener("click", () => this.closeDirectionTab());
        })

        routes.forEach((route, i) => {
            route.dataset.i = i + 1
            route.addEventListener("click", () => this.openRoute(JSON.parse(route.dataset.route), route, i + 1));
        });
        

    }

    openDirectionTab = (element, i) => {
        if (JSON.parse(element.dataset.locked)) return;

        let relatedTab = document.getElementsByClassName(`c-map__menuDirectionTab-${i}`)[0]

        if (relatedTab) {
            relatedTab.classList.add("active");

            this.openRoute(
                JSON.parse(relatedTab.firstElementChild.nextElementSibling.dataset.route),
                relatedTab.firstElementChild.nextElementSibling,
                JSON.parse(relatedTab.firstElementChild.nextElementSibling.dataset.i)
            );
        }
    }

    openRoute = (route, element, id) => {
        this.closeMenuItem();

        this.mapState.filterFeatures(route.pois)
            .then(result => this.mapState.getDirections(result))
            .then(data => this.mapState.addRoute(data.routeCoords.routes[0].geometry, data.markerCoords))

        if (element) element.classList.add('c-map__menuTabActive')

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

        // Adds first point as last point to make sure the google route ends where it started.
        googleRouteHref += `${route.pois[0].postalCode}/`
        // Data block to specify walking transportation mode.
        googleRouteHref += `data=!4m2!4m1!3e2/`

        const googleRouteButton = document.createElement("a");
        googleRouteButton.target = "_blank";
        googleRouteButton.href = googleRouteHref;
        googleRouteButton.className = "c-map__menuGoogleButton"
        googleRouteButton.innerHTML = "Open in Google maps";

        routeOverview.appendChild(routeList);
        routeOverview.appendChild(googleRouteButton);

        element.insertAdjacentHTML('afterend', this.getHTML(routeOverview, true));
    }

    closeMenuItem = () => {
        const active = document.querySelector(".c-map__menuItem.active");
        const activeTab = document.querySelector(".c-map__menuTabActive");

        if (active) active.remove();
        if (activeTab) activeTab.classList.remove('c-map__menuTabActive');
    }

    closeDirectionTab = () => {
        const activeTab = document.querySelector(".c-map__menuDirectionTab.active")

        if (activeTab) activeTab.classList.remove("active");
        this.mapState.resetMap();
        this.closeMenuItem();
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