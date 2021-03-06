angular.module('sleepapp_patient.controllers', [])

.controller('welcomeCtrl', function($scope, $state, $ionicSlideBoxDelegate) {
    $scope.slideChanged = function(index) {
        if (index == 4) {
            document.getElementsByClassName("slider-pager")[0].style.display = "none";
        }else{
            document.getElementsByClassName("slider-pager")[0].style.display = "block";
        };
    };
    // LOCK SCREEN ORIENTATION IN PORTRAIT MODE FOR CAROUSEL SCREENS.
    document.addEventListener("deviceready", onDeviceReady, false);
    function onDeviceReady() {
        screen.lockOrientation('portrait');
    }
    // Called to navigate to the main app
    $scope.startApp = function() {
        window.localStorage['IsCompleted'] = true;
        $state.go('signin');
    };
})

.controller('SignUpController', function($scope, $rootScope, $state, ionicMaterialInk, $timeout, $ionicLoading, $ionicPopup, UserService, ionicTimePicker, $ionicHistory) {
    ionicMaterialInk.displayEffect();
    $scope.type = 'Male';
    $scope.setType = function(event) {
        $scope.type = angular.element(event.target).text();
    };

    $scope.patient = {};
    $scope.patient.country_code = "+1";
    $scope.rating = {};
    $scope.rating.max = 5;
    $scope.reminderTime = "09:00 PM";

    /*
     * signUp function to add new User.
     * developer : GpSingh
     */
    $scope.signUp = function(userData) {
        $ionicLoading.show();
        console.log("userData = ", userData);
        $scope.patient = userData;
        $scope.patient.user_type = 2; // Patient
        //delete $scope.patient.passwordC;
        var userName = $scope.patient.username;
        UserService.checkUser(userData).success(function(data) {
            console.log("data = ", data);
            if (data.status == "success") {
                console.log(JSON.stringify($scope.patient));
                inputString = $scope.patient;
                inputString.is_status = true;
                inputString.originalPassword = inputString.password;
                var passwordEncrpt = CryptoJS.AES.encrypt(JSON.stringify(inputString.password), ENCRYPTION_KEY);
                inputString.password = passwordEncrpt.toString();
                var ciphertext = CryptoJS.AES.encrypt(JSON.stringify(inputString), ENCRYPTION_KEY);
                var encryptedJSON = {};
                encryptedJSON.inputData = ciphertext.toString();

                UserService.signUpUser(encryptedJSON).success(function(data) {
                    console.log("data2 = ", data);
                    if (data.status == "success") {
                        var user = {};
                        user.username = data.data.username;
                        user.password = inputString.originalPassword;
                        console.log("logInUser  ==  ", user);
                        UserService.logInUser(user).success(function(data) {
                            console.log("data3 = ", data);
                            $ionicLoading.hide();
                            if (data.status == "success") {
                            	$ionicLoading.show();
                                window.localStorage['ACCESS_TOKEN'] = data.access_token;
                                window.localStorage['USER_DATA'] = JSON.stringify(data.data.user);
                                window.localStorage['USER_DATA'].password = inputString.originalPassword;
                                var userData = JSON.parse(window.localStorage['USER_DATA']);
                                var inputdata = {};
                                inputdata._id = userData._id;
                                inputdata.device_id = window.localStorage["DEVICE_ID"];
			                    inputdata.platform_type = window.localStorage['PLATFORM'];
			                    inputdata.time_zone = window.localStorage['TIME_ZONE'];
                                //alert(JSON.stringify(inputdata));
                                UserService.saveDeviceId(inputdata).success(function(data, status) {
                                	$ionicLoading.hide();
                                    console.log(data);
                                    $state.go("app.tabs.checkIn");
                                });
                            } else {
                                $rootScope.$broadcast('Call_Custom_Alert');
                                var alertPopup = $ionicPopup.alert({
                                    title: 'Error!',
                                    template: SIGNUP_LOGIN,
                                });
                                alertPopup.then(function(res) {
                                    $state.go("signin");
                                });
                            }
                        });
                    } else {
                        console.log(data.message);
                        var str = data.message;
                        var res = str.split(",");
                        var PARENT_ID_SERVER_ERROR = res[0].includes("parentCast to ObjectID failed for value");
                        if (res[0] && res[1]) {
                            var errorMsg = EMAIL_ERROR;
                        } else if (PARENT_ID_SERVER_ERROR && res[1] == undefined) {
                            var errorMsg = PARENT_ID_ERROR;
                        } else if (res[0] == EMAIL_SERVER_ERROR && res[1] == undefined) {
                            var errorMsg = EMAIL_ERROR;
                        }
                        $ionicLoading.hide();
                        $rootScope.$broadcast('Call_Custom_Alert');
                        var alertPopup = $ionicPopup.alert({
                            title: 'Error!',
                            template: errorMsg,
                        });
                        alertPopup.then(function(res) {});
                    }
                }).error(function(error, status) {
                    console.log(status);
                    $ionicLoading.hide();
                    if (status == 401 || status == -1) {
                        $rootScope.$broadcast('Call_Custom_Alert');
                        var alertPopup = $ionicPopup.alert({
                            title: 'Error!',
                            template: LOGIN_ERROR,
                        });
                        alertPopup.then(function(res) {});
                    }
                });
            } else {
                if (data.status == "warning-email")
                    $ionicLoading.hide();
                $rootScope.$broadcast('Call_Custom_Alert');
                var alertPopup = $ionicPopup.alert({
                    title: 'Error!',
                    template: (data.status == "warning-email") ? EMAIL_ERROR : USER_NAME_ERROR,
                });
                alertPopup.then(function(res) {});
            }
        });
    }

    /*
     * editTime function to edit/set time for fields.
     * developer : GpSingh
     */
    $scope.editTime = function(num) {
        var ipObj1 = {
            callback: function(val) { //Mandatory
                if (typeof(val) === 'undefined') {
                    console.log('Time not selected');
                } else {
                    var selectedTime = new Date(val * 1000);
                    var d = new Date(selectedTime);
                    var d2 = new Date();

                    d.setMonth(d2.getMonth());
                    d.setDate(d2.getDate());
                    d.setFullYear(d2.getFullYear());
                    d.setHours(d.getUTCHours());
                    d.setMinutes(d.getUTCMinutes());
                    // Check if User have selected previous time
                    if (d2.getTime() > d.getTime()) {
                        d.setDate(d2.getDate() + 1);
                    }

                    var hours = d.getHours();
                    var hours2 = hours - 2; /* subtracting 2 hours to automatically get glasses wear time */
                    var minutes = d.getMinutes();
                    var ampm = hours >= 12 ? 'PM' : 'AM';
                    var ampm2 = hours2 >= 12 ? 'PM' : 'AM';
                    hours = hours % 12;
                    hours = hours ? hours : 12; // the hour '0' should be '12'
                    hours2 = hours2 % 12;
                    hours2 = hours2 ? hours2 : 12; // the hour '0' should be '12'
                    minutes = minutes < 10 ? '0' + minutes : minutes;
                    var timeString = hours + ":" + minutes + " " + ampm;
                    var timeString2 = hours2 + ":" + minutes + " " + ampm2;
                    if (num == 1) {
                        $scope.patient.planned_bedtime = timeString;
                        $scope.patient.wear_glasses_time = timeString2;
                    } else if (num == 2) {
                        $scope.patient.planned_wakeup = timeString;
                    }
                }
            },
            //inputTime: 50400, //Optional
            format: 12, //Optional
            step: 1, //Optional
            setLabel: 'Set' //Optional
        };

        ionicTimePicker.openTimePicker(ipObj1);
    }

    $scope.ageValidationError = false;
	/* signup page watchers */
    $scope.$watch('patient.age', function(newValue, oldValue){
        if(newValue < 13){
            $scope.ageValidationError = true;
        }else{
            $scope.ageValidationError = false;
        }
    });
	$scope.$watch('patient.energy', function(newValue, oldValue){
		if(typeof newValue != 'undefined'){
			if(newValue >= 4){
				document.getElementById("smiley1").setAttribute("src", "img/happy.png");
			} else if(newValue <= 2){
				document.getElementById("smiley1").setAttribute("src", "img/sad.png");
			} else {
				document.getElementById("smiley1").setAttribute("src", "img/normal.png");
			}
		}
    });
	$scope.$watch('patient.relaxed', function(newValue, oldValue){
		if(typeof newValue != 'undefined'){
			if(newValue >= 4){
				document.getElementById("smiley2").setAttribute("src", "img/happy.png");
			} else if(newValue <= 2){
				document.getElementById("smiley2").setAttribute("src", "img/sad.png");
			} else {
				document.getElementById("smiley2").setAttribute("src", "img/normal.png");
			}
		}
    });
	$scope.$watch('patient.happy', function(newValue, oldValue){
		if(typeof newValue != 'undefined'){
			if(newValue >= 4){
				document.getElementById("smiley3").setAttribute("src", "img/happy.png");
			} else if(newValue <= 2){
				document.getElementById("smiley3").setAttribute("src", "img/sad.png");
			} else {
				document.getElementById("smiley3").setAttribute("src", "img/normal.png");
			}
		}
    });
	/* signup page watchers END */
    $scope.goBackToSignIn = function(){
        $ionicHistory.goBack();
    }
})

.controller('SignInController', function($scope, $rootScope, $timeout, $ionicHistory, ionicMaterialInk, $ionicPopup, $ionicLoading, $state, UserService) {
    // UNLOCK SCREEN ORIENTATION
    document.addEventListener("deviceready", onDeviceReady, false);
    function onDeviceReady() {
        screen.unlockOrientation();
    }

    ionicMaterialInk.displayEffect();
    $scope.user = {};
    var animation = 'bounceInDown';
    $scope.signIn = function(user) {
        $ionicLoading.show();
        UserService.logInUser(user).success(function(data) {
            console.log("logInUser response = ", data);
            $ionicLoading.hide();
            if (data.status == "success") {
                // Check User Status Active or Inactive
                if (data.data.user.is_status == true) {
                	$ionicLoading.show();
                    window.localStorage['ACCESS_TOKEN'] = data.access_token;
                    window.localStorage['USER_DATA'] = JSON.stringify(data.data.user);
                    var userData = JSON.parse(window.localStorage['USER_DATA']);
                    var inputdata = {};
                    inputdata._id = userData._id;
                    inputdata.device_id = window.localStorage["DEVICE_ID"];
                    inputdata.platform_type = window.localStorage['PLATFORM'];
                    inputdata.time_zone = window.localStorage['TIME_ZONE'];
                    console.log(JSON.stringify(inputdata));
                    UserService.saveDeviceId(inputdata).success(function(data, status) {
                        $ionicLoading.hide();
                        if (data.status == "success") {
                            if (userData.user_type == 4) {
                                var userId = userData._id;
                                $ionicLoading.show();
                            } else {
                                $state.go("app.tabs.checkIn");
                            }
                        }
                    });
                } else {
                    $rootScope.$broadcast('Call_Custom_Alert');
                    var alertPopup = $ionicPopup.alert({
                        title: 'Error!',
                        template: LOGIN_STATUS_ERROR,
                    });
                    alertPopup.then(function(res) {
                        $state.go("signin");
                    });
                }
            } else {
                $rootScope.$broadcast('Call_Custom_Alert');
				var errMsg = '';
				if(data.message){
					errMsg = data.message;
				}else{
					errMsg = LOGIN_ERROR;
				}
                var alertPopup = $ionicPopup.alert({
                    title: 'Error!',
                    template: errMsg,
                });
                alertPopup.then(function(res) {
                    $state.go("signin");
                });
            }
        }).error(function(error, status) {
            $ionicLoading.hide();
            if (status == 401 || status == -1) {
                $rootScope.$broadcast('Call_Custom_Alert');
                var alertPopup = $ionicPopup.alert({
                    title: 'Error!',
                    template: LOGIN_ERROR,
                });
                alertPopup.then(function(res) {});
            }
        });
    };

    $scope.goBackToSignUp = function() {
        $ionicHistory.goBack();
    }
})

