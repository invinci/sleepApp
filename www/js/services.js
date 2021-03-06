
angular.module('sleepapp_patient.services', [])

.factory('UserService',  function($q, $http) {
    return {
        checkUser:  function(userData){
           var promise = $http({
                url: CHECKUSER_URL,
                method: 'POST',
                data: userData,
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
                url: ADD_USER_DATA_URL,
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
                url: LOGIN_URL,
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
        saveDeviceId: function(Data){
            console.log(Data);
            var token = window.localStorage['ACCESS_TOKEN'];
            var AUTH_HEADER = {
                'Content-Type': 'application/json',
                'Authorization' : 'Bearer ' + token
            };
            var promise = $http({
                url: SAVE_DEVICE_ID_URL,
                method: 'POST',
                data: Data,
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
            }).error(function (error, status){
                return status;
            });
            return promise;
        },
        checkOtp: function(data){
            var promise = $http({
                url: CHECK_OTP,
                method: 'POST',
                data: data,
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
        updatePassword: function(data){
            var promise = $http({
                url: RESET_PASSWORD,
                method: 'POST',
                data: data,
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
        },
        changePassword: function(dataJSON){
            var promise = $http({
                url: CHANGE_PASSWORD,
                method: 'POST',
                data: dataJSON,
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
        logOutUser: function(dataJSON){
            var promise = $http({
                url: LOG_OUT,
                method: 'POST',
                data: dataJSON,
                headers: {
                    'Content-Type': 'application/json' 
                }
            }).success(function(data, status, headers, config) {
                return data;
            }).error(function (error, status){
                return status;
            });
            return promise;
        }
    }
})

.factory('CheckInService',   function($q, $http) {
    return {
        findCheckinData: function(dataJSON) {
            var token = window.localStorage['ACCESS_TOKEN'];
            var AUTH_HEADER = {
                'Content-Type': 'application/json',
                'Authorization' : 'Bearer ' + token
            };
            var promise = $http({
                url: CHECK_IN,
                method: 'POST',
                data:   dataJSON,
                headers: AUTH_HEADER
            }).success(function(data, status, headers, config) {
                return data;
            });
            return promise;
        },
        findCheckinCount: function(dataJSON) {
            var token = window.localStorage['ACCESS_TOKEN'];
            var AUTH_HEADER = {
                'Content-Type': 'application/json',
                'Authorization' : 'Bearer ' + token
            };
            var promise = $http({
                url: COUNT_CHECK_IN,
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
        saveCheckIn: function(dataJSON) {
            var token = window.localStorage['ACCESS_TOKEN'];
            var AUTH_HEADER = {
                'Content-Type': 'application/json',
                'Authorization' : 'Bearer ' + token
            };
            var promise = $http({
                url: SAVE_CHECK_IN_URL,
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
})

.factory('jetLagService',   function($q, $http) {
    return {
          saveJetLagData: function(dataJSON) {
            var token = window.localStorage['ACCESS_TOKEN'];
            var AUTH_HEADER = {
                'Content-Type': 'application/json',
                'Authorization' : 'Bearer ' + token
            };
            var promise = $http({
                url: SAVE_JET_LAGS,
                method: 'POST',
                data:   dataJSON,
                headers: AUTH_HEADER
            }).success(function(data, status, headers, config) {
                return data;
            });
            return promise;
        },

 updateJetLagData:function(dataJSON) {
            var token = window.localStorage['ACCESS_TOKEN'];
            // ("token",token);
            // console.log("id",user_id);
            // console.log("dataJSON",dataJSON);
            var AUTH_HEADER = {
                'Content-Type': 'application/json',
                'Authorization' : 'Bearer ' + token
            };
            var promise = $http({
                url: UPDATE_JET_LAGS,
                method: 'POST',
                data:   dataJSON,
                headers: AUTH_HEADER
            }).success(function(data, status, headers, config) {
                return data;
            });
            return promise;
        },

 getJetLagData:function(dataJSON) {
            var token = window.localStorage['ACCESS_TOKEN'];
            // console.log("token",token);
       
            var AUTH_HEADER = {
                'Content-Type': 'application/json',
                'Authorization' : 'Bearer ' + token
            };
            var promise = $http({
                url: GET_JET_LAGS,
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
.factory('stateOfMindService',   function($q, $http) {
    return {
          findCheckIndata: function(dataJSON) {
            var token = window.localStorage['ACCESS_TOKEN'];
            var AUTH_HEADER = {
                'Content-Type': 'application/json',
                'Authorization' : 'Bearer ' + token
            };
            var promise = $http({
                url: GET_CHECK_IN,
                method: 'POST',
                data:   dataJSON,
                headers: AUTH_HEADER
            }).success(function(data, status, headers, config) {
                return data;
            });
            return promise;
        },
    
}
    
})
