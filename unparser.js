var dictionary = require('./dictionary');
var _ = require('lodash');

function unparser(element) {
	var buffer = new Buffer(0);

	// Write list
	writeList(element);

	// Add message prefix (flag, length)
	writeInt8(0);
	writeInt8(0);
	writeInt8(buffer.length); // TODO: Should be Int16

	return buffer;


	function writeList(element) {
		// Write list
		writeInt8('\xf8');

		// Write list length
		writeInt8(String.fromCharCode(1 + _.size(element.attrs) + 1));

		// Add tag name
		writeInt8(dictionary.getKey(element.name));

		// Add attributes
		_.each(element.attrs, function (value, key) {
			var value = dictionary.getKey(value);
			var key = dictionary.getKey(key);

			writeInt8(key);
			writeInt8(value);
		});

		// Add children or text
		if (element.children.length) {
			/*
			Should handle transparant lists, little bit more complicated..

			_.each(element.children, function (child) {
				writeList(child);
			});
			*/
		} else {
			//..
		}
	}

	function writeInt8(data) {
		buffer.write(data);
	}
}

module.exports = unparser;