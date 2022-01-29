function HueEventLightSensorAccessory(ServiceParam, CharacteristicParam, platform, lightInfo) {
  Service = ServiceParam;
  Characteristic = CharacteristicParam;

  this.platform = platform;
  this.log = platform.log;
  this.id = lightInfo.id;
  this.zigbee_id = lightInfo.zigbee_id;
  this.name = lightInfo.config["sensor_name"];
  this.currentLightOn = lightInfo.on;

  this.informationService = new Service.AccessoryInformation();
  this.informationService.setCharacteristic(Characteristic.Manufacturer, "HueEventSensorPlatform");
  this.informationService.setCharacteristic(Characteristic.Model, "HueEventLightSensorAccessory-" + this.name);
  this.informationService.setCharacteristic(Characteristic.SerialNumber, "HueEventLightSensorAccessory-" + this.id);

  this.service = new Service.ContactSensor(this.name);
  this.service.getCharacteristic(Characteristic.ContactSensorState).on('get', this.getState.bind(this));
}

HueEventLightSensorAccessory.prototype.onEvent = function(eventData) {
  if(eventData.type === "light" && eventData.on) {
    var lightIsOn = false;
    if(eventData.on.on === true) {
      lightIsOn = true;
    }
    this.service.getCharacteristic(Characteristic.ContactSensorState).updateValue(lightIsOn ? Characteristic.ContactSensorState.CONTACT_NOT_DETECTED : Characteristic.ContactSensorState.CONTACT_DETECTED, undefined, null);
  }
  else if(eventData.type === "zigbee_connectivity") {
    var lightIsOn = false;
    if(eventData.status === "connected") {
      lightIsOn = true;
    }
    this.service.getCharacteristic(Characteristic.ContactSensorState).updateValue(lightIsOn ? Characteristic.ContactSensorState.CONTACT_NOT_DETECTED : Characteristic.ContactSensorState.CONTACT_DETECTED, undefined, null);
  }
};

HueEventLightSensorAccessory.prototype.getState = function(callback) {
  this.log.debug("Getting current state for '%s'...", this.id);
  callback(null, this.currentLightOn ? Characteristic.ContactSensorState.CONTACT_NOT_DETECTED : Characteristic.ContactSensorState.CONTACT_DETECTED);
};

HueEventLightSensorAccessory.prototype.getServices = function() {
  return [ this.service, this.informationService ];
};

module.exports = HueEventLightSensorAccessory;
