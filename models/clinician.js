const mongoose = require('mongoose')

const clinicalNote = new mongoose.Schema({  // each user has an array of these
    timestamp: Date,
    local_date: String,
    note: {type: String},
    patient_id: {type: mongoose.Schema.Types.ObjectId, ref: 'Patient'},
    clinician_id: {type: mongoose.Schema.Types.ObjectId, ref: 'Clinician'}
})

const schema = new mongoose.Schema({
    first_name: String,
    last_name: String,
    selectedpatient_id: {type: mongoose.Schema.Types.ObjectId, ref: 'Patient'},
    notes: [clinicalNote],
    mypatients: [{type: mongoose.Schema.Types.ObjectId, ref: 'Patient'}]  
})

const Clinician = mongoose.model('Clinician', schema)
const ClinicalNote = mongoose.model('ClinicalNote', clinicalNote)
// module.exports = Clinician
module.exports = { Clinician, ClinicalNote }
