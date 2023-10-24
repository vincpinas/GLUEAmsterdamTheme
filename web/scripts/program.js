class Program {
    // Initialize
    // =========================================================================
    constructor() {
        this.selector = ".c-program__menu"
        this.search = document.querySelector(`${this.selector}Search`)
        this.filterButton = document.querySelector(`${this.selector}Filter`)
        this.filterList = document.querySelector(`${this.selector}Filters`)
        this.filters = document.querySelectorAll(`${this.selector}Filters input`)
        this.date = document.querySelector(`${this.selector} #date`)
        this.list = document.querySelector('.c-program__entries')
        this.entries = JSON.parse(this.list.dataset.entries)

        this.init();
    }

    init() {
        this._registerFilterMenu();
        this._registerFilterEvents();

        this.filter();
    }

    // Functions
    // =========================================================================

    filter() {
        this.clearEntriesList();

        let filtered_date = this.entries.filter(entry => entry.date == this.getDate() || this.getDate() == "*")
        let filtered_type = filtered_date.filter(entry => this.getFilters().includes(entry.type.value))
        let filtered_search = filtered_type.filter(entry => entry.title.toLowerCase().includes(this.getSearch()))
        let sorted_list = filtered_search.sort((a, b) => a.date - b.date)

        this.populateEntriesList(sorted_list)

        this.checkEntriesList();
    }

    populateEntriesList(entries) {
        entries.forEach(entry => {
            const li = document.createElement("li");
            li.className = "c-program__entry"

            if(entry.thumbnail) {
                const background = document.createElement("img")
                background.className = "c-program__entryBackground"
                background.src = entry.thumbnail
                li.appendChild(background)
            }

            const info_wrapper = document.createElement("a")
            info_wrapper.className = "c-program__entryInfo"
            info_wrapper.href = this.getRsvp(entry.rsvp);
            info_wrapper.target = "_blank"

            const title = document.createElement("h2");
            title.innerHTML = `<span>${this.getIcon(entry.type.value)} - </span>${entry.title}`
            
            info_wrapper.appendChild(title)

            const organizers_wrapper = document.createElement("div")
            organizers_wrapper.className = "c-program__entryOrganizersWrapper"
            const organizers_title = document.createElement("h3")
            organizers_title.innerHTML = "Organizer(s)"
            const organizers = document.createElement("div")
            organizers.className = "c-program__entryOrganizers"
            const author = document.createElement("h5")
            author.innerHTML = entry.author.fullName;
            organizers.appendChild(author)
            entry.members.forEach(member => {
                const organizer = document.createElement("h6")
                organizer.innerHTML = member.fullName;
                organizers.appendChild(organizer)
            })
            organizers_wrapper.appendChild(organizers_title)
            organizers_wrapper.appendChild(organizers)
            info_wrapper.appendChild(organizers_wrapper)


            const date = document.createElement("h4")
            const dateString = new Date(entry.date).toLocaleString("en-GB", {
                month: "numeric",
                day: "numeric",
                year: "numeric"
            })
            const timeString = new Date(entry.time.date).toLocaleString("en-GB", {
                hour: "numeric",
                minute: "numeric"
            })
            date.innerHTML = `${entry.type.label} | ${dateString} - ${timeString}`
            info_wrapper.appendChild(date)


            li.appendChild(info_wrapper)

            this.list.appendChild(li)
        })
    }

    clearEntriesList() {
        this.list.innerHTML = "";
    }

    checkEntriesList() {
        if(this.list.children.length > 0) return;

        let message = document.createElement("h2");
        message.innerHTML = "no entries available"

        this.list.appendChild(message);
    }

    getSearch() {
        return this.search.value.toLowerCase();
    }

    getFilters() {
        let temp = [];

        this.filters.forEach((filter) => {
            if(filter.checked) temp.push(filter.dataset.value)
        })

        return temp;
    }

    getDate() {
        return this.date.value;
    }

    getIcon(type) {
        switch (type) {
            case 'lecture':
                return '<ion-icon name="school-outline"></ion-icon>'
            case 'workshop':
                return '<ion-icon name="cut-outline"></ion-icon>'
            case 'guidedTour':
                return '<ion-icon name="walk-outline"></ion-icon>'
            case 'drink':
                return '<ion-icon name="wine-outline"></ion-icon>'
            default:
                return '<ion-icon name="calendar-clear-outline"></ion-icon>';
        }
    }

    getRsvp(rsvp) {
        if(!rsvp) return "#";
        else if(rsvp.length <= 0) return "#";
        else if(/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(rsvp)) return `mailto:${rsvp}`;
        else if(!rsvp.includes("https://" || !rsvp.includes("http://"))) return "https://" + rsvp;
        else return rsvp;
    }

    // Partials
    // =========================================================================

    _registerFilterMenu() {
        this.filterButton.addEventListener("click", () => {
            this.filterList.classList.toggle('active')
        })
    }

    _registerFilterEvents() {
        this.search.addEventListener("input", () => this.filter());
        this.filters.forEach(filter => {
            filter.addEventListener("click", () => this.filter());
        });
        this.date.addEventListener("change", () => this.filter());
    }
}

new Program();