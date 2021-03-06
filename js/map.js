// <----------------------- END MAP NAVIGATION --------------------------->

var drawControl;

function initMapControls() {
    map.addControl(new MapboxGeocoder({
        accessToken: mapboxgl.accessToken
    }), 'top-right');
    map.addControl(new mapboxgl.NavigationControl(), 'bottom-left');
    var scale = new mapboxgl.ScaleControl({
        maxWidth: 150,
        unit: 'imperial'
    });
    map.addControl(scale, 'bottom-right');
    map.addControl(new mapboxgl.GeolocateControl({
        positionOptions: {
            enableHighAccuracy: true
        },
        trackUserLocation: true
    }), 'bottom-left');
    drawControl = new MapboxDraw({
        displayControlsDefault: false,
        default_mode: 'draw_polygon',
        controls: {
            polygon: true,
            trash: true,
            userProperties: true
        }
    });
}

// <----------------------- END MAP NAVIGATION --------------------------->

// <----------------------- STATE ---------------------------------------->
var serverMarkers;

var drawnStatuses = [];

var currentClickedSpotID = null;
var currentClickedSpotIDText = null;

var currentMode;

// <----------------------- END STATE ------------------------------------>

// <----------------------- HTML INIT ------------------------------------>
var distanceContainer = document.getElementById('distance');
var legend = document.getElementById('legend');
var mode = document.getElementById('mode');

// <----------------------- END HTML INIT -------------------------------->

function clearMap() {
    while (drawnStatuses.length > 0) {
        drawnStatuses.pop().remove();
    }
}

function toggleSearch(enabled) {
    $(".mapboxgl-ctrl-geocoder").find(':input').prop("disabled", !enabled);
    if (enabled) {
        $(".mapboxgl-ctrl-geocoder").find(':input').css('background-color', '')
    } else {
        $(".mapboxgl-ctrl-geocoder").find(':input').css('background-color', '#BEBEBE');
    }
}

function toggleDrawTools(displayed, displayedControls) {
    if (displayed) {
        options = {
            'trash': true
        }
        if (typeof displayedControls != 'undefined' && displayedControls != null && displayedControls.length > 0) {
            displayedControls.forEach(function (current) {
                options[current] = true
            });
            try {
                map.removeControl(drawControl);
                drawControl = new MapboxDraw({
                    displayControlsDefault: false,
                    default_mode: 'draw_polygon',
                    userProperties: true,
                    controls: options
                });
            } catch (e) {
                drawControl = new MapboxDraw({
                    displayControlsDefault: false,
                    default_mode: 'draw_polygon',
                    controls: {
                        polygon: true,
                        trash: true,
                        userProperties: true
                    }
                });
                map.addControl(drawControl, 'bottom-left');
            }
        }
    } else {
        map.removeControl(drawControl);
    }
}

function splitToPoints(blockId, geojson) {
    var chunk = turf.lineChunk(geojson, aspace.sensor_delta_feet / mapbox.feet_in_mile, {
        units: 'miles'
    });
    addSpots(toMidpointSqlInsert(chunk, blockId), function (response) {
        if (response == "SUCCESS!") {
            alertify.success("Block ID " + blockId + " added successfully. Go to normal mode to refresh.");
        } else {
            alertify.error("An error occurred attempting to add " + blockId + " to the database.");
        }
    });
}

function toMidpointSqlInsert(geojson, blockId) {
    var data = "[";
    for (var index = 0; index < geojson.features.length; index++) {
        var point1 = turf.point([geojson.features[index].geometry.coordinates[0][0], geojson.features[index].geometry.coordinates[0][1]]);
        var point2 = turf.point([geojson.features[index].geometry.coordinates[1][0], geojson.features[index].geometry.coordinates[1][1]]);
        currentMarker = turf.midpoint(point1, point2);
        data += "{\"lng\": \"" + currentMarker.geometry.coordinates[0] + "\", \"lat\": \"" + currentMarker.geometry.coordinates[1] + "\", \"block_id\" : \"" + blockId + "\"}"
        if (index < geojson.features.length - 1) {
            data += ", ";
        } else {
            data += "]";
        }
    }
    return data;
}

function toSqlInsert(geojson, blockId) {
    var data = "[";
    for (var index = 0; index < geojson.features.length; index++) {
        var lng = geojson.features[index].geometry.coordinates[0];
        var lat = geojson.features[index].geometry.coordinates[1];
        data += "{\"lng\": \"" + lng + "\", \"lat\": \"" + lat + "\", \"block_id\" : \"" + blockId + "\"}"
        if (index < geojson.features.length - 1) {
            data += ", ";
        } else {
            data += "]";
        }
    }
    return data;
}

