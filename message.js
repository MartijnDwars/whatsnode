var util = require('util'),
  events = require('events'),
  _ = require('lodash');

function Message(reader, listener) {
  var self = this;

  if (_.isFunction(listener)) {
    this.on('message', listener);
  }

  var buffer = new Buffer(0);

  reader.on('data', function (data) {
    console.log('got data');
    var length;

    buffer = Buffer.concat([
      buffer,
      data
    ]);

    while (true) {
      if (buffer.length >= 3) {
        length = buffer.readUInt16BE(1);
        if (buffer.length >= length + 3) {
          self.emit('message', buffer.slice(0, length + 3));
          buffer = buffer.slice(length + 3);
        } else {
          break;
        }
      } else {
        break;
      }
    }
  });
}

util.inherits(Message, events.EventEmitter);

module.exports.message = function (reader, listener) {
  return new Message(reader, listener);
};