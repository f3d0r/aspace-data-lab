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
    }
    if (currentMode == MODE.API_TEST_BBOX) {

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