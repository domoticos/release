"use strict";

const iotdb = require('iotdb');
const _ = iotdb._;
const iotdb_transport = require('iotdb-transport');
const errors = require('iotdb-errors');

const Rx = require('rx');
const events = require('events');

const util = require('util');
const url = require('url');

const logger = iotdb.logger({
    name: 'iotdb-transport-memory',
    module: 'transporter'
});

const global_bddd = {};
const subjectd = new Map();

const make = (app, bddd) => {
  console.log('-----------++++++++--------- make')
    const self = iotdb_transport.make();

    const _bddd = bddd || global_bddd;
    let _subject = subjectd.get(_bddd);
    if (!_subject) {
        subjectd.set(_bddd, _subject = new Rx.Subject());
    }

    self.rx.list = (observer, d) => {
      console.log('-----------++++++++--------- list')
        _.keys(_bddd)
            .sort()
            .forEach(id => {
                const rd = _.d.clone.shallow(d);
                rd.id = id;

                observer.onNext(rd);
            });

        observer.onCompleted();
    };

    self.rx.put = (observer, d) => {
      console.log('-----------++++++++--------- put', d)
      const rd = _.d.clone.shallow(d);
      return;
      if(d.band === 'meta'){

        //rd.value = _.timestamp.add(rd.value);
        app.service('things').find({query: {'iot:thing-id':rd.id}}).then(thingsAvailable => {
          //let thingData = buildThingDataObject(rd.value);
          let thingData = rd.value;
          thingData._id = rd.id;
          delete thingData['@timestamp'];
          if(thingsAvailable.length > 0){
            app.service('things').update(rd.id, thingData);
          } else {
            console.log('----------------- NEW THING!')
            app.service('things').create(thingData).then(newThing => {
              //const attributes = buidAttributesDataObject(rd.value);
              //attributes.map(attribute => {
              //  attribute.thingId = newThing._id;
              //  app.service('attributes').create(attribute);
              //});
            });
          }
        });

      } else if(d.band === 'connection'){
        app.service('thingsReachable').find({query: {_id:rd.id}}).then(thingsFound => {
          //console.log('thingsFound', thingsFound)
          if(thingsFound.length > 0){
            app.service('thingsReachable').patch(rd.id, {'iot:reachable': rd.value['iot:reachable']});
          } else {
            app.service('thingsReachable').create({_id: rd.id, reachable: rd.value['iot:reachable']}).then(newThing => {
              //const attributes = buidAttributesDataObject(rd.value);
              //attributes.map(attribute => {
              //  attribute.thingId = newThing._id;
              //  app.service('attributes').create(attribute);
              //});
            });
          }
        });
      }

      observer.onNext(rd);
      observer.onCompleted();
      _subject.onNext(d);
    };

    self.rx.get = (observer, d) => {
      console.log('-----------++++++++--------- get')
        const bdd = _bddd[d.id];
        if (_.is.Undefined(bdd)) {
            return observer.onError(new errors.NotFound());
        }


        const bd = bdd[d.band];
        if (_.is.Undefined(bd)) {
            return observer.onError(new errors.NotFound());
        }

        const rd = _.d.clone.shallow(d);
        rd.value = bd;

        observer.onNext(rd);
        observer.onCompleted();
    };

    self.rx.bands = (observer, d) => {
      console.log('-----------++++++++--------- bands')
        const bdd = _bddd[d.id];
        if (!bdd) {
            return observer.onError(new errors.NotFound());
        }

        _.keys(bdd)
            .sort()
            .forEach(band => {
                const rd = _.d.clone.shallow(d);
                rd.band = band;

                observer.onNext(rd);
            });

        observer.onCompleted();
    };

    self.rx.added = (observer, d) => {
      console.log('-----------++++++++--------- added', d)
        observer.onCompleted();
    };

    self.rx.updated = (observer, d) => {
      console.log('-----------++++++++--------- updated')
        _subject
            .filter(ud => !d.id || d.id === ud.id)
            .filter(ud => !d.band || d.id === ud.band)
            .map(ud => _.d.compose.shallow(d, ud))
            .subscribe(
                d => observer.onNext(d),
                error => observer.onError(error),
                () => observer.onCompleted()
            );
    };


    return self;
};

/**
 *  API
 */
exports.make = make;