.controller('ForgotPasswordController', function($scope, $rootScope, $ionicPopup, ionicMaterialInk, $ionicLoading, $state, UserService, $ionicHistory) {
    ionicMaterialInk.displayEffect();
    $scope.user = {};
    $scope.forgotPassword = function(user) {
        $ionicLoading.show();
        UserService.ForgotPassword(user).success(function(data) {
            $ionicLoading.hide();
            if (data.messageId == 203) {
                $rootScope.$broadcast('Call_Custom_Alert');
                var alertPopup = $ionicPopup.alert({
                    title: 'Warning!',
                    template: data.message
                });
                alertPopup.then(function(res) {});
            } else {
                if (data.data.phone) {
                    window.localStorage['USER_DATA'] = JSON.stringify(data.data);
                    window.localStorage['OTP_DATA'] = JSON.stringify(data.otpdata);
                    $state.go("enterOTP");
                } else {
                    $rootScope.$broadcast('Call_Custom_Alert');
                    var alertPopup = $ionicPopup.alert({
                        title: 'Warning!',
                        template: NO_MOBILE_NUMBER
                    });
                    alertPopup.then(function(res) {});
                }
            }
        }).error(function(error, status) {
            $ionicLoading.hide();
            if (status == 401 || status == -1) {
                $rootScope.$broadcast('Call_Custom_Alert');
                var alertPopup = $ionicPopup.alert({
                    title: 'OOPS!',
                    template: SERVER_ERROR,
                });
                alertPopup.then(function(res) {
                });
            }
        });
    }

    $scope.goBackToSignIn = function() {
        $ionicHistory.goBack();
    }
})

.controller('enterOTPController', function($scope, $rootScope, ionicMaterialInk, $ionicPopup, $timeout, $state, $ionicLoading, UserService, $ionicHistory) {
        ionicMaterialInk.displayEffect();
        $scope.userData = JSON.parse(window.localStorage['USER_DATA']);
        var otpData = JSON.parse(window.localStorage['OTP_DATA']);
        $scope.showAfterOtpExpire = false;
        $scope.verify = {};

        $scope.checkCode = function() {
            var inputJSON = {};
            inputJSON._id = otpData._id;
            inputJSON.otp_code = $scope.verify.otp_code;
            UserService.checkOtp(inputJSON).success(function(data) {
                if (data.messageId == 203) {
                    $rootScope.$broadcast('Call_Custom_Alert');
                    var alertPopup = $ionicPopup.alert({
                        title: 'Warning!',
                        template: OTP_NOT_MATCH
                    });
                    alertPopup.then(function(res) {});
                } else if (data.messageId == 204) {
                    $rootScope.$broadcast('Call_Custom_Alert');
                    var alertPopup = $ionicPopup.alert({
                        title: 'Warning!',
                        template: OTP_EXPIRED
                    });
                    alertPopup.then(function(res) {});
                } else if (data.messageId == 200) {
                    // OTP macthed successfully
                    $rootScope.$broadcast('Call_Custom_Alert');
                    var alertPopup = $ionicPopup.alert({
                        title: 'Success!',
                        template: OTP_MATHCED
                    });
                    alertPopup.then(function(res) {});
                    window.localStorage["RESET_PASSWORD_USER_DATA"] = JSON.stringify(data.data[0]);
                    $state.go("resetpassword");
                } else {
                    $rootScope.$broadcast('Call_Custom_Alert');
                    var alertPopup = $ionicPopup.alert({
                        title: 'Warning!',
                        template: SOMETHING_WENT_WRONG
                    });
                    alertPopup.then(function(res) {});
                }
            }).error(function(error, status) {
                $ionicLoading.hide();
                if (status == 401 || status == -1) {
                    $rootScope.$broadcast('Call_Custom_Alert');
                    var alertPopup = $ionicPopup.alert({
                        title: 'OOPS!',
                        template: SERVER_ERROR,
                    });
                    alertPopup.then(function(res) {
                    });
                }
            });
        }
        $scope.goBackToForgot = function() {
            $ionicHistory.goBack();
        }

        $scope.resendOtp = function() {
            $ionicLoading.show();
            var user = {};
            user.email = $scope.userData.email;
            UserService.ForgotPassword(user).success(function(data) {
                $ionicLoading.hide();
                if (data.messageId == 203) {
                    $rootScope.$broadcast('Call_Custom_Alert');
                    var alertPopup = $ionicPopup.alert({
                        title: 'Warning!',
                        template: data.message
                    });
                    alertPopup.then(function(res) {});
                } else {
                    if (data.data.phone) {
                        window.localStorage['USER_DATA'] = JSON.stringify(data.data);
                        window.localStorage['OTP_DATA'] = JSON.stringify(data.otpdata);
                        $rootScope.$broadcast('Call_Custom_Alert');
                        var alertPopup = $ionicPopup.alert({
                            title: 'Success!',
                            template: OTP_RESEND
                        });
                        alertPopup.then(function(res) {});
                        $state.go($state.current, {}, {
                            reload: true
                        });
                    } else {
                        $rootScope.$broadcast('Call_Custom_Alert');
                        var alertPopup = $ionicPopup.alert({
                            title: 'Warning!',
                            template: NO_MOBILE_NUMBER
                        });
                        alertPopup.then(function(res) {});
                    }
                }
            }).error(function(error, status) {
                $ionicLoading.hide();
                if (status == 401 || status == -1) {
                    $rootScope.$broadcast('Call_Custom_Alert');
                    var alertPopup = $ionicPopup.alert({
                        title: 'OOPS!',
                        template: SERVER_ERROR,
                    });
                    alertPopup.then(function(res) {
                    });
                }
            });
        }
})

.controller('resetPasswordController', function($scope, $rootScope, ionicMaterialInk, $ionicPopup, $timeout, $state, $ionicLoading, UserService, $ionicHistory) {
    ionicMaterialInk.displayEffect();
    var userData = JSON.parse(window.localStorage["RESET_PASSWORD_USER_DATA"]);
    $scope.user = {};

    $scope.resetPassword = function() {
        var inputString = {};
        inputString._id = userData.user;
        inputString.password = $scope.user.newpassword;
        inputString.originalPassword = $scope.user.newpassword;
        var passwordEncrpt = CryptoJS.AES.encrypt(JSON.stringify(inputString.password), ENCRYPTION_KEY);
        inputString.password = passwordEncrpt.toString();
        var ciphertext = CryptoJS.AES.encrypt(JSON.stringify(inputString), ENCRYPTION_KEY);
        var encryptedJSON = {};
        encryptedJSON.inputData = ciphertext.toString();
        UserService.updatePassword(encryptedJSON).success(function(data) {
            if (data.messageId == 200) {
                $rootScope.$broadcast('Call_Custom_Alert');
                var alertPopup = $ionicPopup.alert({
                    title: 'Success!',
                    template: PASSWORD_RESET_SUCCESS
                });
                alertPopup.then(function(res) {
                    localStorage.removeItem('USER_DATA');
                    $state.go("signin");
                });
            } else {
                $rootScope.$broadcast('Call_Custom_Alert');
                var alertPopup = $ionicPopup.alert({
                    title: 'Warning!',
                    template: PASSWORD_RESET_ERROR
                });
                alertPopup.then(function(res) {});
            }
        })
    }
})

.controller('menuCtrl', function($scope, $rootScope, $state, $ionicPopup, $cordovaToast, $ionicHistory, UserService, $ionicLoading) {
    var msg = LOGOUT_MSG;
    $scope.logout = function() {
        $rootScope.$broadcast('Call_Custom_Alert');
        var confirmPopup = $ionicPopup.confirm({
            title: 'Logout Alert!',
            template: 'Are you sure you want to Log Out ?' + msg
        });
        confirmPopup.then(function(res) {
            if (res) {
                $ionicLoading.show();
                var userData = JSON.parse(window.localStorage['USER_DATA']);
                var user_id = userData._id;
                var inputJSON = {"_id": user_id};
                UserService.logOutUser(inputJSON).success(function(data) {
                    $ionicLoading.hide();
                    if(data.status == "success"){
                        localStorage.removeItem('USER_DATA');
                        $state.go("signin");
                    }else{
                        $cordovaToast.showLongBottom('Sorry! Something went wrong. Please again later.');
                    }
                });
            } else {
                console.log('You are not sure');
            }
        });
    }
})

.controller('ChangePasswordController', function($scope, $rootScope, $ionicPopup, ionicMaterialInk, $state, $ionicLoading, $ionicHistory, UserService) {
    ionicMaterialInk.displayEffect();

    if(window.localStorage['USER_DATA']){
       var userData = JSON.parse(window.localStorage['USER_DATA']);
        console.log("userData = ", userData);
        if(userData.user){
            userData = userData.user;
        }
        var user = {};
        $scope.patient = {};
        user.username = userData.username;
        var decryptedData = CryptoJS.AES.decrypt(userData.password, ENCRYPTION_KEY);
        var decryptedOldPassword = decryptedData.toString(CryptoJS.enc.Utf8);
        decryptedOldPassword = decryptedOldPassword.slice(1, -1);
        user.password = decryptedOldPassword;

        UserService.logInUser(user).success(function(data) {
            $ionicLoading.hide();
            if (data.status == "success") {
                // Check User Status Active or Inactive
                if (data.data.user.is_status == true) {
                    window.localStorage['ACCESS_TOKEN'] = data.access_token;
                    window.localStorage['USER_DATA'] = JSON.stringify(data.data.user);
                    var userData = JSON.parse(window.localStorage['USER_DATA']);
                } else {
                    $rootScope.$broadcast('Call_Custom_Alert');
                    var alertPopup = $ionicPopup.alert({
                        title: 'Error!',
                        template: LOGIN_STATUS_ERROR,
                    });
                    alertPopup.then(function(res) {
                        $state.go("signin");
                    });
                }
            } else {
                $rootScope.$broadcast('Call_Custom_Alert');
                var alertPopup = $ionicPopup.alert({
                    title: 'Error!',
                    template: LOGIN_ERROR,
                });
                alertPopup.then(function(res) {
                    $state.go("signin");
                });
            }
        }).error(function(error, status) {
            $ionicLoading.hide();
            if (status == 401 || status == -1) {
                $rootScope.$broadcast('Call_Custom_Alert');
                var alertPopup = $ionicPopup.alert({
                    title: 'Error!',
                    template: LOGIN_ERROR,
                });
                alertPopup.then(function(res) {});
            }
        }); 
    }else{
        $state.go("signin");
        return;
    }

    $scope.user = {};

    $scope.changePassword = function() {
        $ionicLoading.show();
        var userData = JSON.parse(window.localStorage['USER_DATA']);
        var user_id = userData._id;
        var inputJSON = { "_id": user_id, "password": $scope.user.oldpassword, "newpassword": $scope.user.newpassword };
        var ciphertext = CryptoJS.AES.encrypt(JSON.stringify(inputJSON.newpassword), ENCRYPTION_KEY);
        inputJSON.newpassword = ciphertext.toString();
        UserService.changePassword(inputJSON).success(function(data) {
            $ionicLoading.hide();
            if(data.status == "warning"){
                $rootScope.$broadcast('Call_Custom_Alert');
                var alertPopup = $ionicPopup.alert({
                    title: 'Warning!',
                    template: OLD_NEW_PASSWORD_ERROR
                });
                alertPopup.then(function(res) {
                });
            }else if(data.status == "failure"){
                $rootScope.$broadcast('Call_Custom_Alert');
                var alertPopup = $ionicPopup.alert({
                    title: 'Warning!',
                    template: OLD_PASSWORD_ERROR
                });
                alertPopup.then(function(res) {});
            }else{
                $rootScope.$broadcast('Call_Custom_Alert');
                var alertPopup = $ionicPopup.alert({
                    title: 'Success!',
                    template: PASSWORD_CHANGE_SUCCESS
                });
                alertPopup.then(function(res) {
                    $state.go("signin");
                });
            }
        })
    }
})

