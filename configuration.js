const fs = require('fs');
const path = require('path');
const makeDebug = require('debug');
const deepAssign = require('deep-assign');

const debug = makeDebug('feathers:configuration');
const separator = path.sep;

module.exports = function() {
  return function() {
    const deep = true;
    const app = this;
    const env = app.settings.env;
    var root = __dirname;
    var configFolder = 'config';
    var configFile = 'config'
    const productionConfig = path.join(__dirname, 'config', 'config.json');
    const productionDefaultConfig = path.join(__dirname, 'config', 'config.default.json');
    const developmentConfig = path.join(__dirname, '..', 'config', 'development.json');
    if(fs.existsSync(productionConfig)){
      root = __dirname;
      configFile = 'config';
    } else if(fs.existsSync(productionDefaultConfig)){
      root = __dirname;
      configFile = 'config.default';
    } else if(fs.existsSync(developmentConfig)){
      root = path.join(__dirname, '..');
      configFile = 'development';
    }


    const convert = current => {
      const result = Array.isArray(current) ? [] : {};

      Object.keys(current).forEach(name => {
        let value = current[name];

        if(typeof value === 'object' && value !== null) {
          value = convert(value);
        }

        if(typeof value === 'string') {
          if(value.indexOf('\\') === 0) {
            value = value.replace('\\', '');
          } else {
            if(process.env[value]) {
              value = process.env[value];
            } else if(value.indexOf('.') === 0 || value.indexOf('..') === 0) {
              // Make relative paths absolute
              value = path.resolve(
                path.join(root, configFolder),
                value.replace(/\//g, separator)
              );
            }
          }
        }

        result[name] = value;
      });

      return result;
    };

    let config = convert(require(path.join(root, configFolder, `${configFile}.json`)));

    // We can use sync here since configuration only happens once at startup
    if(fs.existsSync(`${configFile}.js`) || fs.existsSync(`${configFile}.json`)) {
      config = deep ? deepAssign(config, convert(require(`${configFile}.json`))) :
        Object.assign(config, convert(require(`${configFile}.json`)));
    } else {
      debug(`Configuration file for ${env} environment not found at ${configFile}`);
    }

    Object.keys(config).forEach(name => {
      let value = config[name];

      debug(`Setting ${name} configuration value to`, value);

      app.set(name, value);
    });
  };
};
