// user.js
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        validate: {
            validator: function(v) {
                return /@sahyadri\.edu\.in$/.test(v);
            },
            message: props => `${props.value} is not a valid Sahyadri College email address. Please enter a valid email ending with @sahyadri.edu.in.`
        }
    },
    password: {
        type: String,
        required: true
    },
    usn: {
        type: String,
        required: true,
        unique: true,
       
    },
    branch: {
        type: String,
        required: true
    },
    year: {
        type: Number,
        required: true,
        min: 1,
        max: 4
    }
});

const User = mongoose.model('User', userSchema);

module.exports = User;




