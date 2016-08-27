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
    $scope.demoCaption2 = "Fill in the information. Copy and paste the reference code from the admin email.";
    $scope.demoActive2 = true;

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


.controller('checkInCtrl', function($scope, $ionicLoading, $stateParams, ionicMaterialInk, UserService, CheckInService, $timeout, $ionicPopup, ionicTimePicker) {
    ionicMaterialInk.displayEffect();

    var userData = JSON.parse(window.localStorage['USER_DATA']);
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
    $scope.hideCheckInData = false;
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
    $scope.findPatientCheckIn.checkin_date = date;

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

    // Check in Init Function
    $scope.checkInDataGet = function() {
        $ionicLoading.show({
            content: 'Loading',
            animation: 'fade-in',
            showBackdrop: true,
            maxWidth: 200,
            showDelay: 0
        });
        //$scope.dailyMetricData = [];
        //$scope.weeklyMetricData = []
        //$scope.weekly_Metric_Data = {};
        //$scope.daily_metric_data = {};
        $scope.showCheckInData = true;
        // Getting Patient General Questions
        //$scope.getPatientGeneralQuestions();

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
                    $scope.hideCheckInData = true;
                    $scope.alreadySubmiited = CHECK_IN_MESSAGE;
                } else {
                    $scope.showCheckInData = true;
                    $scope.hideCheckInData = false;
                }
            } else {
                console.log("Error.")
            }
        });
    }

    var inputJsonData = {};
    inputJsonData.static_metric = [];
    inputJsonData.weekly_metric = [];
    inputJsonData.daily_metric = [];
    inputJsonData.general_metric = [];

    $scope.saveCheckInData = function() {
        $ionicLoading.show({
            content: 'Loading',
            animation: 'fade-in',
            showBackdrop: true,
            maxWidth: 200,
            showDelay: 0
        });
        inputJsonData.patient = userData._id;
        inputJsonData.checkin_date = date;

        for (var i in $scope.dailyMetricData) {
            if ($scope.dailyMetricData.hasOwnProperty(i)) {
                inputJsonData.daily_metric.push($scope.dailyMetricData[i]);
            }
        }

        for (var i in $scope.weeklyMetricData) {
            if ($scope.weeklyMetricData.hasOwnProperty(i)) {
                inputJsonData.weekly_metric.push($scope.weeklyMetricData[i]);
            }
        }


        for (var i in $scope.staticQuestions) {
            if ($scope.staticQuestions.hasOwnProperty(i)) {
                inputJsonData.static_metric.push($scope.staticQuestions[i]);
            }
        }

        for (var i in $scope.generalQuestionCheckIn) {
            if ($scope.generalQuestionCheckIn.hasOwnProperty(i)) {
                inputJsonData.general_metric.push($scope.generalQuestionCheckIn[i]);
            }
        }
        // Save check in on daily basis
        CheckInService.savePatientCheckIn(inputJsonData).success(function(response) {
            $ionicLoading.hide();
            if (response.messageId == 200) {
                showConfirm(animation);
                var alertPopup = $ionicPopup.alert({
                    title: 'Success!',
                    template: CHECK_IN_SUCCESS,
                });
                alertPopup.then(function(res) {
                    $scope.showCheckInData = false;
                    $scope.hideCheckInData = true;
                    $scope.alreadySubmiited = CHECK_IN_MESSAGE;
                });
            } else {
                showConfirm(animation);
                var alertPopup = $ionicPopup.alert({
                    title: 'Warning!',
                    template: CHECK_IN_ERROR,
                });
                alertPopup.then(function(res) {});
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
                        $scope.patient.bedtime = timeString;
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
            },
            //inputTime: 50400, //Optional
            format: 12, //Optional
            step: 1, //Optional
            setLabel: 'Set' //Optional
        };

        ionicTimePicker.openTimePicker(ipObj1);
    }
})

