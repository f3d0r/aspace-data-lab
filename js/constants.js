// MAPBOX CONSTANTS
var mapbox = {
    access_token: '***REMOVED***',
    default_zoomin: [-122.32076559745069, 47.61561766959997],
    zoom: 16,
    maxZoom: 19,
    minZoom: 12,
    feet_in_mile: 5280,
    theme_default: '***REMOVED***',
    theme_satellite: '***REMOVED***',
    theme_satellite_w_streets: '***REMOVED***',
    theme_aspace: '***REMOVED***'
};

// ASPACE CONSTANTS
var aspace = {
    sensor_delta_feet: 4,
    auth_key: '***REMOVED***',
    refresh_interval_milli: 2000
};

var MODE = {
    NORMAL: '42052546-7caf-53a5-968b-ad5515d21432',
    CREATE_DATA_BY_SPOT: 'bcf83de2-6148-593b-834b-d010df4c4bd5',
    CREATE_DATA_BY_STRIP: '4c0896f7-7c33-560b-b3a2-c4c1b0c516f1',
    LIVE_FEED: '9075cb12-9012-5da2-af88-fc9b7d6628cb',
    API_TEST_RADIUS: 'b08f5e37-a7bb-577d-a023-5013e1d27aa8',
    API_TEST_BBOX: '4d19cf93-b8bf-5303-84c2-ac793bc7eb02',
    API_TEST_VIEW_SPOT_STATUS: 'e69207d5-8226-53b5-92ed-ac9bf26f6316',
    API_TEST_VIEW_BLOCK_STATUS: '5532d991-0342-5b6f-8bf2-fbc6cbb638ef',
    API_ROUTING_DEV: '891ee0a2-8b88-51c5-b867-9a3b9639486d',
    API_ROUTING_PROD: 'b310ad65-0f24-5c89-b63a-ed9e498d31ec',
    PREVIEW_ROUTE: 'cb848f27-40a7-54d4-a79e-ce73cc3362de'
}

var strings = {
    welcomeString: '<p>Welcome to the aspace Data Lab!</p><p>For a tutorial, click <a href="#">here</a>!</p>',
    NORMAL: "Normal Mode",
    CREATE_DATA_BY_SPOT: "Creating Individual Spot Data",
    CREATE_DATA_BY_STRIP: "Creating Block Data",
    LIVE_FEED: "Viewing Live Data Feed",
    API_TEST_RADIUS: "Testing API Radius Search Method",
    API_TEST_BBOX: "Testing API BBox Method",
    API_TEST_VIEW_BLOCK_STATUS: "Viewing Block Status",
    API_TEST_VIEW_SPOT_STATUS: "Viewing Spot Status"
}

var colors = {
    NORMAL: "lawngreen",
    CREATE_DATA_BY_SPOT: "red",
    CREATE_DATA_BY_STRIP: "red",
    LIVE_FEED: "lawngreen",
    API_TEST_RADIUS: "yellow",
    API_TEST_BBOX: "yellow",
    API_TEST_VIEW_BLOCK_STATUS: "yellow",
    API_TEST_VIEW_SPOT_STATUS: "yellow"
}