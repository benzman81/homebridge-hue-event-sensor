const Util = require('../Util');

var HueEventLightSensorAccessory = require('./accessories/HueEventLightSensorAccessory');

var Service, Characteristic;

function HueEventSensorPlatform(log, config, homebridge) {
  Service = homebridge.hap.Service;
  Characteristic = homebridge.hap.Characteristic;

  if(!config.bridge_ip_or_dnsname) {
    log("bridge_ip_or_dnsname is missingin config");
  }
  if(!config.hue_application_key) {
    log("hue_application_key is missingin config");
  }
  this.log = log;
  this.bridge_ip_or_dnsname = config.bridge_ip_or_dnsname;
  this.hue_application_key = config.hue_application_key;
  this.lightsConfig = config["lights"] || [];
};

HueEventSensorPlatform.prototype.accessories = function(callback) {
  if(!this.bridge_ip_or_dnsname || !this.hue_application_key || this.lightsConfig.length === 0) {
    callback([]);
    return;
  }
  Util.getLightsAndStatusRespectingPowerState(this.bridge_ip_or_dnsname, this.hue_application_key, this.log, function(lights) {
    var accessories = [];
    for (var i = 0; i < lights.length; i++) {
      var light = lights[i];
      for (var j = 0; j < this.lightsConfig.length; j++) {
        var lightConfig = this.lightsConfig[j];
        if(light.name === lightConfig.light_name_in_hue) {
          light.config = lightConfig;
          var accessory = new HueEventLightSensorAccessory(Service, Characteristic, this, light);
          accessories.push(accessory);
        }
      }
    }

    Util.startEventListener(this.bridge_ip_or_dnsname, this.hue_application_key, this.log, function(message) {
      var messageData = JSON.parse(message.data);
      for (var i = 0; i < messageData.length; i++) {
        var data = messageData[i];
        for (var j = 0; j < data.data.length; j++) {
          var singleData = data.data[j];
          for (var k = 0; k < accessories.length; k++) {
            var accessory = accessories[k];
            if(accessory.id === singleData.id || accessory.zigbee_id === singleData.id) {
              accessory.onEvent(singleData);
            }
          }
        }
      }
    }.bind(this));

    callback(accessories);

  }.bind(this));
};

module.exports = HueEventSensorPlatform;
