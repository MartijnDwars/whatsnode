var unparser = require('../unparser.js');
var element = require('../element.js');
var should = require('should');

describe('Unparser', function () {
	it('should unparse a message with only one element', function () {
		var stream = unparser(
			element('stream:stream')
		);

		var expected = new Buffer('\xf8\x01\x01', 'binary');

		stream.should.eql(expected);
	});

	it('should unparse a message with one element, two attributes (of which one has a non-dictionary value)', function () {
		var stream = unparser(
			element('stream:stream', {
				to: 's.whatsapp.net',
				resource: 'WP7-2.9.4-5222'
			})
		);

		var expected = new Buffer('\xf8\x05\x01\xc8\xab\xa5\xfc\x0e\x57\x50\x37\x2d\x32\x2e\x39\x2e\x34\x2d\x35\x32\x32\x32', 'binary');

		stream.should.eql(expected);
	});

	it('should unparse a message with one element, three attributes (of which one has a non-dictionary value)', function () {
		var auth = unparser(
			element('auth', {
				xmlns: 'urn:ietf:params:xml:ns:xmpp-sasl',
				mechanism: 'WAUTH-1',
				user: '31630086909'
			})
		);

		var expected = new Buffer('\xf8\x07\x10\xe8\xcf\x6d\xec\xda\xfc\x0b\x33\x31\x36\x33\x30\x30\x38\x36\x39\x30\x39', 'binary');

		auth.should.eql(expected);
	});

	it('should unparse a message with static size attributes', function () {
		var challenge = unparser(
			element('stream:stream', {
				from: 's.whatsapp.net'
			})
		);

		var expected = new Buffer('\xf8\x03\x01\x41\xab', 'binary');

		challenge.should.eql(expected);
	});

	it('should unparse a message with attribute and data', function () {
		var challenge = unparser(
			element('challenge', {
				xmlns: 'urn:ietf:params:xml:ns:xmpp-sasl'
			}, new Buffer('\x31\xe3\xb5\xe4\x5c\x35\xb4\x9a\xf2\xf8\x91\x4c\x24\x8a\x52\x4a\xda\x05\x18\x44', 'binary'))
		);

		var expected = new Buffer('\xf8\x04\x1b\xe8\xcf\xfc\x14\x31\xe3\xb5\xe4\x5c\x35\xb4\x9a\xf2\xf8\x91\x4c\x24\x8a\x52\x4a\xda\x05\x18\x44', 'binary');

		challenge.should.eql(expected);
	});

	it('should unparse a message with a transparant list', function () {
		var features = unparser(
			element('stream:features', {}, [
				element('receipt_acks')
			])
		);

		var expected = new Buffer('\xf8\x02\xbb\xf8\x01\xf8\x01\x9c', 'binary');

		features.should.eql(expected);
	});

	it('should unparse a message with child element and JID_PAIR ', function () {
		var iq = unparser(
				element('iq', {
				id: '1234567890-1',
				to: '31612345678@s.whatsapp.net',
				type: 'get'
			}, [
				element('query', {
					xmlns: 'jabber:iq:last'
				})
			])
		);

		var expected = new Buffer('\xf8\x08\x55\x4d\xfc\x0c\x31\x32\x33\x34\x35\x36\x37\x38\x39\x30\x2d\x31\xc8\xfa\xfc\x0b\x33\x31\x36\x31\x32\x33\x34\x35\x36\x37\x38\xab\xcb\x43\xf8\x01\xf8\x03\x98\xe8\x59', 'binary');
	});
});