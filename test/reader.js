var reader = require('../reader.js');
var should = require('should');

var testStream = function (stream, input, output) {
	input.forEach(function (chunk) {
		stream.write(chunk);
	});

	stream.read().should.eql(output);
};

describe('Reader', function () {
	describe('construtor', function () {
		it('should return an instance of Reader whether or not using "new"', function () {
			var stream1 = new reader();
			stream1.should.be.an.instanceOf(reader);

			var stream2 = reader();
			stream2.should.be.an.instanceOf(reader);
		});
	});

	describe('parser', function () {
		it('should parse a single message', function () {
			testStream(reader(), [
				new Buffer('\x00\x00\x01\xaa', 'binary')
			], new Buffer('\x00\x00\x01\xaa', 'binary'));
		});

		it('should parse two separate message', function () {
			testStream(reader(), [
				new Buffer('\x00\x00\x01\xaa', 'binary'),
				new Buffer('\x00\x00\x01\xbb', 'binary')
			], new Buffer('\x00\x00\x01\xaa\x00\x00\x01\xbb', 'binary'));
		});

		it('should parse two messages at once', function () {
			testStream(reader(), [
				new Buffer('\x00\x00\x01\xaa\x00\x00\x01\xbb', 'binary'),
			], new Buffer('\x00\x00\x01\xaa\x00\x00\x01\xbb', 'binary'));
		});

		it('should parse half message first, then the other part, then another message', function () {
			testStream(reader(), [
				new Buffer('\x00\x00\x02\x50', 'binary'),
				new Buffer('\x51', 'binary'),
				new Buffer('\x00\x00\x01\x52', 'binary'),
			], new Buffer('\x00\x00\x02\x50\x51\x00\x00\x01\x52', 'binary'));
		});
	});
});