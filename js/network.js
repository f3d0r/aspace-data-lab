function checkBlockIdExists(blockId, callback) {
    var settings = {
        "async": true,
        "crossDomain": true,
        "url": "https://api.trya.space/v1/parking/block_id_exists?block_id=" + blockId,
        "method": "GET",
        "headers": {}
    }

    $.ajax(settings).done(function (response) {
        if (response.res_content == "T") {
            alertify.error("The block_id you entered already exists");
        } else {
            callback(blockId);
        }
    });
}

function getBboxPoints(boundingBox, callback) {
    var boundingBoxData = {};
    boundingBoxData["ne"] = boundingBox._ne;
    boundingBoxData["sw"] = boundingBox._sw;

    var settings = {
        "async": true,
        "crossDomain": true,
        "url": "https://api.trya.space/v1/parking/get_status_bbox/json",
        "method": "POST",
        "headers": {
            "content-type": "application/json"
        },
        "processData": false,
        "data": JSON.stringify(boundingBoxData)
    }

    $.ajax(settings).done(function (response) {
        callback(response.res_content);
    });
}

function getRadiusPoints(originLatLng, radius_feet, callback) {
    var originLatLngData = {};

    originLatLngData["lat"] = originLatLng.lat;
    originLatLngData["lng"] = originLatLng.lng;

    var settings = {
        "async": true,
        "crossDomain": true,
        "url": "https://api.trya.space/v1/parking/get_status_radius/json?radius_feet=" + radius_feet,
        "method": "POST",
        "headers": {
            "content-type": "application/json"
        },
        "processData": false,
        "data": JSON.stringify(originLatLngData)
    }

    $.ajax(settings).done(function (response) {
        callback(response.res_content);
    });
}

function getSpotsbyID(searchType, searchValue, callback) {
    var settings = {
        "async": true,
        "crossDomain": true,
        "url": "https://api.trya.space/v1/parking/get_status/json?" + searchType + "=" + searchValue,
        "method": "GET",
        "headers": {
            "content-type": "application/json"
        }
    }

    $.ajax(settings).done(function (response) {
        callback(response.res_content);
    });
}

function updateSpotStatus(spotId, newStatus, callback) {
    var settings = {
        "async": true,
        "crossDomain": true,
        "url": "https://api.trya.space/v1/parking/update_status?auth_key=" + aspace.auth_key + "&spot_id=" + spotId + "&occupied=" + newStatus,
        "method": "POST",
        "headers": {}
    }

    $.ajax(settings).done(function (response) {
        callback(response.res_info.code);
    });
}

function addSpots(spotsJSON, callback) {
    var settings = {
        "async": true,
        "crossDomain": true,
        "url": "https://api.trya.space/v1/parking/upload_spots?auth_key=" + aspace.auth_key,
        "method": "POST",
        "headers": {
            "content-type": "application/json"
        },
        "processData": false,
        "data": spotsJSON
    }

    $.ajax(settings).done(function (response) {
        callback(response.res_content);
    });
}

function getRoute(originLng, originLat, destLng, destLat, routeType, debugging, callback) {
    var settings = {
        "async": true,
        "crossDomain": true,
        "url": getRouteBaseURL(debugging) + getRouteExtension(routeType) + "?origin_lat=" + originLat + "&origin_lng=" + originLng + "&dest_lat=" + destLat + "&dest_lng=" + destLng + "&session_starting=0&access_code=null&device_id=null",
        "method": "POST",
        "processData": false,
    }

    $.ajax(settings).done(function (response) {
        callback(response.res_content.routes);
    });
}

function getRouteExtension(routeType) {
    if (routeType == "drive_direct") {
        return "get_drive_direct_route/";
    } else if (routeType == "park_bike") {
        return "get_drive_bike_route/";
    } else {
        return "get_drive_walk_route/";
    }
}

function getRouteBaseURL(debugging) {
    if (debugging) {
        return "https://routing-dev.trya.space/v1/";
    } else {
        return "https://routing.trya.space/v1/";
    }
}