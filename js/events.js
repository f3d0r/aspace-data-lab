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
    if (state == MODE.API_TEST_BBOX) {

    }
});

map.on('zoomend', function(e) {
    if (currentMode == MODE.API_TEST_BBOX) {

    }
    // console.log(map.getBounds());
    // getBboxPoints(map.getBounds());
});

map.on('moveend', function(e) {
    if (currentMode == MODE.LIVE_FEED) {
        refreshData();
    }
});