/* global L */


import { createElement } from './utils.js';

export const addMap = async (counter) => {
    const bikeDiv = document.getElementById("bike-container");
    const bikeList = createElement("ul.bike-list");

    bikeDiv.appendChild(bikeList);
    const map = L.map('map').setView([59.34392202335363, 18.048605404461142], 12);

    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(map);
    for (const cityid of [1, 2, 3]) {
        const cityFile = await fetch(`../../cities/${cityid}.json`);
        const city = await cityFile.json();
        let geojsonFeature = city.coords;
        L.geoJSON(geojsonFeature, {
            style: {
                color: '#eb1c0d',
                fillOpacity: 0
            }
        }).addTo(map);
    
        for (const zone of city.forbidden) {
            if (zone.properties.role === "forbidden") {
                L.geoJSON(zone, {
                    style: {
                    color: '#eb1c0d',
                    fillColor: '#eb1c0d',
                    fillOpacity: 0.3
                }
                }).addTo(map);
            }

        }
    }

    for (let i = 1; i < counter; i++) {
        const file = await fetch(`../../bike-routes/${i}.json`);
        const bike = await file.json();
        const bikeItem = createElement("li.bike-item.no-wrap",
        {},
        { innerText: `Bike ${i}`});
        bikeList.appendChild(bikeItem);
        const routeList = createElement("ul.route-list");
        bikeItem.appendChild(routeList);

        for (let j = 0; j<bike.trips.length; j++) {
            const bikeCoords = [];
            for (const coord of bike.trips[j].coords) {
                const geoJsonPoint = {
                    type: "Feature",
                    properties: {},
                    geometry: {
                        "type": "Point",
                        "coordinates": coord
                    }
                }
                const marker = L.geoJSON(
                    geoJsonPoint).bindPopup(`Bike ${i}, route ${j+1}, user: ${bike.trips[j].user.id}, ${bike.trips[j].summary.distance} meter, ${Math.floor(bike.trips[j].summary.duration/60)} min ${Math.round(bike.trips[j].summary.duration % 60)} sec`);
                bikeCoords.push(marker);
            }
            const bikeRoute = L.layerGroup(bikeCoords);


            const routeItem = createElement("li.route-item");
            routeList.appendChild(routeItem);
            const content = createElement("span.no-wrap",
            {},
            {innerText: `Route ${j+1}: `});
            const checkBox = createElement("input",
            {"type": "checkbox"});
            const content2 = createElement("span.no-wrap",
            {},
            {innerText: `${bike.trips[j].coords.length} points`});
            routeItem.appendChild(content);
            routeItem.appendChild(content2);
            routeItem.appendChild(checkBox);
            checkBox.addEventListener("change",() => {
                if (checkBox.checked == true) {
                    bikeRoute.addTo(map);
                } else {
                    map.removeLayer(bikeRoute);
                    console.log("removed", bikeRoute);
                }
            });
        }
    }
}