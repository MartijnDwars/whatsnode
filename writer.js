/**
 * This file represents a writable stream. Its main responsibility is to send the initialization packet. Furthermore, it acts as a gateway to the actual socket.
 */

var Writable = require('stream').Writable;
var util = require('util');

function Writer(socket) {
	Writable.call(this);

	this.socket = socket;
	this.write(new Buffer('WA\x01\x02', 'binary'), 'binary');
}

util.inherits(Writer, Writable);

Writer.prototype.write = function (chunk, encoding, callback) {
	return this.socket.write(chunk, callback);
};

module.exports = Writer;