.controller('settingsCtrl', function($scope, $rootScope, $state, $cordovaToast, UserService, $ionicLoading) {
    if(window.localStorage['USER_DATA']){
       var userData = JSON.parse(window.localStorage['USER_DATA']);
        console.log("userData = ", userData);
        if(userData.user){
            userData = userData.user;
        }
        var user = {};
        $scope.patient = {};
        user.username = userData.username;
        var decryptedData = CryptoJS.AES.decrypt(userData.password, ENCRYPTION_KEY);
        var decryptedOldPassword = decryptedData.toString(CryptoJS.enc.Utf8);
        decryptedOldPassword = decryptedOldPassword.slice(1, -1);
        user.password = decryptedOldPassword;

        UserService.logInUser(user).success(function(data) {
            $ionicLoading.hide();
            if (data.status == "success") {
                // Check User Status Active or Inactive
                if (data.data.user.is_status == true) {
                    window.localStorage['ACCESS_TOKEN'] = data.access_token;
                    window.localStorage['USER_DATA'] = JSON.stringify(data.data.user);
                    var userData = JSON.parse(window.localStorage['USER_DATA']);
                } else {
                    $rootScope.$broadcast('Call_Custom_Alert');
                    var alertPopup = $ionicPopup.alert({
                        title: 'Error!',
                        template: LOGIN_STATUS_ERROR,
                    });
                    alertPopup.then(function(res) {
                        $state.go("signin");
                    });
                }
            } else {
                $rootScope.$broadcast('Call_Custom_Alert');
                var alertPopup = $ionicPopup.alert({
                    title: 'Error!',
                    template: LOGIN_ERROR,
                });
                alertPopup.then(function(res) {
                    $state.go("signin");
                });
            }
        }).error(function(error, status) {
            $ionicLoading.hide();
            if (status == 401 || status == -1) {
                $rootScope.$broadcast('Call_Custom_Alert');
                var alertPopup = $ionicPopup.alert({
                    title: 'Error!',
                    template: LOGIN_ERROR,
                });
                alertPopup.then(function(res) {});
            }
        }); 
    }else{
        $state.go("signin");
        return;
    }
    $scope.getUserSettings = function(){
        if(userData.notifications_setting == true){
            $scope.pushNotification = { checked: true };
        }else{
            $scope.pushNotification = { checked: false };
        }
    }
    $scope.pushNotificationChange = function(){
        console.log('Push Notification Change', $scope.pushNotification.checked);
        var inputdata = {};
        inputdata._id = userData._id;
        inputdata.notifications_setting = $scope.pushNotification.checked;
        console.log(JSON.stringify(inputdata));
        $ionicLoading.show();
        UserService.saveDeviceId(inputdata).success(function(data, status) {
            $ionicLoading.hide();
            if (data.status == "success") {
                console.log("HERE in SUCCESS");
                $cordovaToast.showLongBottom('Push notifications setting changed.');
            }
        });
    }
})

