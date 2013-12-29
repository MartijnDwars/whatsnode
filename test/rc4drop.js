// Create rc4drop stream with dummy key and dummy drop
// Verify that writing a lot of bytes and reading them one after another works

var rc4drop = require('../rc4drop.js');
var should = require('should');

var testStream = function (stream, input, output) {
    input.forEach(function (chunk) {
        stream.write(chunk);
    });

    should.deepEqual(stream.read(), output);
};

describe('Rc4drop', function () {
    describe('construtor', function () {
        it('should return an instance of Rc4drop whether or not using "new"', function () {
            var rc4drop1 = new rc4drop('abc');
            rc4drop1.should.be.an.instanceOf(rc4drop);

            var rc4drop2 = rc4drop('abc');
            rc4drop2.should.be.an.instanceOf(rc4drop);
        });
    });

    describe('write', function () {
        it('should drop first 5 bytes from keystream and encrypt message', function () {
            testStream(rc4drop('abc', 5), [
                new Buffer('abcde', 'ascii')
            ], new Buffer('\xbe\x8f\x10\x48\x82', 'binary'));
        });
    });
});