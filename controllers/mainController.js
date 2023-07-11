// const res = require('express/lib/response')
const Patient = require('../models/patient')
const PatientDataItem = require('../models/patientDataItem')
const User = require('../models/user')
const {Clinician} = require('../models/clinician')
const {ClinicalNote} = require('../models/clinician')
const mongoose = require('mongoose')

// handle request to go to the homepage (logged in as admin, patient or clinician)
const goHome = async (req, res, next) => {
    try {
        return res.redirect('/')
    } catch (err) {
        return next(err)
    }
}

// handle request to go to the My Account homepage (logged in as admin, patient or clinician)
const getAccountView = async (req, res, next) => {
    const patientId = req.user.patient_id
    const clinicianId = req.user.clinician_id
    var thisUser = new User()
    
    try {
        if(patientId) {
            thisUser = await User.findOne({_id: req.user._id}).populate('patient_id').lean()
        }
        else if(clinicianId) {
            thisUser = await User.findOne({_id: req.user._id}).populate('clinician_id').lean()
        }
        else {
            thisUser = await User.findOne({_id: req.user._id}).lean()
        }
        if (thisUser.patient_id != null) { // if user is a patient, check for dark mode
            if (thisUser.patient_id.colour_scheme == "Dark") {
                return res.render('accountView', {user: thisUser, css: "style-dark.css"})
            }
        }
        
        return res.render('accountView', {user: thisUser})
    } catch (err) {
        return next(err)
    }
}

// handle request to go to the configure clinician page (logged in as admin)
const getAdminConfigureClinician = async (req, res, next) => {
    try {
        return res.render('adminConfigureClinician')
    } catch (err) {
        return next(err)
    }
}

// handle request to get patientDataEntry page (logged in as patient)
const getPatientDataEntry = async (req, res, next) => {
    try {
        // find most recent record for this date/patient
        var today = new Date()
        var local_date = ''+("0" + today.getDate()).slice(-2)+("0" + (today.getMonth() + 1)).slice(-2)+today.getFullYear()

        const patientId = req.user.patient_id
        const patientItem = await Patient.findById(patientId).lean()
        const patientDataItem = await PatientDataItem.findOne({ local_date: local_date, patient_id: patientItem._id }).lean(); 
        if (!patientItem) {
             // patient not found in database
             return res.sendStatus(404)
        }
        const no_blood = (patientItem.blood_glucose_reqd) ? 0 : 1
        const no_weight = (patientItem.weight_reqd) ? 0 : 1
        const no_insulin = (patientItem.insulin_doses_reqd) ? 0 : 1
        const no_exercise = (patientItem.exercise_reqd) ? 0 : 1
        if (!patientDataItem) {
            // no patientDataItem found in database for this date/patient
            if (patientItem._id != null) { // if user is a patient, check for dark mode
                if (patientItem.colour_scheme == "Dark") {
                    return res.render('patientDataEntry', {onePatient: patientItem, no_blood: no_blood, no_weight: no_weight, no_insulin: no_insulin, no_exercise: no_exercise, css: "style-dark.css"})
                }
            }
            return res.render('patientDataEntry', {onePatient: patientItem, no_blood: no_blood, no_weight: no_weight, no_insulin: no_insulin, no_exercise: no_exercise })
        }
        if (patientItem._id != null) { // if user is a patient, check for dark mode
            if (patientItem.colour_scheme == "Dark") {
                return res.render('patientDataEntry', {oneItem: patientDataItem, onePatient: patientItem, no_blood: no_blood, no_weight: no_weight, no_insulin: no_insulin, no_exercise: no_exercise, css: "style-dark.css"})
            }
        }
        return res.render('patientDataEntry', {oneItem: patientDataItem, onePatient: patientItem, no_blood: no_blood, no_weight: no_weight, no_insulin: no_insulin, no_exercise: no_exercise})
    } catch (err) {
        return next(err)
    }
}

