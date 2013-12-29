function Encoder() {
}

Encoder.prototype.setCipher = function (cipher) {
    this.cipher = cipher;
};

Encoder.prototype.encode = function (message) {
    return this.cipher.encrypt(message);
};

module.exports = Encoder;