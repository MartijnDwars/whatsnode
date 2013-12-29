module.exports = {
    timestamp: function () {
        return Math.round(new Date().getTime()/1000);
    }
};