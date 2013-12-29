var parser = require('../parser.js');
var element = require('../element.js');
var should = require('should');

describe('Parser', function () {
	it('should correctly parse a message with only one element', function () {
		var stream = parser(
			new Buffer('\xf8\x01\x01', 'binary')
		);

		var expected = element('stream:stream');

		stream.should.eql(expected);
	});

	it('should correctly parse a message with static size attributes', function () {
		var challenge = parser(
			new Buffer('\xf8\x03\x01\x41\xab', 'binary')
		);

		var expected = element('stream:stream', {
			from: 's.whatsapp.net'
		});

		challenge.should.eql(expected);
	});

	it('should correctly parse a message with dynamic size attributes'/*, function () {
		var challenge = parser(
			new Buffer('\xf8\x03\xbe\x25\xfc\x0a\x01\x03\x03\x08\x05\x07\x08\x02\x03\x04', 'binary')
		);

		var expected = element('success', {
			creation: '1338578234'
		});

		challenge.should.eql(expected);
	}*/);

	it('should correctly parse a message with attribute and data', function () {
		var challenge = parser(
			new Buffer('\xf8\x04\x1b\xe8\xcf\xfc\x14\x31\xe3\xb5\xe4\x5c\x35\xb4\x9a\xf2\xf8\x91\x4c\x24\x8a\x52\x4a\xda\x05\x18\x44', 'binary')
		);

		var expected = element('challenge', {
			xmlns: 'urn:ietf:params:xml:ns:xmpp-sasl'
		}, new Buffer('\x31\xe3\xb5\xe4\x5c\x35\xb4\x9a\xf2\xf8\x91\x4c\x24\x8a\x52\x4a\xda\x05\x18\x44', 'binary'));

		challenge.should.eql(expected);
	});

	it('should correctly parse a message with a transparant list', function () {
		var features = parser(
			new Buffer('\xf8\x02\xbb\xf8\x01\xf8\x01\x9c', 'binary')
		);

		var expected = element('stream:features', {}, [
			element('receipt_acks')
		]);

		features.should.eql(expected);
	});

	it('should correctly parse a message with a transparant list containing one list', function () {
		var iq = parser(
			new Buffer('\xf8\x08\x55\x41\xab\x4d\xfc\x0f\x31\x33\x37\x38\x33\x38\x39\x34\x39\x32\x2d\x70\x69\x6e\x67\xcb\x43\xf8\x01\xf8\x03\x8b\xe8\xd3', 'binary')
		);

		var expected = element('iq', {
			from: 's.whatsapp.net',
			id: new Buffer('\x31\x33\x37\x38\x33\x38\x39\x34\x39\x32\x2d\x70\x69\x6e\x67', 'binary'),
			type: 'get',
		}, [
			element('ping', {
				xmlns: 'urn:xmpp:ping'
			})
		]);

		iq.should.eql(expected);
	});

	it.only('should correctly parse a message with a transparant list containing multiple lists', function () {
		var message = parser(
			new Buffer('f80a6f41fafc0b3331363330303836393039ab4dfc0c313337393235303139302d33cb1cc3fc0a31333739323532303037f804f8057de8d576fc0d4d617274696a6e204477617273f803a3e8d4f80217fc0548616c6c6ff8017f', 'hex')
		);

		var expected = element('message', {
			    from: '31630086909@s.whatsapp.net',
			    id: new Buffer('\x31\x33\x37\x39\x32\x35\x30\x31\x39\x30\x2d\x33', 'binary'),
			    type: 'chat',
			    t: new Buffer('\x31\x33\x37\x39\x32\x35\x32\x30\x30\x37', 'binary')
			}, [
			    element('notify', {
			        xmlns: 'urn:xmpp:whatsapp',
			        name: new Buffer('\x4d\x61\x72\x74\x69\x6a\x6e\x20\x44\x77\x61\x72\x73', 'binary')
			    }),
			    element('request', {
			        xmlns: 'urn:xmpp:receipts'
			    }),
			    element('body', {}, new Buffer('\x48\x61\x6c\x6c\x6f', 'binary')),
			    element('offline')
			]
		);

		message.should.eql(expected);
	});

	it('should correctly parse a message with a pair', function () {
		var presence = parser(
			new Buffer('\xf8\x05\x90\x41\xfa\xfc\x0b\x31\x32\x35\x32\x36\x35\x33\x34\x34\x38\x37\xab\xcb\x12', 'binary')
		);

		var expected = element('presence', {
			from: "12526534487@s.whatsapp.net",
			type: "available"
		});

		presence.should.eql(expected);
	});
});