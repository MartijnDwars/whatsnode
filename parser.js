var dictionary = require('./dictionary');
var element = require('./element');

function parser(message) {
  var pointer = 0;

  // If we've got a list, TODO: we always get a list; just parse asList :)
  if (readInt8() === 0xf8) {
    return asList();
  } else {
    throw new Error("Unable to parse message: no list found..");
  }

  // Parse rest of message as list
  function asList() {
    var length = readInt8();
    var tag = readInt8();
    var attrs = {};
    var children = [];
    var data = undefined;

    // If the first tag is a list, this is a transparant list
    if (tag === 0xf8) {
      return asList();
    }

    // Iterate through attributes
    for (var i = 0; i < Math.floor((length-1)/2); i++) {
      var key = readInt8();
      var val = readInt8();

      switch (val) {
        case 0xfa:
          attrs[dictionary.getValue(key)] = asPair();
        break;

        case 0xfc:
          attrs[dictionary.getValue(key)] = asBinary();
        break;

        default:
          attrs[dictionary.getValue(key)] = dictionary.getValue(val);
        break;
      }
    }

    // Even list length means children
    if (length % 2 === 0) {
      var token = readInt8();

      // Binary data as child element
      if (token === 0xfc) {
        var data = asBinary();

      // Transparant list as child element
      } else if (token === 0xf8) {
        var length = readInt8();

        for (var i = 0; i < length; i++) {
          if (readInt8() === 0xf8) {
            children.push(asList());
          }
        }
      }
    }

    return new element(dictionary.getValue(tag), attrs, data || children);
  }

  function asString() {
    var key = readInt8();

    if (key === 0xfc) {
      return asBinary();
    } else if (dictionary.getValue(key)) {
      return dictionary.getValue(key);
    }
  }

  function asPair() {
    return asString().toString('ascii') + '@' + asString();
  }

  function asBinary() {
    var length = readInt8();
    var buffer = message.slice(pointer, pointer + length);

    pointer += length;
    return buffer;
  }

  function isList(message) {
    return message[3] === 0xf8;
  }

  /**
   * Reads one byte from the message. Has the side-effect of advancing the internal pointer (e.g. not idempotent)
   */
  function readInt8(offset) {
    if (offset) {
      pointer += offset;
    }

    return message[pointer++];
  }
};

/*
Parser.prototype.asList = function () {
  // Read length
  // Read each attribute
  // Read each value
  // If uneven length, read body
};

Parser.

Parser.prototype.readIntBE = function () {
  this.message = this.message.slice();
};
*/

module.exports = parser;