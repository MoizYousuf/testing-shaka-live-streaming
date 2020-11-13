// mongoose/mongoose.js
const mongoose = require('mongoose');
const db = require('../config/keys').mongoURI;

mongoose.Promise = global.Promise;

/**
 * Connect to MongoDB Database HERE I CONNECTING MY SERVER TO DATABASE
 */
mongoose
    .connect(db)
    .then(() => console.log('MongoDB Connected'))
    .catch((err) => console.log(err));

module.export = { mongoose };