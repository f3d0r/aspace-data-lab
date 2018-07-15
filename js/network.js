function checkBlockIdExists(blockId, callback) {
    var settings = {
        "async": true,
        "crossDomain": true,
        "url": "https://api.trya.space/v1/parking/block_id_exists?block_id=" + blockId,
        "method": "GET",
        "headers": {}
    }

    $.ajax(settings).done(function (response) {
        if (response == "T") {
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
        "url": "https://api.trya.space/v1/parking/get_status_bbox",
        "method": "POST",
        "headers": {
            "content-type": "application/json"
        },
        "processData": false,
        "data": JSON.stringify(boundingBoxData)
    }

    $.ajax(settings).done(function (response) {
        callback(response);
    });
}

function getRadiusPoints(originLatLng, radius_feet, callback) {
    var originLatLngData = {};

    originLatLngData["lat"] = originLatLng.lat;
    originLatLngData["lng"] = originLatLng.lng;

    var settings = {
        "async": true,
        "crossDomain": true,
        "url": "https://api.trya.space/v1/parking/get_status_radius?radius_feet=" + radius_feet,
        "method": "POST",
        "headers": {
            "content-type": "application/json"
        },
        "processData": false,
        "data": JSON.stringify(originLatLngData)
    }

    $.ajax(settings).done(function (response) {
        callback(response);
    });
}

function getSpotsbyID(searchType, searchValue, callback) {
    var settings = {
        "async": true,
        "crossDomain": true,
        "url": "https://api.trya.space/v1/parking/get_status?" + searchType + "=" + searchValue,
        "method": "GET",
        "headers": {
            "content-type": "application/json"
        }
    }

    $.ajax(settings).done(function (response) {
        callback(response);
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
        callback(response);
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
        callback(response);
    });
}