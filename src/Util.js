const Constants = require('./Constants');

var request = require("request");
var EventSource = require("eventsource");

const getLights = function(bridgeIpOrDNSName, hueApplicationKey, log, callback) {
  var theRequest = {
    method : "GET",
    url : "https://" + bridgeIpOrDNSName + "/clip/v2/resource/light",
    timeout : Constants.DEFAULT_REQUEST_TIMEOUT,
    rejectUnauthorized : false,
    headers : {
      "hue-application-key" : hueApplicationKey
    }
  };

  request(theRequest, (function(err, response, body) {
    var statusCode = response && response.statusCode ? response.statusCode : -1;
    if (!err && statusCode >= 200 && statusCode < 300) {
      callback(JSON.parse(body));
    }
    else {
      log("Error in getLights: Request to '%s' finished with status code '%s' and body '%s'.", theRequest.url, statusCode, body, err);
    }
  }).bind(this));
};

const getDevices = function(bridgeIpOrDNSName, hueApplicationKey, log, callback) {
  var theRequest = {
      method : "GET",
      url : "https://" + bridgeIpOrDNSName + "/clip/v2/resource/device",
      timeout : Constants.DEFAULT_REQUEST_TIMEOUT,
      rejectUnauthorized : false,
      headers : {
        "hue-application-key" : hueApplicationKey
      }
    };

    request(theRequest, (function(err, response, body) {
      var statusCode = response && response.statusCode ? response.statusCode : -1;
      if (!err && statusCode >= 200 && statusCode < 300) {
        callback(JSON.parse(body));
      }
      else {
        log("Error in getDevices: Request to '%s' finished with status code '%s' and body '%s'.", theRequest.url, statusCode, body, err);
      }
    }).bind(this));
};

const getZigbeeConnectivities = function(bridgeIpOrDNSName, hueApplicationKey, log, callback) {
  var theRequest = {
      method : "GET",
      url : "https://" + bridgeIpOrDNSName + "/clip/v2/resource/zigbee_connectivity",
      timeout : Constants.DEFAULT_REQUEST_TIMEOUT,
      rejectUnauthorized : false,
      headers : {
        "hue-application-key" : hueApplicationKey
      }
    };

    request(theRequest, (function(err, response, body) {
      var statusCode = response && response.statusCode ? response.statusCode : -1;
      if (!err && statusCode >= 200 && statusCode < 300) {
        callback(JSON.parse(body));
      }
      else {
        log("Error in getZigbeeConnectivities: Request to '%s' finished with status code '%s' and body '%s'.", theRequest.url, statusCode, body, err);
      }
    }).bind(this));
};

const getLightsAndStatusRespectingPowerState = function(bridgeIpOrDNSName, hueApplicationKey, log, callback) {
  getLights(bridgeIpOrDNSName, hueApplicationKey, log, function(lights) {
    getDevices(bridgeIpOrDNSName, hueApplicationKey, log, function(devices) {
      getZigbeeConnectivities(bridgeIpOrDNSName, hueApplicationKey, log, function(zigbeeConnectivities) {
        var lightsInHue = [];
        for (var i = 0; i < lights.data.length; i++) {
          var light = lights.data[i];
          var lightOn = light.on.on;
          var belongingDevice = null;
          for (var j = 0; j < devices.data.length; j++) {
            var device = devices.data[j];
            for (var z = 0; z < device.services.length; z++) {
              var service = device.services[z];
              if (service.rtype === "light" && light.id === service.rid) {
                belongingDevice = device;
              }
            }
          }
          if(!belongingDevice) {
            continue;
          }
          var zigbeeId = null;
          for (var y = 0; y < belongingDevice.services.length; y++) {
            var service = belongingDevice.services[y];
            if (service.rtype === "zigbee_connectivity") {
              for (var h = 0; h < zigbeeConnectivities.data.length; h++) {
                if (service.rid === zigbeeConnectivities.data[h].id) {
                  zigbeeId = service.rid;
                  if(zigbeeConnectivities.data[h].status !== "connected") {
                    lightOn = false;
                  }
                  break;
                }
              }
            }
          }
          lightsInHue.push({
            id : light.id,
            zigbee_id: zigbeeId,
            name : light.metadata.name,
            on : lightOn
          })
        }
        callback(lightsInHue);
      }.bind(this));
    }.bind(this));
  }.bind(this));
};

const onmessage = function(log, messageCallback, message) {
  messageCallback(message)
};

const onopen = function(log) {
  log('Connected to hue bridge.')
};

const onerror = function(log, err) {
  log(err)
};

const startEventListener = function(bridgeIpOrDNSName, hueApplicationKey, log, messageCallback) {
  var eventSourceInitDict = {
      headers : {
        "hue-application-key" : hueApplicationKey
      }
  };
  const events = new EventSource("https://" + bridgeIpOrDNSName + "/eventstream/clip/v2", eventSourceInitDict);
  events.addEventListener('message', onmessage.bind(this, log, messageCallback));
  events.addEventListener('open', onopen.bind(this, log));
  events.addEventListener('error', onerror.bind(this, log));
};

module.exports = {
  getLights : getLights,
  getDevices: getDevices,
  getZigbeeConnectivities: getZigbeeConnectivities,
  getLightsAndStatusRespectingPowerState: getLightsAndStatusRespectingPowerState,
  startEventListener: startEventListener
};