.controller('stateOfMindCtrl', function($scope, $stateParams, UserService, CheckInService, $ionicLoading) {
    var userData = JSON.parse(window.localStorage['USER_DATA']);
    var user = {};
    user.username = userData.username;
    user.password = userData.password;

    UserService.logInUser(user).success(function(data) {
        if (data.status == "success") {
            // Check User Status Active or Inactive
            if (data.data.is_status == true) {
                window.localStorage['ACCESS_TOKEN'] = data.access_token;
                window.localStorage['USER_DATA'] = JSON.stringify(data.data);
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


    var caregiverUserData;
    $scope.user_name = userData.first_name + " " + userData.last_name;


    // Set User Type in Charts
    if (userData.user_type == 3) {
        $scope.User_Type = "Patient";
    } else if (userData.user_type == 4) {
        $scope.User_Type = "Caregiver";
    }

    $scope.noDataMessage = NO_DATA;
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
})


/*
 *jet lag calculator controller .
 * developer : Shilpa Sharma
 */
.controller('jetLagCtrl', function($scope, $ionicLoading, $stateParams, ionicMaterialInk, UserService, CheckInService, jetLagService, $timeout, $ionicPopup, ionicTimePicker, ionicDatePicker,$state) {
 
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
        $scope.calculateJetLag();
    };

    $scope.jetLagData = [{
        "id": "1"
    }, {
        "id": "2"
    }, {
        "id": "3"
    }, {
        "id": "4"
    }, {
        "id": "5"
    }, {
        "id": "6"
    }]


$scope.showConfirm = function() {
   var confirmPopup = $ionicPopup.confirm({
     title: 'Consume Ice Cream',
     template: 'Are you sure you want to eat this ice cream?'
   });

   confirmPopup.then(function(res) {
     if(res) {
       console.log('You are sure');
     } else {
       console.log('You are not sure');
     }
   });
 };




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

            if ((typeof $scope.jetLag.time_difference !== "undefined") && (typeof $scope.jetLag.travel_date !== "undefined")) {

                var glasses_time;
                var wakeup;
                var bedtime;
                var time_difference;
                var travel_date = [];
                var timeCalculate = [];
                $scope.Math = window.Math;
                var userData = JSON.parse(window.localStorage['USER_DATA']);
                glasses_time = userData.wear_glasses_time;
                var glassesStr = glasses_time;
                // console.log("glasses_time**************", glasses_time);
                wakeup = userData.planned_wakeup;
                bedtime = userData.planned_bedtime;
                var timeDiffCalculate = {};
                var travelDateCal = {};
                travelDateCal.travel_date = $scope.jetLag.travel_date;
                var get_date = travelDateCal.travel_date;
                var d = new Date(get_date);
                var d1 = new Date(get_date);
                var hoursUpdated = "null";
                var updatedGlasses = "null";
                timeDiffCalculate.time_difference = $scope.jetLag.time_difference;
                timeCalculate = (timeDiffCalculate.time_difference) / 2;
               // (timeCalculate);
                var newTimeCalculate = Math.abs(timeCalculate);
                // console.log("newTimeCalculate1",newTimeCalculate);

                var numberOfDaysToAdd = 0;
                if (newTimeCalculate > 0) {
                    var timeStr = '';
                    timeStr = bedtime;
                    var glassesStr = '';
                    glassesStr = glasses_time;
                    for (var i = 0; i < Math.floor(newTimeCalculate); i++) {
                        $scope.jetLag.day[i] = i + 1;
                        // newTimeCalculate =Math.floor(timeCalculate);

                        d1.setDate(d.getDate() + numberOfDaysToAdd);
                        var dd = d1.getDate();
                        var mm = d1.getMonth() + 1;
                        var y = d1.getFullYear();
                        var someFormattedDate = (mm + '/' + dd  + '/' + y);
                        $scope.jetLag.date[i] = someFormattedDate;
                        ++numberOfDaysToAdd;
                        ///////set the bed time////////////////////////
                        if (hoursUpdated == "null") { // if bedtime
                            // console.log("this is a test");
                            var parts = timeStr.split(':');
                            var hours = parseInt(parts[0]);
                            // if()
                            hours -= 2;
                            if (hours <= 0) {
                                // easily flip it by adding 12
                                hours += 12;
                                if (parts[1].match(/(AM|am)/)) {
                                    parts[1] = parts[1].replace('AM', 'PM').replace('am', 'pm');
                                    // keep the case
                                } else {
                                    if (hours < 12) {
                                        parts[1] = parts[1].replace('PM', 'AM').replace('pm', 'am');
                                    }
                                }
                            }
                            timeStr = hours + ':' + parts[1];
                            hoursUpdated = hours;
                        } else {
                            hours -= 2;
                            if (hours <= 0) {
                                // easily flip it by adding 12
                                hours += 12;
                                // swap am & pm
                                if (parts[1].match(/(AM|am)/)) {
                                    parts[1] = parts[1].replace('AM', 'PM').replace('am', 'pm');
                                    // keep the case
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
                                    // keep the case
                                } else {
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
                            glassesStr = hours1 + ':' + parts1[1];
                            updatedGlasses = hours1;
                        } else { //else glasses time
                            hours1 -= 2;
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

                                } else {
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
                } else {
                    for (var i = 0; i < 6; i++) {
                        $scope.jetLag.day[i] = "";
                        $scope.jetLag.date[i] = "";
                        $scope.jetLag.bedtime[i] = "";
                        $scope.jetLag.time[i] = "";
                    }
                }
            } else {
                for (var i = 0; i < 6; i++) {
                    $scope.jetLag.day[i] = "";
                    $scope.jetLag.date[i] = "";
                    $scope.jetLag.bedtime[i] = "";
                    $scope.jetLag.time[i] = "";
                }
            }
        }
        /*
         * save the jet lag calculator controller .
         * developer : Shilpa Sharma
         */

    inputJsonData.jetLag = {};
    inputJsonData.jet_lags = [];
    $scope.show=true;
    $scope.formDisable=false;
    $scope.saveJetLagData = function() {
        // $ionicLoading.show({
        //     content: 'Loading',
        //     animation: 'fade-in',
        //     showBackdrop: true,
        //     maxWidth: 200,
        //     showDelay: 0
        // });

        var confirmPopup = $ionicPopup.confirm({
			 title: 'confirm',
			 template: JET_LAG_CONFIRM,
			});

                 // console.log("*********

        confirmPopup.then(function(res) {
			 if(res) {
			 	console.log("res",res);
			 	var flag=1;
			 	
			   console.log('You are sure');
			 } else {
			 	console.log("res1",res);
			   console.log('You are not sure');
			 }
			
        inputJsonData.user_id = userData._id;
        inputJsonData.travel_date = $scope.jetLag.travel_date;
        inputJsonData.time_difference = $scope.jetLag.time_difference;

        for (var i = 0; i < $scope.jetLag.day.length; i++) {
            var inputJson = {};
            inputJson.day = $scope.jetLag.day[i];
            inputJson.start_date = $scope.jetLag.date[i];
            inputJson.glasses_time = $scope.jetLag.time[i];
            inputJson.bedtime = $scope.jetLag.bedtime[i];
            // console.log("this is Object", inputJson);
            inputJsonData.jet_lags.push(inputJson);

        }

		

			
	    if(flag == 1){

        jetLagService.saveJetLagData(inputJsonData).success(function(response) {
            $ionicLoading.hide();
            if (response.messageId == 200) {
        
                 var alertPopup = $ionicPopup.alert({
                    title: 'Success!',
                    template: JET_LAG_SUCCESS,
                });
                 // $state.go('tabs.stateOfMind');
                  alertPopup.then(function(res) {

                    $scope.alreadySubmiited = JET_LAG_MESSAGE;
                });
                  $scope.show=false;
                  $scope.formDisable=true;
                 // console.log("****************", $scope.$invalid);
            } 
            else {

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

  
})