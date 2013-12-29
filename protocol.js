var events = require('events')
  , util = require('util')
  , net = require('net')
  , crypto = require('crypto')
  , debug = require('debug')('protocol')
  , writer = require('./writer')
  , reader = require('./reader')
  , decoder = require('./decoder')
  , parser = require('./parser')
  , unparser = require('./unparser')
  , element = require('./element')
  , rc4drop = require('./rc4drop')
  , utils = require('./utils');

function Protocol(phone) {
    events.EventEmitter.call(this);
}

util.inherits(Protocol, events.EventEmitter);

var key;
var encodeCipher;

Protocol.prototype.connect = function (phone, password) {
    if (!phone || !password) {
        throw new Error("Unable to connect without phone or password");
    }

    this.phone = phone;
    this.password = password;

    var socket = net.connect({
        host: 'c.whatsapp.net',
        port: 5222
    }, this.onConnect.bind(this));

    this.decoder = decoder();

    socket
        .pipe(reader())
        .pipe(this.decoder)
        .on('data', this.onData.bind(this))
        .on('close', this.onClose.bind(this));

    this.writer = writer(socket);
};

Protocol.prototype.onConnect = function () {
    var stream = element('stream:stream', {
        to: 's.whatsapp.net',
        resource: 'WP7-2.9.4-5222'
    });

    var auth = element('auth', {
        xmlns: 'urn:ietf:params:xml:ns:xmpp-sasl',
        mechanism: 'WAUTH-1',
        user: this.phone
    });

    this.writer.write(unparser(stream));
    this.writer.write(unparser(auth));
};

Protocol.prototype.onData = function (message) {
    message = parser(message);

    debug('<< %j', message);

    switch (message.name) {
        case 'challenge':
            this.processChallenge(message.children);
        break;

        case 'success':
            this.writer.setEncoded();
            this.writer.setCipher(encodeCipher);
            this.writer.setKey(key);

            this.emit('success', {
                kind: message.attrs.kind,
                status: message.attrs.status,
                active: message.attrs.active,
                creation: message.attrs.creation.toString(),
                expiration: message.attrs.expiration.toString(),
            });
        break;

        case 'iq':
            // If ping -> send pong
        break;

        case 'message':
            this.emit('message', message);
        break;

        case 'failure':
            this.emit('failure', message);
        break;
    }
};

Protocol.prototype.onClose = function () {
    this.emit('close');
};

Protocol.prototype.processChallenge = function (nonce) {
    key = crypto.pbkdf2Sync(new Buffer(this.password, 'base64'), nonce, 16, 20);

    // Set key on decoder
    this.decoder.setKey(key);

    // Create encoder, decoder & hasher streams
    encodeCipher = new rc4drop(key, 256);
    var hasher = crypto.createHmac('sha1', key);

    // Create response body
    var timestamp = utils.timestamp();
    var body = Buffer.concat([
        new Buffer(this.phone),
        nonce,
        new Buffer(timestamp.toString())
    ]);

    // Encrypt data, create signature, concat and compose response message
    var encodedData = encodeCipher.encrypt(body);
    var signature = crypto.createHmac('sha1', key).update(encodedData).digest().slice(0, 4);
    var response = Buffer.concat([
        signature,
        encodedData
    ]);

    // Construct <response xmlns="..">[...]</response> node
    var response = element('response', {
        xmlns: 'urn:ietf:params:xml:ns:xmpp-sasl'
    }, response);

    // Send back response
    this.writer.write(unparser(response));
};

Protocol.prototype.setPresence = function (type, name) {
    var presence = element('presence', {
        type: type,
        name: name
    });

    this.writer.write(
        unparser(presence)
    );
};

Protocol.prototype.getLastSeen = function (phone) {
    var iq = element('iq', {
        id: utils.timestamp + '-1',
        to: phone + '@s.whatsapp.net',
        type: 'get'
    }, [
        element('query', {
            xmlns: 'jabber:iq:last'
        })
    ]);

    this.writer.write(
        unparser(iq)
    );
};

Protocol.prototype.sendMessage = function (phone, message) {
    var message = element('message', {
        to: phone + '@s.whatsapp.net',
        type: 'chat',
        id: '1343676064-1'
    }, [
        new element('x', {
            xmlns: 'jabber:x:event'
        }),
        new element('body', new Buffer(message))
    ]);
};

module.exports = new Protocol;