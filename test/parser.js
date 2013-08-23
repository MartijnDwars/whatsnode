var parser = require('../parser.js');
var element = require('../element.js');
var should = require('should');

describe('Parser', function () {
	it('should correctly parse a message with only one element', function () {
		var stream = parser(
			new Buffer('\x00\x00\x03\xf8\x01\x01', 'binary')
		);

		var expected = element('stream:stream');

		stream.should.eql(expected);
	});

	it('should correctly parse a message with static size attributes', function () {
		var challenge = parser(
			new Buffer('\x00\x00\x05\xf8\x03\x01\x41\xab', 'binary')
		);

		var expected = element('stream:stream', {
			from: 's.whatsapp.net'
		});

		challenge.should.eql(expected);
	});

	it('should correctly parse a message with dynamic size attributes'/*, function () {
		var challenge = parser(
			new Buffer('\x00\x00\x10\xf8\x03\xbe\x25\xfc\x0a\x01\x03\x03\x08\x05\x07\x08\x02\x03\x04', 'binary')
		);

		var expected = element('success', {
			creation: '1338578234'
		});

		challenge.should.eql(expected);
	}*/);

	it('should correctly parse a message with attribute and data', function () {
		var challenge = parser(
			new Buffer('\x00\x00\x1b\xf8\x04\x1b\xe8\xcf\xfc\x14\x31\xe3\xb5\xe4\x5c\x35\xb4\x9a\xf2\xf8\x91\x4c\x24\x8a\x52\x4a\xda\x05\x18\x44', 'binary')
		);

		var expected = element('challenge', {
			xmlns: 'urn:ietf:params:xml:ns:xmpp-sasl'
		}, new Buffer('\x31\xe3\xb5\xe4\x5c\x35\xb4\x9a\xf2\xf8\x91\x4c\x24\x8a\x52\x4a\xda\x05\x18\x44', 'binary'));

		challenge.should.eql(expected);
	});

	it('should correctly parse a message with a transparant list', function () {
		var features = parser(
			new Buffer('\x00\x00\x08\xf8\x02\xbb\xf8\x01\xf8\x01\x9c', 'binary')
		);

		var expected = element('stream:features', {}, [
			element('receipt_acks')
		]);

		features.should.eql(expected);
	});
});