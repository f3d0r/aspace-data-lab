$("#export").click(function () {
    // exportFunction();
});

$("#start_point").click(function () {
    if (firstMarker != null) {
        firstMarker.remove();
    }
    firstMarker = null;
});

$("#end_point").click(function () {
    if (secondMarker != null) {
        secondMarker.remove();
    }
    secondMarker = null;
});

$("#draw_line").click(function () {
    if (firstMarker != null && secondMarker != null) {
        drawLine(firstMarker.getLngLat(), secondMarker.getLngLat());
    }
});

$("#view_live_feed").click(function () {
    currentLiveFeed = true;
    alertify.message("Viewing live data feed.");
});

$("#clear_map").click(function () {
    clearMap();
});

$("#split_to_strip").click(function () {
    if (firstMarker == null || secondMarker == null) {
        alertify.error("Please select both points.");
    } else {
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
    }
});

$("#theme_default").click(function () {
    changeTheme(mapbox.theme_default);
});

$("#theme_satellite").click(function () {
    changeTheme(mapbox.theme_satellite);
});

$("#theme_aspace").click(function () {
    changeTheme(mapbox.theme_aspace);
});

$("#api_bbox").click(function () {
    apiBbox();
});

var geojson = {
    "type": "FeatureCollection",
    "features": [{
            "type": "Feature",
            "properties": {
                "message": "Foo",
                "marker-symbol": "monument"
            },
            "geometry": {
                "type": "Point",
                "coordinates": [-66.324462890625, -16.024695711685304]
            }
        },
        {
            "type": "Feature",
            "properties": {
                "message": "Bar",
                "marker-symbol": "monument"
            },
            "geometry": {
                "type": "Point",
                "coordinates": [-61.2158203125, -15.97189158092897]
            }
        },
        {
            "type": "Feature",
            "properties": {
                "message": "Baz",
                "marker-symbol": "monument"
            },
            "geometry": {
                "type": "Point",
                "coordinates": [-63.29223632812499, -18.28151823530889]
            }
        }
    ]
};

$("#api_radius").click(function () {
    mode = MODE.API_TEST_RADIUS;
    map.addSource('id', {
        type: 'geojson',
        data: geojson
    });
    // // add markers to map
    // geojson.features.forEach(function (marker) {

    //     // create a HTML element for each feature
    //     var el = document.createElement('div');
    //     el.className = 'marker';

    //     // make a marker for each feature and add to the map
    //     new mapboxgl.Marker(el)
    //         .setLngLat(marker.geometry.coordinates)
    //         .addTo(map);
    // });
});