.controller('checkInCtrl', function($scope, $rootScope, $ionicLoading, $stateParams, ionicMaterialInk, UserService, CheckInService, $timeout, $ionicPopup, ionicTimePicker, $state) {
    ionicMaterialInk.displayEffect();
    if(window.localStorage['USER_DATA']){
       var userData = JSON.parse(window.localStorage['USER_DATA']);
        console.log("userData = ", userData);
        if(userData.user){
            userData = userData.user;
        }
        var user = {};
        $scope.patient = {};
        user.username = userData.username;
        var decryptedData = CryptoJS.AES.decrypt(userData.password, ENCRYPTION_KEY);
        var decryptedOldPassword = decryptedData.toString(CryptoJS.enc.Utf8);
        decryptedOldPassword = decryptedOldPassword.slice(1, -1);
        user.password = decryptedOldPassword;

        UserService.logInUser(user).success(function(data) {
            $ionicLoading.hide();
            if (data.status == "success") {
                // Check User Status Active or Inactive
                if (data.data.user.is_status == true) {
                    window.localStorage['ACCESS_TOKEN'] = data.access_token;
                    window.localStorage['USER_DATA'] = JSON.stringify(data.data.user);
                    var userData = JSON.parse(window.localStorage['USER_DATA']);
                } else {
                    $rootScope.$broadcast('Call_Custom_Alert');
                    var alertPopup = $ionicPopup.alert({
                        title: 'Error!',
                        template: LOGIN_STATUS_ERROR,
                    });
                    alertPopup.then(function(res) {
                        $state.go("signin");
                    });
                }
            } else {
                $rootScope.$broadcast('Call_Custom_Alert');
                var alertPopup = $ionicPopup.alert({
                    title: 'Error!',
                    template: LOGIN_ERROR,
                });
                alertPopup.then(function(res) {
                    $state.go("signin");
                });
            }
        }).error(function(error, status) {
            $ionicLoading.hide();
            if (status == 401 || status == -1) {
                $rootScope.$broadcast('Call_Custom_Alert');
                var alertPopup = $ionicPopup.alert({
                    title: 'Error!',
                    template: LOGIN_ERROR,
                });
                alertPopup.then(function(res) {});
            }
        }); 
    }else{
        $state.go("signin");
        return;
    }
    
    /* durationPicker Configuration*/
    $scope.durationConfig = {};
    $scope.durationConfig = {
        inputButtonType: 'button-stable',
        popupTitle: 'Enter Duration',
        popupSubTitle: 'In minutes & seconds.',
        popupSaveLabel: 'Set',
        popupSaveButtonType: 'button-balanced',
        popupCancelLabel: 'Close',
        popupCancelButtonType: 'button-assertive',
        rtl: false
    };

    $scope.noDataMessage = NO_DATA;
    $scope.dailyMetricAvailable = false;
    $scope.weeklyMetricAvailable = false;
    $scope.generalMetricAvailable = false;
    $scope.staticMetricAvailable = false;
    $scope.updateButton = false;
    $scope.nodata = false;
    $scope.showCheckInData = false;
    $scope.isMessage = false;
    var animation = 'bounceInDown';
    $scope.rating = {};
    $scope.rating.max = 5;
    var currentDt = new Date();
    var mm = currentDt.getMonth() + 1;
    var dd = currentDt.getDate();
    var yyyy = currentDt.getFullYear();
    var date = (mm < 10 ? '0' + mm : mm) + '/' + dd + '/' + yyyy;
    var dataJSON = {};
    dataJSON.patient = userData._id;
    $scope.findPatientCheckIn = {};
    $scope.findPatientCheckIn.patient = userData._id;
    $scope.newDate = date;
    $scope.todayDate = date;
    
    $scope.generalQuestionCheckIn = [{
        "id": 1,
        "title": "Alcohol/drugs?",
        "is_enable": false,
        "checked": false
    }, {
        "id": 2,
        "title": "Exercise?",
        "is_enable": false,
        "checked": false
    }, {
        "id": 3,
        "title": "Caffeine?",
        "is_enable": false,
        "checked": false
    }];

    $scope.staticQuestions = [{
        "id": "1",
        "title": "Sleep Quality?",
        "rating": 0
    }, {
        "id": "2",
        "title": "Sleep Enough?",
        "rating": 0
    }, {
        "id": "3",
        "title": "Energy?",
        "rating": 0
    }, {
        "id": "4",
        "title": "Relaxed?",
        "rating": 0
    }, {
        "id": "5",
        "title": "Happy?",
        "rating": 0
    }, {
        "id": "6",
        "title": "Stress?",
        "rating": 0
    }, {
        "id": "7",
        "title": "Irritable?",
        "rating": 0
    }];
	
	/* Watchers for Smileys */
	$scope.$watch('patient.sleep_quality', function(newValue, oldValue){
		if(typeof newValue != 'undefined' && document.getElementById("smiley0") != null){
			if(newValue >= 4){
				document.getElementById("smiley0").setAttribute("src", "img/happy.png");
			} else if(newValue <= 2){
				document.getElementById("smiley0").setAttribute("src", "img/sad.png");
			} else {
				document.getElementById("smiley0").setAttribute("src", "img/normal.png");
			}
		}
    });
	$scope.$watch('patient.sleep_enough', function(newValue, oldValue){
		if(typeof newValue != 'undefined' && document.getElementById("smiley1") != null){
			if(newValue >= 4){
				document.getElementById("smiley1").setAttribute("src", "img/happy.png");
			} else if(newValue <= 2){
				document.getElementById("smiley1").setAttribute("src", "img/sad.png");
			} else {
				document.getElementById("smiley1").setAttribute("src", "img/normal.png");
			}
		}
    });
	$scope.$watch('patient.energy', function(newValue, oldValue){
		if(typeof newValue != 'undefined' && document.getElementById("smiley2") != null){
			if(newValue >= 4){
				document.getElementById("smiley2").setAttribute("src", "img/happy.png");
			} else if(newValue <= 2){
				document.getElementById("smiley2").setAttribute("src", "img/sad.png");
			} else {
				document.getElementById("smiley2").setAttribute("src", "img/normal.png");
			}
		}
    });
	$scope.$watch('patient.happy', function(newValue, oldValue){
		if(typeof newValue != 'undefined' && document.getElementById("smiley3") != null){
			if(newValue >= 4){
				document.getElementById("smiley3").setAttribute("src", "img/happy.png");
			} else if(newValue <= 2){
				document.getElementById("smiley3").setAttribute("src", "img/sad.png");
			} else {
				document.getElementById("smiley3").setAttribute("src", "img/normal.png");
			}
		}
    });
	$scope.$watch('patient.relaxed', function(newValue, oldValue){
		if(typeof newValue != 'undefined' && document.getElementById("smiley4") != null){
			if(newValue >= 4){
				document.getElementById("smiley4").setAttribute("src", "img/happy.png");
			} else if(newValue <= 2){
				document.getElementById("smiley4").setAttribute("src", "img/sad.png");
			} else {
				document.getElementById("smiley4").setAttribute("src", "img/normal.png");
			}
		}
    });
	$scope.$watch('patient.stress', function(newValue, oldValue){
		if(typeof newValue != 'undefined' && document.getElementById("smiley5") != null){
			if(newValue >= 4){
				document.getElementById("smiley5").setAttribute("src", "img/happy.png");
			} else if(newValue <= 2){
				document.getElementById("smiley5").setAttribute("src", "img/sad.png");
			} else {
				document.getElementById("smiley5").setAttribute("src", "img/normal.png");
			}
		}
    });
	$scope.$watch('patient.irritable', function(newValue, oldValue){
		if(typeof newValue != 'undefined' && document.getElementById("smiley6") != null){
			if(newValue >= 4){
				document.getElementById("smiley6").setAttribute("src", "img/happy.png");
			} else if(newValue <= 2){
				document.getElementById("smiley6").setAttribute("src", "img/sad.png");
			} else {
				document.getElementById("smiley6").setAttribute("src", "img/normal.png");
			}
		}
    });
	
	//----------Add more functionality for Food-------------------//
        $scope.patient1 = {};
        // new Implementation
        $scope.inputsData = [
            {
                name: "food1",
                settime: 7
            },
            {
                name: "food2",
                settime: 8
            },
            {
                name: "food3",
                settime: 9
            }
        ];

        $scope.addNewFoodChoice = function () {
            var newItemNo = $scope.inputsData.length+1;
            var lastSettime = $scope.inputsData[$scope.inputsData.length-1].settime;
            $scope.inputsData.push({
                name: "food"+newItemNo,
                settime: lastSettime+1
            });
        }

        $scope.removeFoodChoice = function (data) {
            console.log(data);
            if (data.settime == 10) {
                delete $scope.patient1[data.name];
            }
             else if (data.settime == 11) {
                delete $scope.patient1[data.name];
            }
             else if (data.settime == 12) {
                delete $scope.patient1[data.name];
            }

            var lastItem = $scope.inputsData.length-1;
            $scope.inputsData.splice(lastItem);
        }
	//--------------------------------------------------//

    $scope.next = function() {
        $ionicSlideBoxDelegate.next();
    };
    $scope.previous = function() {
        $ionicSlideBoxDelegate.previous();
    };

    // Called each time the slide changes
    $scope.slideChanged = function(index) {
        $scope.slideIndex = index;
    };

    /*
     *  Check in Init Function .
     *  developer : Shilpa Sharma
     *  modified by : Gurpreet
     */
    $scope.showCheckInData = false;
    $scope.checkInDisable = false;
    $scope.CheckIn = true;
    $scope.CheckInNext = false; $scope.CheckInPrevious = true;
    $scope.checkinDate = false;
    $scope.checkinDateOne = true;
    $scope.noClick = true;
    $scope.isDataAvailable = false;
	$scope.checkInSubmittedDays = 0;
	$scope.checkInTotalDays = 0;
    $scope.checkInDataGet = function(num, holderDate) {
        $ionicLoading.show();
        if (num == 1 || num == 2) {
            $scope.CheckInNext = true;
            var d = new Date(holderDate);
            if (num == 1) {
                d.setDate(d.getDate() - 1);
            } else if (num == 2) {
                d.setDate(d.getDate() + 1);
            }
            var mm = d.getMonth() + 1;
            var yyyy = d.getFullYear();
            var dd = d.getDate();
            var formatdate = (mm < 10 ? '0' + mm : mm) + '/' + dd + '/' + yyyy;
            $scope.newDate = formatdate;
            
            var inputJsonData = {};
            inputJsonData.user_id = userData._id;
            inputJsonData.checkin_date = formatdate;
            CheckInService.findCheckinData(inputJsonData).success(function(response) {
                $scope.checkinDateOne = true;
                $ionicLoading.hide();
                if (response.messageId == 200) {
                    if(formatdate == $scope.todayDate){
                        console.log(">>> it's today.");
                        $scope.CheckIn = true;
                        $scope.isMessage = false;
                        $scope.isDataAvailable = true;
                        $scope.CheckInNext = false;
                        $scope.checkInDisable = false;
                        showTodayCheckIns(response);
                    }else{
                        /* if not data is available for check-in */
                        if (response.data.length == 0) {
                            $scope.patient = {};
                            $scope.isMessage = true;
                            $scope.boxMessageText = NO_CHECK_IN;
                            $scope.checkInDisable = true;
                            $scope.isDataAvailable = false;
                        } else {
                            $scope.newDate = formatdate;
                            $scope.isDataAvailable = true;
                            $scope.patient = response.data[0];
                            $scope.patient1 = response.data[0];
                            newInputFoodArray($scope.patient1);
                            $scope.showCheckInData = true;
                            $scope.CheckIn = false;
                            $scope.isMessage = true;
                            $scope.checkInDisable = true;
                            if (response.data.length == 1) {
                                console.log("-- not today, but 1");
                                $scope.boxMessageText = PREV_ONE_CHECK_IN_MESSAGE;
                            } else if (response.data.length == 2) {
                                console.log("-- not today, but 2");
                                $scope.boxMessageText = PREV_ALL_CHECK_IN_MESSAGE;
                            }
                        }
                    }
                }
            });
        } else if (num == 0) {
            var inputJson = {};
            inputJson.user_id = userData._id;
			
			/* first find checkin count */
			CheckInService.findCheckinCount(inputJson).success(function(response) {
				console.log("response = ", response);
                if (response.messageId == 200) {
					$scope.checkInSubmittedDays = response.data.checkinCount;
					$scope.checkInTotalDays 	= response.data.totalDays;
					
					inputJson.checkin_date = $scope.newDate;
                    CheckInService.findCheckinData(inputJson).success(function(response) {
						$ionicLoading.hide();
						if (response.messageId == 200) {
							showTodayCheckIns(response);
						}
					});
                }
            }).error(function(error, status) {
				$ionicLoading.hide();
				inputJson.checkin_date = $scope.newDate;
                CheckInService.findCheckinData(inputJson).success(function(response) {
					$ionicLoading.hide();
					if (response.messageId == 200) {
						showTodayCheckIns(response);
					}
				});
			});
        }
    }
    /*
    *   function to show check-in screen in different cases for today.
    *   developer   :   Gurpreet
    **/
    function showTodayCheckIns(response){
        $ionicLoading.show();
        $scope.isDataAvailable = true;
        $scope.showCheckInData = true;
        $scope.newDate = date;
        console.log("scope.newDate = ", $scope.newDate);
        $scope.checkinDateOne = true; // console.log("count",response.data[0].checkin_count);
        console.log("response.data.length = ", response.data.length);
        if (response.data.length == 0) {
            $ionicLoading.hide();
            $scope.CheckIn = true;
            $scope.patient = {};
        }else if (response.data.length == 1) {
            $ionicLoading.hide();
            $scope.isMessage = false;
            $scope.CheckIn = true;
            $scope.CheckInOne = false;
            $scope.patient = response.data[0];
            $scope.patient1 = response.data[0];
            newInputFoodArray($scope.patient1);
            $scope.isMessage = true;
            $scope.boxMessageText = ONE_CHECK_IN_MESSAGE;
        } else if (response.data.length == 2) {
            $ionicLoading.hide();
            $scope.checkInDisable = true;
            $scope.isMessage = true;
            $scope.CheckIn = false;
            $scope.CheckInOne = false;
            $scope.checkinDateOne = true;
            $scope.patient = response.data[0];
            $scope.patient1 = response.data[0];
            newInputFoodArray($scope.patient1);
            $scope.boxMessageText = CHECK_IN_MESSAGE;
        }
    }

    function newInputFoodArray (val) {
        if(val.food4){
            var newItemNo = $scope.inputsData.length+1;
            var lastSettime = $scope.inputsData[$scope.inputsData.length-1].settime;
            $scope.inputsData.push({
                name: "food"+newItemNo,
                settime: lastSettime+1
            });
        }
        if(val.food5){
            var newItemNo = $scope.inputsData.length+1;
            var lastSettime = $scope.inputsData[$scope.inputsData.length-1].settime;
            $scope.inputsData.push({
                name: "food"+newItemNo,
                settime: lastSettime+1
            });
        }
        if(val.food6){
            var newItemNo = $scope.inputsData.length+1;
            var lastSettime = $scope.inputsData[$scope.inputsData.length-1].settime;
            $scope.inputsData.push({
                name: "food"+newItemNo,
                settime: lastSettime+1
            });
        }
    }
    
    $scope.getPatientGeneralQuestions = function() {
        CheckInService.listPatientGeneralQuestions(dataJSON).success(function(response) {
            if (response.messageId == 200) {
                if (response.data.length != 0) {
                    $scope.generalQuestionCheckIn = [{
                        "id": 1,
                        "title": "Alcohol/drugs?",
                        "is_enable": response.data[0].is_alcohal_drugs,
                        "checked": false
                    }, {
                        "id": 2,
                        "title": "Exercise?",
                        "is_enable": response.data[0].is_exercise,
                        "checked": false
                    }, {
                        "id": 3,
                        "title": "Caffeine?",
                        "is_enable": response.data[0].is_caffeine,
                        "checked": false
                    }];
                } else {
                    $scope.GeneralDataAvailable = false;
                }
                $scope.getPatientCheckInData();
            }
        });
    }

    $scope.getPatientCheckInData = function() {
        CheckInService.getPatientCheckIn($scope.findPatientCheckIn).success(function(response) {
           $ionicLoading.hide();
            if (response.messageId == 200) {
                if (response.data.length != 0) {
                    $scope.showCheckInData = false;
                    $scope.isMessage = true;
                    $scope.boxMessageText = CHECK_IN_MESSAGE;
                } else {
                    $scope.showCheckInData = true;
                    CheckIn
                    $scope.isMessage = false;
                }
            } else {
                console.log("Error.")
            }
        });
    }

    var inputJsonData = {};
    /**
     *  function - saveCheckInData : Add CheckIn Data
     *  developer : Shilpa Sharma
     **/
    $scope.saveCheckInData = function() {

        console.log($scope.patient1);
        var foodDataJson = {};
        for(key in $scope.patient1){
            if(key == "food1"){
                foodDataJson[key] = $scope.patient1[key];
            }
            if(key == "food2"){
                foodDataJson[key] = $scope.patient1[key];
            }
            if(key == "food3"){
                foodDataJson[key] = $scope.patient1[key];
            }
            if(key == "food4"){
                foodDataJson[key] = $scope.patient1[key];
            }
            if(key == "food5"){
                foodDataJson[key] = $scope.patient1[key];
            }if(key == "food6"){
                foodDataJson[key] = $scope.patient1[key];
            }
        }

        console.log("foodDataJson",  foodDataJson); 
        var i = 1;
        var j = "food";
        for(key in foodDataJson){
            $scope.patient[j+i] = foodDataJson[key];
            i++;
        }

        console.log('$scope.patient = ', $scope.patient);

        $ionicLoading.show();
        inputJsonData = $scope.patient;
        inputJsonData.user_id = userData._id;
        inputJsonData.checkin_date = date;
        inputJsonData.static_metric = [];
        inputJsonData.checkin_count = $scope.patient.checkin_count;
        console.log("check in data = ", inputJsonData);
        if (inputJsonData.checkin_count == 1) {
            inputJsonData.checkin_count += 1;
        }

        // Save check-in on daily basis
        CheckInService.saveCheckIn(inputJsonData).success(function(response) {
           $ionicLoading.hide();
            console.log("response saveeee= ", response);
            if (response.messageId == 200) {
                $rootScope.$broadcast('Call_Custom_Alert');
                var alertPopup = $ionicPopup.alert({
                    title: 'Success!',
                    template: CHECK_IN_SAVE,
                });
                console.log('response.data.checkin_count = ', response.data.checkin_count);
                alertPopup.then(function(res) {
                    $scope.boxMessageText = CHECK_IN_MESSAGE;
                });
                if(response.data.checkin_count == 2){
                    console.log("response.data.checkin_count", response.data.checkin_count);
                    $scope.checkIn = false;
                    $scope.checkInDisable = true;
                }
                $state.reload('app.tabs.checkIn');
            } else {
                $rootScope.$broadcast('Call_Custom_Alert');
                var alertPopup = $ionicPopup.alert({
                    title: 'Warning!',
                    template: CHECK_IN_ERROR,
                });
                alertPopup.then(function(res) {});
            }
        });
        // $state.reload('tabs.checkIn');
    }

    /*
     * setTime function to set time for fields on CHECK IN screen.
     * developer : GpSingh
     */
    $scope.setTime = function(num) {
        console.log(num);
        var ipObj1 = {

            callback: function(val) { //Mandatory
                if (typeof(val) === 'undefined') {
                    console.log('Time not selected');
                } else {
                    if ($scope.patient === undefined) {
                        $scope.patient = {};
                    }
                    var selectedTime = new Date(val * 1000);
                    var d = new Date(selectedTime);
                    var d2 = new Date();

                    d.setMonth(d2.getMonth());
                    d.setDate(d2.getDate());
                    d.setFullYear(d2.getFullYear());
                    d.setHours(d.getUTCHours());
                    d.setMinutes(d.getUTCMinutes());
                    // Check if User have selected previous time
                    if (d2.getTime() > d.getTime()) {
                        d.setDate(d2.getDate() + 1);
                        console.log(d.setDate(d2.getDate() + 1));
                    }

                    var hours = d.getHours();
                    var hours2 = hours - 2; /* subtracting 2 hours to automatically get glasses wear time */
                    var minutes = d.getMinutes();
                    var ampm = hours >= 12 ? 'PM' : 'AM';
                    var ampm2 = hours2 >= 12 ? 'PM' : 'AM';
                    hours = hours % 12;
                    hours = hours ? hours : 12; // the hour '0' should be '12'
                    hours2 = hours2 % 12;
                    hours2 = hours2 ? hours2 : 12; // the hour '0' should be '12'
                    minutes = minutes < 10 ? '0' + minutes : minutes;
                    var timeString = hours + ":" + minutes + " " + ampm;
                    var timeString2 = hours2 + ":" + minutes + " " + ampm2;
                    if (num == 1) {
                        console.log('in num 1');
                        $scope.patient.bedtime = timeString;
                        console.log('timeString = ', timeString);
                        console.log('$scope.patient.bedtime = ', $scope.patient.bedtime);
                    } else if (num == 2) {
                        $scope.patient.wake_up = timeString;
                    } else if (num == 3) {
                        $scope.patient.wear_glasses_time = timeString;
                    } else if (num == 4) {
                        $scope.patient.out_of_bed = timeString;
                    } else if (num == 5) {
                        $scope.patient.up_at_night = timeString;
                    } else if (num == 6) {
                        $scope.patient.nap = timeString;
                    }
                }
                // console.log($scope.patient);
            },
            //inputTime: 50400, //Optional
            format: 12, //Optional
            step: 1, //Optional
            setLabel: 'Set' //Optional
        };
        ionicTimePicker.openTimePicker(ipObj1);
    }

    $scope.setFoodTime = function(num, name) {
        console.log(num, name);
        var ipObj1 = {
            callback: function(val) { //Mandatory
                if (typeof(val) === 'undefined') {
                    console.log('Time not selected');
                } else {
                    if ($scope.patient === undefined) {
                        $scope.patient = {};
                    }
                    var selectedTime = new Date(val * 1000);
                    var d = new Date(selectedTime);
                    var d2 = new Date();

                    d.setMonth(d2.getMonth());
                    d.setDate(d2.getDate());
                    d.setFullYear(d2.getFullYear());
                    d.setHours(d.getUTCHours());
                    d.setMinutes(d.getUTCMinutes());
                    // Check if User have selected previous time
                    if (d2.getTime() > d.getTime()) {
                        d.setDate(d2.getDate() + 1);
                        console.log(d.setDate(d2.getDate() + 1));
                    }

                    var hours = d.getHours();
                    var hours2 = hours - 2; /* subtracting 2 hours to automatically get glasses wear time */
                    var minutes = d.getMinutes();
                    var ampm = hours >= 12 ? 'PM' : 'AM';
                    var ampm2 = hours2 >= 12 ? 'PM' : 'AM';
                    hours = hours % 12;
                    hours = hours ? hours : 12; // the hour '0' should be '12'
                    hours2 = hours2 % 12;
                    hours2 = hours2 ? hours2 : 12; // the hour '0' should be '12'
                    minutes = minutes < 10 ? '0' + minutes : minutes;
                    var timeString = hours + ":" + minutes + " " + ampm;
                    var timeString2 = hours2 + ":" + minutes + " " + ampm2;
                    if (num == 7 && name == "food1") {
                        $scope.patient1[name] = timeString;
                    } else if (num == 8) {
                        $scope.patient1[name] = timeString;
                    } else if (num == 9) {
                        $scope.patient1[name] = timeString;
                    }
                    else if (num == 10) {
                        $scope.patient1[name] = timeString;
                    }
                     else if (num == 11) {
                        $scope.patient1[name] = timeString;
                    }
                     else if (num == 12) {
                        $scope.patient1[name] = timeString;
                    }
                }
                // console.log($scope.patient);
            },
            //inputTime: 50400, //Optional
            format: 12, //Optional
            step: 1, //Optional
            setLabel: 'Set' //Optional
        };
        ionicTimePicker.openTimePicker(ipObj1);
    }
	
	/* Check if a entered string is a valid two digit numeric */
	function checkNumRegex(val){
		var reg = new RegExp('^[0-9]{0,2}$');
		//console.log('regex test result = ', reg.test(val));
		return reg.test(val);
	}
	
	$scope.enableErrClass1 = false;
	$scope.$watch('patient.caffeine1', function(newValue, oldValue){
		$scope.enableErrClass1 = false;
		if((typeof newValue != 'undefined') && (isNaN(newValue) || newValue < 0 || !checkNumRegex(newValue))){
			$scope.enableErrClass1 = true;
		}
    });
	$scope.$watch('patient.caffeine2', function(newValue, oldValue){
		$scope.enableErrClass2 = false;
		if((typeof newValue != 'undefined') && (isNaN(newValue) || newValue < 0 || !checkNumRegex(newValue))){
			$scope.enableErrClass2 = true;
		}
    });
	$scope.$watch('patient.caffeine3', function(newValue, oldValue){
		$scope.enableErrClass3 = false;
		if((typeof newValue != 'undefined') && (isNaN(newValue) || newValue < 0 || !checkNumRegex(newValue))){
			$scope.enableErrClass3 = true;
		}
    });
	$scope.$watch('patient.medication', function(newValue, oldValue){
		$scope.enableErrClass4 = false;
		if((typeof newValue != 'undefined') && (isNaN(newValue) || newValue < 0 || !checkNumRegex(newValue))){
			$scope.enableErrClass4 = true;
		}
    });
	$scope.$watch('patient.alcohol', function(newValue, oldValue){
		$scope.enableErrClass5 = false;
		if((typeof newValue != 'undefined') && (isNaN(newValue) || newValue < 0 || !checkNumRegex(newValue))){
			$scope.enableErrClass5 = true;
		}
    });
})

