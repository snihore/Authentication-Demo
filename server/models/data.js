const mongoose = require('mongoose');

var Data = mongoose.model("Data", {
    text: {
        type: String,
        require: true,
        trim: true,
        minlength: 1
    },
    completed: {
        type: Boolean,
        default: false
    },
    _creator:{
        type: mongoose.Schema.Types.ObjectId,
        require: true
    }
})

module.exports = {Data};