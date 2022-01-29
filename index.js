var HueEventSensorPlatform = require('./src/homekit/HueEventSensorPlatform');
var HueEventLightSensorAccessory = require('./src/homekit/accessories/HueEventLightSensorAccessory');

module.exports = function(homebridge) {
  homebridge.registerPlatform("homebridge-hue-event-sensor", "HueEventSensorPlatform", HueEventSensorPlatform);
  homebridge.registerAccessory("homebridge-hue-event-light-sensor", "HueEventLightSensorAccessory", HueEventLightSensorAccessory);
};