.controller('stateOfMindCtrl', function($scope, $rootScope, $state, $stateParams, UserService, CheckInService, $ionicLoading, ionicMaterialInk, $timeout, $ionicPopup, stateOfMindService) {
    if(window.localStorage['USER_DATA']){
       var userData = JSON.parse(window.localStorage['USER_DATA']);
        if(userData.user){
            userData = userData.user;
        }
        var user = {};
        $scope.patient = {};
        user.username = userData.username;
        var decryptedData = CryptoJS.AES.decrypt(userData.password, ENCRYPTION_KEY);
        var decryptedOldPassword = decryptedData.toString(CryptoJS.enc.Utf8);
        decryptedOldPassword = decryptedOldPassword.slice(1, -1);
        user.password = decryptedOldPassword;

        UserService.logInUser(user).success(function(data) {
            $ionicLoading.hide();
            if (data.status == "success") {
                // Check User Status Active or Inactive
                if (data.data.user.is_status == true) {
                    window.localStorage['ACCESS_TOKEN'] = data.access_token;
                    window.localStorage['USER_DATA'] = JSON.stringify(data.data.user);
                    var userData = JSON.parse(window.localStorage['USER_DATA']);
                } else {
                    $rootScope.$broadcast('Call_Custom_Alert');
                    var alertPopup = $ionicPopup.alert({
                        title: 'Error!',
                        template: LOGIN_STATUS_ERROR,
                    });
                    alertPopup.then(function(res) {
                        $state.go("signin");
                    });
                }
            } else {
                $rootScope.$broadcast('Call_Custom_Alert');
                var alertPopup = $ionicPopup.alert({
                    title: 'Error!',
                    template: LOGIN_ERROR,
                });
                alertPopup.then(function(res) {
                    $state.go("signin");
                });
            }
        }).error(function(error, status) {
            $ionicLoading.hide();
            if (status == 401 || status == -1) {
                $rootScope.$broadcast('Call_Custom_Alert');
                var alertPopup = $ionicPopup.alert({
                    title: 'Error!',
                    template: LOGIN_ERROR,
                });
                alertPopup.then(function(res) {});
            }
        }); 
    }else{
        $state.go("signin");
        return;
    }


    $scope.user_name = userData.first_name + " " + userData.last_name;

    $scope.showAppointmentDiv = false;
    $scope.showDailyMetricDiv = false;
    $scope.showDailyMetricCharts = false;
    $scope.showWeeklyMetricDiv = false;
    $scope.NoDataAvailable = true;
    $scope.DataAvailable = false;
    $scope.Math = window.Math;

    function formatDate(date) {
        var weekday = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
        var day = weekday[date.getDay()];
        var hours = date.getHours();
        var minutes = date.getMinutes();
        var month = date.getMonth() + 1;
        var dateday = date.getDate();
        var ampm = hours >= 12 ? 'pm' : 'am';
        hours = hours % 12;
        hours = hours ? hours : 12; // the hour '0' should be '12'
        minutes = minutes < 10 ? '0' + minutes : minutes;
        month = month < 10 ? '0' + month : month;
        dateday = dateday < 10 ? '0' + dateday : dateday;
        var strTime = hours + ':' + minutes + ' ' + ampm;
        var dateReturn = dateday + "/" + month + "/" + date.getFullYear();
        return strTime + " " + day + " " + dateReturn;
    }
    // Set Appointment Date End
    
    $scope.getStateofMindData = function() {
        $ionicLoading.show();
        var inputJson = {};
        inputJson.user_id = userData._id;
        $scope.chartlabels1 = []; $scope.chartlabels2 = []; $scope.chartlabels3 = [];
        $scope.FirstChartData = []; $scope.FirstChartSeries = [];
        $scope.SecondChartData = []; $scope.SecondChartSeries = [];
        $scope.ThirdChartData = []; $scope.ThirdChartSeries = [];
        $scope.showChart1 = false; $scope.showChart2 = false; $scope.showChart3 = false;
        $scope.nodata = false; $scope.noDataMessage = '';
        
        stateOfMindService.findCheckIndata(inputJson).success(function(response) {
            console.log("response = ", response);
            if ((response.messageId == 200) && (response.data.length > 0)) {
                var firstData = []; var secondData = []; var thirdData = [];
                firstData[0] = []; firstData[1] = []; firstData[2] = [];
                secondData[0] = []; secondData[1] = []; secondData[2] = [];
                thirdData[0] = []; thirdData[1] = []; thirdData[2] = [];
                for (var i = 0; i < response.data.length; i++) {
                    var checkinData = response.data[i];
                    var str = checkinData.checkin_date;
                    var res = str.split("/");
                    var dateForChart = res[0] + "/" + res[1];
                        $scope.chartlabels1.push(dateForChart);
                        firstData[0].push(checkinData.sleep_quality);
                        firstData[1].push(checkinData.energy);
                        firstData[2].push(checkinData.happy);
                        
                        $scope.chartlabels2.push(dateForChart);
                        secondData[0].push(checkinData.happy);
                        secondData[1].push(checkinData.relaxed);
                        secondData[2].push(checkinData.sleep_enough);
                        
                        $scope.chartlabels3.push(dateForChart);
                        thirdData[0].push(checkinData.relaxed);
                        thirdData[1].push(checkinData.alcohol);
                        thirdData[2].push(checkinData.medication);
                } //for end.
                
                console.log("firstData = ", firstData);
                console.log("secondData = ", secondData);
                $scope.FirstChartSeries = ['Sleep Quality', 'Energy', 'Happy'];
                $scope.FirstChartData = firstData;
                $scope.showChart1 = true;
                $scope.SecondChartSeries = ['Happy', 'Relaxed', 'Sleep Enough'];
                $scope.ThirdChartSeries = ['Relaxed', 'Alcohol', 'Medication'];

                setTimeout(function(){
                    $scope.SecondChartData = secondData;
                    $scope.showChart2 = true;
                    $scope.$apply();
                }, 1000);
                
                setTimeout(function(){
                    $scope.ThirdChartData = thirdData;
                    $scope.showChart3 = true;
                    $scope.$apply();
                    $ionicLoading.hide();
                }, 1000);
                
            }else{
                $scope.nodata = true;
                $scope.noDataMessage = 'No data available. Please submit check-ins first.';
                $ionicLoading.hide();
            }
        });        
    }

    // animate pop up dailog
    function showConfirm(animation) {
        $timeout(function() {
            var popupElements = document.getElementsByClassName("popup-container");
            if (popupElements.length) {
                var popupElement = angular.element(popupElements[0]);
                popupElement.addClass('animated')
                popupElement.addClass(animation)
            };
        }, 1)
    }
	
})