function drawSpotsFromGeoJson(geojson, currentSpotIDPopup) {
    var markers = [];
    geojson.features.forEach(function (currentSpot) {
        var el = document.createElement('div');
        var occupancyStatus = currentSpot.properties.occupied;
        if (occupancyStatus == 'F') {
            el.className = 'marker-vacant';
        } else if (occupancyStatus == 'T') {
            el.className = 'marker-occupied';
        } else {
            el.className = 'marker-notavailable';
        }
        var onClickFunction = "switchSpotStatus(" + currentSpot.properties.spot_id + ', ' + 'document.getElementById(\'newStatus\').value);';
        var html = '<h3>Spot ID: ' + currentSpot.properties.spot_id + ' // Block ID: ' + currentSpot.properties.block_id + '</h3>' +
            '<p>Occupied: ' + currentSpot.properties.occupied + '</p>' +
            '<p>New Status: <input type="text" id="newStatus"' +
            'onchange="inputTextChange(' + currentSpot.properties.spot_id + ', document.getElementById(\'newStatus\').value);">' +
            '<button type="submit" value="Update Status" onclick="' + onClickFunction + '">Submit</button></p>';
        var popup = new mapboxgl.Popup({
                offset: 15
            })
            .setHTML(html);
        var currentMarker = new mapboxgl.Marker(el)
            .setLngLat(currentSpot.geometry.coordinates)
            .setPopup(popup)
            .addTo(map);
        if (currentSpotIDPopup != null && currentSpotIDPopup == currentSpot.properties.spot_id) {
            currentMarker.togglePopup();
            document.getElementById("newStatus").focus();
            if (currentClickedSpotIDText != null) {
                document.getElementById("newStatus").value = currentClickedSpotIDText;
            }
        }
        el.addEventListener('click', () => {
            currentClickedSpotID = currentSpot.properties.spot_id;
            map.flyTo({
                zoom: 22,
                center: [
                    currentSpot.properties.lng,
                    currentSpot.properties.lat,
                ]
            });
        });
        drawnStatuses.push(currentMarker);
    });
}

function inputTextChange(spot_id, newText) {
    currentClickedSpotIDText = newText;
}

function switchSpotStatus(spotId, newStatus) {
    updateSpotStatus(spotId, newStatus, function (responseCode) {
        if (responseCode != 19) {
            alertify.error('The spot status could not be changed.');
        } else {
            alertify.success('Spot ID ' + spotId + " status changed to '" + newStatus + "'.");
            getBboxPoints(map.getBounds(), function (spots) {
                clearMap();
                var geojson = getGeoJsonFromPoints(spots);
                drawSpotsFromGeoJson(geojson, currentClickedSpotID);
            });
        }
    });
}

function getGeoJsonFromPoints(spots) {
    var returnJson = {};
    returnJson["features"] = [];
    returnJson["type"] = "FeatureCollection";

    spots.forEach(function (currentSpot) {
        var currentJson = {};
        currentJson["type"] = "Feature";
        currentJson["properties"] = currentSpot;
        currentJson["geometry"] = {};
        currentJson["geometry"].coordinates = [currentSpot.lng, currentSpot.lat];
        currentJson["geometry"].type = "Point";
        returnJson["features"].push(currentJson);
    });
    return returnJson;
}

function changeMode(newMode) {
    if (currentMode == MODE.CREATE_DATA_BY_SPOT || currentMode == MODE.CREATE_DATA_BY_STRIP || currentMode == MODE.API_TEST_BBOX) {
        toggleDrawTools(false);
    }

    currentClickedSpotIDText = null;
    currentClickedSpotID = null;

    clearMap();

    if (newMode != 'LIVE_FEED') {
        clearInterval(repeatRefresh);
    }

    if (newMode == 'CREATE_DATA_BY_SPOT' || newMode == 'CREATE_DATA_BY_STRIP' || newMode == 'API_TEST_BBOX') {
        toggleDrawTools(true, ['polygon']);
    }

    currentMode = MODE[newMode];
    mode.innerHTML = strings[newMode];
    mode.style.backgroundColor = colors[newMode];

    alertify.message(strings[newMode]);
}

function refreshData() {
    getBboxPoints(map.getBounds(), function (spots) {
        clearMap();
        var geojson = getGeoJsonFromPoints(spots);
        drawSpotsFromGeoJson(geojson, currentClickedSpotID);
    });
}

function updateMouseLatLng(e) {
    var lng = decimalCutoff(e.lngLat.lng, 5);
    var lat = decimalCutoff(e.lngLat.lat, 5);
    legend.innerHTML = "Lng/Lat: (" + lng + ", " + lat + ")";
}