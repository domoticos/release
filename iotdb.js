const iotdb = require("iotdb");
const RulesEngine = require("./rulesEngine");

iotdb.make_thing_id = function(thing){
  const model_id = thing.model_id()
  var thing_id = thing.thing_id()+':'+model_id;
  if(thing.__bridge.initd.thing_id){
    thing_id = thing.__bridge.initd.thing_id;
  }
  return thing_id;
}

module.exports = function(app){
  app.rulesEngine = new RulesEngine(app);
  app.rulesEngine.loadRules().then(function(){
    app.rulesEngine.emit('boot');
  });

  var data = {modules:{}, moduleEnabled:{}, moduleSettings:{}};

  const getConfig = function(key, otherwise) {
      if (key == 'modules2') {
        return data.modules;
      } else if (key.indexOf('bridges/') != -1) {
        var substrStart = key.indexOf('bridges/') + 8,
          substrEnd = key.indexOf('/', substrStart + 1),
          bridge = key.substring(substrStart, substrEnd);
        return data.moduleSettings[bridge];
      } else if(key.indexOf('/enabled/modules/') != -1) {
        var substrStart = key.indexOf('/enabled/modules/') + '/enabled/modules/'.length,
          //substrEnd = key.indexOf('/', substrStart + 1),
          enabled = key.substring(substrStart);
        return data.moduleEnabled[enabled];
      } else {
        return;
      }
    };


  iotdb.settings = function() {
        return {
          get: function(key, otherwise) {
            console.log("++++++++ key",key)
            var data = getConfig(key, otherwise);
            console.log('++++++++ data', data)
            return data;
          }
        }
      }

/*
const _universal_thing_id = thing => {
  console.log('++++++++++++ THING ID +++++++++++++++++')
    const iotdb = require('./iotdb');
    const runner_id = iotdb.settings().get("/homestar/runner/keys/homestar/key", null);
    const thing_id = thing.thing_id();
    const model_id = thing.model_id();

    if (runner_id) {
        return _.id.uuid.iotdb("t", runner_id.replace(/^.*:/, '') + ":" + _.hash.short(thing_id + ":" + model_id));
    } else {
        return thing_id + ":" + model_id;
    }
};
*/
  const computeConfigData = function() {
    return new Promise(function(resolve, reject) {
      app.service('modules').find().then(modules => {
        modules.map(function(IotdbModule) {
          const enabled = IotdbModule.hasOwnProperty('enabled')?IotdbModule.enabled:false;
          //if(enabled){
            data.modules[IotdbModule.name] = IotdbModule.path;
          //}

          data.moduleEnabled[IotdbModule.name] = enabled;
          if (IotdbModule.hasOwnProperty('settingFields') && IotdbModule.settingFields.length > 0) {
            data.moduleSettings[IotdbModule.bridge] = {};
            IotdbModule.settingFields.map(function(settingField){
              data.moduleSettings[IotdbModule.bridge][settingField.name] = settingField.value;
            });
          }
        });
        // console.log('config', data)
        resolve(data);
      });
    });
  }

  const buidAttributesDataObject = function(thing){
    return iotdb._.d.list(thing.state("model"), "iot:attribute", [])
    .map(attr => {return app.iotdbServer.buildAttribute(attr)});
  }


  const buildThingDataObject = function(thing){
    const meta = thing.state('meta');
    const thingData = {
      _id: thing.thing_id(),
      //thingId: thing.thing_id(),
      modelId: thing.model_id(),
      productModel: meta['schema:model'],
      manufacturer: meta['schema:manufacturer'],
      manufacturerNumber: meta['schema:mpn'],
      label: thing.__bridge.initd.name?thing.__bridge.initd.name:thing.name(),
      reachable: thing.reachable(),
      zones: thing.zones(),
      facets: thing.facets(),
      discoverable: thing.tag().indexOf('was-configured')===-1
    }
    return thingData;
  }

  const start = function() {
    iotdb.connect();
    app.service('thingsDefinitions').find({}).then(thingsDefinitions => {
      thingsDefinitions.map(function(definition){
        definition.uuid = definition.thing_id;
        iotdb.connect(definition).tag("was-configured");
      });
    });


    var things = iotdb.things();
    //const iotdbTransport = require("iotdb-transport-iotdb");
    //const iotdbTransporter = iotdbTransport.make({}, things);

    //const feathersTransport = require("./feathersTransport");
    //const feathersTransporter = feathersTransport.make(app);

    //feathersTransporter.monitor(iotdbTransporter);
    //iotdb_transporter.monitor(memory_transporter)


    //setTimeout(() => console.log('%%% THINGS:', things.all()[0].thing_id()), 7000)
    //var things = iotdb.things();
    //console.log('things', iotdb.things().all())
    //console.log('modules', iotdb.modules().modules())

    things.on("istate", thing => {
      const istate = thing.state("istate");
      Object.keys(istate).map(attribute => {
        app.service('attributes').find({query: {thingId:thing.thing_id(), name: '#'+attribute}}).then(attrsFound => {
          if(attrsFound.length > 0){
            app.service('attributes').patch(attrsFound[0]._id, {value: istate[attribute], prevValue: attrsFound[0].value}).then(attributeObj => {
              // console.log(attribute, attributeObj.value);
              // trigger rules only if value changed from the last one
              if(istate[attribute] !== attrsFound[0].value){
                app.rulesEngine.emit('stateChange.'+attributeObj._id);
                //rulesEngine.applyRules({triggerType: 'stateChange', attribute: attributeObj});
              }
            });
          }
        });
      });
    })

    things.on("thing", function(thing) {
      thing.band("connection").on("iot:reachable", (thing, band, isReachable) => {
        app.service('things').find({query: {_id:thing.thing_id()}}).then(thingsFound => {
          if(thingsFound.length > 0){
            app.service('things').patch(thingsFound[0]._id, {reachable: isReachable});
          }
        });
      })

      app.service('things').find({query: {_id:thing.thing_id()}}).then(thingsAvailable => {
        let thingData = buildThingDataObject(thing);
        if(thingsAvailable.length > 0){

        } else {
          app.service('things').create(thingData).then(newThing => {
            const attributes = buidAttributesDataObject(thing);
            attributes.map(attribute => {
              attribute.thingId = newThing._id;
              app.service('attributes').create(attribute);
            });
          });
        }
      });
    });
  }
  return {
    iotdb: iotdb,
    buildAttribute: function(attr){
      return {
        name: attr['@id'],
        isActuator: attr['iot:actuator'],
        purpose: attr['iot:purpose'],
        isRead: attr['iot:read'],
        isSensor: attr['iot:sensor'],
        isWrite: attr['iot:write'],
        label: attr['schema:name'],
        unit: attr['iot:unit'],
        maximum: attr['iot:maximum'],
        minimum: attr['iot:minimum'],
        valueType: attr['iot:type'],
        values: attr['iot:enumeration']?attr['iot:enumeration']:this.generateValues(attr['iot:purpose'])
      }
    },
    generateValues: function(purpose){
      if(purpose == 'iot-purpose:on'){
        return ['true', 'false'];
      } else {
        return null;
      }
    },

    start: function() {
      const me = this;
      computeConfigData().then(function(){
        iotdb.use("homestar-samsung-smart-tv");
        iotdb.use("homestar-knx");
        iotdb.use("homestar-rest");
        start();
        me.rulesEngine.loadRules();
      });
    },

    restart: function() {
      iotdb.things().disconnect();
      computeConfigData().then(function(){
        console.log('restart')
        iotdb.reset();
        iotdb.use("homestar-samsung-smart-tv");
        iotdb.use("homestar-knx");
        iotdb.use("homestar-rest");
        start();
      });
    }
  }
}
