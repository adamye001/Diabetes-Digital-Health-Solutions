const express = require('express')

// create our Router object
const mainRouter = express.Router()

// import main controller functions
const mainController = require('../controllers/mainController') 

// add a route to handle the GET request for the site Home page (login + about diabetes) 
mainRouter.get('/', mainController.goHome)

// add a route to handle the GET request for patientDataEntry page (patient 'home')
mainRouter.get('/patientDataEntry', mainController.getPatientDataEntry)

// add a route to handle the GET request for patientDataView page 
mainRouter.get('/patientDataView', mainController.getPatientDataView)

// add a route to handle the GET request for clinician dashboard page (clinician 'home')
mainRouter.get('/clinicianDashboard', mainController.getClinicianDashboard)

// add a route to handle the GET request for clinician configure patient page
mainRouter.get('/clinicianConfigurePatient/:flag', mainController.getClinicianConfigurePatient)

// add a route to handle the GET request for clinician detailed patient data page
mainRouter.get('/clinicianPatientView', mainController.getClinicianPatientView)

// add a new JSON object to the database from patient data entry page
mainRouter.post('/patientDataEntry', mainController.insertPatientData)

// remove a JSON object from the database from patient data entry page
mainRouter.post('/patientDataRemove', mainController.clearTodayPatientData)

// add a route  page to handle the GET request for accountView page
mainRouter.get('/accountView', mainController.getAccountView)

// add a route to handle the GET request for adminConfigureClinician page
mainRouter.get('/adminConfigureClinician', mainController.getAdminConfigureClinician)

// add a route to handle the POST request for inserting a new clinician
mainRouter.post('/adminConfigureClinician', mainController.insertNewClinician)

// add a route to handle the POST request for inserting a new patient from clinician configure patient page
mainRouter.post('/insertNewPatient', mainController.insertNewPatient)

// add a route to handle the POST request for updating a patient from clinician configure patient page
mainRouter.post('/updatePatient/', mainController.updatePatient)

// add a route to handle the POST request for selecting a particular patient on clinician configure page
mainRouter.post('/setCurPatient', mainController.selectPatient)

// add a route to handle the POST request for viewing a particular patient on clinician detailed patient data page
mainRouter.post('/viewPatient', mainController.viewPatient)

// add a route to handle the POST request for adding a clinician note on clinician detailed patient data page
mainRouter.post('/insertClinicianNote', mainController.insertClinicianNote)

// add a route to handle the POST request for updating the patient support msg on clinician detailed patient data page
mainRouter.post('/updateSupportMsg', mainController.updateSupportMsg)

// add a route to handle the POST request for clearing the patient configuration form from clinician configure patient page
mainRouter.post('/clearForm', mainController.clearForm)

// add a route to handle the POST request for updating the colour mode for a patient
mainRouter.post('/setColourMode', mainController.setColourMode)

// export the router
module.exports = mainRouter