.controller('jetLagCtrl', function($scope, $rootScope, $ionicLoading, $stateParams, ionicMaterialInk, UserService, CheckInService, jetLagService, $timeout, $ionicPopup, ionicTimePicker, ionicDatePicker, $state, $http) {
    if(window.localStorage['USER_DATA']){
       var userData = JSON.parse(window.localStorage['USER_DATA']);
        console.log("userData = ", userData);
        if(userData.user){
            userData = userData.user;
        }
        var user = {};
        $scope.patient = {};
        user.username = userData.username;
        var decryptedData = CryptoJS.AES.decrypt(userData.password, ENCRYPTION_KEY);
        var decryptedOldPassword = decryptedData.toString(CryptoJS.enc.Utf8);
        decryptedOldPassword = decryptedOldPassword.slice(1, -1);
        user.password = decryptedOldPassword;

        UserService.logInUser(user).success(function(data) {
            $ionicLoading.hide();
            if (data.status == "success") {
                // Check User Status Active or Inactive
                if (data.data.user.is_status == true) {
                    window.localStorage['ACCESS_TOKEN'] = data.access_token;
                    window.localStorage['USER_DATA'] = JSON.stringify(data.data.user);
                    var userData = JSON.parse(window.localStorage['USER_DATA']);
                } else {
                    $rootScope.$broadcast('Call_Custom_Alert');
                    var alertPopup = $ionicPopup.alert({
                        title: 'Error!',
                        template: LOGIN_STATUS_ERROR,
                    });
                    alertPopup.then(function(res) {
                        $state.go("signin");
                    });
                }
            } else {
                $rootScope.$broadcast('Call_Custom_Alert');
                var alertPopup = $ionicPopup.alert({
                    title: 'Error!',
                    template: LOGIN_ERROR,
                });
                alertPopup.then(function(res) {
                    $state.go("signin");
                });
            }
        }).error(function(error, status) {
            $ionicLoading.hide();
            if (status == 401 || status == -1) {
                $rootScope.$broadcast('Call_Custom_Alert');
                var alertPopup = $ionicPopup.alert({
                    title: 'Error!',
                    template: LOGIN_ERROR,
                });
                alertPopup.then(function(res) {});
            }
        }); 
    }else{
        $state.go("signin");
        return;
    }

    $scope.timezones = {};
    $scope.timezones = [
            {"key":"-12 (west)", "value":"-12"},
            {"key":"-10 (west)", "value":"-10"},
            {"key":"-8 (west)", "value":"-8"},
            {"key":"-6 (west)", "value":"-6"},
            {"key":"-4 (west)", "value":"-4"},
            {"key":"-2 (west)", "value":"-2"},
            //{"key":"0", "value":"0"},
            {"key":"+2 (east)", "value":"2"},
            {"key":"+4 (east)", "value":"4"},
            {"key":"+6 (east)", "value":"6"},
            {"key":"+8 (east)", "value":"8"},
            {"key":"+10 (east)", "value":"10"},
            {"key":"+12 (east)", "value":"12"}
    ];
    $scope.ifJetLagFilled = false;
    
    $scope.jetLag = {};
    var ipObj1 = {
        callback: function(val) {
            var d = new Date(val);
            var formatdate = (d.getMonth() + 1) + '/' + d.getDate() + '/' + d.getFullYear();
            $scope.jetLag.travel_date = formatdate;

        },
        disabledDates: [ //Optional
            // new Date(2016, 2, 16),
            new Date(2015, 3, 16),
            new Date(2015, 4, 16),
            new Date(2015, 5, 16),
            new Date('Wednesday, August 12, 2015'),
            new Date("08-16-2016"),
            new Date(1439676000000)
        ],
        from: new Date(), //Optional
        inputDate: new Date(), //Optional
        mondayFirst: true, //Optional
        disableWeekdays: [0], //Optional
        closeOnSelect: false, //Optional
        // templateType: 'popup'    //Optional
    };

    $scope.openDatePicker = function() {
        ionicDatePicker.openDatePicker(ipObj1);
        //$scope.calculateJetLag();
    };
    
    $scope.$watch('jetLag.travel_date', function(newValue, oldValue){
        console.log('vals = ', newValue, oldValue);
        if(newValue != oldValue)
            $scope.calculateJetLag();
    });

    var inputJsonData = {};
    $scope.jetLag = {};
    $scope.jetLag.day = [];
    $scope.jetLag.date = [];
    $scope.jetLag.bedtime = [];
    $scope.jetLag.time = [];
    /*
     * jet lag calculator.
     * developer : Shilpa Sharma
     */
    $scope.calculateJetLag = function() {
        console.log("$scope.jetLag = ", $scope.jetLag);
        if ((typeof $scope.jetLag.time_difference !== "undefined") && (typeof $scope.jetLag.travel_date !== "undefined")) {
            var td = parseInt($scope.jetLag.time_difference);
            var glasses_time, wakeup, bedtime, time_difference;
            var travel_date = [];
            var timeCalculate = [];
            $scope.Math = window.Math;
            var userData = JSON.parse(window.localStorage['USER_DATA']);
            glasses_time = userData.wear_glasses_time;
            wakeup = userData.planned_wakeup;
            bedtime = userData.planned_bedtime;

            var timeDiffCalculate = {};
            var travelDateCal = {};
            travelDateCal.travel_date = $scope.jetLag.travel_date;
            var get_date = travelDateCal.travel_date;
            var d = new Date(get_date);
            var d1 = new Date(get_date);
            
            timeDiffCalculate.time_difference = $scope.jetLag.time_difference;
            timeCalculate = (timeDiffCalculate.time_difference) / 2;
            var newTimeCalculate = Math.abs(timeCalculate);
            $scope.jetLagData = [];
            for(var z=0;z<newTimeCalculate;z++){
                $scope.jetLagData.push({'id':z});
            }

            var jetLagParams = {};
                jetLagParams.glasses_time       = glasses_time;
                jetLagParams.wakeup             = wakeup;
                jetLagParams.bedtime            = bedtime;
                jetLagParams.newTimeCalculate   = newTimeCalculate;
                jetLagParams.d                  = d;
                jetLagParams.d1                 = d1;
                jetLagParams.hoursUpdated       = "null";
                jetLagParams.updatedGlasses     = "null";
                
            /*
             *  if (td > 0) // travelling ahead.
             *  if (td < 0) // travelling behind.
            */
            $scope.jetLag.day       = [];
            $scope.jetLag.date      = [];
            $scope.jetLag.bedtime   = [];
            $scope.jetLag.time      = [];
            if (td > 0) { // travelling ahead
                getTravelAheadJetLag($scope.jetLag, jetLagParams);
            } else { // travelling behind
                getTravelBehindJetLag($scope.jetLag, jetLagParams);
            }
            $scope.ifJetLagFilled = true;
        } else {
            for (var i = 0; i < 6; i++) {
                $scope.jetLag.day[i] = "";
                $scope.jetLag.date[i] = "";
                $scope.jetLag.bedtime[i] = "";
                $scope.jetLag.time[i] = "";
            }
            $scope.ifJetLagFilled = false;
        }
    }

    /*
     * get the jet lag calculator controller .
     * developer : Shilpa Sharma
     */
    $scope.show = true;
    $scope.completeShow = false;
    $scope.formDisable = false;
    $scope.jetLagId = '';
    $scope.completeDisable = true;

    $scope.instructionNotes = INSTRUCTION_NOTE;
    // console.log("**********", userData._id);
    $scope.getJetLagData = function() {
        var inputJson = {};
        inputJson.user_id = userData._id;
        inputJson.is_completed = false;
        $ionicLoading.show();
        jetLagService.getJetLagData(inputJson).success(function(response) {
            $ionicLoading.hide();
            if (response.messageId == 200) {
                if (response.data.length != 0) {
                    $scope.jetLagId = response.data[0]._id;
                    //console.log(JSON.stringify(response.data[0]));
                    for (var i = 0; i < response.data[0].jet_lags.length; i++) {
                        $scope.jetLag.travel_date = response.data[0].travel_date;
                        $scope.jetLag.time_difference = response.data[0].time_difference;
                        $scope.jetLag.day[i] = response.data[0].jet_lags[i].day;
                        $scope.jetLag.date[i] = response.data[0].jet_lags[i].start_date;
                        $scope.jetLag.time[i] = response.data[0].jet_lags[i].glasses_time;
                        $scope.jetLag.bedtime[i] = response.data[0].jet_lags[i].bedtime;
                        $scope.show = false;
                        $scope.completeShow = true;
                        $scope.formDisable = true;
                    }
                    var travelDate = new Date(response.data[0].travel_date);
                    travelDate.setHours(0,0,0,0);
                    var current_date = new Date();
                    current_date.setHours(0,0,0,0);
                    if(travelDate.valueOf() == current_date.valueOf()){
                        $scope.completeDisable = false;
                    }
                    $scope.instructionNotes = COMPLETE_BUTTON_MSG;
                }
            } else {
                var alertPopup = $ionicPopup.alert({
                    title: 'Warning!',
                    template: CHECK_IN_ERROR,
                });
                alertPopup.then(function(res) {});
            }
        });
    }
        
    /*
     * save the jet lag calculator controller.
     * developer : RaJesh Thakur
     */
    inputJsonData.jetLag = {};
    inputJsonData.jet_lags = [];
    $scope.is_save = true;
    $scope.is_completed = false;
    $scope.completeShow = false;
    $scope.saveJetLagData = function() {
            inputJsonData.user_id = userData._id;
            inputJsonData.travel_date = $scope.jetLag.travel_date;
            inputJsonData.time_difference = $scope.jetLag.time_difference;
            inputJsonData.is_save = $scope.is_save;
            for (var i = 0; i < $scope.jetLag.day.length; i++) {
                var inputJson = {};
                inputJson.day = $scope.jetLag.day[i];
                inputJson.start_date = $scope.jetLag.date[i];
                inputJson.glasses_time = $scope.jetLag.time[i];
                inputJson.bedtime = $scope.jetLag.bedtime[i];
                inputJsonData.jet_lags.push(inputJson);
            }
            var confirmPopup = $ionicPopup.confirm({
                title: 'Confirm',
                template: JET_LAG_CONFIRM,
            });
            confirmPopup.then(function(res) {
                if (res) {
                    $ionicLoading.show();
                    jetLagService.saveJetLagData(inputJsonData).success(function(response) {
                        $ionicLoading.hide();
                        if (response.messageId == 200) {
                            var alertPopup = $ionicPopup.alert({
                                title: 'Success!',
                                template: JET_LAG_SUCCESS,
                            });
                            alertPopup.then(function(res) {
                                $scope.alreadySubmiited = JET_LAG_MESSAGE;
                                $state.reload("app.tabs.jetLag");
                            });
                        } else {
                            var alertPopup = $ionicPopup.alert({
                                title: 'Warning!',
                                template: CHECK_IN_ERROR,
                            });
                            alertPopup.then(function(res) {});
                        }

                    });
                } else {
                    console.log("res-->>", res);
                }
            });
        }

    /*
     * update the jet lag calculator controller .
     * developer : RaJesh Thakur
     */
    var updateJson = {};
    $scope.updateJetLagData = function() {
        var confirmPopup = $ionicPopup.confirm({
            title: 'Confirm',
            template: JET_LAG_COMPLETE,
        });
        confirmPopup.then(function(res) {
            if (res) {
                updateJson.user_id = userData._id;
                updateJson._id = $scope.jetLagId;
                updateJson.is_completed = true;
                updateJson.is_save = false;
                $ionicLoading.show();
                jetLagService.updateJetLagData(updateJson).success(function(response) {
                    $ionicLoading.hide();
                    if (response.messageId == 200) {
                        var alertPopup = $ionicPopup.alert({
                            title: 'Success!',
                            template: JET_LAG_COMPLETE_SUCCESS,
                        });
                        alertPopup.then(function(res) {
                            $scope.alreadySubmiited = JET_LAG_MESSAGE;
                            $state.reload("app.tabs.jetLag");
                        });
                    } else {
                        var alertPopup = $ionicPopup.alert({
                            title: 'Warning!',
                            template: CHECK_IN_ERROR,
                        });
                        alertPopup.then(function(res) {});
                    }
                });
            } else {
                console.log("res-->>", res);
            }
        });
    }

    /*
     * Reset jet lag calculator controller .
     * developer : Shilpa Sharma
     */
    $scope.resetJetLagData = function() {
        $state.reload('app.tabs.jetLag');
    }
    
    function getTravelAheadJetLag(jetLag, jetLagParams){
        glasses_time        = jetLagParams.glasses_time;
        wakeup              = jetLagParams.wakeup;
        bedtime             = jetLagParams.bedtime;
        newTimeCalculate    = jetLagParams.newTimeCalculate;
        d                   = jetLagParams.d;
        d1                  = jetLagParams.d1;
        hoursUpdated        = jetLagParams.hoursUpdated;
        updatedGlasses      = jetLagParams.updatedGlasses;
                
        var timeStr = ''; var timeStr2 = '';
        var glassesStr = '';
        glassesStr = glasses_time;
        timeStr = bedtime;
        timeStr2 = timeStr;
        glassesStr2 = glassesStr;

        /*Get Twenty hours format starts here*/
        var gethours = Number(timeStr2.match(/^(\d\d?)/)[1]);
        // var getminutes = Number(timeStr2.match(/:(\d\d?)/)[1]);
        var getAMPM = timeStr2.match(/\s(.AM|am|PM|pm)$/i)[1];

        if (getAMPM == 'PM' || getAMPM == 'pm' && gethours < 12) {
            gethours = gethours + 12;
        } else if (getAMPM == 'AM' || getAMPM == "am" && gethours == 12) {
            gethours = gethours - 12;
        }

        var sHours = gethours.toString();
        if (gethours < 10) {
            sHours = "0" + sHours;
        }
        var t24hoursFormat = sHours;
        var gethours1 = Number(glassesStr2.match(/^(\d\d?)/)[1]);
        // var getminutes = Number(timeStr2.match(/:(\d\d?)/)[1]);
        var getAMPM1 = glassesStr2.match(/\s(.AM|am|PM|pm)$/i)[1];

        if (getAMPM1 == 'PM' || getAMPM1 == 'pm' && gethours1 < 12) {
            gethours1 = gethours1 + 12;
        } else if (getAMPM1 == 'AM' || getAMPM1 == "am" && gethours1 == 12) {
            gethours1 = gethours1 - 12;
        }
        var sHours1 = gethours1.toString();
        // var sMinutes = getmint24hoursFormatutes.toString();

        if (gethours1 < 10) {
            sHours1 = "0" + sHours1;
        }
        var t24hoursFormat1 = sHours1;
        /* Get Twenty hours format ends here */
        console.log("bed time", timeStr);
        for (var i = 0; i < newTimeCalculate; i++) {
            $scope.jetLag.day[i] = i + 1;
            if(i==0){
                d1.setDate(d.getDate());
            }else{
                d1.setDate(d1.getDate() - 1);
            }
        
            //var d2 = new Date(d.getTime() - 86400);
            var dd = d1.getDate();
            var mm = d1.getMonth() + 1;
            var y = d1.getFullYear();
            var someFormattedDate = (mm + '/' + dd + '/' + y);
            $scope.jetLag.date[i] = someFormattedDate;
            
            ///////set the bed time////////////////////////
            if (hoursUpdated == "null") { // if bedtime
                var parts = timeStr.split(':');
                var hours = parseInt(parts[0]);
                hours -= 2;
                t24hoursFormat -= 2;
            
                if (hours <= 0) {
                    hours += 12;
                    // t24hoursFormat += 12;
                    if (parts[1].match(/(AM|am)/)) {
                        parts[1] = parts[1].replace('AM', 'PM').replace('am', 'pm');
                        // keep the case
                    } else {
                        if (hours < 12) {
                            parts[1] = parts[1].replace('PM', 'AM').replace('pm', 'am');
                        }
                    }
                }
                if (t24hoursFormat < 12 && t24hoursFormat > 0) {
                    parts[1] = parts[1].replace('PM', 'AM').replace('pm', 'am');
                }
                timeStr = hours + ':' + parts[1];
                hoursUpdated = hours;
            } else {
                hours -= 2;
                t24hoursFormat -= 2;
                if (hours <= 0) {
                    // easily flip it by adding 12
                    hours += 12;
                    console.log("hours in else part second", hours);
                    // swap am & pm
                    if (parts[1].match(/(AM|am)/)) {
                        parts[1] = parts[1].replace('AM', 'PM').replace('am', 'pm');
                    } else {
                        if (hours < 12) {
                            parts[1] = parts[1].replace('PM', 'AM').replace('pm', 'am');
                        }
                    }
                } else {
                    if (parts[1].match(/(AM|am)/)) {
                        if (hours < 12) {
                            parts[1] = parts[1].replace('PM', 'AM').replace('pm', 'am');
                        }
                    } else if (parts[1].match(/(AM|am)/) && hours <= 12 && timeStr2.match(/(AM|am)/)) {
                        parts[1] = parts[1].replace('AM', 'PM').replace('am', 'pm');

                    } else if (parts[1].match(/(PM|pm)/) && hours <= 12 && t24hoursFormat >= 1 && t24hoursFormat <= 12 && timeStr2.match(/(PM|pm)/)) {
                        // noon condition
                        parts[1] = parts[1].replace('PM', 'AM').replace('pm', 'am');
                    } else if (parts[1].match(/(PM|pm)/) && hours <= 12 && t24hoursFormat > 12 && timeStr2.match(/(PM|pm)/)) {
                        //night condition
                        parts[1] = parts[1].replace('PM', 'PM').replace('pm', 'pm');
                    } else if (parts[1].match(/(AM|am)/)) {
                        if (hours < 12) {
                            parts[1] = parts[1].replace('PM', 'AM').replace('pm', 'am');
                        }
                    }
                }
                timeStr = hours + ':' + parts[1];
                hoursUpdated = hours;
            } //else  bedtime
            //////////////glasses time////////////
            if (updatedGlasses == "null") { //if glasses time
                var parts1 = glassesStr.split(':');
                var hours1 = parseInt(parts1[0]);
                hours1 -= 2;
                t24hoursFormat1 -= 2;
                if (hours1 <= 0) {
                    hours1 += 12;
                    // swap am & pm
                    if (parts1[1].match(/(AM|am)/)) {
                        parts1[1] = parts1[1].replace('AM', 'PM').replace('am', 'pm');
                        // keep the case
                    } else {
                        if (hours < 12) {
                            parts[1] = parts[1].replace('PM', 'AM').replace('pm', 'am');
                        }
                    }
                }
                if (t24hoursFormat1 < 12 && t24hoursFormat1 > 0) {
                    parts1[1] = parts1[1].replace('PM', 'AM').replace('pm', 'am');
                }
                glassesStr = hours1 + ':' + parts1[1];
                updatedGlasses = hours1;

            } else { //else glasses time
                hours1 -= 2;
                t24hoursFormat1 -= 2;
                if (hours1 <= 0) {
                    // easily flip it by adding 12
                    hours1 += 12;
                    // swap am & pm
                    if (parts1[1].match(/(AM|am)/)) {
                        parts1[1] = parts1[1].replace('AM', 'PM').replace('am', 'pm');

                    } else {
                        if (hours1 < 12) {
                            parts1[1] = parts1[1].replace('PM', 'AM').replace('pm', 'am');
                        }
                    }
                } else {
                    if (parts1[1].match(/(AM|am)/)) {
                        if (hours1 < 12) {
                            parts1[1] = parts1[1].replace('PM', 'AM').replace('pm', 'am');
                        }
                    } else if (parts1[1].match(/(AM|am)/) && hours1 <= 12 && glassesStr2.match(/(AM|am)/)) {
                        parts1[1] = parts1[1].replace('AM', 'PM').replace('am', 'pm');
                    } else if (parts1[1].match(/(PM|pm)/) && hours1 <= 12 && t24hoursFormat1 >= 1 && t24hoursFormat1 <= 12 && glassesStr2.match(/(PM|pm)/)) {
                        // noon condition
                        parts1[1] = parts1[1].replace('PM', 'AM').replace('pm', 'am');
                    } else if (parts1[1].match(/(PM|pm)/) && hours1 <= 12 && t24hoursFormat1 > 12 && glassesStr2.match(/(PM|pm)/)) {
                        //night condition
                        parts1[1] = parts1[1].replace('PM', 'PM').replace('pm', 'pm');
                    } else if (parts1[1].match(/(AM|am)/)) {
                        if (hours1 < 12) {
                            parts1[1] = parts1[1].replace('PM', 'AM').replace('pm', 'am');
                        }
                    }
                }
                glassesStr = hours1 + ':' + parts1[1];
                updatedGlasses = hours1;
            }
            $scope.jetLag.bedtime[i] = timeStr;
            $scope.jetLag.time[i] = glassesStr;
        } //for
    }
    
    function getTravelBehindJetLag(jetLag, jetLagParams){
        glasses_time        = jetLagParams.glasses_time;
        wakeup              = jetLagParams.wakeup;
        bedtime             = jetLagParams.bedtime;
        newTimeCalculate    = jetLagParams.newTimeCalculate;
        d                   = jetLagParams.d;
        d1                  = jetLagParams.d1;
        hoursUpdated        = jetLagParams.hoursUpdated;
        updatedGlasses      = jetLagParams.updatedGlasses;
        
        var timeStr = ''; var timeStr2 = ''; var glassesStr = '';
        glassesStr = glasses_time;
        timeStr = bedtime;
        timeStr2 = timeStr;
        glassesStr2 = glassesStr;

        /*Get Twenty hours format starts here*/
        var gethours = Number(timeStr2.match(/^(\d\d?)/)[1]);
    //console.log('gethours = ', gethours);
        // var getminutes = Number(timeStr2.match(/:(\d\d?)/)[1]);
        var getAMPM = timeStr2.match(/\s(.AM|am|PM|pm)$/i)[1];
    //console.log('getAMPM = ', getAMPM);
        if (getAMPM == 'PM' || getAMPM == 'pm' && gethours < 12) {
            gethours = gethours + 12;
        } else if (getAMPM == 'AM' || getAMPM == "am" && gethours == 12) {
            gethours = gethours - 12;
        }
    //console.log('gethours new = ', gethours);
        var sHours = gethours.toString();
        // var sMinutes = getminutes.toString();
        if (gethours < 10) {
            sHours = "0" + sHours;
        }
        var t24hoursFormat = parseInt(sHours);
    //console.log('sHours = ', sHours);
    //console.log('t24hoursFormat = ', t24hoursFormat);
        var gethours1 = Number(glassesStr2.match(/^(\d\d?)/)[1]);
        // var getminutes = Number(timeStr2.match(/:(\d\d?)/)[1]);
        var getAMPM1 = glassesStr2.match(/\s(.AM|am|PM|pm)$/i)[1];

        if (getAMPM1 == 'PM' || getAMPM1 == 'pm' && gethours1 < 12) {
            gethours1 = gethours1 + 12;
        } else if (getAMPM1 == 'AM' || getAMPM1 == "am" && gethours1 == 12) {
            gethours1 = gethours1 - 12;
        }
        var sHours1 = gethours1.toString();
        // var sMinutes = getmint24hoursFormatutes.toString();

        if (gethours1 < 10) {
            sHours1 = "0" + sHours1;
        }
        var t24hoursFormat1 = sHours1;
        /* Get Twenty hours format ends here */
        console.log("bed time====", timeStr);
        for (var i = 0; i < newTimeCalculate; i++) {
            $scope.jetLag.day[i] = i + 1;
            if(i==0){
                d1.setDate(d.getDate());
            }else{
                d1.setDate(d1.getDate() - 1);
            }
            
            var dd = d1.getDate();
            var mm = d1.getMonth() + 1;
            var y = d1.getFullYear();
            var someFormattedDate = (mm + '/' + dd + '/' + y);
            $scope.jetLag.date[i] = someFormattedDate;
            
            ///////set the bed time////////////////////////
        //console.log('hoursUpdated = ', hoursUpdated);
            if (hoursUpdated == "null") { // if bedtime
            //console.log('timeStr = ', timeStr);
                var parts = timeStr.split(':');
                var hours = parseInt(parts[0]);
                hours += 2;
                t24hoursFormat += 2;
            //console.log('-------hours ', hours, t24hoursFormat); // 13, 25
                if (hours >= 12) {
                    hours -= 12;
                    
                    if (parts[1].match(/(AM|am)/)) {
                        parts[1] = parts[1].replace('AM', 'PM').replace('am', 'pm');
                    } else {
                        //if (hours < 12) {
                            parts[1] = parts[1].replace('PM', 'AM').replace('pm', 'am');
                        //}
                    }
                }
                //if (t24hoursFormat < 12 && t24hoursFormat > 0) {
                //    parts[1] = parts[1].replace('PM', 'AM').replace('pm', 'am');
                //}
                timeStr = hours + ':' + parts[1];
                hoursUpdated = hours;
            } else {
                hours += 2;
                t24hoursFormat += 2;
                if (hours >= 12) {
                    hours -= 12;
                    // swap am & pm
                    if (parts[1].match(/(AM|am)/)) {
                        parts[1] = parts[1].replace('AM', 'PM').replace('am', 'pm');
                    } else {
                        //if (hours < 12) {
                            parts[1] = parts[1].replace('PM', 'AM').replace('pm', 'am');
                        //}
                    }
                } else {
                    if (parts[1].match(/(AM|am)/)) {
                        if (hours < 12) {
                            parts[1] = parts[1].replace('PM', 'AM').replace('pm', 'am');
                        }
                        // keep the case
                    } else if (parts[1].match(/(AM|am)/) && hours <= 12 && timeStr2.match(/(AM|am)/)) {
                        parts[1] = parts[1].replace('AM', 'PM').replace('am', 'pm');

                    } else if (parts[1].match(/(PM|pm)/) && hours <= 12 && t24hoursFormat >= 1 && t24hoursFormat <= 12 && timeStr2.match(/(PM|pm)/)) {
                        // noon condition
                        parts[1] = parts[1].replace('PM', 'AM').replace('pm', 'am');
                    } else if (parts[1].match(/(PM|pm)/) && hours <= 12 && t24hoursFormat > 12 && timeStr2.match(/(PM|pm)/)) {
                        //night condition
                        parts[1] = parts[1].replace('PM', 'PM').replace('pm', 'pm');
                    } else if (parts[1].match(/(AM|am)/)) {
                        if (hours < 12) {
                            parts[1] = parts[1].replace('PM', 'AM').replace('pm', 'am');
                        }
                    }
                }
                timeStr = hours + ':' + parts[1];
                hoursUpdated = hours;
            } //else  bedtime
            
            //////////////glasses time////////////
            if (updatedGlasses == "null") { //if glasses time
                var parts1 = glassesStr.split(':');
                var hours1 = parseInt(parts1[0]);
                hours1 += 2;
                t24hoursFormat1 += 2;
                if (hours1 >= 12) {
                    hours1 -= 12;
                    // swap am & pm
                    if (parts1[1].match(/(AM|am)/)) {
                        parts1[1] = parts1[1].replace('AM', 'PM').replace('am', 'pm');
                        // keep the case
                    } else {
                        //if (hours < 12) {
                            parts[1] = parts[1].replace('PM', 'AM').replace('pm', 'am');
                        //}
                    }
                }
                //if (t24hoursFormat1 < 12 && t24hoursFormat1 > 0) {
                //    parts1[1] = parts1[1].replace('PM', 'AM').replace('pm', 'am');
                //}
                glassesStr = hours1 + ':' + parts1[1];
                updatedGlasses = hours1;

            } else { //else glasses time
                hours1 += 2;
                t24hoursFormat1 += 2;
                if (hours1 >= 12) {
                    hours1 -= 12;
                    // swap am & pm
                    if (parts1[1].match(/(AM|am)/)) {
                        parts1[1] = parts1[1].replace('AM', 'PM').replace('am', 'pm');
                    } else {
                        //if (hours1 < 12) {
                            parts1[1] = parts1[1].replace('PM', 'AM').replace('pm', 'am');
                        //}
                    }
                } else {
                    if (parts1[1].match(/(AM|am)/)) {
                        if (hours1 < 12) {
                            parts1[1] = parts1[1].replace('PM', 'AM').replace('pm', 'am');
                        }
                    } else if (parts1[1].match(/(AM|am)/) && hours1 <= 12 && glassesStr2.match(/(AM|am)/)) {
                        parts1[1] = parts1[1].replace('AM', 'PM').replace('am', 'pm');
                    } else if (parts1[1].match(/(PM|pm)/) && hours1 <= 12 && t24hoursFormat1 >= 1 && t24hoursFormat1 <= 12 && glassesStr2.match(/(PM|pm)/)) {
                        // noon condition
                        parts1[1] = parts1[1].replace('PM', 'AM').replace('pm', 'am');
                    } else if (parts1[1].match(/(PM|pm)/) && hours1 <= 12 && t24hoursFormat1 > 12 && glassesStr2.match(/(PM|pm)/)) {
                        //night condition
                        parts1[1] = parts1[1].replace('PM', 'PM').replace('pm', 'pm');
                    } else if (parts1[1].match(/(AM|am)/)) {
                        if (hours1 < 12) {
                            parts1[1] = parts1[1].replace('PM', 'AM').replace('pm', 'am');
                        }
                    }
                }
                glassesStr = hours1 + ':' + parts1[1];
                updatedGlasses = hours1;
            }
            $scope.jetLag.bedtime[i] = timeStr;
            $scope.jetLag.time[i] = glassesStr;
        } //for
    }
})