// handle request to get patientDataView page (logged in as patient)
const getPatientDataView = async (req, res, next) => {
    try {
        const patientId = req.user.patient_id
        const curPatient = await Patient.findOne({ _id: patientId}).lean()
        const patientDataItems = await PatientDataItem.find({ patient_id: patientId}).sort({timestamp: "asc"}).lean()
        const patientUsers = await User.find({ usertype: "patient"}).populate('patient_id').lean()
        //console.log(patientUsers)
        let sortedUsers = patientUsers.sort((c1, c2) => (c1.patient_id.engagement_rate < c2.patient_id.engagement_rate) ? 1 : (c1.patient_id.engagement_rate > c2.patient_id.engagement_rate) ? -1 : 0)
        sortedUsers = sortedUsers.slice(0, 5);  //get top 5 users
        //console.log(sortedUsers)
        if (curPatient._id != null) { // if user is a patient, check for dark mode
            if (curPatient.colour_scheme == "Dark") {
                return res.render('patientDataView', {data: patientDataItems, patient: curPatient, leaderboard: sortedUsers, css: "style-dark.css"})
            }
        }
        return res.render('patientDataView', {data: patientDataItems, patient: curPatient, leaderboard: sortedUsers})
    } catch (err) {
        return next(err)
    }
}

// handle request to get clinician page (logged in as clinician)
const getClinicianDashboard = async (req, res, next) => {
    try {
        var today = new Date()
        var local_date = ''+("0" + today.getDate()).slice(-2)+("0" + (today.getMonth() + 1)).slice(-2)+today.getFullYear()
        const patientList = await Patient.find({ myclinician: req.user.clinician_id}).lean()
        const patientDataItems = await PatientDataItem.find({ local_date: local_date}).populate('patient_id').lean()
        var clinicianId = req.user.clinician_id
        var clinicianIdString = clinicianId.toString()

        let filteredDataItems = patientDataItems.filter(item => item.patient_id.myclinician == clinicianIdString )

        const foundPatients = filteredDataItems.map(a => a.patient_id)

        var patId
        var foundId
        const missingPatients = []
        // Add clinician's patients to dashboard even if no health data entered today
        for (const pat of patientList) {
            found = false
            patId = pat._id.toString()
            for (const foundPat of foundPatients) {
                foundId = foundPat._id.toString()
                if (patId == foundId) {
                    //console.log("already have ", patId)
                    found = true
                    break
                }
            }
            if (!found) {
                missingPatients.push(pat)
            }
        }
        //console.log("missing patient for this clinician", missingPatients )
        return res.render('clinicianDashboard', {data: filteredDataItems, otherPat: missingPatients})
    } catch (err) {
        return next(err)
    }
}

// handle request to get clinician configure patient page (logged in as clinician)
const getClinicianConfigurePatient = async (req, res, next) => {
    try {
        const patientList = await Patient.find({ myclinician: req.user.clinician_id}).lean()
        const curClinician = await Clinician.findOne({ _id: req.user.clinician_id})
        const curPatientUser = await User.findOne({patient_id: curClinician.selectedpatient_id, usertype: "patient"}).populate('patient_id').lean()
        var successFlag = req.params.flag // 0: no action, 1: success add, 2: success update, 3: fail add, 4: fail update
        successFlag = successFlag.substring(1)  // remove leading colon (:)
        req.params.flag =':0'
        // console.log("num patients ",patientList.length)
        return res.render('clinicianConfigurePatient', {patients: patientList, clinician_id: req.user.clinician_id, selected_patient_user: curPatientUser, flag: successFlag})
    } catch (err) {
        return next(err)
    }
}

// handle request to get clinicianPatientView page (logged in as clinician)
const getClinicianPatientView = async (req, res, next) => {
    try {
        const patientList = await Patient.find({ myclinician: req.user.clinician_id}).lean()
        const curClinician = await Clinician.findOne({ _id: req.user.clinician_id})
        const patientId = curClinician.selectedpatient_id
        const curClinicianId = curClinician._id
        const selectedPatient = await Patient.findOne({ _id: patientId}).lean()
        const patientDataItems = await PatientDataItem.find({ patient_id: patientId}).sort({timestamp: "asc"}).lean()
        const clinicalNotes = await ClinicalNote.find({ patient_id: patientId, clinician_id: curClinicianId}).sort({timestamp: "desc"}).lean()
        //const patientDataItems = await PatientDataItem.find({ patient_id: patientItem.patient_id}).populate('patient_id').lean()
        return res.render('clinicianPatientView', {data: patientDataItems, patients: patientList, selectpatient: selectedPatient, notes: clinicalNotes})
    } catch (err) {
        return next(err)
    }
}

