const mongoose = require('mongoose')

const schema = new mongoose.Schema({
    timestamp: Date,
    blood_glucose_timestamp: Date,
    weight_timestamp: Date,
    insulin_doses_timestamp: Date,
    exercise_timestamp: Date,
    local_date: String,
    blood_glucose: { type: Number, min: 0, max: 200},
    blood_glucose_comment: String,
    weight: { type: Number, min: 0, max: 700},
    weight_comment: String,
    insulin_doses: { type: Number, min: 0},
    insulin_doses_comment: String,
    exercise: { type: Number, min: 0},
    exercise_comment: String,
    patient_id: {type: mongoose.Schema.Types.ObjectId, ref: 'Patient'}
})

const PatientDataItem = mongoose.model('PatientDataItem', schema)
module.exports = PatientDataItem