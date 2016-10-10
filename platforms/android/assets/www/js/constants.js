// APP's PLAYSTORE DOWNLOAD LINK
var DOWNLOAD_LINK = 'http://google.com';

// HOSTs
var HOST = 'http://52.39.212.226:4021';
//var HOST = 'http://localhost:3000';

// MESSAGES
var SIGNUP_LOGIN = "Your account has been created. Please login.";
var LOGIN_ERROR = "Either username or password is incorrect.";
var LOGIN_STATUS_ERROR = "Your account is not active. Please contact your clinician."
var USER_NAME_ERROR = "Username already exist. Please try another.";
var EMAIL_ERROR = "Email already exist. Please try another.";
var EMAIL_SERVER_ERROR = 'email already exists.';
var PARENT_ID_ERROR = "Reference code does not match.";

// assessment messages
var ASSESSMENT_SUBMITTED_MESSAGE = "You have already submitted your assessment.";
var NO_ASSESSMENT_MESSAGE = "No assessments available right now for you.";

// check in messages
var CHECK_IN_SAVE				= "Check in data has been submitted.";
var CHECK_IN_UPDATE				= "Check in data has been updated.";
var CHECK_IN_ERROR				= "Something went wrong. Please try again.";
var CHECK_IN_MESSAGE			= "You have submitted your allowed number(2) of check-ins for today.";
var NO_CHECK_IN					= "No check-in data available for this date.";
var ONE_CHECK_IN_MESSAGE		= "You have submitted 1(2) check-ins for today.";
var PREV_ONE_CHECK_IN_MESSAGE	= "You have submitted 1(2) check-ins for today. Check-ins cannot be submitted for previous days.";
var PREV_ALL_CHECK_IN_MESSAGE	= "You have submitted your allowed number(2) of check-ins for today. Check-ins cannot be submitted for previous days.";

var OLD_NEW_PASSWORD_ERROR = "Old password and new password can't be same.";
var PASSWORD_CHANGE_SUCCESS = "Password has been changed successfully. Please login again to continue.";
var OLD_PASSWORD_ERROR = "Old password is incorrect.";

// jet lag messages
var JET_LAG_MESSAGE = "You have already submitted your jet lag for today.";
var JET_LAG_SUCCESS = "Jet Lag  saved successfully.";
var JET_LAG_CONFIRM ='Are you sure you want to save jet lag information?';
var JET_LAG_COMPLETE ='Are you sure you want to complete jet lag information?';
var JET_LAG_COMPLETE_SUCCESS=' Your Jet lag  is completed.';


var NO_DATA = "This page becomes active once you see your clinician. Thanks for your patience!";

var INSTRUCTION_NOTE = "Note : If you are moving to a timezone which is not listed above, you can select the nearest timezone difference.";
var COMPLETE_BUTTON_MSG = "Note : Your jet lag is active now. You will receive notifications based on new timings. Complete button will become active on travel date. Do complete the jet lag once travel is done.";
var LOGOUT_MSG = "After Log Out you won\'t be able to receive any Jet Lag related notifications.";
// DIRECTORY PATH
var PROFILE_PIC       = HOST + 'images/profile/';

/* encryptionKey */
var ENCRYPTION_KEY = "GFYUFGTYGFTYTY64564545acvbvrttyFG@%#%#%#%#TTRR";

/*  SERVICE URLs Starts Here  */
var LOGIN_URL   			= HOST + '/adminlogin/authenticate';
var CHECKUSER_URL   		= HOST + '/users/checkUser'; // Check if username & email already register or not
var ADD_USER_DATA_URL   	= HOST + '/users/signUp'; // Save user data into data during sign up
var SAVE_DEVICE_ID_URL		= HOST + '/users/updateUser'
var SAVE_CHECK_IN_URL		= HOST + '/checkin/add';
var CHANGE_PASSWORD			= HOST + '/adminlogin/change_password';
var LOG_OUT					= HOST + '/adminlogin/logout_mobile_app_user';


var FIND_PATIENT_FOR_CAREGIVER = HOST + '/users/findPatientByCaregiverId';
var FORGOTPASSWORD			= HOST + '';
var UPDATE_PROFILE			= HOST + '/users/update';
var GET_PATIENT_CHECK_IN    = HOST + '/checkin/list';
var GET_GENERAL_QUESTIONS 	= HOST + '/generalquestions/patientGeneralQuestion';

var UPDATE_PATIENT_CHECK_IN = HOST + '/checkin/update';
var FIND_ASSESSMENT 		= HOST + '/patients/findOne';
var SAVE_JET_LAGS          	= HOST +  '/jetLag/add';
var UPDATE_JET_LAGS         = HOST + '/jetLag/updateJetLagData';
var GET_JET_LAGS			= HOST	+'/jetLag/findJetLagData';
var GET_CHECK_IN            = HOST +'/stateOfMind/findCheckIndata';
var CHECK_IN          		= HOST+'/checkin/findCheckinData';
var COUNT_CHECK_IN          = HOST+'/checkin/findCheckinCount';