// insert a patient data item in the database (logged in as patient)
const insertPatientData = async (req, res, next) => {
    try {
        newPatientDataItem = new PatientDataItem( req.body )
        //console.log("returned patient ID ",newPatientDataItem.patient_id)

        const existingPatientDataItem = await PatientDataItem.findOne({ local_date: newPatientDataItem.local_date, patient_id: newPatientDataItem.patient_id}); 
        const patient = await Patient.findOne({ _id: req.user.patient_id});
        if (!existingPatientDataItem) {
            await newPatientDataItem.save() 
            // new data received today, increment and recalc engagement score 
            var today = new Date() 
            patient.data_pts_recd = patient.data_pts_recd + 1
            // convert date registered to start of that day (local time)
            var date_reg_yr = patient.date_registered.getFullYear()  // local year value
            var date_reg_mnth_idx = patient.date_registered.getMonth()  // local month index 0..11
            var date_reg_day = patient.date_registered.getDate()  // local day of month
            var dateRegistered = new Date(date_reg_yr,date_reg_mnth_idx,date_reg_day)
            //console.log("registered at ",dateRegistered)

            var daysRegistered = Math.floor( (today.getTime() - dateRegistered.getTime()) /(1000*60*60*24) ) + 1
            patient.data_pts_asked = daysRegistered
            patient.engagement_rate = Math.round(100 * patient.data_pts_recd / patient.data_pts_asked) 
            patient.save(function(err,savedPatient) {
                if (err) {
                    console.log(err);
                }
            })
        } else {
            existingPatientDataItem.timestamp = newPatientDataItem.timestamp
            existingPatientDataItem.blood_glucose = newPatientDataItem.blood_glucose
            if(newPatientDataItem.blood_glucose_comment != "") {
                existingPatientDataItem.blood_glucose_comment = newPatientDataItem.blood_glucose_comment
            }
            existingPatientDataItem.weight = newPatientDataItem.weight
            if(newPatientDataItem.weight_comment != "") {
                existingPatientDataItem.weight_comment = newPatientDataItem.weight_comment
            }
            existingPatientDataItem.insulin_doses = newPatientDataItem.insulin_doses
            if(newPatientDataItem.insulin_doses_comment != "") {
                existingPatientDataItem.insulin_doses_comment = newPatientDataItem.insulin_doses_comment
            }
            existingPatientDataItem.exercise = newPatientDataItem.exercise
            if(newPatientDataItem.exercise_comment != "") {
                existingPatientDataItem.exercise_comment = newPatientDataItem.exercise_comment
            }
            await existingPatientDataItem.save()
        }

        return res.redirect('/main/patientDataEntry')
    } catch (err) {
        return next(err)
    }
}

// remove a patient data item document (for today) from the database (logged in as patient)
const clearTodayPatientData = async (req, res, next) => {
    try {
        var today = new Date()
        var local_date = ''+("0" + today.getDate()).slice(-2)+("0" + (today.getMonth() + 1)).slice(-2)+today.getFullYear()
        newPatientDataItem = new PatientDataItem( req.body )
        await PatientDataItem.findOneAndRemove({ local_date: local_date, patient_id: newPatientDataItem.patient_id}); 
        return res.redirect('/main/patientDataEntry')
    } catch (err) {
        return next(err)
    }
}

// insert a new clinician into the database (logged in as admin)
const insertNewClinician = async (req, res, next) => {
    try {
        var newClinician = new Clinician()
        var newUser = new User()
        var newClinicianId = new mongoose.mongo.ObjectId();

        newClinician.first_name = req.body.first_name
        newClinician.last_name = req.body.last_name
        newClinician._id = newClinicianId
        newClinician.save(function(err,savedClinician) {
        })

        newUser.username = req.body.username
        newUser.password = "temporary"
        newUser.displayname = req.body.displayname
        newUser.clinician_id = newClinicianId
        newUser.usertype = "clinician"
        newUser.yearofbirth = req.body.yearofbirth
        newUser.textbio = req.body.textbio
        newUser.save(function(err,savedUser) {
            // console.log("new clinician attached to user ",newUser.clinician_id)
            savedUser.setPassword( "temporary", function(err) {
                savedUser.save()
            })
        }) 
        return res.redirect('/main/adminConfigureClinician')
    } catch (err) {
        return next(err)
    }
}

