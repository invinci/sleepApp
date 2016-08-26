// APP's PLAYSTORE DOWNLOAD LINK
var DOWNLOAD_LINK = 'http://google.com';

// HOST
//var HOST = 'http://52.39.212.226:4003';
var HOST = 'http://localhost:3000';

// MESSAGES

var SIGNUP_LOGIN = "Your account has been created. Please login.";
var LOGIN_ERROR = "Either username or password is incorrect.";
var LOGIN_STATUS_ERROR = "Your account is not active. Please contact your clinician."
var USER_NAME_ERROR = "Username already exist. Please try another.";
var EMAIL_ERROR = "Email already exist. Please try another.";
var EMAIL_SERVER_ERROR = 'email already exists.';
var PARENT_ID_ERROR = "Reference code does not match.";
var ASSESSMENT_SUBMITTED_MESSAGE = "You have already submitted your assessment.";
var NO_ASSESSMENT_MESSAGE = "No assessments available right now for you.";
var CHECK_IN_SUCCESS = "Check in data updated.";
var CHECK_IN_ERROR = "Unable to update check in data.";
var CHECK_IN_MESSAGE = "You have already submitted your check in data for today.";
var JET_LAG_MESSAGE = "You have already submitted your jet lag for today.";
var JET_LAG_SUCCESS = "Jet Lag data updated.";

var NO_DATA = "This page becomes active once you see your clinician. Thanks for your patience!";

// DIRECTORY PATH
var PROFILE_PIC       = HOST + 'images/profile/';

/* encryptionKey */
var ENCRYPTION_KEY = "GFYUFGTYGFTYTY64564545acvbvrttyFG@%#%#%#%#TTRR";

/*  SERVICE URLs Starts Here  */
var LOGIN_URL   				      = HOST + '/adminlogin/authenticate';
var CHECKUSER_URL   			    = HOST + '/users/checkUser'; // Check if username & email already register or not
var ADD_USER_DATA_URL   		  = HOST + '/users/signUp'; // Save user data into data during sign up
var SAVE_DEVICE_ID_URL			  = HOST + '/users/updateUser'



var FIND_PATIENT_FOR_CAREGIVER = HOST + '/users/findPatientByCaregiverId';
var FORGOTPASSWORD			= HOST + '';
var UPDATE_PROFILE			= HOST + '/users/update';
var GET_PATIENT_CHECK_IN    = HOST + '/checkin/list';
var GET_GENERAL_QUESTIONS 	= HOST + '/generalquestions/patientGeneralQuestion';
var SAVE_PATIENT_CHECK_IN	= HOST + '/checkin/add';
var UPDATE_PATIENT_CHECK_IN = HOST + '/checkin/update';
var FIND_ASSESSMENT 		= HOST + '/patients/findOne';
var SAVE_JET_LAGS          	= HOST +  '/jetLag/add';
