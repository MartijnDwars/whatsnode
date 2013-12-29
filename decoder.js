/**
 * Wrapper around node's cipher stream. Main purpose is to check whether the message is decoded and decode if it is.
 */

var Transform = require('stream').Transform;
var util = require('util');
var crypto = require('crypto');
var debug = require('debug')('decoder');
var rc4drop = require('./rc4drop');
var _ = require('lodash');
var bufferEqual = require('buffer-equal')

function Decoder() {
  if (!(this instanceof Decoder))
    return new Decoder();

  Transform.call(this);
}

util.inherits(Decoder, Transform);

Decoder.prototype.setKey = function (key) {
	this.key = key;
	this.cipher = new rc4drop(key, 256);

	console.log('Key: ' + key.toString('hex'));
};

Decoder.prototype._transform = function (message, encoding, done) {
	var checksum
	  , data
	  , hasher
	  , signature
	  , self = this;

	if (Decoder.isEncoded(message)) {
		if (this.key) {
			checksum = message.slice(3, 7);
			data = message.slice(7);

			hasher = crypto.createHmac('sha1', this.key);
			hasher.end(data, function () {
				signature = hasher.read(4);
				if (bufferEqual(signature, checksum)) {

					var decoded = self.cipher.encrypt(data);
					debug('[] ' + decoded.toString('hex'));
					self.push(decoded);
				} else {
					// TODO Async error: re-calculated checksum incorrect
					console.error('Re-calculated checksum incorrect');
				}
			});
		} else {
			// TODO Async error: encoded message, but no key available
			console.error('Encoded message, but no key available');
		}
	} else {
		data = message.slice(3);
		debug('][ ' + data.toString('hex'));
		this.push(data);
	}

	done();
};

Decoder.isEncoded = function (message) {
	return message[0] >> 7;
};

module.exports = Decoder;