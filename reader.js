/**
 * This file represents a readable stream. Its main responsibility is to
 * collect bytes from the socket and transform those bytes into full WhatsApp
 * messages.
 */

var Transform = require('stream').Transform
  , util = require('util')
  , debug = require('debug')('nodeapp:reader');

function Reader() {
  if (!(this instanceof Reader)) {
    return new Reader();
  }

  Transform.call(this);

  this.buffer = new Buffer(0);
}

util.inherits(Reader, Transform);

Reader.prototype._transform = function (chunk, encoding, callback) {
  var length, message;

  this.buffer = Buffer.concat([
    this.buffer,
    chunk
  ]);

  while (true) {
    if (this.buffer.length >= 3) {
      length = this.buffer.readUInt16BE(1);
      if (this.buffer.length >= length + 3) {
        message = this.buffer.slice(0, length + 3);

        debug('<< ' + message.toString('hex'));
        
        this.buffer = this.buffer.slice(length + 3);
        this.push(message);
      } else {
        break;
      }
    } else {
      break;
    }
  }

  callback();
};

Reader.prototype._flush = function (callback) {
  if (this.buffer.length) {
    this.push(this.buffer);
  }

  callback();
};


// Test cases:

  // One full message, then another message
  // (echo -ne '\x00\x00\x01\x50'; sleep 3; echo -ne '\x00\x00\x01\x51') | nodejs test.js

  // Two messages at once
  // (echo -ne '\x00\x00\x01\x50\x00\x00\x01\x51') | nodejs test.js

  // Half message first, then the other part, then another message
  // (echo -ne '\x00\x00\x02\x50'; sleep 3; echo -ne '\x51'; sleep 3; echo -ne '\x00\x00\x01\x52') | nodejs test.js

  // TODO:
  // Test both negative branches of the if cases in the loop

// Also, test flushing behaviour..

module.exports = Reader;