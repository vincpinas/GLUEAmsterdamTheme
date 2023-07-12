const getSessionInfo = function () {
    return fetch('/actions/users/session-info', {
        headers: {
            'Accept': 'application/json',
        },
    })
        .then(response => response.json());
};

export default class MapMenu {
    constructor(mapStateMachine) {
        this.menuRoutes = [];
        this.mapState = mapStateMachine;
        this.menuLocations = null;
        this.activeMenuItem = null;
        this.activePopUp = null;
        this.locked = JSON.parse(document.querySelector(".c-map__menu").dataset.locked);

        this.init();
    }

    init = () => {
        const directionButtons = document.querySelectorAll(".c-map__menuDirectionButton")
        const directionCloseButtons = document.querySelectorAll(".c-map__menuDirectionCloseButton")
        const routes = document.querySelectorAll(".c-map__menuRoute")

        this.menuRoutes = routes;

        directionButtons.forEach((button) => {
            button.addEventListener("click", () => {
                if (!this.locked) return;
                if (document.querySelector(".c-map__menuPopup")) return;

                const popup = document.createElement("div")
                popup.className = "c-map__menuPopup"
                const popupWrapper = document.createElement("div")
                popupWrapper.className = "c-map__menuPopupWrapper"
                popupWrapper.method = "post"
                popupWrapper.acceptCharset = "UTF-8"

                const guest = document.createElement("input");
                guest.setAttribute("type", "hidden")
                guest.setAttribute("name", "guestRegister")
                guest.value = true

                const close = document.createElement("ion-icon");
                close.setAttribute("name", "close-outline")
                close.addEventListener("click", () => popup.remove())
                const closeClone = close.cloneNode(true)
                closeClone.addEventListener("click", () => popup.remove())

                const submit = document.createElement("button")
                submit.innerHTML = "Submit"

                const next = document.createElement("button")
                next.innerHTML = "Next"

                const title = document.createElement("h2")
                title.innerHTML = "Register for GLUE routes"
                const name = document.createElement("input")
                name.setAttribute("type", "text");
                name.setAttribute("name", "fullName");
                name.setAttribute("placeholder", "Fullname");
                const email = document.createElement("input")
                email.setAttribute("type", "email");
                email.setAttribute("name", "email");
                email.setAttribute("placeholder", "Email");
                const emailClone = email.cloneNode(true);

                const profession_select = document.createElement("select")
                const professions = [document.createElement("option"), document.createElement("option"), document.createElement("option")]
                const prof_values = ["I'm a design professional", "Not a professional, but I'm a design lover!", "I'm from the press"]
                professions.forEach((prof, index) => {
                    prof.value = prof_values[index]
                    prof.innerHTML = prof_values[index]
                    profession_select.appendChild(prof)
                })

                const age_select = document.createElement("select")
                const age_groups = [document.createElement("option"), document.createElement("option"), document.createElement("option")]
                const age_values = ["-25", "-25 - 45", "45 +"]
                age_groups.forEach((age, index) => {
                    age.value = age_values[index]
                    age.innerHTML = age_values[index]
                    age_select.appendChild(age)
                })

                const marketing_label = document.createElement("label")
                const marketing_perms = document.createElement("input")
                marketing_perms.setAttribute("type", "checkbox");
                marketing_label.appendChild(marketing_perms)
                marketing_label.innerHTML += "Yes, I would like to continue receiving emails from GLUE"

                popup.appendChild(popupWrapper)

                const page1 = document.createElement("div")
                page1.appendChild(close)
                page1.appendChild(title)
                page1.appendChild(email)
                page1.appendChild(next)

                const page2 = document.createElement("div")
                page2.appendChild(closeClone)
                page2.appendChild(title.cloneNode(true))
                page2.appendChild(name)
                page2.appendChild(emailClone)
                page2.appendChild(profession_select)
                page2.appendChild(age_select)
                page2.appendChild(marketing_label)
                page2.appendChild(submit)

                next.addEventListener("click", () => {
                    fetch(`https://glueweb.ddev.site/api?query=query%20MyQuery%20%7B%0A%20%20user(email%3A%20%22${email.value}%22)%20%7B%0A%20%20%20%20email%0A%20%20%7D%0A%7D%0A`).then(response => response.json()).then(query => {
                        return query.data.user
                    }).then(user => {
                        console.log(user)
                        if (user) {
                            getSessionInfo().then(session => {
                                const params = new FormData();
                                params.append("password", "GLUEAms2023")
                                params.append("loginName", user.email)

                                return fetch('/actions/users/login', {
                                    method: 'POST',
                                    headers: {
                                        'Accept': 'application/json',
                                        'X-CSRF-Token': session.csrfTokenValue,
                                        'X-Requested-With': 'XMLHttpRequest',
                                    },
                                    body: params,
                                })
                            }).then(loginReq => {
                                if (loginReq.status === 200) {
                                    document.location.reload();
                                }
                            })
                        } else {
                            emailClone.value = email.value
                            page1.remove();
                            popupWrapper.appendChild(page2);
                        }
                    })
                })

                submit.addEventListener("click", () => {
                    let token;

                    getSessionInfo().then(session => {
                        token = session.csrfTokenValue;

                        const params = new FormData();
                        params.append("fullName", name.value)
                        params.append("email", emailClone.value)
                        params.append("password", "GLUEAms2023")
                        params.append("fields[marketingPermissions]", marketing_perms.checked ? "Yes" : "No")
                        params.append("fields[profession]", profession_select.value)
                        params.append("fields[ageGroup]", age_select.value)
                        params.append("guestRegister", true)

                        return fetch('actions/users/save-user', {
                            method: 'POST',
                            headers: {
                                'Accept': 'application/json',
                                'X-CSRF-Token': token,
                                'X-Requested-With': 'XMLHttpRequest',
                            },
                            body: params,
                        })
                    })
                    .then(() => {
                        const params = new FormData();
                        params.append("password", "GLUEAms2023")
                        params.append("loginName", emailClone.value)

                        return fetch('/actions/users/login', {
                            method: 'POST',
                            headers: {
                                'Accept': 'application/json',
                                'X-CSRF-Token': token,
                                'X-Requested-With': 'XMLHttpRequest',
                            },
                            body: params,
                        })
                    }).then(() => document.location.reload())
                })

                popupWrapper.appendChild(page1)
                document.body.appendChild(popup)
            })
        })

        directionButtons.forEach((button) => {
            button.addEventListener("click", () => {
                this.openDirectionTab(button, button.dataset.i)
                document.querySelector(".c-map__headersGroup").innerHTML = ` Routes - ${button.dataset.group}`

                const legend = document.querySelector(".c-map__legend")

                if (legend && legend.classList.contains('active')) legend.classList.remove('active')
            });
        })

        directionCloseButtons.forEach((button, i) => {
            button.addEventListener("click", () => this.closeDirectionTab());
        })

        document.querySelector(".c-map__headers").style.opacity = "0"
        document.querySelector(".c-map__headersClose button").style.pointerEvents = "none"

        routes.forEach((route, i) => {
            route.dataset.i = i + 1
            route.addEventListener("click", () => this.openRoute(JSON.parse(route.dataset.route), route, i + 1));
        });

        const legendButton = document.querySelector(".c-map__legendButton")
        const legend = document.querySelector(".c-map__legend")
        legendButton.addEventListener("click", () => {
            if (document.querySelector(".c-map__menuPopup")) {
                legend.classList.remove("active");
                return;
            }

            legend.classList.toggle("active")
        })
    }

