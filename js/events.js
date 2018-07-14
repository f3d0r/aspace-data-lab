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
    changeMode('NORMAL');
    // Add styles to the map
    alertify.success(strings.welcomeString);
});

map.on('mousemove', function (e) {
    var lng = e.lngLat.lng + "";
    var lat = e.lngLat.lat + "";
    lng = lng.substring(0, lng.indexOf('.') + 5);
    lat = lat.substring(0, lat.indexOf('.') + 5);
    legend.innerHTML = "Mouse Lng/Lat: (" + lng + ", " + lat + ")";
});

map.on('click', function (e) {
    console.log("MAP CLICKED!");
    if (currentMode == MODE.API_TEST_BBOX) {

    }
});

map.on('zoomend', function (e) {
    if (currentMode == MODE.API_TEST_BBOX) {

    }
    // console.log(map.getBounds());
    // getBboxPoints(map.getBounds());
});

map.on('moveend', function (e) {
    if (currentMode == MODE.LIVE_FEED) {
        refreshData();
    }
});

map.on('draw.create', glDrawCreate);
map.on('draw.update', glDrawUpdate)

function glDrawCreate(e) {
    var data = drawControl.getAll();
    var bbox = turf.bbox(data);
    // drawControl.deleteAll();
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
}

function glDrawUpdate(e) {
    alertify.dismissAll();
    alertify.message("Press <a onclick=\"glDrawCreate();\" href=\"#\">here</a> to re-size the bounding box.");
}