// insert a new patient/user into the database (logged in as clinician)
const insertNewPatient = async (req, res, next) => {
    try {
        var newPatient = new Patient()
        var newUser = new User()
        var newPatientId = new mongoose.mongo.ObjectId()
        var today = new Date()

        // check for duplicate username
        const checkUser = await User.find({username: req.body.username})
        if(checkUser.length != 0) {
            console.log("duplicate username", req.body.username)
            req.flash('error', 'Duplicate username not allowed')
            return res.redirect('/main/clinicianConfigurePatient/:3')
        }

        newPatient.first_name = req.body.first_name
        newPatient.last_name = req.body.last_name
        newPatient._id = newPatientId
        newPatient.myclinician = req.body.clinician_id
        newPatient.colour_schene = "light"
        newPatient.data_pts_asked = 0
        newPatient.data_pts_recd = 0
        newPatient.engagement_rate = 100

        // checkbox returned as "on" or null
        newPatient.blood_glucose_reqd = (req.body.blood_glucose_reqd == "on") ? true : false
        newPatient.weight_reqd = (req.body.weight_reqd == "on") ? true : false
        newPatient.insulin_doses_reqd = (req.body.insulin_doses_reqd == "on") ? true : false
        newPatient.exercise_reqd = (req.body.exercise_reqd == "on") ? true : false

        newPatient.blood_glucose_lower = req.body.blood_glucose_lower
        newPatient.weight_lower = req.body.weight_lower
        newPatient.insulin_doses_lower = req.body.insulin_doses_lower
        newPatient.exercise_lower = req.body.exercise_lower
        newPatient.blood_glucose_upper = req.body.blood_glucose_upper
        newPatient.weight_upper = req.body.weight_upper
        newPatient.insulin_doses_upper = req.body.insulin_doses_upper
        newPatient.exercise_upper = req.body.exercise_upper
        newPatient.date_registered = today
        newPatient.save(function(err,savedPatient) {
            if (err) {
                console.log(err);
            }
        })

        newUser.username = req.body.username
        newUser.password = "temporary"
        newUser.displayname = req.body.displayname
        newUser.patient_id = newPatientId
        newUser.usertype = "patient"
        newUser.yearofbirth = req.body.yearofbirth
        newUser.textbio = req.body.textbio
        newUser.save(function(err,savedUser) {
            // console.log("new patient attached to user ",newUser.clinician_id)
            savedUser.setPassword( "temporary", function(err) {
                savedUser.save(function(err,savedClinician) {
                    if (err) {
                        console.log(err);
                    }  
                })
            })
        }) 

        const curClinician = await Clinician.findOne({ _id: req.user.clinician_id})
        curClinician.selectedpatient_id = newPatient._id
        await curClinician.save()

        req.flash('success', 'New Patient Added')
        return res.redirect('/main/clinicianConfigurePatient/:1')
    } catch (err) {
        return next(err)
    }
}

// update a patient/user in the database (logged in as clinician)
const updatePatient = async (req, res, next) => {
    try {
        // check for existing user based on username provided
        const checkUser = await User.findOne({username: req.body.username})
        // console.log(checkUser)
        if(!checkUser) {
            console.log("missing user", req.body.username)
            req.flash('error', 'Unable to find User to update')
            return res.redirect('/main/clinicianConfigurePatient/:4')
        }
        // check for existing patient
        const checkPatient = await Patient.findOne({_id: checkUser.patient_id})
        // console.log(checkPatient)
        if(!checkPatient) {
            console.log("missing patient for user: ", req.body.username)
            req.flash('error', 'Unable to find Patient to update')
            return res.redirect('/main/clinicianConfigurePatient/:4')
        }

        //update patient fields and save
        checkPatient.first_name = req.body.first_name
        checkPatient.last_name = req.body.last_name

        // checkbox returned as "on" or null
        checkPatient.blood_glucose_reqd = (req.body.blood_glucose_reqd == "on") ? true : false
        checkPatient.weight_reqd = (req.body.weight_reqd == "on") ? true : false
        checkPatient.insulin_doses_reqd = (req.body.insulin_doses_reqd == "on") ? true : false
        checkPatient.exercise_reqd = (req.body.exercise_reqd == "on") ? true : false
        checkPatient.blood_glucose_lower = req.body.blood_glucose_lower
        checkPatient.weight_lower = req.body.weight_lower
        checkPatient.insulin_doses_lower = req.body.insulin_doses_lower
        checkPatient.exercise_lower = req.body.exercise_lower
        checkPatient.blood_glucose_upper = req.body.blood_glucose_upper
        checkPatient.weight_upper = req.body.weight_upper
        checkPatient.insulin_doses_upper = req.body.insulin_doses_upper
        checkPatient.exercise_upper = req.body.exercise_upper
        checkPatient.save(function(err,savedPatient) {
            if (err) {
                console.log(err);
            }
        })

        // update user fields and save
        checkUser.username = req.body.username
        checkUser.displayname = req.body.displayname
        checkUser.yearofbirth = req.body.yearofbirth
        checkUser.textbio = req.body.textbio
        checkUser.save(function(err,savedUser) {
            if (err) {
                console.log(err);
            }   
        }) 
        req.flash('success', 'Patient Updated')
        return res.redirect('/main/clinicianConfigurePatient/:2')
    } catch (err) {
        return next(err)
    }
}

