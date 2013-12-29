var protocol = require('./protocol');

protocol.on('challenge', function () {
    console.log('Get challenge event');
});

protocol.connect('12526534487', 'mAfCZpby1DbPqZ9j8RFdUqJ5dsw=');