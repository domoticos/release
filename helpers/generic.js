const SunCalc = require('suncalc');
const app = require('../app');

module.exports = {
  calculateSunTimes: function() {
    const times = SunCalc.getTimes(new Date(), 42.635694, 23.369633);
    app.service('/memory').find({query: {_id:'sunTimes'}}).then(sunTimes => {
      if(sunTimes[0]){
        app.service('memory').update({query: {_id:'sunTimes'}}, {_id:'sunTimes', value:times});
      } else {
        app.service('memory').create({_id:'sunTimes', value:times});
      }
    });
  }
}
