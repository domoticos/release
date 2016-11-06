const jsonLogic = require('json-logic-js');
const app = require('./app');
const moment = require('moment');
const nodemailer = require('nodemailer');
const vm = require('vm');
var transporter = nodemailer.createTransport('smtps://mishoboss%40gmail.com:misho86-@smtp.gmail.com');

const actionsStorage = {
  mail: function(params){
    return new Promise(function(resolve, reject) {
      var mailOptions = {
        from: '"My Home" <myhome@myhome.com>',
        to: params.email,
        subject: params.subject,
        text: 'Hello world',
        html: '<b>Hello world</b>'
      };
      transporter.sendMail(mailOptions, function(error, info){
        if(error){
          //reject('Failure!' + error);
          return console.log(error);
        }
        //resolve('Message sent: ' + info.response);
      });
      resolve();
    })
  },
  delay: function(params){
    return new Promise(function(resolve, reject) {
      setTimeout(function(){
        resolve();
      }, params.delay*1000);
    })
  },
  setState: function(params){
    return new Promise(function(resolve, reject) {
      app.service('attributes').find({query: { _id: params.attribute}}).then(attributesFound => {
        if(attributesFound.length > 0){
          app.service('states').create({ thingId: attributesFound[0].thingId, purpose: attributesFound[0].purpose, state: params.state }).then(state => {
            resolve();
          }).catch(reject);
        } else {
          reject();
        }
      }).catch(reject);
    })
  },
  test: function(params){
    return new Promise(function(resolve, reject) {
      console.log('test', params.name);
      resolve();
    })
  }
}


const executeActions = function(actions) {
  var queue = Promise.resolve();
  actions.forEach(function(action){
    queue = queue.then(function(result){
      if(actionsStorage.hasOwnProperty(action.action)){
        return actionsStorage[action.action].call(this, action.params);
      }
      return Promise.resolve();
    });
  });
  queue.then(function(){
    console.log('ACTIONS COMPLETE')
  });
}

const applyRules = function(settings) {
  var utcOffest = 0;
  app.service('/properties').find({query: {key:'time'}}).then(time => {
    if(time[0]){
      utcOffest = (time[0].value.rawOffset/3600)+(time[0].value.dstOffset/3600)
    }

    app.service('attributes').find().then(attributes => {
      var attrsObject = {};
      attributes.map(attribute => {
        attrsObject[attribute._id] = { value: attribute.value, prevValue: attribute.prevValue, lastUpdated: attribute.updatedAt }
        return true;
      });


      var query = {
        enabled: true
      };
      if(settings.triggerType === 'stateChange'){
        query.body = new RegExp(settings.attribute._id);
        attrsObject.trigger = {type: 'stateChange', attributeId: settings.attribute._id}
      } else {
        attrsObject.trigger = {type: 'timeChange', time: Math.ceil(moment().utcOffset(utcOffest).unix()/60)}
      }

      console.log('attrsObject', attrsObject.trigger)
      app.service('rules').find({query: query}).then(rules => {
        rules.map(rule => {
          const script = new vm.Script(rule.code);


          const result = jsonLogic.apply(
                    JSON.parse(rule.body),
                    attrsObject
                );
          if (Array.isArray(result) && result.length > 0) {
            const now = moment().utcOffset(utcOffest);
            const last = moment(rule.executedAt).utcOffset(utcOffest);
            console.log('result', result)
            console.log('now', now.format("dddd, MMMM Do YYYY, h:mm:ss a"))
            console.log('last', last.format("dddd, MMMM Do YYYY, h:mm:ss a"))
            if(!rule.executedAt || (now.unix()-rule.dontRunIn > last.unix())){
              executeActions(result);
              app.service('rules').patch(rule._id, {executedAt: new Date()});
            }
          }
        });
      });
    });
  });
}

// run time based rules every second

setInterval(function(){
  applyRules({ triggerType: 'timeChange' });
}, 1000*60);
applyRules({ triggerType: 'timeChange' });

exports.applyRules = applyRules;
