angular.module('sleepapp_patient.controllers', [])

.controller('welcomeCtrl', function($scope, $state) {

    // LOCK SCREEN ORIENTATION IN PORTRAIT MODE FOR CAROUSEL SCREENS.
    document.addEventListener("deviceready", onDeviceReady, false);

    function onDeviceReady() {
        screen.lockOrientation('portrait');
    }
    // Called to navigate to the main app
    $scope.startApp = function() {
        $state.go('signup');
    };
})

.controller('SignUpController', function($scope, $state, ionicMaterialInk, $timeout, $ionicLoading, $ionicPopup, UserService, ionicTimePicker) {
    // UNLOCK SCREEN ORIENTATION
    document.addEventListener("deviceready", onDeviceReady, false);

    function onDeviceReady() {
        screen.unlockOrientation();
    }

    ionicMaterialInk.displayEffect();
    window.localStorage['ACCESS_TOKEN'] = "";
    window.localStorage['USER_DATA'] = "";

    var animation = 'bounceInDown';
    $scope.type = 'Male';
    $scope.setType = function(event) {
        $scope.type = angular.element(event.target).text();
        console.log($scope.type);
    };

    $scope.patient = {};
    $scope.rating = {};
    $scope.rating.max = 5;
    $scope.reminderTime = "09:00 PM";

    /*
     * signUp function to add new User.
     * developer : GpSingh
     */
    $scope.signUp = function(userData) {
        $ionicLoading.show({
            content: 'Loading',
            animation: 'fade-in',
            showBackdrop: true,
            maxWidth: 200,
            showDelay: 0
        });
        //console.log("userData = ", userData);

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
                                window.localStorage['ACCESS_TOKEN'] = data.access_token;
                                window.localStorage['USER_DATA'] = JSON.stringify(data.data);
                                window.localStorage['USER_DATA'].password = inputString.originalPassword;
                                var userData = JSON.parse(window.localStorage['USER_DATA']);
                                var inputdata = {};
                                inputdata.id = userData._id;
                                inputdata.device_id = window.localStorage["device_id"];
                                inputdata.platform_type = window.localStorage['PLATFORM'];
                                UserService.saveDeviceId(inputdata).success(function(data, status) {
                                    console.log(data);
                                    $state.go("tabs.checkIn");
                                    //console.log(userData.user_type);
                                    //console.log(window.localStorage["NOTIFICATION_SETTING"]);
                                });
                            } else {
                                showConfirm(animation);
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
                        showConfirm(animation);
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
                        showConfirm(animation);
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
                showConfirm(animation);
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

.controller('SignInController', function($scope, $timeout, $ionicHistory, ionicMaterialInk, $ionicPopup, $ionicLoading, $state, UserService) {
    ionicMaterialInk.displayEffect();
    window.localStorage['ACCESS_TOKEN'] = "";
    window.localStorage['USER_DATA'] = "";
    $scope.user = {};
    var animation = 'bounceInDown';

    /**
     * function to sign in user
     **/
    $scope.signIn = function(user) {
        $ionicLoading.show({
            content: 'Loading',
            animation: 'fade-in',
            showBackdrop: true,
            maxWidth: 200,
            showDelay: 0
        });
        UserService.logInUser(user).success(function(data) {
            console.log("logInUser response = ", data);
            $ionicLoading.hide();
            if (data.status == "success") {
                // Check User Status Active or Inactive
                if (data.data.user.is_status == true) {
                    window.localStorage['ACCESS_TOKEN'] = data.access_token;
                    window.localStorage['USER_DATA'] = JSON.stringify(data.data.user);
                    var userData = JSON.parse(window.localStorage['USER_DATA']);
                    var inputdata = {};
                    inputdata.id = userData._id;
                    $ionicLoading.show({
                        content: 'Loading',
                        animation: 'fade-in',
                        showBackdrop: true,
                        maxWidth: 200,
                        showDelay: 0
                    });
                    inputdata.device_id = window.localStorage["device_id"];
                    inputdata.platform_type = window.localStorage['PLATFORM'];
                    UserService.saveDeviceId(inputdata).success(function(data, status) {
                        $ionicLoading.hide();
                        if (data.status == "success") {
                            if (userData.user_type == 4) {
                                var userId = userData._id;
                                $ionicLoading.show({
                                    content: 'Loading',
                                    animation: 'fade-in',
                                    showBackdrop: true,
                                    maxWidth: 200,
                                    showDelay: 0
                                });

                            } else {
                                console.log(window.localStorage["NOTIFICATION_SETTING"]);
                                if (window.localStorage["NOTIFICATION_SETTING"] == undefined) {
                                    $state.go("settings");
                                } else {
                                    $state.go("tabs.checkIn");
                                }
                            }
                        }
                    });
                } else {
                    showConfirm(animation);
                    var alertPopup = $ionicPopup.alert({
                        title: 'Error!',
                        template: LOGIN_STATUS_ERROR,
                    });
                    alertPopup.then(function(res) {
                        $state.go("signin");
                    });
                }
            } else {
                showConfirm(animation);
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
                showConfirm(animation);
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
        // animate pop up dailog
    function showConfirm(animation) {
        $timeout(function() {
            var popupElements = document.getElementsByClassName("popup-container")
            if (popupElements.length) {
                var popupElement = angular.element(popupElements[0]);
                popupElement.addClass('animated')
                popupElement.addClass(animation)
            };
        }, 1)
    }
})

.controller('ForgotPasswordController', function($scope, ionicMaterialInk, $state, UserService, $ionicHistory) {
    ionicMaterialInk.displayEffect();

    $scope.forgotPassword = function(user) {
        console.log(user);
        $state.go("signin");
    }

    $scope.goBackToSignIn = function() {
        $ionicHistory.goBack();
    }
})

.controller('settingsCtrl', function($scope, $state, $cordovaToast, $ionicHistory, $stateParams, $cordovaLocalNotification, ionicTimePicker) {
    if (window.localStorage["NOTIFICATION_SETTING"] == undefined) {
        $scope.hideBackButton = true;
    } else {
        $scope.hideBackButton = false;
    }
    var currentDate = new Date();
    var weekday = new Array(7);
    weekday[0] = "Sunday";
    weekday[1] = "Monday";
    weekday[2] = "Tuesday";
    weekday[3] = "Wednesday";
    weekday[4] = "Thursday";
    weekday[5] = "Friday";
    weekday[6] = "Saturday";
    var n;
    $scope.dayOfWeek = [{
        "id": 0,
        "day": "Sunday"
    }, {
        "id": 1,
        "day": "Monday"
    }, {
        "id": 2,
        "day": "Tuesday"
    }, {
        "id": 3,
        "day": "Wednesday"
    }, {
        "id": 4,
        "day": "Thursday"
    }, {
        "id": 5,
        "day": "Friday"
    }, {
        "id": 6,
        "day": "Saturday"
    }];
    if (window.localStorage['CUSTOM_REMINDER'] == undefined) {
        // setting Notification for daily reminder for default time 9 PM
        $scope.reminderTime = "9:00 PM";
        var today = new Date();
        today.setHours(21);
        today.setMinutes(0);
        today.setSeconds(0);
        $scope.today_at_9_pm = today;
        window.localStorage['REMINDER_TIME'] = $scope.reminderTime;
        window.localStorage['DAILY_REMINDER_TIME'] = $scope.today_at_9_pm;
        // set default reminder value for weekly goals on Sunday 12:00 PM.
        n = weekday[currentDate.getDay()];
        $scope.selectedDay = $scope.dayOfWeek[0];
        $scope.dataDay = $scope.selectedDay.day;
        $scope.weeklyReminderDayTime = "Sunday, 12:00 PM";
        $scope.selectedTime = "12:00 PM";
        if (n == $scope.selectedDay.day) {
            console.log("If day is Sunday.");
            currentDate.setHours(12);
            currentDate.setMinutes(0);
            currentDate.setSeconds(0);
            $scope.dateTimeForWeeklyReminder = currentDate;
        } else {
            console.log("If day is not Sunday.");
            if (n == "Monday") {
                currentDate.setDate(currentDate.getDate() + 6);
            } else if (n == "Tuesday") {
                currentDate.setDate(currentDate.getDate() + 5);
            } else if (n == "Wednesday") {
                currentDate.setDate(currentDate.getDate() + 4);
            } else if (n == "Thursday") {
                currentDate.setDate(currentDate.getDate() + 3);
            } else if (n == "Friday") {
                currentDate.setDate(currentDate.getDate() + 2);
            } else if (n == "Saturday") {
                currentDate.setDate(currentDate.getDate() + 1);
            }
            currentDate.setHours(12);
            currentDate.setMinutes(0);
            currentDate.setSeconds(0);
            $scope.dateTimeForWeeklyReminder = currentDate;
        }
        console.log(currentDate);
        var hours = currentDate.getHours();
        var minutes = currentDate.getMinutes();
        var setreminderTime = hours
        var ampm = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12;
        hours = hours ? hours : 12; // the hour '0' should be '12'
        minutes = minutes < 10 ? '0' + minutes : minutes;

        var timeString = hours + ":" + minutes + " " + ampm;
        $scope.selectedtimeString = timeString;
        $scope.weeklyReminderDayTime = $scope.dataDay + ", " + $scope.selectedtimeString;
        $scope.selectedTime = $scope.selectedtimeString;
        window.localStorage['WEEKLY_REMINDER_TIME'] = $scope.weeklyReminderDayTime;
        window.localStorage['TIME_FOR_WEEKLY_REMINDER'] = $scope.selectedTime;
        window.localStorage['WEEKLY_REMINDER_TIME_SAVE'] = $scope.dateTimeForWeeklyReminder;
    } else {
        $scope.today_at_9_pm = window.localStorage['DAILY_REMINDER_TIME'];
        $scope.dateTimeForWeeklyReminder = window.localStorage['WEEKLY_REMINDER_TIME_SAVE'];
        console.log(window.localStorage['TIME_FOR_WEEKLY_REMINDER']);
        console.log(window.localStorage['WEEKLY_REMINDER_TIME']);
        $scope.reminderTime = window.localStorage['REMINDER_TIME'];
        if (window.localStorage['WEEKLY_REMINDER_TIME']) {
            var day = window.localStorage['WEEKLY_REMINDER_TIME'];
            var dayToSet = day.split(',');
            var newDay = dayToSet[0];
            if (newDay == "Sunday") {
                $scope.selectedDay = $scope.dayOfWeek[0];
            } else if (newDay == "Monday") {
                $scope.selectedDay = $scope.dayOfWeek[1];
            } else if (newDay == "Tuesday") {
                $scope.selectedDay = $scope.dayOfWeek[2];
            } else if (newDay == "Wednesday") {
                $scope.selectedDay = $scope.dayOfWeek[3];
            } else if (newDay == "Thursday") {
                $scope.selectedDay = $scope.dayOfWeek[4];
            } else if (newDay == "Friday") {
                $scope.selectedDay = $scope.dayOfWeek[5];
            } else if (newDay == "Saturday") {
                $scope.selectedDay = $scope.dayOfWeek[6];
            }
        }
        $scope.weeklyReminderDayTime = window.localStorage['WEEKLY_REMINDER_TIME'];
        $scope.selectedTime = window.localStorage['TIME_FOR_WEEKLY_REMINDER'];
    }

    $scope.editDailyReminder = function() {
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
                    $scope.today_at_9_pm = d;
                    window.localStorage['DAILY_REMINDER_TIME'] = $scope.today_at_9_pm;
                    var hours = d.getHours();
                    var minutes = d.getMinutes();
                    var setreminderTime = hours
                    var ampm = hours >= 12 ? 'PM' : 'AM';
                    hours = hours % 12;
                    hours = hours ? hours : 12; // the hour '0' should be '12'
                    minutes = minutes < 10 ? '0' + minutes : minutes;
                    var timeString = hours + ":" + minutes + " " + ampm;
                    $scope.reminderTime = timeString;
                    window.localStorage['REMINDER_TIME'] = timeString;
                }
            },
            inputTime: 50400, //Optional
            format: 12, //Optional
            step: 1, //Optional
            setLabel: 'Set' //Optional
        };

        ionicTimePicker.openTimePicker(ipObj1);
    }

    // Weekly goals Settings

    $scope.selectedDayValue = function(data) {
        $scope.dataDay = data.day;
        if ($scope.selectedtimeString == undefined) {
            $scope.weeklyReminderDayTime = data.day + ", 12:00 PM";
        } else {
            $scope.weeklyReminderDayTime = data.day + ", " + $scope.selectedtimeString;
            $scope.selectedTime = $scope.selectedtimeString;
        }
        if (n == data.day) {
            console.log("If Current day, repeat alarm on same day from next week");
            var d = new Date();
            console.log($scope.TimeSelected);
            if ($scope.TimeSelected == false) {
                d.setDate(d.getDate() + 7);
                d.setHours(12);
                d.setMinutes(0);
                d.setSeconds(0);
            } else {
                d.setHours($scope.alreadySelectedTime.getHours());
                d.setMinutes($scope.alreadySelectedTime.getMinutes());
                d.setSeconds(0);
            }
            console.log(d);
            $scope.dateTimeForWeeklyReminder = d;
            var hours = d.getHours();
            var minutes = d.getMinutes();
            var setreminderTime = hours
            var ampm = hours >= 12 ? 'PM' : 'AM';
            hours = hours % 12;
            hours = hours ? hours : 12; // the hour '0' should be '12'
            minutes = minutes < 10 ? '0' + minutes : minutes;

            var timeString = hours + ":" + minutes + " " + ampm;
            $scope.selectedtimeString = timeString;
            $scope.weeklyReminderDayTime = $scope.dataDay + ", " + $scope.selectedtimeString;
            $scope.selectedTime = $scope.selectedtimeString;
            window.localStorage['WEEKLY_REMINDER_TIME_SAVE'] = $scope.dateTimeForWeeklyReminder;
            window.localStorage['WEEKLY_REMINDER_TIME'] = $scope.weeklyReminderDayTime;
            window.localStorage['TIME_FOR_WEEKLY_REMINDER'] = $scope.selectedTime;
        } else {
            var newDate = new Date();
            if ($scope.TimeSelected == false) {
                newDate.setHours(12);
                newDate.setMinutes(0);
                newDate.setSeconds(0);
                n = weekday[newDate.getDay()];
                matchDay(newDate, n);
            } else {
                console.log($scope.alreadySelectedTime);
                newDate.setHours($scope.alreadySelectedTime.getHours());
                newDate.setMinutes($scope.alreadySelectedTime.getMinutes());
                newDate.setSeconds(0);
                n = weekday[newDate.getDay()];
                console.log(n);
                matchDay(newDate, n);
            }
        }
    }
    $scope.TimeSelected = false;

    function matchDay(newDate, n) {
        if (n == "Monday" && $scope.dataDay == "Tuesday") {
            newDate.setDate(newDate.getDate() + 1);
        } else if (n == "Monday" && $scope.dataDay == "Wednesday") {
            newDate.setDate(newDate.getDate() + 2);
        } else if (n == "Monday" && $scope.dataDay == "Thursday") {
            newDate.setDate(newDate.getDate() + 3);
        } else if (n == "Monday" && $scope.dataDay == "Friday") {
            newDate.setDate(newDate.getDate() + 4);
        } else if (n == "Monday" && $scope.dataDay == "Saturday") {
            newDate.setDate(newDate.getDate() + 5);
        } else if (n == "Monday" && $scope.dataDay == "Sunday") {
            newDate.setDate(newDate.getDate() + 6);
        } else if (n == "Tuesday" && $scope.dataDay == "Wednesday") {
            newDate.setDate(newDate.getDate() + 1);
        } else if (n == "Tuesday" && $scope.dataDay == "Thursday") {
            newDate.setDate(newDate.getDate() + 2);
        } else if (n == "Tuesday" && $scope.dataDay == "Friday") {
            newDate.setDate(newDate.getDate() + 3);
        } else if (n == "Tuesday" && $scope.dataDay == "Saturday") {
            newDate.setDate(newDate.getDate() + 4);
        } else if (n == "Tuesday" && $scope.dataDay == "Sunday") {
            newDate.setDate(newDate.getDate() + 5);
        } else if (n == "Tuesday" && $scope.dataDay == "Monday") {
            newDate.setDate(newDate.getDate() + 6);
        } else if (n == "Wednesday" && $scope.dataDay == "Thursday") {
            newDate.setDate(newDate.getDate() + 1);
        } else if (n == "Wednesday" && $scope.dataDay == "Friday") {
            newDate.setDate(newDate.getDate() + 2);
        } else if (n == "Wednesday" && $scope.dataDay == "Saturday") {
            newDate.setDate(newDate.getDate() + 3);
        } else if (n == "Wednesday" && $scope.dataDay == "Sunday") {
            newDate.setDate(newDate.getDate() + 4);
        } else if (n == "Wednesday" && $scope.dataDay == "Monday") {
            newDate.setDate(newDate.getDate() + 5);
        } else if (n == "Wednesday" && $scope.dataDay == "Tuesday") {
            newDate.setDate(newDate.getDate() + 6);
        } else if (n == "Thursday" && $scope.dataDay == "Friday") {
            newDate.setDate(newDate.getDate() + 1);
        } else if (n == "Thursday" && $scope.dataDay == "Saturday") {
            newDate.setDate(newDate.getDate() + 2);
        } else if (n == "Thursday" && $scope.dataDay == "Sunday") {
            newDate.setDate(newDate.getDate() + 3);
        } else if (n == "Thursday" && $scope.dataDay == "Monday") {
            newDate.setDate(newDate.getDate() + 4);
        } else if (n == "Thursday" && $scope.dataDay == "Tuesday") {
            newDate.setDate(newDate.getDate() + 5);
        } else if (n == "Thursday" && $scope.dataDay == "Wednesday") {
            newDate.setDate(newDate.getDate() + 6);
        } else if (n == "Friday" && $scope.dataDay == "Saturday") {
            newDate.setDate(newDate.getDate() + 1);
        } else if (n == "Friday" && $scope.dataDay == "Sunday") {
            newDate.setDate(newDate.getDate() + 2);
        } else if (n == "Friday" && $scope.dataDay == "Monday") {
            newDate.setDate(newDate.getDate() + 3);
        } else if (n == "Friday" && $scope.dataDay == "Tuesday") {
            newDate.setDate(newDate.getDate() + 4);
        } else if (n == "Friday" && $scope.dataDay == "Wednesday") {
            newDate.setDate(newDate.getDate() + 5);
        } else if (n == "Friday" && $scope.dataDay == "Thursday") {
            newDate.setDate(newDate.getDate() + 6);
        } else if (n == "Saturday" && $scope.dataDay == "Sunday") {
            newDate.setDate(newDate.getDate() + 1);
        } else if (n == "Saturday" && $scope.dataDay == "Monday") {
            newDate.setDate(newDate.getDate() + 2);
        } else if (n == "Saturday" && $scope.dataDay == "Tuesday") {
            newDate.setDate(newDate.getDate() + 3);
        } else if (n == "Saturday" && $scope.dataDay == "Wednesday") {
            newDate.setDate(newDate.getDate() + 4);
        } else if (n == "Saturday" && $scope.dataDay == "Thursday") {
            newDate.setDate(newDate.getDate() + 5);
        } else if (n == "Saturday" && $scope.dataDay == "Friday") {
            newDate.setDate(newDate.getDate() + 6);
        } else if (n == "Sunday" && $scope.dataDay == "Monday") {
            newDate.setDate(newDate.getDate() + 1);
        } else if (n == "Sunday" && $scope.dataDay == "Tuesday") {
            newDate.setDate(newDate.getDate() + 2);
        } else if (n == "Sunday" && $scope.dataDay == "Wednesday") {
            newDate.setDate(newDate.getDate() + 3);
        } else if (n == "Sunday" && $scope.dataDay == "Thursday") {
            newDate.setDate(newDate.getDate() + 4);
        } else if (n == "Sunday" && $scope.dataDay == "Friday") {
            newDate.setDate(newDate.getDate() + 5);
        } else if (n == "Sunday" && $scope.dataDay == "Saturday") {
            newDate.setDate(newDate.getDate() + 6);
        }

        console.log(newDate);
        $scope.dateTimeForWeeklyReminder = newDate;
        console.log(newDate);
        var hours = newDate.getHours();
        var minutes = newDate.getMinutes();
        var setreminderTime = hours
        var ampm = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12;
        hours = hours ? hours : 12; // the hour '0' should be '12'
        minutes = minutes < 10 ? '0' + minutes : minutes;

        var timeString = hours + ":" + minutes + " " + ampm;
        $scope.selectedtimeString = timeString;
        $scope.weeklyReminderDayTime = $scope.dataDay + ", " + $scope.selectedtimeString;
        $scope.selectedTime = $scope.selectedtimeString;
        window.localStorage['WEEKLY_REMINDER_TIME_SAVE'] = $scope.dateTimeForWeeklyReminder;
        window.localStorage['WEEKLY_REMINDER_TIME'] = $scope.weeklyReminderDayTime;
        window.localStorage['WEEKLY_REMINDER_TIME_SAVE'] = $scope.dateTimeForWeeklyReminder;
    }
    $scope.editWeeklyReminderTime = function() {
        var ipObj1 = {
            callback: function(val) { //Mandatory
                if (typeof(val) === 'undefined') {
                    console.log('Time not selected');
                } else {
                    $scope.TimeSelected = true;
                    var selectedTime = new Date(val * 1000);
                    var d = new Date(selectedTime);
                    var d2 = new Date();
                    d.setMonth(d2.getMonth());
                    d.setDate(d2.getDate());
                    d.setFullYear(d2.getFullYear());
                    d.setHours(d.getUTCHours());
                    d.setMinutes(d.getUTCMinutes());
                    $scope.alreadySelectedTime = d;
                    n = weekday[$scope.alreadySelectedTime.getDay()];
                    matchDay($scope.alreadySelectedTime, n);
                    var hours = d.getHours();
                    var minutes = d.getMinutes();
                    var setreminderTime = hours
                    var ampm = hours >= 12 ? 'PM' : 'AM';
                    hours = hours % 12;
                    hours = hours ? hours : 12; // the hour '0' should be '12'
                    minutes = minutes < 10 ? '0' + minutes : minutes;

                    var timeString = hours + ":" + minutes + " " + ampm;
                    $scope.selectedtimeString = timeString;
                    $scope.weeklyReminderDayTime = $scope.dataDay + ", " + $scope.selectedtimeString;
                    $scope.selectedTime = $scope.selectedtimeString;
                    window.localStorage['WEEKLY_REMINDER_TIME'] = $scope.weeklyReminderDayTime;
                    window.localStorage['TIME_FOR_WEEKLY_REMINDER'] = $scope.selectedTime;
                }
            },
            inputTime: 50400, //Optional
            format: 12, //Optional
            step: 1, //Optional
            setLabel: 'Set' //Optional
        };

        ionicTimePicker.openTimePicker(ipObj1);
    }

    function setReminder(timeForReminder) {
        document.addEventListener('deviceready', function() {
            // cordova.plugins.notification.local is now available
            cordova.plugins.notification.local.schedule({
                id: 1,
                title: 'BH App Daily Notification',
                text: 'Please fill in your daily Check In data.',
                firstAt: timeForReminder,
                every: "day" // "minute", "hour", "day" , "week", "month", "year"
            });
        }, false);
    }

    function setWeeklyGoalReminder(timeForReminder) {
        document.addEventListener('deviceready', function() {
            // cordova.plugins.notification.local is now available
            cordova.plugins.notification.local.schedule({
                id: 1,
                title: 'BH App Weekly Notification',
                text: 'Please fill in your Weekly Goals Check In data.',
                firstAt: timeForReminder,
                every: "week" // "minute", "hour", "day", "week", "month", "year"
            });
        }, false);
    }


    $scope.saveReminder = function() {
        console.log($scope.today_at_9_pm);
        // CALL SET DAILY REMINDER
        setReminder($scope.today_at_9_pm);

        console.log($scope.dateTimeForWeeklyReminder);
        // CALL SET WEEKLY REMINDER
        setWeeklyGoalReminder($scope.dateTimeForWeeklyReminder);


        window.localStorage['CUSTOM_REMINDER'] = true;
        window.localStorage["NOTIFICATION_SETTING"] = true;
        $cordovaToast.showLongBottom('Remiders are set successfully.').then(function(success) {
            // success
        }, function(error) {
            // error
        });

        if ($stateParams.pageId == 1) {
            $state.go("tabs.assessment");
        } else if ($stateParams.pageId == 2) {
            $state.go("tabs.goals");
        } else if ($stateParams.pageId == 3) {
            $state.go("tabs.checkIn");
        } else if ($stateParams.pageId == 4) {
            $state.go("tabs.stateOfMind");
        } else if ($stateParams.pageId == 5) {
            $state.go("tabs.emergencyCall");
        } else {
            $state.go("tabs.assessment");
        }
    }

    $scope.goBackToback = function() {
        if ($stateParams.pageId == 1) {
            $state.go("tabs.assessment");
        } else if ($stateParams.pageId == 2) {
            $state.go("tabs.goals");
        } else if ($stateParams.pageId == 3) {
            $state.go("tabs.checkIn");
        } else if ($stateParams.pageId == 4) {
            $state.go("tabs.stateOfMind");
        } else if ($stateParams.pageId == 5) {
            $state.go("tabs.emergencyCall");
        }
    }

})


.controller('checkInCtrl', function($scope, $ionicLoading, $stateParams, ionicMaterialInk, UserService, CheckInService, $timeout, $ionicPopup, ionicTimePicker, $state) {

    ionicMaterialInk.displayEffect();
    /* ++ custom IONIC loader functions ++ */
        function showLoader()
        {
            $ionicLoading.show({
                content: 'Loading',
                animation: 'fade-in',
                showBackdrop: true,
                maxWidth: 200,
                showDelay: 0
            });
        }
        function hideLoader()
        {
           $ionicLoading.hide();
        }
    /* -- custom IONIC loader functions -- */

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

    UserService.logInUser(user).success(function(data) {
        $ionicLoading.hide();
        if (data.status == "success") {
            // Check User Status Active or Inactive
            if (data.data.user.is_status == true) {
                window.localStorage['ACCESS_TOKEN'] = data.access_token;
                window.localStorage['USER_DATA'] = JSON.stringify(data.data.user);
                var userData = JSON.parse(window.localStorage['USER_DATA']);
            } else {
                showConfirm(animation);
                var alertPopup = $ionicPopup.alert({
                    title: 'Error!',
                    template: LOGIN_STATUS_ERROR,
                });
                alertPopup.then(function(res) {
                    $state.go("signin");
                });
            }
        } else {
            showConfirm(animation);
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
            showConfirm(animation);
            var alertPopup = $ionicPopup.alert({
                title: 'Error!',
                template: LOGIN_ERROR,
            });
            alertPopup.then(function(res) {});
        }
    });

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
    }];

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
    $scope.checkInDataGet = function(num, holderDate) {
        showLoader();
        console.log('--', num, holderDate);
        if (num == 1 || num == 2) {
            $scope.CheckInNext = true;
            var d = new Date(holderDate);
            if (num == 1) {
                var d = new Date(holderDate);
                var mm = d.getMonth() + 1;
                var dd = d.getDate() - 1;
            } else if (num == 2) {
                var d = new Date(holderDate);
                var mm = d.getMonth() + 1;
                var dd = d.getDate() + 1;
            }
            var yyyy = d.getFullYear();
            var formatdate = (mm < 10 ? '0' + mm : mm) + '/' + dd + '/' + yyyy;
            $scope.newDate = formatdate;
            var inputJsonData = {};
            inputJsonData.user_id = userData._id;
            inputJsonData.checkin_date = formatdate;
            CheckInService.findCheckinData(inputJsonData).success(function(response) {
                $scope.checkinDateOne = true;
                hideLoader();
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
            inputJson.checkin_date = $scope.newDate;
            //console.log('inputJson = ', inputJson);
            CheckInService.findCheckinData(inputJson).success(function(response) {
            console.log("findCheckinData... ", response);
                if (response.messageId == 200) {
                    showTodayCheckIns(response);
                }
            });
        }
    }
    
    /*
    *   function to show check-in screen in different cases for today.
    *   developer   :   Gurpreet
    **/
    function showTodayCheckIns(response){
        hideLoader();
        $scope.isDataAvailable = true;
        $scope.showCheckInData = true;
        $scope.newDate = date;
        console.log("scope.newDate = ", $scope.newDate);
        $scope.checkinDateOne = true; // console.log("count",response.data[0].checkin_count);
        console.log("response.data.length = ", response.data.length);
        if (response.data.length == 0) {
            $scope.CheckIn = true;
            $scope.patient = {};
        }else if (response.data.length == 1) {
            console.log("in 1");
            $scope.isMessage = false;
            $scope.CheckIn = true;
            $scope.CheckInOne = false;
            $scope.patient = response.data[0];
            $scope.isMessage = true;
            $scope.boxMessageText = ONE_CHECK_IN_MESSAGE;
        } else if (response.data.length == 2) {
            console.log("in 2");
            $scope.checkInDisable = true;
            $scope.isMessage = true;
            $scope.CheckIn = false;
            $scope.CheckInOne = false;
            $scope.checkinDateOne = true;
            $scope.patient = response.data[0];
            $scope.boxMessageText = CHECK_IN_MESSAGE;
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
            hideLoader();
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
        showLoader();
    console.log('$scope.patient = ', $scope.patient);
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
            hideLoader();
            console.log("response saveeee= ", response);
            if (response.messageId == 200) {
                showConfirm(animation);
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
                    $state.reload('tabs.checkIn');
                }
            } else {
                showConfirm(animation);
                var alertPopup = $ionicPopup.alert({
                    title: 'Warning!',
                    template: CHECK_IN_ERROR,
                });
                alertPopup.then(function(res) {});
            }
        });
        // $state.reload('tabs.checkIn');
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

    /*
     * setTime function to set time for fields on CHECK IN screen.
     * developer : GpSingh
     */
    $scope.setTime = function(num) {
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
                        $scope.patient.food1 = timeString;
                    } else if (num == 7) {
                        $scope.patient.food2 = timeString;
                    } else if (num == 8) {
                        $scope.patient.food3 = timeString;
                    } else if (num == 9) {
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
})

.controller('stateOfMindCtrl', function($scope, $state, $stateParams, UserService, CheckInService, $ionicLoading, ionicMaterialInk, $timeout, $ionicPopup, stateOfMindService) {
    var userData = JSON.parse(window.localStorage['USER_DATA']);
    var user = {};
    var inputString = {};
    user.password = userData.password;
    user.username = userData.username;
    var decryptedData = CryptoJS.AES.decrypt(userData.password, ENCRYPTION_KEY);
    var decryptedOldPassword = decryptedData.toString(CryptoJS.enc.Utf8);
    decryptedOldPassword = decryptedOldPassword.slice(1, -1);
    user.password = decryptedOldPassword;
    $scope.user_name = userData.first_name + " " + userData.last_name;
    // $scope.patient.checkin_count=[];

    $scope.findCheckIndata = function() {
        $ionicLoading.show({
            content: 'Loading',
            animation: 'fade-in',
            showBackdrop: true,
            maxWidth: 200,
            showDelay: 0
        });
        var inputJson = {};
        inputJson.user_id = userData._id;
        // inputJson.checkin_count=$scope.patient.checkin_count;
        // console.log($scope.patient.checkin_count);
        // console.log(inputJson.checkin_count);
        // return;
        console.log("inputjson", inputJson);
        stateOfMindService.findCheckIndata(inputJson).success(function(response) {
            $ionicLoading.hide();
            // console.log("response", response);
            if (response.messageId == 200) {
                if (response.data.length != 0) {
                    // console.log(response.data);
                    var sq = [];
                    var energy = [];
                    var happy = new Array();
                    var relaxed = new Array();
                    var alcohol = new Array();
                    var medication = new Array();
                    var sleep_enough = new Array();
                    var checkin_date = new Array();
                    console.log(response.data.checkin_date);
                    // response.data.checkin_date;
                    for (var i = 0; i < response.data.length; i++) {
                        if (response.data[i].checkin_count == 2) {
                            console.log(response.data[i].checkin_count);
                            sq.push(response.data[i].sleep_quality);
                            energy.push(response.data[i].energy);
                            happy.push(response.data[i].happy);
                            relaxed.push(response.data[i].relaxed);
                            alcohol.push(response.data[i].alcohol);
                            medication.push(response.data[i].medication);
                            sleep_enough.push(response.data[i].sleep_enough);
                            // console.log("checkin", response.data[i].checkin_date);
                            checkin_date.push(response.data[i].checkin_date);

                        }
                    }
                    console.log("$scope.sleep_quality", sq);
                    console.log("$scope.energy", energy);
                    console.log("checkin date", checkin_date);






                    ////////////////////////////////////////////////////////////////////////////////////////////
                    //google.charts.load('current', { 'packages': ['corechart'] });
                    google.charts.setOnLoadCallback(drawChart);

                    function drawChart() {
                        var data = google.visualization.arrayToDataTable([
                            ['Date', 'Happy', 'Relaxed', 'Sleep enough'],
                            [checkin_date[0], happy[0], relaxed[0], sleep_enough[0]],
                            [checkin_date[1], happy[1], relaxed[1], sleep_enough[1]],
                            [checkin_date[2], happy[2], relaxed[2], sleep_enough[2]],
                            [checkin_date[3], happy[3], relaxed[3], sleep_enough[3]],
                            [checkin_date[4], happy[4], relaxed[4], sleep_enough[4]]
                        ]);

                        var options = {
                            title: 'Sleep Quality',
                            legend: { position: 'bottom' },
                            curveType: 'function',
                            width: 275,
                            chartArea: { left: 0, right: 10 },
                            height: 200,



                        };

                        var chart = new google.visualization.LineChart(document.getElementById('curve_chart'));

                        chart.draw(data, options);
                    }

                    //////////////////////////////////////////////////////////////////////
                    google.charts.setOnLoadCallback(drawChart1);

                    function drawChart1() {
                        var data = google.visualization.arrayToDataTable([
                            ['Date', 'energy', 'sleep quality'],
                            [checkin_date[0], sq[0], energy[0]],
                            [checkin_date[1], sq[1], energy[1]],
                            [checkin_date[2], sq[2], energy[2]],
                            [checkin_date[3], sq[3], energy[3]]
                        ]);
                        var options = {
                            title: 'Sleep as Input',
                            curveType: 'function',
                            width: 275,
                            chartArea: { left: 0, right: 10 },
                            height: 200,
                            legend: { position: 'bottom' }
                        };

                        var chart = new google.visualization.LineChart(document.getElementById('chart_div'));
                        chart.draw(data, options);
                    }
                    ////////////////////////////////////////////////////////////
                    //                        google.charts.load('current', {'packages':['corechart']});
                    // google.charts.setOnLoadCallback(drawChart);

                    // // function drawChart() {
                    // //   var data = google.visualization.arrayToDataTable([
                    // //      ['energy','sleep quality'],
                    // //      sq, energy

                    // //   ]);
                    //    function drawChart() {
                    //   var data = google.visualization.arrayToDataTable([
                    //     ['Sales','Expenses'],
                    //       sq, energy

                    //     // ['2005',  1170,      460],
                    //     // ['2006',  660,       1120],
                    //     // ['2007',  1030,      540]
                    //   ]);

                    //   var options = {
                    //     title: 'Sleep Quality',
                    //     curveType: 'function',
                    //     legend: { position: 'bottom' },
                    //     colors: ['black','blue']
                    //   };

                    //   var chart = new google.visualization.LineChart(document.getElementById('line'));

                    //   chart.draw(data, options);
                    //   console.log("charts",chart);
                    // }

                    $scope.labels = [];
                    $scope.series = ['relaxed', 'alcohol', 'medication'];
                    $scope.data = [
                        relaxed,
                        alcohol,
                        medication
                    ];
                    // console.log("data", $scope.data)
                    // $scope.onClick = function(points, evt) {
                    //     console.log(points, evt);
                    // };
                    $scope.datasetOverride = [{ yAxisID: 'y-axis-1' }, { yAxisID: 'y-axis-2' }];
                    // var data=$scope.data=response.data;
                    $scope.options = {
                        scales: {
                            yAxes: [{
                                id: 'y-axis-1',
                                title: "sleep_quality",
                                type: 'linear',

                                display: true,
                                position: 'left'
                            }, {
                                id: 'y-axis-2',
                                title: "energy",
                                type: 'linear',
                                display: true,
                                position: 'right'
                            }]
                        }
                    };
                    ///////////////////////////////
                    $scope.labels1 = [];
                    $scope.series1 = ['Sleep Quantity', 'Energy', 'happy'];
                    $scope.data1 = [
                        sq,
                        energy,
                        happy

                    ];
                    // console.log("data", $scope.data1)
                    // $scope.onClick1 = function(points1, evt1) {
                    //     console.log(points1, evt1);
                    // };
                    $scope.datasetOverride1 = [{ yAxisID: 'y-axis-1' }, { yAxisID: 'y-axis-2' }];
                    // var data=$scope.data=response.data;
                    $scope.options1 = {
                        scales: {
                            yAxes: [{
                                id: 'y-axis-1',
                                title: "sleep_quality",
                                type: 'linear',

                                display: true,
                                position: 'left'
                            }, {
                                id: 'y-axis-2',
                                title: "energy",
                                type: 'linear',
                                display: true,
                                position: 'right'
                            }]
                        }
                    };
                    //////////////////////////////////////////////////////////////////////////////////////////
                    $scope.labels2 = [];
                    $scope.series2 = ['sleep enough'];
                    $scope.data2 = [
                        sleep_enough,


                    ];
                    console.log("data", $scope.data1);
                    $scope.datasetOverride2 = [{ yAxisID: 'y-axis-1' }, { yAxisID: 'y-axis-2' }];
                    // var data=$scope.data=response.data;
                    $scope.options2 = {
                        scales: {
                            yAxes: [{
                                id: 'y-axis-1',
                                title: "sleep_quality",
                                type: 'linear',

                                display: true,
                                position: 'left'
                            }, {
                                id: 'y-axis-2',
                                title: "energy",
                                type: 'linear',
                                display: true,
                                position: 'right'
                            }]
                        }
                    };
                    //////////////////////////////////////////////////////////////////////////////////////
                    console.log("$scope.sleep_quality", sq);
                    console.log("$scope.energy", energy);

                }
            } else {
                console.log("Error.");
            }

        });
    }

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

    // Show Loader 
    return;

    $scope.getStateofMindData = function() {
        $ionicLoading.show({
            content: 'Loading',
            animation: 'fade-in',
            showBackdrop: true,
            maxWidth: 200,
            showDelay: 0
        });

        var inputJSONcheckIn = {};
        var inputJsonString = {};
        var d = new Date();
        d.setDate(d.getDate() - 10);
        var newdate = (d.getMonth() + 1) + '/' + d.getDate() + '/' + d.getFullYear();
        inputJsonString.patient = userData._id;
        inputJSONcheckIn.patient = userData._id;
        inputJSONcheckIn.created_date = {
            $gte: d.toISOString()
        };
        /** Get all goals for patients Start**/
        $scope.dailyMetricData = {};
        $scope.weeklyMetricData = {};
        $scope.patient_goal_data = {};

        /** Get Patient General Questions Start**/
        CheckInService.listPatientGeneralQuestions(inputJsonString).success(function(response) {
            $ionicLoading.hide();
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
                }
            }
        });
        /** Get Patient General Questions end **/

        /** List CheckIn Data Start Start**/
        $scope.CheckInDailyMetricData = {};
        $scope.CheckInWeeklyMetricData = {};
        $scope.checkInData = {};
        $scope.chartlabels = [];
        $scope.FirstChartData = [];
        $scope.SecondChartData = [];
        $scope.weeklyChartSeries = [];
        $scope.WeeklyChartData = [];
        CheckInService.getPatientCheckIn(inputJSONcheckIn).success(function(response) {
            console.log(response);
            $ionicLoading.hide();
            if (response.messageId == 200) {
                $scope.totalDays = response.data.length;
                if ($scope.totalDays == 0) {
                    console.log("Here");
                    $scope.NoDataAvailable = true;
                    $scope.DataAvailable = false;
                } else {
                    $scope.NoDataAvailable = false;
                    $scope.DataAvailable = true;
                    // Set Appointment Date Start
                    if (userData.next_appointment_date) {
                        var nextApptDate = userData.next_appointment_date;
                        var nextApptTime = userData.next_appointment_time;
                        var newTime = nextApptTime.split(":");
                        var d = new Date(nextApptDate);
                        d.setHours(newTime[0]);
                        d.setMinutes(newTime[1]);
                        $scope.nextApptDateTime = formatDate(d);
                        var currentDt = new Date();
                        if (d >= currentDt) {
                            $scope.showAppointmentDiv = true;
                        } else {
                            $scope.showAppointmentDiv = false;
                        }
                    }
                    $scope.newObj = {};
                    $scope.newObj1 = {};
                    $scope.newObj2 = {};
                    for (var i = 0; i < response.data.length; i++) {
                        $scope.checkInData = response.data;
                        if ($scope.checkInData[i].daily_metric) {
                            var checkIn_daily_metric = $scope.checkInData[i].daily_metric;
                            if (checkIn_daily_metric.length == 0) {
                                $scope.showDailyMetricDiv = false;
                            } else {
                                $scope.showDailyMetricDiv = true;
                                for (var j = 0; j < checkIn_daily_metric.length; j++) {
                                    $scope.checkIn_dm = checkIn_daily_metric[j];
                                    // Changed by Rajesh
                                    if (j == 0) {
                                        $scope.CheckInDailyMetricData[$scope.checkIn_dm.goal] = 0;
                                    }
                                    if ($scope.checkIn_dm.checked == true) {
                                        $scope.CheckInDailyMetricData[$scope.checkIn_dm.goal] += 1;
                                    }
                                }
                            }
                        }
                        var str = $scope.checkInData[i].checkin_date;
                        var res = str.split("/");
                        var dateForChart = res[0] + "/" + res[1];
                        $scope.chartlabels.push(dateForChart);

                        if ($scope.checkInData[i].static_metric) {
                            var checkIn_static_metric = $scope.checkInData[i].static_metric;
                            if (checkIn_static_metric.length == 0) {
                                $scope.showDailyMetricCharts = false;
                            } else {
                                $scope.showDailyMetricCharts = true;
                                for (var k = 0; k < checkIn_static_metric.length; k++) {
                                    if (checkIn_static_metric[k].id == 1 || checkIn_static_metric[k].id == 2 || checkIn_static_metric[k].id == 3) {
                                        if (typeof $scope.newObj[checkIn_static_metric[k].id] == "undefined") {
                                            $scope.newObj[checkIn_static_metric[k].id] = new Array();
                                        }
                                        $scope.newObj[checkIn_static_metric[k].id].push(checkIn_static_metric[k].rating);
                                    }
                                    if (checkIn_static_metric[k].id == 1 || checkIn_static_metric[k].id == 4 || checkIn_static_metric[k].id == 5) {
                                        if (typeof $scope.newObj1[checkIn_static_metric[k].id] == "undefined") {
                                            $scope.newObj1[checkIn_static_metric[k].id] = new Array();
                                        }
                                        $scope.newObj1[checkIn_static_metric[k].id].push(checkIn_static_metric[k].rating);
                                    }
                                }
                            }
                        }

                        if ($scope.checkInData[i].weekly_metric) {
                            var checkIn_weekly_metric = $scope.checkInData[i].weekly_metric;
                            $scope.thirdchartData = [];
                            if (checkIn_weekly_metric.length == 0) {
                                $scope.showWeeklyMetricDiv = false;
                            } else {
                                $scope.showWeeklyMetricDiv = true;
                                for (var k = 0; k < checkIn_weekly_metric.length; k++) {
                                    if (typeof $scope.newObj2[checkIn_weekly_metric[k].goal] == "undefined") {
                                        $scope.newObj2[checkIn_weekly_metric[k].goal] = new Array();
                                    }
                                    $scope.newObj2[checkIn_weekly_metric[k].goal].push(checkIn_weekly_metric[k].rating);
                                }
                            }

                        }
                    }
                    if (response.data[0].weekly_metric) {
                        for (var c = 0; c < response.data[0].weekly_metric.length; c++) {
                            var yourString = response.data[0].weekly_metric[c].goal_question;
                            var maxLength = 20 // maximum number of characters to extract

                            //trim the string to the maximum length
                            var trimmedString = yourString.substr(0, maxLength);

                            //re-trim if we are in the middle of a word
                            trimmedString = trimmedString.substr(0, Math.min(trimmedString.length, trimmedString.lastIndexOf(" ")));

                            $scope.weeklyChartSeries.push(trimmedString);
                        }
                    }
                    for (key in $scope.newObj) {
                        var dailydetail1 = (typeof $scope.newObj[key] != "undefined") ? $scope.newObj[key] : null;
                        $scope.FirstChartData.push(dailydetail1);
                    }
                    for (key in $scope.newObj1) {
                        var dailydetail2 = (typeof $scope.newObj1[key] != "undefined") ? $scope.newObj1[key] : null;
                        $scope.SecondChartData.push(dailydetail2);
                    }
                    for (key in $scope.newObj2) {
                        var detail = (typeof $scope.newObj2[key] != "undefined") ? $scope.newObj2[key] : null;
                        $scope.WeeklyChartData.push(detail);
                    }
                    $scope.CheckInDailyMetricDataKeys = Object.keys($scope.CheckInDailyMetricData);
                }
            }
        });
    }

    $scope.firstchartseries = ['Good Mood', 'Good Energy', 'Low Stress'];
    $scope.secondchartseries = ['Good Mood', 'Good Sleep', 'Eating Healthy'];

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


/*
 *jet lag calculator controller .
 * developer : Shilpa Sharma
 */
.controller('jetLagCtrl', function($scope, $ionicLoading, $stateParams, ionicMaterialInk, UserService, CheckInService, jetLagService, $timeout, $ionicPopup, ionicTimePicker, ionicDatePicker, $state, $http) {
    
    $scope.timezones = {};
    $scope.timezones = [
            {"key":"-12", "value":"-12"},
            {"key":"-10", "value":"-10"},
            {"key":"-8", "value":"-8"},
            {"key":"-6", "value":"-6"},
            {"key":"-4", "value":"-4"},
            {"key":"-2", "value":"-2"},
            //{"key":"0", "value":"0"},
            {"key":"+2", "value":"2"},
            {"key":"+4", "value":"4"},
            {"key":"+6", "value":"6"},
            {"key":"+8", "value":"8"},
            {"key":"+10", "value":"10"},
            {"key":"+12", "value":"12"}
    ];
    $scope.ifJetLagFilled = false;
    /*
    $http.get('json/timezones-even.json').success(function(data) {
        //console.log('timezones = ', data);
        $scope.timezones = data;
    });
    */
    
    var userData = JSON.parse(window.localStorage['USER_DATA']);
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
    // console.log("**********", userData._id);
    $scope.getJetLagData = function() {
            var inputJson = {};
            inputJson.user_id = userData._id;
            inputJson.is_completed = false;
            // inputJson.is_save=true;
            jetLagService.getJetLagData(inputJson).success(function(response) {
                //console.log("response", response);
                if (response.messageId == 200) {
                    if (response.data.length != 0) {
                        $scope.jetLagId = response.data[0]._id;
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
                    }
                } else {
                    console.log("Error.");
                }
            })
    }
        
    /*
     * save the jet lag calculator controller.
     * developer : Shilpa Sharma
     */
    inputJsonData.jetLag = {};
    inputJsonData.jet_lags = [];
    $scope.is_save = true;
    $scope.is_completed = false;
    $scope.completeShow = false;
    $scope.saveJetLagData = function() {
            $ionicLoading.show({
                content: 'Loading',
                animation: 'fade-in',
                showBackdrop: true,
                maxWidth: 200,
                showDelay: 0
            });
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
            $ionicLoading.hide();
            var confirmPopup = $ionicPopup.confirm({
                title: 'Confirm',
                template: JET_LAG_CONFIRM,
            });
            confirmPopup.then(function(res) {
                if (res) {
                    // console.log("res", res);
                    var flag = 1;
                } else {
                    console.log("res1", res);
                }
                if (flag == 1) {
                    jetLagService.saveJetLagData(inputJsonData).success(function(response) {
                        // console.log("response", response);
                        // $ionicLoading.hide();
                        if (response.messageId == 200) {

                            var alertPopup = $ionicPopup.alert({
                                title: 'Success!',
                                template: JET_LAG_SUCCESS,
                            });
                            alertPopup.then(function(res) {
                                $scope.alreadySubmiited = JET_LAG_MESSAGE;
                            });
                            $state.reload("tabs.jetLag");

                        } else {

                            var alertPopup = $ionicPopup.alert({
                                title: 'Warning!',
                                template: CHECK_IN_ERROR,
                            });
                            alertPopup.then(function(res) {});
                        }

                    });

                }
            });
        }
        /*
         * update the jet lag calculator controller .
         * developer : Shilpa Sharma
         */
    var updateJson = {};
    var is_completed = false;
    // $scope.show = true;
    $scope.updateJetLagData = function() {
        var confirmPopup = $ionicPopup.confirm({
            title: 'confirm',
            template: JET_LAG_COMPLETE,
        });
        confirmPopup.then(function(res) {
            if (res) {
                // console.log("res", res);
                var flag1 = 1;
            } else {
                console.log("res1", res);
            }
            // updateJson.user_id = userData._id;
            updateJson._id = $scope.jetLagId;
            updateJson.is_completed = true;
            updateJson.is_save = false;

            // console.log("updatejson", updateJson);
            if (flag1 == 1) {
                jetLagService.updateJetLagData(updateJson).success(function(response) {
                    // console.log("response for update", response);
                    if (response.messageId == 200) {
                        var alertPopup = $ionicPopup.alert({
                            title: 'Success!',
                            template: JET_LAG_COMPLETE_SUCCESS,
                        });

                        alertPopup.then(function(res) {

                            $scope.alreadySubmiited = JET_LAG_MESSAGE;
                        });
                        $state.reload("tabs.jetLag");


                    } else {
                        var alertPopup = $ionicPopup.alert({
                            title: 'Warning!',
                            template: CHECK_IN_ERROR,
                        });
                        alertPopup.then(function(res) {});
                    }

                });
            }

        });
    }

    /*
     * Reset jet lag calculator controller .
     * developer : Shilpa Sharma
     */
    $scope.resetJetLagData = function() {
        $state.reload('tabs.jetLag');
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
        var glassesStr = ''; var numberOfDaysToAdd = 0;
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
            d1.setDate(d.getDate() - numberOfDaysToAdd);
            var dd = d1.getDate();
            var mm = d1.getMonth() + 1;
            var y = d1.getFullYear();
            var someFormattedDate = (mm + '/' + dd + '/' + y);
            $scope.jetLag.date[i] = someFormattedDate;
            ++numberOfDaysToAdd;
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
        
        var timeStr = ''; var timeStr2 = ''; var glassesStr = ''; var numberOfDaysToAdd = 0;
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
            d1.setDate(d.getDate() - numberOfDaysToAdd);
            var dd = d1.getDate();
            var mm = d1.getMonth() + 1;
            var y = d1.getFullYear();
            var someFormattedDate = (mm + '/' + dd + '/' + y);
            $scope.jetLag.date[i] = someFormattedDate;
            ++numberOfDaysToAdd;
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
});
