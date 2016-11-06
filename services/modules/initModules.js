module.exports = [
  {
    "name":"homestar-knx",
    "path":"../homestar-knx",
    "label":"KNX",
    "description":"Control KNX devices",
    "bridge":"KNXBridge",
    "enabled": true,
    "settingFields":[
      {
        "name":"host",
        "type":"text",
        "label":"Gateway IP",
        "value":"192.168.80.101"
      },
      {
        "name":"port",
        "type":"number",
        "label":"Gateway port",
        "value":"3671"
      },
      {
        "name":"tunnel_host",
        "type":"text",
        "label":"Tunnel address",
        "value":"udp://0.0.0.0"
      },
      {
        "name":"tunnel_port",
        "type":"text",
        "label":"Tunnel port",
        "value":"13671"
      }
    ]
  },
  {
    "name":"homestar-rest",
    "path":"../homestar-rest",
    "label":"REST",
    "description":"Communicate via HTTP REST",
    "bridge":"RESTBridge",
    "enabled": true,
    "settingFields":[

    ]
  },
  {
    "name":"homestar-samsung-smart-tv",
    "path":"../homestar-samsung-smart-tv",
    "label":"Samsung Smart TV",
    "description":"Control Samsung Smart TV models prior 2014",
    "bridge":"SamsungSmartTVBridge",
    "enabled": true,
    "settingFields":[

    ]
  }
]
