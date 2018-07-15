var repeatRefresh;

$("#view_normal").click(function () {
    changeMode('NORMAL');
});

$("#view_live_feed").click(function () {
    changeMode('LIVE_FEED');

    refreshData();
    repeatRefresh = setInterval(function () {
        refreshData();
    }, aspace.refresh_interval_milli);
});

$("#split_to_strip").click(function () {
    // if (firstMarker == null || secondMarker == null) {
    //     alertify.error("Please select both points.");
    // } else {
    alertify
        .prompt("Please enter a block_id",
            function (val, ev) {
                ev.preventDefault();
                checkBlockIdExists(val, function () {
                    splitToPoints(val);
                });
            },
            function (ev) {
                ev.preventDefault();
                alertify.error("You've clicked Cancel");
            }
        );
    // }
});

$("#theme_default").click(function () {
    map.setStyle(mapbox.theme_default);
});

$("#theme_satellite").click(function () {
    map.setStyle(mapbox.theme_satellite);
});

$("#theme_aspace").click(function () {
    map.setStyle(mapbox.theme_aspace);
});

$("#api_bbox").click(function () {
    changeMode('API_TEST_BBOX');
    clearMap();
});

$("#api_radius").click(function () {
    changeMode('API_TEST_RADIUS');
    clearMap();

    state = MODE.API_TEST_RADIUS;

    var mapCenter = map.getCenter();
    var myCircle = new MapboxCircle({
        lat: mapCenter.lat,
        lng: mapCenter.lng
    }, 100, {
        editable: true,
        minRadius: 1,
        fillColor: '#29AB87'
    }).addTo(map);
    myCircle.on('contextmenu', function (mapMouseEvent) {
        feetRadius = myCircle.getRadius() / 0.3048;
        center = myCircle.getCenter();
        getRadiusPoints(center, feetRadius, function (spots) {
            var geojson = getGeoJsonFromPoints(spots);
            drawSpotsFromGeoJson(geojson, null);
            var bbox = turf.bbox(geojson);
            map.fitBounds(bbox, {
                padding: {
                    top: 75,
                    bottom: 50,
                    left: 25,
                    right: 25
                }
            });
            myCircle.remove();
        });
    });
});

$("#view_spot_id").click(function () {
    changeMode('API_TEST_VIEW_SPOT_STATUS');
    clearMap();
    alertify.prompt("Please enter the Spot ID you would like to view.", "Spot ID",
        function (evt, value) {
            getSpotsbyID('spot_id', value, function (spot) {
                if (spot.length == 0) {
                    alertify.error('Invalid Block ID');
                } else {
                    var geojson = getGeoJsonFromPoints(spot);
                    drawSpotsFromGeoJson(geojson, null);
                    map.flyTo({
                        zoom: 20,
                        center: [
                            spot[0].lng,
                            spot[0].lat,
                        ]
                    });
                }
            });
        }
    );
});

$("#view_block_id").click(function () {
    changeMode('API_TEST_VIEW_BLOCK_STATUS');
    clearMap();
    alertify.prompt("Please enter the Block ID you would like to view.", "Block ID",
        function (evt, value) {
            getSpotsbyID('block_id', value, function (spots) {
                if (spots.length == 0) {
                    alertify.error('Invalid Block ID');
                } else {
                    var geojson = getGeoJsonFromPoints(spots);
                    var bbox = turf.bbox(geojson);
                    drawSpotsFromGeoJson(geojson, currentClickedSpotID);
                    map.fitBounds(bbox, {
                        padding: {
                            top: 75,
                            bottom: 50,
                            left: 25,
                            right: 25
                        }
                    });
                }
            });
        }
    );
});

$("#create_individual_spot").click(function () {
    changeMode('CREATE_DATA_BY_SPOT');
    drawControl.changeMode('draw_point');
});

$("#create_spot_strip").click(function () {
    changeMode('CREATE_DATA_BY_STRIP');
    drawControl.changeMode('draw_line_string');
});