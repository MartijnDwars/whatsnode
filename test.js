var Writer = require('./writer');
var Reader = require('./reader');
var parser = require('./parser');
var net = require('net');

var socket = net.connect({
	host: 'c.whatsapp.net',
	port: 5222
});

var writer = new Writer(socket); // TODO: would be nicer if we could pipe the writer to the socket, instead of passing it as dependency?
var reader = new Reader();

// TODO: create a parser that transforms messages into their xml equivalent

socket.pipe(reader).on('data', function (message) {
	var element = parser(message); // TODO: Use pipeline to convert messages into elements

	/*
	console.log('Message:');
	console.log(message);
	console.log('Element:');
	console.log(element);
	*/

	switch (element.name) {
		case 'challenge':
			console.log('Nonce:');
			console.log(element.children);

			// Derive key
			// Implement RC4Drop
			// Set key on upstream/downstream
			// DONE :)
		break;
	}
});

/*
var stream = new Element('stream:stream', {
	to: 's.whatsapp.net',
	resource: 'iPhone-2.6.9-5222'
});
*/

// TODO: create a parser that transforms elements into their message equivalent

//writer.write(stream);

writer.write(new Buffer('\x00\x00\x16\xf8\x05\x01\xc8\xab\xa5\xfc\x0e\x57\x50\x37\x2d\x32\x2e\x39\x2e\x34\x2d\x35\x32\x32\x32', 'binary'), 'binary', function () {
	console.log('Written');
});
writer.write(new Buffer('\x00\x00\x15\xf8\x07\x10\xe8\xcf\x6d\xec\xda\xfc\x0b\x33\x31\x36\x33\x30\x30\x38\x36\x39\x30\x39', 'binary'), 'binary', function () {
	console.log('Written 2');
});