// clear the patient configuration form on clinician configure patient page
const clearForm = async (req, res, next) => {
    try {
        const curClinician = await Clinician.findOne({ _id: req.user.clinician_id})
        curClinician.selectedpatient_id = null
        await curClinician.save()

        return res.redirect('/main/clinicianConfigurePatient/:0')
    } catch (err) {
        return next(err)
    }
}
// store in database the id of patient that clinician is currently updating (logged in as clinician)
const selectPatient = async (req, res, next) => {
    try {
        var selectedPatientId = req.body.cur_patient_id
        //console.log("selected patient", selectedPatientId)
        const curClinician = await Clinician.findOne({ _id: req.user.clinician_id})
        curClinician.selectedpatient_id = selectedPatientId
        await curClinician.save()
        return res.redirect('/main/clinicianConfigurePatient/:0')
    } catch (err) {
        return next(err)
    }
}

// store in database the id of patient that clinician wants to view (logged in as clinician)
const viewPatient = async (req, res, next) => {
    try {
        var selectedPatientId = req.body.cur_patient_id
        //console.log("selected patient", selectedPatientId)
        const curClinician = await Clinician.findOne({ _id: req.user.clinician_id})
        curClinician.selectedpatient_id = selectedPatientId
        await curClinician.save()
        return res.redirect('/main/clinicianPatientView')
    } catch (err) {
        return next(err)
    }
}

// insert a new clinician note into the database (logged in as clinician)
const insertClinicianNote = async (req, res, next) => {
    try {
        const curClinician = await Clinician.findOne({ _id: req.user.clinician_id})
        var today = new Date()
        var local_date = ''+("0" + today.getDate()).slice(-2)+("0" + (today.getMonth() + 1)).slice(-2)+today.getFullYear()
        var newClinicalNote = new ClinicalNote()
        var newClinicalNoteId = new mongoose.mongo.ObjectId();

        newClinicalNote.note = req.body.note
        newClinicalNote.timestamp = today
        newClinicalNote.local_date = local_date
        newClinicalNote.clinician_id = req.user.clinician_id
        newClinicalNote.patient_id = curClinician.selectedpatient_id
        newClinicalNote_id = newClinicalNoteId
        newClinicalNote.save(function(err,savedNote) {
            if (err) {
                console.log(err);
            }   
        })

        return res.redirect('/main/clinicianPatientView')
    } catch (err) {
        return next(err)
    }
}

// update the support message for a patient (logged in as clinician)
const updateSupportMsg = async (req, res, next) => {
    try {
        const curClinician = await Clinician.findOne({ _id: req.user.clinician_id})
        const patientId = curClinician.selectedpatient_id
        const selectedPatient = await Patient.findOne({ _id: patientId})
        selectedPatient.support_msg = req.body.support_msg
        selectedPatient.save(function(err,savedPatient) {
            if (err) {
                console.log(err);
            }  
        })

        return res.redirect('/main/clinicianPatientView')
    } catch (err) {
        return next(err)
    }
}

// update the colour mode for a patient, called from My Account page (logged in as patient)
const setColourMode = async (req, res, next) => {
    try {
        const patientId = req.user.patient_id
        const selectedPatient = await Patient.findOne({ _id: patientId})
        if(selectedPatient != null) {
            selectedPatient.colour_scheme = req.body.cur_colour_scheme
            selectedPatient.save(function(err,savedPatient) {  // TODO FIX THIS
                if (err) {
                    console.log(err);
                }  
            })
        }
        return res.redirect('/main/accountView')
    } catch (err) {
        return next(err)
    }
}

// exports an object, which contain functions imported by router
module.exports = {
    getAccountView,
    getAdminConfigureClinician,
    getPatientDataEntry,
    getPatientDataView,
    getClinicianDashboard,
    getClinicianConfigurePatient,
    getClinicianPatientView,
    insertPatientData,
    clearTodayPatientData,
    insertNewClinician,
    insertNewPatient,
    updatePatient,
    selectPatient,
    viewPatient,
    insertClinicianNote,
    updateSupportMsg,
    clearForm,
    setColourMode,
    goHome
}
