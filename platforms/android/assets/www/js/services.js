
angular.module('BH_patient.services', [])

.factory('UserService',  function($q, $http) {
    return {
        checkUser:  function(username){
           var promise = $http({
                url: CHECKUSER + '/' + username,
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json' 
                }
            }).success(function(data, status, headers, config) {
                return data;
            });
            return promise; 
        },
        signUpUser: function(userData) {
            var promise = $http({
                url: ADD_USER_DATA,
                method: 'POST',
                data: userData,
                headers: {
                    'Content-Type': 'application/json' 
                }
            }).success(function(data, status, headers, config) {
                return data;
            }).error(function (error, status){
                return status;
            });
            return promise;
        },
        logInUser: function(user){
            var promise = $http({
                url: LOGIN,
                method: 'POST',
                data: {'username':user.username, 'password':user.password},
                headers: {
                    'Content-Type': 'application/json' 
                }
            }).success(function(data, status, headers, config) {
                return data;
            }).error(function (error, status){
                return status;
            });
            return promise;
        },
        saveDeviceId: function(user){
            var token = window.localStorage['ACCESS_TOKEN'];
            var AUTH_HEADER = {
                'Content-Type': 'application/json',
                'Authorization' : 'Bearer ' + token
            };
            var promise = $http({
                url: SAVE_DEVICE_ID,
                method: 'POST',
                data: {'_id':user.id, 'device_id':user.device_id},
                headers: AUTH_HEADER
            }).success(function(data, status, headers, config) {
                return data;
            }).error(function (error, status){
                return status;
            });
            return promise;
        },
        findPatientByCaregiver: function(dataJSON){
            var token = window.localStorage['ACCESS_TOKEN'];
            var AUTH_HEADER = {
                'Content-Type': 'application/json',
                'Authorization' : 'Bearer ' + token
            };
            var promise = $http({
                url: FIND_PATIENT_FOR_CAREGIVER,
                method: 'POST',
                data: {'caregiver':dataJSON},
                headers: AUTH_HEADER
            }).success(function(data, status, headers, config) {
                return data;
            }).error(function (error, status){
                return status;
            });
            return promise;
        },
        ForgotPassword: function(user){
            var promise = $http({
                url: FORGOTPASSWORD,
                method: 'POST',
                data:   {'email':user.email},
                headers: {
                    'Content-Type': 'application/json' 
                }
            }).success(function(data, status, headers, config) {
                return data;
            });
            return promise;
        },
        updateProfile: function(user_id, dataJSON){
            var token = window.localStorage['ACCESS_TOKEN'];
            console.log(token);
            console.log(user_id);
            console.log(dataJSON);
            var AUTH_HEADER = {
                'Content-Type': 'application/json',
                'Authorization' : 'Bearer ' + token
            };
            var promise = $http({
                url: UPDATE_PROFILE + "/" + user_id,
                method: 'POST',
                data:   dataJSON,
                headers: AUTH_HEADER
            }).success(function(data, status, headers, config) {
                return data;
            });
            return promise;
        }
    }
})

.factory('AssessmentService',   function($q, $http) {
    return {
        getBasicAssessment: function(dataJSON) {
            var token = window.localStorage['ACCESS_TOKEN'];
            var AUTH_HEADER = {
                'Content-Type': 'application/json',
                'Authorization' : 'Bearer ' + token
            };
            var promise = $http({
                url: GET_ASSESSMENT,
                method: 'POST',
                data:   dataJSON,
                headers: AUTH_HEADER
            }).success(function(data, status, headers, config) {
                return data;
            });
            return promise;
        },
        saveBasicAssessment: function(dataJSON){
            var token = window.localStorage['ACCESS_TOKEN'];
            var AUTH_HEADER = {
                'Content-Type': 'application/json',
                'Authorization' : 'Bearer ' + token
            };
            var promise = $http({
                url: SAVE_BASIC_ASSESSMENT,
                method: 'POST',
                data:   dataJSON,
                headers: AUTH_HEADER
            }).success(function(data, status, headers, config) {
                return data;
            });
            return promise;
        },
        findBasicAssessment: function(dataJSON){
            var token = window.localStorage['ACCESS_TOKEN'];
            var AUTH_HEADER = {
                'Content-Type': 'application/json',
                'Authorization' : 'Bearer ' + token
            };
            var promise = $http({
                url: FIND_ASSESSMENT,
                method: 'POST',
                data:   dataJSON,
                headers: AUTH_HEADER
            }).success(function(data, status, headers, config) {
                return data;
            });
            return promise;
        }
    } 
})
.factory('GoalService',   function($q, $http) {
    return {
        getPatientGoal: function(dataJSON) {
            var token = window.localStorage['ACCESS_TOKEN'];
            var AUTH_HEADER = {
                'Content-Type': 'application/json',
                'Authorization' : 'Bearer ' + token
            };
            var promise = $http({
                url: GET_PATIENT_GOAL,
                method: 'POST',
                data:   dataJSON,
                headers: AUTH_HEADER
            }).success(function(data, status, headers, config) {
                return data;
            });
            return promise;
        }
    } 
})

.factory('CheckInService',   function($q, $http) {
    return {
        getPatientCheckIn: function(dataJSON) {
            var token = window.localStorage['ACCESS_TOKEN'];
            var AUTH_HEADER = {
                'Content-Type': 'application/json',
                'Authorization' : 'Bearer ' + token
            };
            var promise = $http({
                url: GET_PATIENT_CHECK_IN,
                method: 'POST',
                data:   dataJSON,
                headers: AUTH_HEADER
            }).success(function(data, status, headers, config) {
                return data;
            });
            return promise;
        },
        listPatientGeneralQuestions: function(dataJSON) {
            var token = window.localStorage['ACCESS_TOKEN'];
            var AUTH_HEADER = {
                'Content-Type': 'application/json',
                'Authorization' : 'Bearer ' + token
            };
            var promise = $http({
                url: GET_GENERAL_QUESTIONS,
                method: 'POST',
                data:   dataJSON,
                headers: AUTH_HEADER
            }).success(function(data, status, headers, config) {
                return data;
            });
            return promise;
        },
        savePatientCheckIn: function(dataJSON) {
            var token = window.localStorage['ACCESS_TOKEN'];
            var AUTH_HEADER = {
                'Content-Type': 'application/json',
                'Authorization' : 'Bearer ' + token
            };
            var promise = $http({
                url: SAVE_PATIENT_CHECK_IN,
                method: 'POST',
                data:   dataJSON,
                headers: AUTH_HEADER
            }).success(function(data, status, headers, config) {
                return data;
            });
            return promise;
        },
        updatePatientCheckIn: function(dataJSON, checkIn_id) {
            var token = window.localStorage['ACCESS_TOKEN'];
            var AUTH_HEADER = {
                'Content-Type': 'application/json',
                'Authorization' : 'Bearer ' + token
            };
            var promise = $http({
                url: UPDATE_PATIENT_CHECK_IN + "/" + checkIn_id,
                method: 'POST',
                data:   dataJSON,
                headers: AUTH_HEADER
            }).success(function(data, status, headers, config) {
                return data;
            });
            return promise;
        }
    } 
});