# homebridge-hue-event-sensor

A Hue event sensor using API v2 for [Homebridge](https://github.com/nfarina/homebridge).

Currently only supports light on/off also if power was lost and regained.

# Configuration
Example config.json:
```
    {
        "platforms": [
            {
                "platform": "HueEventSensorPlatform",
                "bridge_ip_or_dnsname": "huebridge",
                "hue_application_key": "your key, see https://developers.meethue.com/develop/hue-api-v2/getting-started/",
                "lights": [
                    {
                        "light_name_in_hue": "Hue color spot 1",
                        "sensor_name": "My light 1"
                    }
                    ...
                ]
            }
        ]
    }
```

# Power loss/gain
Note that this plugin is not constantly pulling, so power loss or gain takes some time to be refreshed (about 30s).