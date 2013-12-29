/**
 * This file represents a writable stream. Its main responsibility is to send
 * the initialization packet. Furthermore, if encryption is enabled (after
 * setEncryption is called), the chunk is first piped through the rc4drop
 * stream.
 */

var Writable = require('stream').Writable
  , util = require('util')
  , rc4drop = require('./rc4drop')
  , debug = require('debug')('nodeapp:writer');

function Writer(socket) {
    if (!(this instanceof Writer)) {
        return new Writer(socket);
    }
    
	Writable.call(this);

	this.socket = socket;
	this.socket.write(new Buffer('WA\x01\x02', 'binary'), 'binary');
}

util.inherits(Writer, Writable);

Writer.prototype.setEncoded = function () {
    this.encoded = true;
}

Writer.prototype.setCipher = function (cipher) {
    this.cipher = cipher;
}

Writer.prototype.setKey = function (key) {
    this.key = key;
}

Writer.prototype.write = function (chunk, encoding, callback) {
    // Flag
    if (this.encoded) {
        var flag = new Buffer('10', 'hex');
        var hasher = require('crypto').createHmac('sha1', this.key);
        var encoded = this.cipher.encrypt(chunk);
        var signature = hasher.update(encoded).digest();

        console.log('Key:');
        console.log(this.key);

        console.log('Encoded:');
        console.log(encoded);

        console.log('Signature:');
        console.log(signature);
        
        // Modify chunk
        chunk = Buffer.concat([
            encoded,
            signature.slice(0, 4),
        ]);
    } else {
        var flag = new Buffer('00', 'hex');
    }

    // Length (TODO: length should be double byte, now forced 0)
    var length = new Buffer([0, chunk.length]);

    // Build header
    var header = Buffer.concat([
        flag,
        length
    ]);

    // Build message
    var message = Buffer.concat([
        header,
        chunk,
    ]);

    debug('>> ' + message.toString('hex'));

	this.socket.write(message, encoding, callback);
};

module.exports = Writer;