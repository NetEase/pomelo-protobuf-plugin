var fs = require('fs');
var path = require('path');
var protobuf = require("protobufjs");
var SERVER = 'server';
var CLIENT = 'client';
var logger = require('pomelo-logger').getLogger('pomelo', __filename);

module.exports = function(app, opts) {
  return new Component(app, opts);
};

var Component = function(app, opts) {
  this.app = app;
  this.version = 0;
  this.builder = null;
  opts = opts || {};
  this.serverProtosPath = opts.serverProtos || '/config/serverProtos.json';
  this.clientProtosPath = opts.clientProtos || '/config/clientProtos.json';
};

var pro = Component.prototype;

pro.name = '__decodeIO__protobuf__';

pro.start = function(cb) {
  this.setProtos(SERVER, path.join(this.app.getBase(), this.serverProtosPath));
  this.setProtos(CLIENT, path.join(this.app.getBase(), this.clientProtosPath));

  this.builder = protobuf.loadJsonFile(path.join(this.app.getBase(), this.serverProtosPath));
  process.nextTick(cb);
};

pro.build = function(route) {
  if(!this.builder) {
    logger.warn('protobuf builder is undefined.');
    return;
  }
  return this.builder.build(route);
};

pro.check = function(route) {
  return this.builder.lookup(route);
};

pro.encode = function(Encoder, message) {
  var encoder = new Encoder(message);
  return encoder.encodeNB();
};

pro.getProtos = function() {
  return {
    server : this.serverProtos,
    client : this.clientProtos,
    version : this.version
  };
};

pro.getVersion = function() {
  return this.version;
};

pro.setProtos = function(type, path) {
  if(!fs.existsSync(path)) {
    return;
  }

  if(type === SERVER) {
    this.serverProtos = require(path);
  }

  if(type === CLIENT) {
    this.clientProtos = require(path);
  }

  //Set version to modify time
  var time = fs.statSync(path).mtime.getTime();
  if(this.version < time) {
    this.version = time;
  }

  //Watch file
  fs.watch(path, this.onUpdate.bind(this, type, path));
};

pro.onUpdate = function(type, path, event) {
  if(event !== 'change') {
    return;
  }

  fs.readFile(path, 'utf8' ,function(err, data) {
    try {
      if(type === SERVER) {
        this.serverProtos = JSON.parse(data);
      } else {
        this.clientProtos = JSON.parse(data);
      }

      this.version = fs.statSync(path).mtime.getTime();
      logger.debug('change proto file , type : %j, path : %j, version : %j', type, path, this.version);
    } catch(e) {
      logger.warn("change proto file error! path : %j", path);
      logger.warn(e);
    }
  });
};