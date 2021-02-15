const mongoose = require('mongoose')
const userSchema = mongoose.Schema({
    email: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        required: true
    },
    messages: [{
        type: String
    }]
})

module.exports = mongoose.model('user', userSchema)