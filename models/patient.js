const mongoose = require('mongoose')

const schema = new mongoose.Schema({
    first_name: String,
    last_name: String,
    blood_glucose_upper: { type: Number, min: 0},
    blood_glucose_lower: { type: Number, min: 0},
    weight_upper: { type: Number, min: 0},
    weight_lower: { type: Number, min: 0},
    insulin_doses_upper: { type: Number, min: 0},
    insulin_doses_lower: { type: Number, min: 0},
    exercise_upper: { type: Number, min: 0},
    exercise_lower: { type: Number, min: 0},
    blood_glucose_reqd: Boolean,
    weight_reqd: Boolean,
    insulin_doses_reqd: Boolean,
    exercise_reqd: Boolean,
    support_msg: String,
    data_pts_asked: Number,
    data_pts_recd: Number,
    engagement_rate: Number,
    colour_scheme: String, 
    date_registered: Date,
    myclinician: {type: mongoose.Schema.Types.ObjectId, ref: 'Clinician'}
})

const Patient = mongoose.model('Patient', schema)
module.exports = Patient