const mongoose = require('mongoose');

// Schema for attendance records
const attendanceSchema = new mongoose.Schema({
    subject: String,
    conductedClasses: {
        type: Number,
        default: 0
    },
    attendedClasses: {
        type: Number,
        default: 0
    }
});



// Calculate attendance percentage
attendanceSchema.virtual('attendancePercentage').get(function() {
    return this.conductedClasses === 0 ? 0 : (this.attendedClasses / this.conductedClasses) * 100;
});

// Schema for users
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
        unique: true
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
    },
    // Reference to attendance records
    attendance: [attendanceSchema]
});

const User = mongoose.model('User', userSchema);

module.exports = User;
