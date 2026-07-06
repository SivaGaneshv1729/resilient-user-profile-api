const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    id: {
        type: String,
        required: true,
        unique: true
    },
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    registrationDate: {
        type: Date,
        default: Date.now
    }
});

// Use 'id' instead of '_id' for the output
userSchema.set('toJSON', {
    transform: (document, returnedObject) => {
        returnedObject.id = returnedObject.id || returnedObject._id;
        delete returnedObject._id;
        delete returnedObject.__v;
    }
});

module.exports = mongoose.model('User', userSchema);
