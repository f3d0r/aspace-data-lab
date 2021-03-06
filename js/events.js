mapboxgl.accessToken = mapbox.access_token;

var map = new mapboxgl.Map({
    container: 'map',
    style: mapbox.theme_default,
    center: mapbox.default_zoomin,
    zoom: mapbox.zoom,
    maxZoom: mapbox.maxZoom,
    minZoom: mapbox.minZoom,
    attributionControl: false
});

map.on('load', function () {
    initMapControls();
    updateMouseLatLng({
        lngLat: map.getCenter()
    });
    changeMode('NORMAL');
    alertify.success(strings.welcomeString);
});

var currentDrawFeatures = null;
var confirm = false;

var currentRouteType = null;
var currentRouteDebugging = null;

map.on('mousemove', function (e) {
    updateMouseLatLng(e);
});

map.on('click', function (e) {
    if (currentMode == MODE.CREATE_DATA_BY_STRIP) {
        if (drawControl.getSelected().features.length > 0) {
            if (drawControl.getSelected().features[0].geometry.coordinates.length > 2) {
                alertify.error("You've selected more than two points. Press <a href=\"#\">here</a> to delete this line.");
            } else if (drawControl.getSelected().features[0].geometry.coordinates.length == 2) {
                alertify.prompt("Please enter a Block ID for this strip.", "Block ID",
                    function (evt, value) {
                        checkBlockIdExists(value, function (blockID) {
                            splitToPoints(blockID, drawControl.getSelected());
                        });
                    },
                    function () {});
            }
        }
    } else if (currentMode == MODE.API_TEST_BBOX) {

    } else if (currentMode == MODE.CREATE_DATA_BY_SPOT) {
        if (drawControl.getSelected().features.length > 0) {
            if (confirm) {
                confirm = false;
                addSpots(toSqlInsert(drawControl.getSelected(), "-1"), function (response) {
                    if (response == "SUCCESS!") {
                        alertify.success("Spot ID successfully added. Go to normal mode to refresh.");
                    } else {
                        alertify.error("An error occurred attempting to add this spot to the database.");
                    }
                });
                drawControl.deleteAll();
            } else if (drawControl.getSelected().features.length == 1) {
                alertify.message("Press again on this spot to upload it to the database.");
                confirm = true;
            }
        } else if (drawControl.getSelected().features.length == 0) {
            if (confirm) {
                drawControl.deleteAll();
                confirm = false;
            } else {
                alertify.message("Press away from this spot again to remove it from the map.");
                confirm = true;
            }
        }
    } else if (currentMode == MODE.API_ROUTING_PROD || currentMode == MODE.API_ROUTING_DEV) {
        if (drawControl.getAll().features.length < 2) {
            drawControl.changeMode('draw_point');
        } else {
            var latLngs = [];
            for (var index = 0; index < drawControl.getAll().features.length; index++) {
                if (index == 0) {
                    popupString = "<h2>Origin</h2>";
                } else {
                    popupString = "<h2>Destination</h2>";
                }
                lng = decimalCutoff(drawControl.getAll().features[index].geometry.coordinates[0], 5);
                lat = decimalCutoff(drawControl.getAll().features[index].geometry.coordinates[1], 5)
                latLngs.push([lng, lat]);
                popupString += "[" + lng + ", " + lat + "]";

                var popup = new mapboxgl.Popup({
                        offset: 25
                    })
                    .setHTML(popupString);

                var currentMarker = new mapboxgl.Marker()
                    .setLngLat(drawControl.getAll().features[index].geometry.coordinates)
                    .setPopup(popup)
                    .addTo(map);

            }
            changeMode('PREVIEW_ROUTE');
            toggleDrawTools(false);
            getRoute(latLngs[0][0], latLngs[0][1], latLngs[1][0], latLngs[1][1], currentRouteType, currentRouteDebugging, function (routes) {
                drawRoute(routes[0].map(val => val.directions.routes[0].geometry));
                drawPoints(routes[0].map(val => val.dest));
                drawPoints(routes[0].map(val => val.origin));
            });
        }
    }
});

map.on('zoomend', function (e) {
    if (currentMode == MODE.API_TEST_BBOX) {

    }
});

map.on('moveend', function (e) {
    if (currentMode == MODE.LIVE_FEED) {
        refreshData();
    }
});

map.on('draw.create', function (e) {
    if (currentMode == MODE.CREATE_DATA_BY_SPOT) {

    } else if (currentMode == MODE.CREATE_DATA_BY_STRIP) {

    } else if (currentMode == MODE.API_TEST_BBOX) {
        bbox = glDrawBox(e);
        getBboxPoints(bbox, function (spots) {
            clearMap();
            var geojson = getGeoJsonFromPoints(spots);
            drawSpotsFromGeoJson(geojson);
        });
    }
    currentDrawFeatures = drawControl.getAll();
});

map.on('draw.update', function (e) {
    if (currentMode == MODE.CREATE_DATA_BY_SPOT) {

    } else if (currentMode == MODE.CREATE_DATA_BY_STRIP) {

    } else if (currentMode == MODE.API_TEST_BBOX) {
        if (!checkBboxSame()) {
            alertify.dismissAll();
            alertify.message("Press <a onclick=\"glDrawUpdate();\" href=\"#\">here</a> to re-size the bounding box.");
        } else {
            glDrawUpdate();
        }
    }
    currentDrawFeatures = drawControl.getAll();
});