    openDirectionTab = (element, i) => {
        if (this.locked) return;

        let relatedTab = document.getElementsByClassName(`c-map__menuDirectionTab-${i}`)[0]

        if (relatedTab) {
            relatedTab.classList.add("active");

            this.openRoute(
                JSON.parse(relatedTab.firstElementChild.dataset.route),
                relatedTab.firstElementChild,
                JSON.parse(relatedTab.firstElementChild.dataset.i)
            );
            document.querySelector(".c-map__headers").style.opacity = "1"
            document.querySelector(".c-map__headersClose button").style.pointerEvents = "all"
        }
    }

    openRoute = (route, element, id) => {
        this.closeMenuItem();

        const routeOverview = document.createElement("div");
        routeOverview.className = `c-map__routeOverview c-map__menuItem-${id} c-map__menuItem active`;

        this.mapState.filterFeatures(route.pois)
            .then(result => this.mapState.getDirections(result))
            .then(data => {
                let distance = Math.round(data.routeCoords.routes[0].distance / 1000);
                let time = data.routeCoords.routes[0].duration / 60;
                this.mapState.addRoute(data.routeCoords.routes[0].geometry, data.markerCoords)
                return { distance, time }
            }).then(callback => {
                let hours = Math.floor(callback.time / 60);
                let minutes = Math.floor(callback.time % 60);


                console.log(`${hours}:${minutes}`, `${callback.distance}km`)

            })

        if (element) element.classList.add('c-map__menuTabActive')

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
            a.href = `/${poi.fullName.replace(/\s/g, "-")}`;
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
        document.querySelector(".c-map__headers").style.opacity = "0"
        document.querySelector(".c-map__headersClose button").style.pointerEvents = "none"

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