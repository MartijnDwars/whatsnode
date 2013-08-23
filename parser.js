var dictionary = require('./dictionary');
var element = require('./element');

function parser(message) {
  var pointer = 0;

  // Skip first 2 bytes
  readInt8(2);

  // If we've got a list
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

    // Iterate through attributes
    for (var i = 0; i < Math.floor((length-1)/2); i++) {
      var key = readInt8();
      var val = readInt8();
      
      if (val === 0xfc) {
        var x = asBinary();
        attrs[dictionary.getValue(key)] = asBinary().toString('utf-8');
      } else {
        attrs[dictionary.getValue(key)] = dictionary.getValue(val);
      }
    }

    // Even list length means children
    if (length % 2 === 0) {
      var token = readInt8();

      // Binary data as child element
      if (token === 0xfc) {
        var data = asBinary();

      // List as child element
      } else if (token === 0xf8) {
        // ok, so we know we are going to get a list, so we first get the length
        var listLength = readInt8();
        // each element will be a list, because otherwise we will get strange xml (probably not even valid)
        for (var j = 0; j < listLength; j++) {
          // if it indeed is a list
          if (readInt8() === 0xf8) {
            // parse it as a list (recursive)
            children.push(asList());
          } else {
            throw new Error("Unable to parse message: no list found.."); // TODO: duplicate? put it in asList?
          }
        }
      }
    }

    return new element(dictionary.getValue(tag), attrs, data || children);
  }

  function asBinary() {
    var length = readInt8();
    var buffer = message.slice(pointer, pointer + length);

    pointer += length + 1;
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