function glDrawBox(e) {
    var data = drawControl.getAll();
    var bbox = turf.bbox(data);
    drawControl.set({
        type: 'FeatureCollection',
        features: [{
            type: 'Feature',
            properties: {},
            id: 'example-id',
            geometry: {
                type: 'Polygon',
                coordinates: [
                    [
                        [bbox[0], bbox[1]],
                        [bbox[0], bbox[3]],
                        [bbox[2], bbox[3]],
                        [bbox[2], bbox[1]],
                        [bbox[0], bbox[1]]
                    ]
                ]
            }
        }]
    });
    map.fitBounds(bbox, {
        padding: {
            top: 150,
            bottom: 125,
            left: 25,
            right: 25
        }
    });
    return {
        _sw: {
            lng: bbox[0],
            lat: bbox[1]
        },
        _ne: {
            lng: bbox[2],
            lat: bbox[3]
        }
    }
}

function glDrawUpdate() {
    bbox = glDrawBox();
    getBboxPoints(bbox, function (spots) {
        clearMap();
        var geojson = getGeoJsonFromPoints(spots);
        drawSpotsFromGeoJson(geojson);
    });
}

function checkBboxSame() {
    var side1New = Math.abs(drawControl.getAll().features[0].geometry.coordinates[0][1][0] - drawControl.getAll().features[0].geometry.coordinates[0][0][0]);
    var side1Old = Math.abs(currentDrawFeatures.features[0].geometry.coordinates[0][1][0] - currentDrawFeatures.features[0].geometry.coordinates[0][0][0]);

    var side2New = Math.abs(drawControl.getAll().features[0].geometry.coordinates[0][2][1] - drawControl.getAll().features[0].geometry.coordinates[0][1][1]);
    var side2Old = Math.abs(currentDrawFeatures.features[0].geometry.coordinates[0][2][1] - currentDrawFeatures.features[0].geometry.coordinates[0][1][1]);

    var side3New = Math.abs(drawControl.getAll().features[0].geometry.coordinates[0][3][0] - drawControl.getAll().features[0].geometry.coordinates[0][2][0]);
    var side3Old = Math.abs(currentDrawFeatures.features[0].geometry.coordinates[0][3][0] - currentDrawFeatures.features[0].geometry.coordinates[0][2][0]);

    var side4New = Math.abs(drawControl.getAll().features[0].geometry.coordinates[0][4][1] - drawControl.getAll().features[0].geometry.coordinates[0][3][1]);
    var side4Old = Math.abs(currentDrawFeatures.features[0].geometry.coordinates[0][4][1] - currentDrawFeatures.features[0].geometry.coordinates[0][3][1]);

    return side1New == side1Old && side2New == side2Old && side3New == side3Old && side4New == side4Old;
}

function createRoute(isDebug, routeType) {
    currentRouteDebugging = isDebug;
    currentRouteType = routeType;
    toggleDrawTools(true, ['point']);
    drawControl.changeMode('draw_point');
    if (isDebug) {
        changeMode('API_ROUTING_DEV')
    } else {
        changeMode('API_ROUTING_PROD')
    }
}

function drawRoute(routeGeometries) {
    var index = 0;
    routeGeometries.forEach(function (currentGeometry) {
        map.addLayer({
            "id": Math.floor(Math.random() * 1000) + "-route-" + index,
            "type": "line",
            "source": {
                "type": "geojson",
                "data": {
                    "type": "Feature",
                    "properties": {},
                    "geometry": currentGeometry
                }
            },
            "layout": {
                "line-join": "round",
                "line-cap": "round"
            },
            "paint": {
                "line-color": "#888",
                "line-width": 4
            }
        });
        index++;
    });
}

function drawPoints(points) {
    points.forEach(function (currentPoint) {
        lng = decimalCutoff(currentPoint.lng, 5);
        lat = decimalCutoff(currentPoint.lat, 5);

        if (typeof currentPoint.meta != 'undefined' && typeof currentPoint.meta.type != 'undefined') {
            popupHTML = "<h2>" + currentPoint.meta.type + "</h2>";
            popupHTML += "<h3>[" + lng + ", " + lat + "]</h3>";

            if (currentPoint.meta.type == "bike") {
                popupHTML += "<h3>ID: " + currentPoint.meta.id + "</h3>";
                popupHTML += "<h3>Company: " + currentPoint.meta.company + "</h3>";
                popupHTML += "<h3>Bike Num: " + currentPoint.meta.num + "</h3>";
            } else if (currentPoint.meta.type == "parking") {
                popupHTML += "<h3>Index: " + currentPoint.meta.id + "</h3>";
                popupHTML += "<h3>Name: " + currentPoint.meta.name + "</h3>";
                popupHTML += "<h3>Parking Price: $" + currentPoint.meta.parking_price + "</h3>";

            }
            var popup = new mapboxgl.Popup({
                    offset: 25
                })
                .setHTML(popupHTML);

            var currentMarker = new mapboxgl.Marker()
                .setLngLat([currentPoint.lng, currentPoint.lat])
                .setPopup(popup)
                .addTo(map);
        }
    });
}