// <----------------------- INITIALIZATION ------------------------------------>

// <----------------------- END INITIALIZATION ------------------------------------>

// <----------------------- MAP NAVIGATION ------------------------------------>

var drawControl;

function initMapControls() {
    map.addControl(new MapboxGeocoder({
        accessToken: mapboxgl.accessToken
    }), 'top-right');
    map.addControl(new mapboxgl.FullscreenControl(), 'bottom-left');
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
        controls: {
            polygon: true,
            trash: true
        }
    });
}

// <----------------------- END MAP NAVIGATION ------------------------------------>

// <----------------------- STATE ------------------------------------>
var currentLiveFeed = false;
var serverMarkers;
var firstMarker = null;
var secondMarker = null;
var editMode = false;
var viewMode = true;

var state = MODE.NORMAL;

// <----------------------- END STATE ------------------------------------>

// <----------------------- HTML INIT ------------------------------------>
var distanceContainer = document.getElementById('distance');
var legend = document.getElementById('legend');

// <----------------------- HTML INIT ------------------------------------>

function drawLine(startLngLat, endLngLat) {
    var positions = [
        [startLngLat.lng, startLngLat.lat],
        [endLngLat.lng, endLngLat.lat]
    ];

    var line =
        map.addLayer({
            "id": "point",
            "type": "circle",
            "source": "point",
            "paint": {
                "circle-radius": 10,
                "circle-color": "#3887be"
            }
        });
}

function clearMap() {
    $.each(serverMarkers, function (i, marker) {
        serverMarkers[i].remove();
    });
    if (firstMarker != null) {
        firstMarker.remove();
        firstMarker = null;
    }
    if (secondMarker != null) {
        secondMarker.remove();
        secondMarker = null;
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

function splitToPoints(blockId) {
    var line = turf.lineString([
        [firstMarker.getLngLat().lng, firstMarker.getLngLat().lat],
        [secondMarker.getLngLat().lng, secondMarker.getLngLat().lat]
    ]);

    var chunk = turf.lineChunk(line, aspace.sensor_delta_feet / mapbox.feet_in_mile, {
        units: 'miles'
    });
    var data = "[";
    for (var index = 0; index < chunk.features.length; index++) {
        var point1 = turf.point([chunk.features[index].geometry.coordinates[0][0], chunk.features[index].geometry.coordinates[0][1]]);
        var point2 = turf.point([chunk.features[index].geometry.coordinates[1][0], chunk.features[index].geometry.coordinates[1][1]]);
        currentMarker = turf.midpoint(point1, point2);
        data += "{ \"lng\": \"" + currentMarker.geometry.coordinates[0] + "\", \"lat\": \"" + currentMarker.geometry.coordinates[1] + "\", \"block_id\" : \"" + blockId + "\"}"
        if (index < chunk.features.length - 1) {
            data += ", ";
        } else {
            data += "]";
        }
    }

    console.log(data);
    uploadStrip(data, blockId);
}

function changeTheme(newThemeURL) {
    map.setStyle(newThemeURL);
}

function apiBbox() {
    currentMode = MODE.API_TEST_BBOX
    toggleDrawTools(true);
    var drawCircles = [];
    getBboxPoints(map.getBounds(), function (spots) {
        var geojson = getGeoJsonFromPoints(spots);

        geojson.features.forEach(function (currentSpot) {
            var el = document.createElement('div');
            var occupancyStatus = currentSpot.properties.occupied;
            if (occupancyStatus == 'F') {
                el.className = 'marker-vacant';
            } else if (occupancyStatus == 'T') {
                el.className = 'marker-occupied';
            } else {
                el.className = 'marker-occupied';
            }
            new mapboxgl.Marker(el)
                .setLngLat(currentSpot.geometry.coordinates)
                .setPopup(new mapboxgl.Popup({
                        offset: 25
                    }) // add popups
                    .setHTML('<h3>Spot ID: ' + currentSpot.properties.spot_id + '</h3><p>Block ID:' + currentSpot.properties.block_id + '</p><p>Occupied: ' + currentSpot.properties.occupied + '</p>'))
                .addTo(map);
        });
    });
}

function toggleDrawTools(displayed) {
    if (displayed) {
        map.addControl(drawControl, 'bottom-right');
    } else {
        map.removeControl(drawControl);
    }
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
    console.log(returnJson);
    return returnJson;

}