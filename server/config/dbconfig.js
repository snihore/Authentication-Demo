const mongoose = require('mongoose');

mongoose.Promise = global.Promise;
mongoose.connect('mongodb://localhost:27017/AuthenticationDB', { useNewUrlParser: true });

module.exports = {mongoose};