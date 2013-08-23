function Parser(message) {
  if (!(this instanceof Parser)) {
    return new Parser(message);
  }

  this.message = message;

  if (Parser.isList(message)) {
    console.log('Its a list! Now go parse it as a list!');
  }
};

Parser.prototype.asList = function () {
  // Read length
  // Read each attribute
  // Read each value
  // If uneven length, read body
};

/*** Predicates ***/

Parser.isList = function (message) {
  return message[3] === 0xf8;
};

/*** Util ***/

Parser.prototype.readIntBE = function () {
  this.message = this.message.slice();
};

module.exports = Parser;