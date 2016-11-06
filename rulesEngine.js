const jsonLogic = require('json-logic-js');
const moment = require('moment');
const nodemailer = require('nodemailer');
const EventEmitter = require('events');
const {NodeVM} = require('vm2');
const path = require('path');
const asyncFn = require('asyncawait/async');
const awaitFn = require('asyncawait/await');
const Promise = require('bluebird');


const transporter = nodemailer.createTransport('smtps://mishoboss%40gmail.com:misho86-@smtp.gmail.com');


class RulesEngine extends EventEmitter {
  constructor(app) {
    super();
    this.app = app;


    const rulesEngine = this;
    rulesEngine.sandbox = {
      events: [],
      async: asyncFn,
      await: awaitFn,
      echo: function(text){
        console.log(text);
      },
      on: function(event, callback){
        rulesEngine.sandbox.events.push(event);
        rulesEngine.on(event, callback);
      },
      setState: function(attributeId, state){
        return new Promise(function(resolve, reject) {
          rulesEngine.app.service('attributes').find({query: { _id: attributeId}}).then(attributesFound => {
            if(attributesFound.length > 0){
              rulesEngine.app.service('states').create({ thingId: attributesFound[0].thingId, purpose: attributesFound[0].purpose, state: state }).then(state => {
                resolve();
              }).catch(reject);
            } else {
              reject();
            }
          }).catch(reject);
        })
      },
      pause: function(seconds) {
        return new Promise(function(resolve, reject) {
          setTimeout(function(){
            resolve();
          }, seconds*1000);
        })
      },
      sendMail: function(email, subject, body){
        return new Promise(function(resolve, reject) {
          let mailOptions = {
            from: '"My Home" <myhome@myhome.com>',
            to: email,
            subject: subject,
            //text: '',
            html: body,
          };
          transporter.sendMail(mailOptions, function(error, info){
            if(error){
              //reject('Failure!' + error);
              console.log(error);
            }
            //resolve();
          });
          resolve();
        })
      },
    };


    this.vm = new NodeVM({
      //timeout: 1000,
      require: {
        external: true,
      },
      sandbox: this.sandbox,
      console: 'inherit',
    });
    //const libPath = path.join(app.get('base'), 'node_modules', 'asyncawait')
    //this.vm.run('const {async, await} = require("'+libPath+'");');
  }

  
  loadRules() {
    const engine = this;
    return new Promise(function(resolve, reject) {
      let query = {
        enabled: true,
      };

      console.log('this.sandbox.events', engine.sandbox.events)
      engine.sandbox.events.forEach(function(event){
        engine.removeAllListeners(event);
      });
      engine.sandbox.events = [];

      engine.app.service('rules').find({query: query}).then(rules => {
        rules.map(rule => {
          engine.vm.run(rule.code);
        })
        resolve();
      })
    })
  }
}

module.exports = RulesEngine;
