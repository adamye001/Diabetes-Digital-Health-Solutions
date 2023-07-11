// Mongoose model for our Users collection - includes password comparison used in authentication

const mongoose = require('mongoose'),
        Schema = mongoose.Schema,
        passportLocalMongoose = require('passport-local-mongoose')

const bcrypt = require('bcrypt')

const userSchema = new mongoose.Schema({
    username: {type: String, required: true, unique: true},
    password: {type: String, required: true},
    displayname: {type: String, required: true},
    usertype: {type: String, required: true}, // admin, patient or clinician
    yearofbirth: {type: Number, min: 1900},
    textbio: {type: String},
    patient_id: {type: mongoose.Schema.Types.ObjectId, ref: 'Patient'},  
    clinician_id: {type: mongoose.Schema.Types.ObjectId, ref: 'Clinician'}
})

// password comparison function, not used as will use
userSchema.methods.verifyPassword = function (password, callback) {
    bcrypt.compare(password, this.password, (err, valid) => {
        callback(err, valid)
    })
}

const SALT_FACTOR = 10

// hash password before saving
userSchema.pre('save', function save(next) {
    const user = this// go to next if password field has not been modified
    if (!user.isModified('password')) {
        return next()
    }

    // auto-generate salt/hash
    bcrypt.hash(user.password, SALT_FACTOR, (err, hash) => {
        if (err) {
            return next(err)
        }
        //replace password with hash
        user.password = hash
        next()
    })
})

userSchema.plugin(passportLocalMongoose)

const User = mongoose.model('User', userSchema)
module.exports = User