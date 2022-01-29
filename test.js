const Util = require('./src/Util');

this.bridgeIpOrDNSName = "huebridge";
this.hueApplicationKey = "VAuvefAq7Ll2gPXLAtsgCOElshSQVqHFrj9gaiGl";
this.log = console.log;
var accessesory = {
    onEvent: function(eventData) {
      if(eventData.type === "light" && eventData.on) {
        var lightIsOn = false;
        if(eventData.on.on === true) {
          lightIsOn = true;
        }
        console.log("lightIsOn: "+lightIsOn);
      }
      else if(eventData.type === "zigbee_connectivity") {
        var lightIsOn = false;
        if(eventData.status === "connected") {
          lightIsOn = true;
        }
        console.log("lightIsOn: "+lightIsOn);
      }
    }
}
this.lightsConfig = [ {
  "light_name_in_hue" : "Hue color spot 15",
  "sensor_name" : "Wohnzimmer Hauptlicht Sensor",
  accessesory: accessesory
}, {
  "light_name_in_hue" : "Hue filament bulb 1",
  "sensor_name" : "Wohnzimmer Esstisch Sensor",
  accessesory: accessesory
} ];

this.lightsConfig = [ {
  "light_name_in_hue" : "Hue color spot 7",
  "sensor_name" : "Büro Hauptlicht Sensor",
  accessesory: accessesory
}];


var configuredLights = [];
Util.getLightsAndStatusRespectingPowerState(this.bridgeIpOrDNSName, this.hueApplicationKey, this.log, function(lights) {
  for (var i = 0; i < lights.length; i++) {
    var light = lights[i];
    for (var j = 0; j < this.lightsConfig.length; j++) {
      var lightConfig = this.lightsConfig[j];
      if(light.name === lightConfig.light_name_in_hue) {
        light.config = lightConfig;
        configuredLights.push(light);
      }
    }
  }
  this.log(configuredLights);
}.bind(this));

Util.startEventListener(this.bridgeIpOrDNSName, this.hueApplicationKey, this.log, function(message) {
  var messageData = JSON.parse(message.data);
  for (var i = 0; i < messageData.length; i++) {
    var data = messageData[i];
    for (var j = 0; j < data.data.length; j++) {
      var singleData = data.data[j];
      for (var k = 0; k < configuredLights.length; k++) {
        var configuredLight = configuredLights[k];
        if(configuredLight.id === singleData.id || configuredLight.zigbee_id === singleData.id) {
          configuredLight.config.accessesory.onEvent(singleData);
        }
      }
    }
  }
}.bind(this));