var crypto = require('crypto');

var RC4 = function (key, drop) {
	this.cipher = crypto.createCipheriv('rc4', key, '');

	if (drop) {
		this.cipher.update(new Buffer(drop));
	}
}

RC4.prototype.encrypt = function (data) {
	return this.cipher.update(data);
};

module.exports = RC4;

/*
var Transform = require('stream').Transform;
var util = require('util');
var crypto = require('crypto');

function Rc4drop(key, n) {
	// Use as constructor or as function (e.g. with or without 'new')
	if (!(this instanceof Rc4drop))
		return new Rc4drop(key, n);

	// Validate arguments
	if (!key) {
		throw new Error("Rc4drop requires a valid key");
	}

	// Super constructor
	Transform.call(this);

	// Alias 'this'
	var self = this;

	// Remember if we've swalloed the first n bytes
	var swallowed = false;

	// Create cipher (stream) and forward data
	this.cipher = crypto.createCipheriv('rc4', key, '');

	// Swallow first n bytes, then simply emit data from cipher
	this.cipher.on('data', function (data) {
		if (swallowed) {
			self.push(data);
		} else {
			swallowed = true;
		}
	});

	// If drop specified, write dummy buffer of length n
	if (n) {
		this.cipher.write(new Buffer(n));
	}
}

util.inherits(Rc4drop, Transform);

Rc4drop.prototype._transform = function (chunk, encoding, done) {
	return this.cipher.write(chunk, encoding, function () {
		done();
	});
};

module.exports = Rc4drop;
*/