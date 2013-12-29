var Reader = require('./reader');
var Writer = require('./writer');
var Encoder = require('./encoder');
var decoder = require('./decoder');
var parser = require('./parser');
var unparser = require('./unparser');
var element = require('./element');
var rc4drop = require('./rc4drop');
var utils = require('./utils');
var net = require('net');
var crypto = require('crypto');

var writer = new Writer(socket);
var reader = new Reader();
var decoder = new Decoder();
var encoder = new Encoder();
var encodeCipher;
var key;

var password = 'mAfCZpby1DbPqZ9j8RFdUqJ5dsw=';
var phone = '12526534487';

socket.pipe(reader).pipe(decoder).on('data', function (message) {
	var node = parser(message);

	console.log('< Message:');
	console.log(message);
	console.log('< Element:');
	console.log(require('util').inspect(node, false, null));

	switch (node.name) {
		case 'challenge':
			// Store nonce
			var nonce = node.children;

			// Derive key
			key = crypto.pbkdf2Sync(new Buffer(password, 'base64'), nonce, 16, 20);

			// Set key on decoder
			decoder.setKey(key);

			// Create encoder, decoder & hasher streams
			encodeCipher = new rc4drop(key, 256);
			var hasher = crypto.createHmac('sha1', key);

			// Create response body
			var timestamp = utils.timestamp();
			var body = Buffer.concat([
				new Buffer(phone),
				nonce,
				new Buffer(timestamp.toString())
			]);

			// Encrypt data, create signature, concatenate and send
			var encodedData = encodeCipher.encrypt(body);
			var hasher = crypto.createHmac('sha1', key);
			hasher.write(encodedData, function () {
				hasher.end(function () {
					var signature = hasher.read(4);
					var response = Buffer.concat([
						signature,
						encodedData
					]);

					// Construct <response xmlns="..">[...]</response> node
					var response = element('response', {
						xmlns: 'urn:ietf:params:xml:ns:xmpp-sasl'
					}, response);

					// Send back response
					writer.write(unparser(response), function () {
						console.log('> Written <response /> message');
					});
				});
			});
		break;

		case 'success':
			// If authentication went successful, set encoder on encrypter
			writer.setCipher(encodeCipher);
			writer.setKey(key);
			writer.setEncoded(true);

			var presence = element('presence', {
				type: 'available',
				name: 'Koen'
			});

			writer.write(unparser(presence), function () {
				console.log('Written <presence />');
			});
		break;

		case 'iq':
			var iq = element('iq', {
				to: 's.whatsapp.net',
				id: node.attrs.id,
				type: 'result'
			});

			writer.write(unparser(iq), function () {
				console.log('Written pong (reply to iq)');
			});
		break;
	}
});

var stream = element('stream:stream', {
	to: 's.whatsapp.net',
	resource: 'WP7-2.9.4-5222'
});

var auth = element('auth', {
	xmlns: 'urn:ietf:params:xml:ns:xmpp-sasl',
	mechanism: 'WAUTH-1',
	user: phone
});

writer.write(unparser(stream), 'binary', function () {
	writer.write(unparser(auth), 'binary', function () {
		console.log('> Written <stream /> and <auth /> messages');
	});
});