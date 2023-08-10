const search = document.querySelector(".c-member__search");
const results = document.querySelector(".c-member__results");
const members = JSON.parse(results.dataset.members)
const related = JSON.parse(results.dataset.related)

search.addEventListener("input", () => {
    results.innerHTML = "";

    const filter = members.filter((val) => val.name.toLowerCase().includes(search.value.toLowerCase()));
    
    filter.forEach((item) => {
        if(results.children.length >= 10) return;

        const li = document.createElement("li");
        const label = document.createElement("label");
        const input = document.createElement("input");

        input.type = "checkbox"
        input.name = "fields[member][]"
        input.value = item.id
        label.innerHTML = item.name

        let relation = related.indexOf(item.id.toString());

        if(relation > -1) input.checked = true;

        li.appendChild(label)
        label.appendChild(input)
        results.appendChild(li)
    })
})