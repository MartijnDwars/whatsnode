var dictionary = require('./dictionary');
var _ = require('lodash');

// TODO: Abstract buffer behaviour, I just want to append things.. make easy API?

function unparser(element) {
	var body = new Buffer(0);

	// Write list
	writeList(element);

	return body;


	function writeList(element) {
		// Write list
		writeUInt8(0xf8);

		// Write list length
		writeUInt8(1 + 2 * _.size(element.attrs) + (element.children.length ? 1 : 0));

		// Add tag name
		writeUInt8(dictionary.getKey(element.name));

		// Add attributes
		_.each(element.attrs, function (value, key) {
			var byteKey = dictionary.getKey(key);
			var byteValue = dictionary.getKey(value);

			writeUInt8(byteKey);

			if (byteValue != -1) {
				writeUInt8(byteValue);
			} else {
				// If it ends with '@s.whatsapp.net'
				if (value.substr(-15) === '@s.whatsapp.net') {
					// Write JID_PAIR
					writeUInt8(0xfa);

					// Write binary
					writeBinary(value.slice(0, -15));

					// Write 's.whatsapp.net'
					writeUInt8(dictionary.getKey('s.whatsapp.net'));
				} else {
					writeBinary(value);
				}
			}
		});

		// Add children or text
		if (_.isArray(element.children) && element.children.length) {
			writeUInt8(0xf8);
			writeUInt8(element.children.length);

			_.each(element.children, function (child) {
				writeList(child);
			});
		} else if (Buffer.isBuffer(element.children)) {
			writeBinary(element.children);
		}
	}

	function writeBinary(text) {
		writeUInt8(0xfc);
		writeUInt8(text.length);

		body = Buffer.concat([
			body,
			new Buffer(text)
		]);
	}

	function writeUInt8(data) {
		var appendBuffer = new Buffer(1);
		appendBuffer.writeUInt8(data, 0);

		body = Buffer.concat([
			body,
			appendBuffer
		]);
	}
}

module.exports = unparser;