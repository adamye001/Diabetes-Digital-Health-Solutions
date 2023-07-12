# Diabetes Digital Health Solutions

Diabetes Digital Health Solutions is a web application designed to help
individuals manage their diabetes conveniently from their own homes. The
application allows users to record their health data, which can be remotely
monitored by their clinicians. It provides separate user interfaces for patients
and clinicians, sharing a common database.

We have developed this web application using Node.js, Express.js, MongoDB, and
Handlebars.js.

## Table of Contents

- [Patient UI](#patient-ui)
- [Clinician UI](#clinician-ui)
- [Authentication and Security](#authentication-and-security)
- [Input Data Validation](#input-data-validation)
- [Data Management](#data-management)
- [Responsive Design](#responsive-design)
- [Optional Features](#optional-features)
- [Prototype](#prototype)

## Patient UI

The patient user interface is designed to be highly usable and learnable,
catering to individuals who may not be familiar with cutting-edge technology or
possess smartphones. The UI should work seamlessly across different devices,
including phones, tablets, and desktop screens.

### Information Pages

- **About diabetes**: A static webpage containing patient-friendly information
  about diabetes. It should include descriptive text, headings, a video, and
  links to useful websites. Videos should be embedded from platforms such as
  YouTube.
- **About this website**: A static webpage providing a brief overview of the
  website, its creators, and the requirement for users to log in to access most
  features. These pages should be accessible to all visitors, regardless of
  whether they are logged in or not.

### Recording Health Data

The primary purpose of the app is to allow patients to record their own health
data. Each patient may need to record different types of data as specified by
their clinician. The following data sets can be recorded:

- Blood glucose level (in nmol/L)
- Weight (in kg)
- Doses of insulin taken (number of doses)
- Exercise (step count)

Patients should be able to update each time series once per day. The UI should
clearly indicate which data the patient has already recorded and which data is
yet to be recorded to prevent omissions or duplications. The app should provide
a user-friendly and motivating experience since patients need to enter data
daily for an extended period.

### Customized Data Requirements for Patients

Clinicians should be able to specify the required time series for each patient
they manage. The app should allow clinicians to manage these requirements over
time, adding or removing specific data sets as needed. Patients should have a
clear understanding of the data they need to enter.

### Viewing Data

The app should allow patients to view the health data they have recorded.
Displaying the data in a table or grid format is recommended, with each data
entry as a row and time flowing down the page. Numbers and times should be
displayed in a user-friendly format.

### Support Messages

Patients may receive personalized "support messages" from their clinicians.
These messages should be displayed in a way that encourages the patient without
overwhelming them.

### Motivation

To encourage engagement with data entry, the app includes the following
features:

- Patients receive a digital badge if their overall engagement rate since
  starting to use the app is more than 80%.
- A leaderboard that congratulates the 5 patients with the highest engagement
  rate. Patient screen names are displayed for privacy.

## Clinician UI

The clinician user interface allows clinicians to monitor the health of their
assigned patients. Clinicians will use the app on desktop computers.

### Dashboard

Clinicians have a main dashboard screen that displays an overview of their
patients. The dashboard should use a grid or table format, with one patient per
row and columns showing the current values of the tracked data. Data values
should be visually highlighted if attention is required, such as missing data or
data falling outside safety thresholds.

### Working with Individual Patients

Clinicians can "drill down" on an individual patient from the dashboard to view
specific patient data. They should be able to manage the requirements for each
patient, including specifying which time series the patient should be recording,
setting safety thresholds for the patient's data, and entering and managing
support messages.

### Viewing Patient Health Data

Clinicians should be able to view the data that patients have recorded. A table
or grid format is recommended for displaying time-series data.

### Clinical Notes

Clinicians can record notes about a patient. These notes are text-only and are
associated with a specific patient at a specific time, not tied to specific
health data. The UI should make it easy for clinicians to enter and read
clinical notes.

### Support Messages

Clinicians can enter customized text messages that are displayed to patients.
These messages can be updated and should be specific to individual patients.

### Monitoring Patient Comments

A feature is included for clinicians to see a list of comments made by their
patients. This allows clinicians to quickly scan and identify any potential
problems. Clicking on a comment should display the patient's data.

## Authentication and Security

Authentication is required for all users (patients and clinicians), who must
register with their email address and password. Good security practices, such as
encryption, should be implemented. Users can manage their own passwords. User
profiles should store personal information, such as given and family names,
screen name, year of birth, and a brief bio.

## Input Data Validation

Data entered by patients should be validated to ensure it is of the correct type
and within reasonable bounds. Validations can be hard-coded and do not require
an administrative system.

## Data Management

Health data and clinical notes are considered permanent and should not be
editable once recorded in the database. Other data that does not change
frequently can be entered directly into the system.

## Responsive Design

The patient UI is designed to work well on various screen sizes, including
phones, tablets, and desktops. The clinician UI only needs to be designed for
desktop screens.

## Optional Features

The following optional features can enhance the application, but their
implementation is not mandatory:

### Charts

Implement line charts to visualize numerical data, such as blood glucose levels
over time.

### Live Alerts

Use dynamic-update technology, such as Ajax, to display alert messages in the
clinician UI when a patient submits health data outside the safety range.

### Customized Colour Schemes

Allow patients to choose from pre-defined colour schemes for their UI, such as
light mode, dark mode, or seasonal palettes. The UI appearance should change
accordingly for each patient.

## Prototype

- [Phone Version](https://xd.adobe.com/view/baa9f8a9-9448-4be3-acb2-1a69a4cd2c1b-effa/)
- [Desktop Version](https://xd.adobe.com/view/f667dfad-a8c3-4ef8-9f36-663b03fc9268-a334/)
