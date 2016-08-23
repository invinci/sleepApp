angular.module('BH_patient.controllers', []) 

.controller('welcomeCtrl', function ($scope, $state) {

	// LOCK SCREEN ORIENTATION IN PORTRAIT MODE FOR CAROUSEL SCREENS.
	document.addEventListener("deviceready", onDeviceReady, false);
    function onDeviceReady()
    {
		screen.lockOrientation('portrait'); 
	}
  	// Called to navigate to the main app
  	$scope.startApp = function() {
    	$state.go('signup');
  	};
})

.controller('SignUpController', function ($scope, $state, ionicMaterialInk, $timeout, $ionicLoading, $ionicPopup, UserService){
	// UNLOCK SCREEN ORIENTATION
	document.addEventListener("deviceready", onDeviceReady, false);
    function onDeviceReady()
    {
		screen.unlockOrientation();
	}
	$scope.demoCaption2 = "Fill in the information. Copy and paste the reference code from the admin email.";
	$scope.demoActive2 = true;

	ionicMaterialInk.displayEffect();
	window.localStorage['ACCESS_TOKEN'] = "";
	window.localStorage['USER_DATA'] = "";
	window.localStorage['CAREGIVER_USER_DATA'] = "";
	var animation = 'bounceInDown';
	$scope.type = 'Patient';
	$scope.showEMRNumber = true;
	$scope.setType = function(event){
	    $scope.type = angular.element(event.target).text();
	    console.log($scope.type);
	    if($scope.type == 'Caregiver'){
	    	$scope.showEMRNumber = false;
	    }else{
	    	$scope.showEMRNumber = true;
	    }
  	};

  	$scope.patient = {};
  	$scope.signUp = function(userData){
  		$ionicLoading.show({
		    content: 'Loading',
		    animation: 'fade-in',
		    showBackdrop: true,
		    maxWidth: 200,
		    showDelay: 0
		});

		if($scope.type == "Patient"){
  			$scope.patient.user_type = 3; // Patient
  			$scope.patient.patient_type = 1; // [ 1 patient registering from mobile / 0 patient registering from web admin]
  		}else if($scope.type == "Caregiver"){
  			$scope.patient.user_type = 4; // Caregiver
  		}
  		$scope.patient = userData;
  		$scope.patient.clinic_name = "Test Clinic";
  		delete $scope.patient.passwordC;

  		var userName = $scope.patient.username;
		UserService.checkUser(userName).success(function(data) {
			if(data.status == "success"){
				console.log(JSON.stringify($scope.patient));
				UserService.signUpUser(JSON.stringify($scope.patient)).success(function(data) {
					if(data.status == "success"){
						var user = {};
						user.username = data.data.username;
						user.password = data.data.password;
						console.log(user);
						UserService.logInUser(user).success(function(data) {
							if(data.status == "success"){
								window.localStorage['ACCESS_TOKEN'] = data.access_token;
								window.localStorage['USER_DATA'] = JSON.stringify(data.data);
								var userData = JSON.parse(window.localStorage['USER_DATA']);
								var inputdata = {};
								inputdata.id = userData._id;
								inputdata.device_id = window.localStorage["device_id"];
								inputdata.platform_type = window.localStorage['PLATFORM'];
								UserService.saveDeviceId(inputdata).success(function(data, status) {
									console.log(data);
									if(data.status == "success"){
										console.log(userData.user_type);
										if(userData.user_type == 4){
											var userId = userData._id;
											UserService.findPatientByCaregiver(userId).success(function(data, status) {
												console.log(data);
												$ionicLoading.hide();
												if(data.data){
													window.localStorage['CAREGIVER_USER_DATA'] = JSON.stringify(data.data);
													console.log(window.localStorage["NOTIFICATION_SETTING"]);
													if(window.localStorage["NOTIFICATION_SETTING"]  == undefined){
														$state.go("settings");	
													}else{
														$state.go("tabs.assessment");	
													}
												}else{
													$state.go("noPatientAssigned");
												}
											});
										}else{
											console.log(window.localStorage["NOTIFICATION_SETTING"]);
											if(window.localStorage["NOTIFICATION_SETTING"]  == undefined){
												$state.go("settings");	
											}else{
												$state.go("tabs.assessment");	
											}	
										}
									}
								});
							}else{
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
					}else{
						console.log(data.message);
						var str = data.message;
    					var res = str.split(",");
    					var PARENT_ID_SERVER_ERROR = res[0].includes("parentCast to ObjectID failed for value");
    					if(res[0] && res[1]){
    						var errorMsg = EMAIL_ERROR;
    					}else if(PARENT_ID_SERVER_ERROR && res[1] == undefined){
    						var errorMsg = PARENT_ID_ERROR;
    					}else if(res[0] == EMAIL_SERVER_ERROR && res[1] == undefined){
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
					if(status == 401 || status == -1){
						showConfirm(animation);
						var alertPopup = $ionicPopup.alert({
						title: 'Error!',
						   template: LOGIN_ERROR,
						});
						alertPopup.then(function(res) {});
					}
				});
			}else{
				$ionicLoading.hide();
				showConfirm(animation);
				var alertPopup = $ionicPopup.alert({
			     	title: 'Error!',
			     	template: USER_NAME_ERROR,
			   	});
			   	alertPopup.then(function(res) {});
			}
		});
  	}

  	// Capitalize first letter
 //  	function capitalizeFirstLetter(string) {
	//     return string.charAt(0).toUpperCase() + string.slice(1);
	// }
	// animate pop up dailog
	function showConfirm(animation) {
      	$timeout(function(){
        var popupElements = document.getElementsByClassName("popup-container");
        if (popupElements.length) {
          var popupElement = angular.element(popupElements[0]);
            popupElement.addClass('animated')
            popupElement.addClass(animation)
          };
      	}, 1)
    }
})

.controller('SignInController', function ($scope, $timeout, $ionicHistory, ionicMaterialInk, $ionicPopup, $ionicLoading, $state, UserService){
	ionicMaterialInk.displayEffect();
	window.localStorage['ACCESS_TOKEN'] = "";
	window.localStorage['USER_DATA'] = "";
	window.localStorage['CAREGIVER_USER_DATA'] = "";
	$scope.user = {};

	var animation = 'bounceInDown';
	$scope.signIn = function(user){
		$ionicLoading.show({
		    content: 'Loading',
		    animation: 'fade-in',
		    showBackdrop: true,
		    maxWidth: 200,
		    showDelay: 0
		});
		UserService.logInUser(user).success(function(data) {
			console.log(data);
			$ionicLoading.hide();
			//return;
			if(data.status == "success"){
				// Check User Status Active or Inactive
				if(data.data.is_status == true){
					window.localStorage['ACCESS_TOKEN'] = data.access_token;
					window.localStorage['USER_DATA'] = JSON.stringify(data.data);
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
						if(data.status == "success"){
							if(userData.user_type == 4){
								var userId = userData._id;
								$ionicLoading.show({
								    content: 'Loading',
								    animation: 'fade-in',
								    showBackdrop: true,
								    maxWidth: 200,
								    showDelay: 0
								});
								UserService.findPatientByCaregiver(userId).success(function(data, status) {
									console.log(data);
									$ionicLoading.hide();
									if(data.data){
										window.localStorage['CAREGIVER_USER_DATA'] = JSON.stringify(data.data);
										console.log(window.localStorage["NOTIFICATION_SETTING"]);
										if(window.localStorage["NOTIFICATION_SETTING"]  == undefined){
											$state.go("settings");	
										}else{
											$state.go("tabs.assessment");	
										}
									}else{
										$state.go("noPatientAssigned");
									}
								});
							}else{
								console.log(window.localStorage["NOTIFICATION_SETTING"]);
								if(window.localStorage["NOTIFICATION_SETTING"] == undefined){
									$state.go("settings");	
								}else{
									$state.go("tabs.assessment");	
								}
							}
						}
					});
				}else{
					showConfirm(animation);
					var alertPopup = $ionicPopup.alert({
					title: 'Error!',
					   template: LOGIN_STATUS_ERROR,
					});
					alertPopup.then(function(res) {
						$state.go("signin");
					});
				}
			}else{
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
			if(status == 401 || status == -1){
				showConfirm(animation);
				var alertPopup = $ionicPopup.alert({
				title: 'Error!',
				   template: LOGIN_ERROR,
				});
				alertPopup.then(function(res) {});
			}
		});
	};
		
	$scope.goBackToSignUp = function(){
		$ionicHistory.goBack();
	}
	// animate pop up dailog
	function showConfirm(animation) {
      	$timeout(function(){
        var popupElements = document.getElementsByClassName("popup-container")
        if (popupElements.length) {
          var popupElement = angular.element(popupElements[0]);
            popupElement.addClass('animated')
            popupElement.addClass(animation)
          };
      	}, 1)
    }
})

.controller('ForgotPasswordController', function ($scope,ionicMaterialInk, $state, UserService, $ionicHistory){
	ionicMaterialInk.displayEffect();

	$scope.forgotPassword = function(user){
		console.log(user);
		$state.go("signin");
	}

	$scope.goBackToSignIn = function(){
		$ionicHistory.goBack();
	}
})

.controller('settingsCtrl', function ($scope, $state, $cordovaToast, $ionicHistory, $stateParams, $cordovaLocalNotification, ionicTimePicker){
	if(window.localStorage["NOTIFICATION_SETTING"] == undefined){
		$scope.hideBackButton = true;
	}else{
		$scope.hideBackButton = false;
	}
	var currentDate = new Date();
	var weekday = new Array(7);
		weekday[0]=  "Sunday";
		weekday[1] = "Monday";
		weekday[2] = "Tuesday";
		weekday[3] = "Wednesday";
		weekday[4] = "Thursday";
		weekday[5] = "Friday";
		weekday[6] = "Saturday";
	var n;
	$scope.dayOfWeek = [
	   	{
	      "id": 0,
	      "day": "Sunday"
	    },
	    {
	      "id": 1,
	      "day": "Monday"
	    },
	    {
	      "id": 2,
	      "day": "Tuesday"
	    },
	    {
	      "id": 3,
	      "day": "Wednesday"
	    },
	    {
	      "id": 4,
	      "day": "Thursday"
	    },
	    {
	      "id": 5,
	      "day": "Friday"
	    },
	    {
	      "id": 6,
	      "day": "Saturday"
	    }
	];
	if(window.localStorage['CUSTOM_REMINDER'] == undefined){
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
		if(n == $scope.selectedDay.day){
			console.log("If day is Sunday.");
			currentDate.setHours(12);
			currentDate.setMinutes(0);
			currentDate.setSeconds(0);
			$scope.dateTimeForWeeklyReminder = currentDate;
		}else{
			console.log("If day is not Sunday.");
			if(n == "Monday"){
				currentDate.setDate(currentDate.getDate() + 6);
			}else if(n == "Tuesday"){
				currentDate.setDate(currentDate.getDate() + 5);
			}else if(n == "Wednesday"){
				currentDate.setDate(currentDate.getDate() + 4);
			}else if(n == "Thursday"){
				currentDate.setDate(currentDate.getDate() + 3);
			}else if(n == "Friday"){
				currentDate.setDate(currentDate.getDate() + 2);
			}else if(n == "Saturday"){
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
		minutes = minutes < 10 ? '0'+minutes : minutes;

		var timeString = hours + ":" + minutes + " " + ampm;
		$scope.selectedtimeString = timeString;
		$scope.weeklyReminderDayTime = $scope.dataDay + ", " + $scope.selectedtimeString;
		$scope.selectedTime = $scope.selectedtimeString;
		window.localStorage['WEEKLY_REMINDER_TIME'] = $scope.weeklyReminderDayTime;
		window.localStorage['TIME_FOR_WEEKLY_REMINDER'] = $scope.selectedTime;
		window.localStorage['WEEKLY_REMINDER_TIME_SAVE'] = $scope.dateTimeForWeeklyReminder;
	}else{
		$scope.today_at_9_pm = window.localStorage['DAILY_REMINDER_TIME'];
		$scope.dateTimeForWeeklyReminder= window.localStorage['WEEKLY_REMINDER_TIME_SAVE'];
		console.log(window.localStorage['TIME_FOR_WEEKLY_REMINDER']);
		console.log(window.localStorage['WEEKLY_REMINDER_TIME']);
		$scope.reminderTime = window.localStorage['REMINDER_TIME'];
		if(window.localStorage['WEEKLY_REMINDER_TIME']){
			var day = window.localStorage['WEEKLY_REMINDER_TIME'];
			var dayToSet = day.split(',');
			var newDay = dayToSet[0];
			if(newDay == "Sunday"){
				$scope.selectedDay = $scope.dayOfWeek[0];
			}else if(newDay == "Monday"){
				$scope.selectedDay = $scope.dayOfWeek[1];
			}else if(newDay == "Tuesday"){
				$scope.selectedDay = $scope.dayOfWeek[2];
			}else if(newDay == "Wednesday"){
				$scope.selectedDay = $scope.dayOfWeek[3];
			}else if(newDay == "Thursday"){
				$scope.selectedDay = $scope.dayOfWeek[4];
			}else if(newDay == "Friday"){
				$scope.selectedDay = $scope.dayOfWeek[5];
			}else if(newDay == "Saturday"){
				$scope.selectedDay = $scope.dayOfWeek[6];
			}
		}
		$scope.weeklyReminderDayTime = window.localStorage['WEEKLY_REMINDER_TIME'];
		$scope.selectedTime = window.localStorage['TIME_FOR_WEEKLY_REMINDER'];
	}
	
	$scope.editDailyReminder = function(){
		var ipObj1 = {
		    callback: function (val) {      //Mandatory
		      if (typeof (val) === 'undefined') {
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
			    if(d2.getTime() > d.getTime()){
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
				minutes = minutes < 10 ? '0'+minutes : minutes;
				var timeString = hours + ":" + minutes + " " + ampm;
				$scope.reminderTime = timeString;
				window.localStorage['REMINDER_TIME'] = timeString;
		      }
		    },
		    inputTime: 50400,   //Optional
		    format: 12,         //Optional
		    step: 1,           //Optional
		    setLabel: 'Set'    //Optional
		};

		ionicTimePicker.openTimePicker(ipObj1);
	}

	// Weekly goals Settings
	
	$scope.selectedDayValue = function(data){
		$scope.dataDay = data.day;
		if($scope.selectedtimeString == undefined){
			$scope.weeklyReminderDayTime = data.day + ", 12:00 PM";
		}else{
			$scope.weeklyReminderDayTime = data.day + ", " + $scope.selectedtimeString;
			$scope.selectedTime = $scope.selectedtimeString;
		}
		if(n == data.day){
			console.log("If Current day, repeat alarm on same day from next week");
			var d = new Date();
			console.log($scope.TimeSelected);
			if($scope.TimeSelected == false){
				d.setDate(d.getDate() + 7);
				d.setHours(12);
				d.setMinutes(0);
				d.setSeconds(0);
			}else{
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
			minutes = minutes < 10 ? '0'+minutes : minutes;

			var timeString = hours + ":" + minutes + " " + ampm;
			$scope.selectedtimeString = timeString;
			$scope.weeklyReminderDayTime = $scope.dataDay + ", " + $scope.selectedtimeString;
			$scope.selectedTime = $scope.selectedtimeString;
			window.localStorage['WEEKLY_REMINDER_TIME_SAVE'] = $scope.dateTimeForWeeklyReminder;
			window.localStorage['WEEKLY_REMINDER_TIME'] = $scope.weeklyReminderDayTime;
			window.localStorage['TIME_FOR_WEEKLY_REMINDER'] = $scope.selectedTime;
		}else{
			var newDate = new Date();
			if($scope.TimeSelected == false){
				newDate.setHours(12);
				newDate.setMinutes(0);
				newDate.setSeconds(0);
				n = weekday[newDate.getDay()];
				matchDay(newDate, n);
			}else{
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
		if(n == "Monday" && $scope.dataDay == "Tuesday"){
			newDate.setDate(newDate.getDate() + 1);
		}else if(n == "Monday" && $scope.dataDay == "Wednesday"){
			newDate.setDate(newDate.getDate() + 2);
		}else if(n == "Monday" && $scope.dataDay == "Thursday"){
			newDate.setDate(newDate.getDate() + 3);
		}else if(n == "Monday" && $scope.dataDay == "Friday"){
			newDate.setDate(newDate.getDate() + 4);
		}else if(n == "Monday" && $scope.dataDay == "Saturday"){
			newDate.setDate(newDate.getDate() + 5);
		}else if(n == "Monday" && $scope.dataDay == "Sunday"){
			newDate.setDate(newDate.getDate() + 6);
		}else if(n == "Tuesday" && $scope.dataDay == "Wednesday"){
			newDate.setDate(newDate.getDate() + 1);
		}else if(n == "Tuesday" && $scope.dataDay == "Thursday"){
			newDate.setDate(newDate.getDate() + 2);
		}else if(n == "Tuesday" && $scope.dataDay == "Friday"){
			newDate.setDate(newDate.getDate() + 3);
		}else if(n == "Tuesday" && $scope.dataDay == "Saturday"){
			newDate.setDate(newDate.getDate() + 4);
		}else if(n == "Tuesday" && $scope.dataDay == "Sunday"){
			newDate.setDate(newDate.getDate() + 5);
		}else if(n == "Tuesday" && $scope.dataDay == "Monday"){
			newDate.setDate(newDate.getDate() + 6);
		}else if(n == "Wednesday" && $scope.dataDay == "Thursday"){
			newDate.setDate(newDate.getDate() + 1);
		}else if(n == "Wednesday" && $scope.dataDay == "Friday"){
			newDate.setDate(newDate.getDate() + 2);
		}else if(n == "Wednesday" && $scope.dataDay == "Saturday"){
			newDate.setDate(newDate.getDate() + 3);
		}else if(n == "Wednesday" && $scope.dataDay == "Sunday"){
			newDate.setDate(newDate.getDate() + 4);
		}else if(n == "Wednesday" && $scope.dataDay == "Monday"){
			newDate.setDate(newDate.getDate() + 5);
		}else if(n == "Wednesday" && $scope.dataDay == "Tuesday"){
			newDate.setDate(newDate.getDate() + 6);
		}else if(n == "Thursday" && $scope.dataDay == "Friday"){
			newDate.setDate(newDate.getDate() + 1);
		}else if(n == "Thursday" && $scope.dataDay == "Saturday"){
			newDate.setDate(newDate.getDate() + 2);
		}else if(n == "Thursday" && $scope.dataDay == "Sunday"){
			newDate.setDate(newDate.getDate() + 3);
		}else if(n == "Thursday" && $scope.dataDay == "Monday"){
			newDate.setDate(newDate.getDate() + 4);
		}else if(n == "Thursday" && $scope.dataDay == "Tuesday"){
			newDate.setDate(newDate.getDate() + 5);
		}else if(n == "Thursday" && $scope.dataDay == "Wednesday"){
			newDate.setDate(newDate.getDate() + 6);
		}else if(n == "Friday" && $scope.dataDay == "Saturday"){
			newDate.setDate(newDate.getDate() + 1);
		}else if(n == "Friday" && $scope.dataDay == "Sunday"){
			newDate.setDate(newDate.getDate() + 2);
		}else if(n == "Friday" && $scope.dataDay == "Monday"){
			newDate.setDate(newDate.getDate() + 3);
		}else if(n == "Friday" && $scope.dataDay == "Tuesday"){
			newDate.setDate(newDate.getDate() + 4);
		}else if(n == "Friday" && $scope.dataDay == "Wednesday"){
			newDate.setDate(newDate.getDate() + 5);
		}else if(n == "Friday" && $scope.dataDay == "Thursday"){
			newDate.setDate(newDate.getDate() + 6);
		}else if(n == "Saturday" && $scope.dataDay == "Sunday"){
			newDate.setDate(newDate.getDate() + 1);
		}else if(n == "Saturday" && $scope.dataDay == "Monday"){
			newDate.setDate(newDate.getDate() + 2);
		}else if(n == "Saturday" && $scope.dataDay == "Tuesday"){
			newDate.setDate(newDate.getDate() + 3);
		}else if(n == "Saturday" && $scope.dataDay == "Wednesday"){
			newDate.setDate(newDate.getDate() + 4);
		}else if(n == "Saturday" && $scope.dataDay == "Thursday"){
			newDate.setDate(newDate.getDate() + 5);
		}else if(n == "Saturday" && $scope.dataDay == "Friday"){
			newDate.setDate(newDate.getDate() + 6);
		}else if(n == "Sunday" && $scope.dataDay == "Monday"){
			newDate.setDate(newDate.getDate() + 1);
		}else if(n == "Sunday" && $scope.dataDay == "Tuesday"){
			newDate.setDate(newDate.getDate() + 2);
		}else if(n == "Sunday" && $scope.dataDay == "Wednesday"){
			newDate.setDate(newDate.getDate() + 3);
		}else if(n == "Sunday" && $scope.dataDay == "Thursday"){
			newDate.setDate(newDate.getDate() + 4);
		}else if(n == "Sunday" && $scope.dataDay == "Friday"){
			newDate.setDate(newDate.getDate() + 5);
		}else if(n == "Sunday" && $scope.dataDay == "Saturday"){
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
		minutes = minutes < 10 ? '0'+minutes : minutes;

		var timeString = hours + ":" + minutes + " " + ampm;
		$scope.selectedtimeString = timeString;
		$scope.weeklyReminderDayTime = $scope.dataDay + ", " + $scope.selectedtimeString;
		$scope.selectedTime = $scope.selectedtimeString;
		window.localStorage['WEEKLY_REMINDER_TIME_SAVE'] = $scope.dateTimeForWeeklyReminder;
		window.localStorage['WEEKLY_REMINDER_TIME'] = $scope.weeklyReminderDayTime;
		window.localStorage['WEEKLY_REMINDER_TIME_SAVE'] = $scope.dateTimeForWeeklyReminder;
	}
	$scope.editWeeklyReminderTime = function(){
		var ipObj1 = {
		    callback: function (val) {      //Mandatory
		      if (typeof (val) === 'undefined') {
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
				minutes = minutes < 10 ? '0'+minutes : minutes;

				var timeString = hours + ":" + minutes + " " + ampm;
				$scope.selectedtimeString = timeString;
				$scope.weeklyReminderDayTime = $scope.dataDay + ", " + $scope.selectedtimeString;
				$scope.selectedTime = $scope.selectedtimeString;
				window.localStorage['WEEKLY_REMINDER_TIME'] = $scope.weeklyReminderDayTime;
				window.localStorage['TIME_FOR_WEEKLY_REMINDER'] = $scope.selectedTime;
		      }
		    },
		    inputTime: 50400,   //Optional
		    format: 12,         //Optional
		    step: 1,           //Optional
		    setLabel: 'Set'    //Optional
		};

		ionicTimePicker.openTimePicker(ipObj1);
	}

	function setReminder(timeForReminder){
		document.addEventListener('deviceready', function () {
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

	function setWeeklyGoalReminder(timeForReminder){
		document.addEventListener('deviceready', function () {
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


	$scope.saveReminder = function(){
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
		  }, function (error) {
		    // error
		});

		if($stateParams.pageId == 1){
			$state.go("tabs.assessment");
		}else if($stateParams.pageId == 2){
			$state.go("tabs.goals");
		}else if($stateParams.pageId == 3){	
			$state.go("tabs.checkIn");
		}else if($stateParams.pageId == 4){
			$state.go("tabs.stateOfMind");
		}else if($stateParams.pageId == 5){
			$state.go("tabs.emergencyCall");
		}else{
			$state.go("tabs.assessment");
		}
	}

	$scope.goBackToback = function(){
		if($stateParams.pageId == 1){
			$state.go("tabs.assessment");
		}else if($stateParams.pageId == 2){
			$state.go("tabs.goals");
		}else if($stateParams.pageId == 3){	
			$state.go("tabs.checkIn");
		}else if($stateParams.pageId == 4){
			$state.go("tabs.stateOfMind");
		}else if($stateParams.pageId == 5){
			$state.go("tabs.emergencyCall");
		}
	}

})

.controller('assessmentCtrl', function ($state, $scope,ionicMaterialInk, $cordovaToast, $stateParams, $ionicModal, UserService, AssessmentService, $ionicLoading, $timeout, $ionicPopup){
	ionicMaterialInk.displayEffect();
	var userData = JSON.parse(window.localStorage['USER_DATA']);
	var user = {};
	user.username = userData.username;
	user.password = userData.password;
	UserService.logInUser(user).success(function(data) {
		if(data.status == "success"){
			// Check User Status Active or Inactive
			if(data.data.is_status == true){
				window.localStorage['ACCESS_TOKEN'] = data.access_token;
				window.localStorage['USER_DATA'] = JSON.stringify(data.data);
				var userData = JSON.parse(window.localStorage['USER_DATA']);
			}else{
				showConfirm(animation);
				var alertPopup = $ionicPopup.alert({
				title: 'Error!',
				   template: LOGIN_STATUS_ERROR,
				});
				alertPopup.then(function(res) {
					$state.go("signin");
				});
			}
		}else{
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
		if(status == 401 || status == -1){
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
	if(window.localStorage['CAREGIVER_USER_DATA']){
		caregiverUserData = JSON.parse(window.localStorage['CAREGIVER_USER_DATA']);
		$scope.patient_name = "(" + caregiverUserData.first_name + " " + caregiverUserData.last_name + ")";
	}
	$scope.noAssessmentInDB = false;
	$scope.assessmentDiv = true;
	$scope.showCompleteBtn = false;
	$scope.noDataMessage = ASSESSMENT_SUBMITTED_MESSAGE;
	$scope.noAssessmentMessage = NO_ASSESSMENT_MESSAGE;
	var userId = {};
	userId.user = userData._id;
	$scope.getAssessmentdata = function(){
		$ionicLoading.show({
		    content: 'Loading',
		    animation: 'fade-in',
		    showBackdrop: true,
		    maxWidth: 200,
		    showDelay: 0
		});
		var dataJSON = {};
		if(userData.user_type == 3){
			dataJSON.question_for = 1;
		}else if(userData.user_type == 4){
			dataJSON.question_for = 2;
		}
		console.log(userData.next_assessment_available);
		if(userData.next_assessment_available){
			var date = new Date(userData.next_assessment_date);
			var today = new Date();
			today.setHours(0,0,0,0);
			console.log(date);
			console.log(today);
			if(date.valueOf() <= today.valueOf()){
				console.log("Next Assessment Exist. Show next assessment Questions");
				AssessmentService.getBasicAssessment(dataJSON).success(function(response) {
					$ionicLoading.hide();
					if(response.data.length == 0){
						$scope.showCompleteBtn = false;
						$scope.noAssessmentInDB = true;
					}else{
						$scope.showCompleteBtn = true;
						$scope.showNoDataDiv = false;
						$scope.questions  = response.data;
					}	
				})
			}else if(date.valueOf() > today.valueOf()){
				$ionicLoading.hide();
				console.log("Future Date");
				var nextAssessmentDate = userData.next_assessment_date;
				var d = new Date(nextAssessmentDate);
				var nextAssmentDate = formatDate(d);
				$scope.showCompleteBtn = false;
				$scope.nextAssessmentDiv = true
				$scope.nextAssessmentMessage = "Your next assessment will be available on " + nextAssmentDate + " .";
			}
		}else{
			console.log("Next Assessment Not Exist. Check if basic assessment done or not.");
			AssessmentService.findBasicAssessment(userId).success(function(response) {
				$ionicLoading.hide();
				if(response.data){
					console.log("Basic Assessment Already Done.");
					$scope.showNoDataDiv = true;
				}else{
					$ionicLoading.show({
					    content: 'Loading',
					    animation: 'fade-in',
					    showBackdrop: true,
					    maxWidth: 200,
					    showDelay: 0
					});
					AssessmentService.getBasicAssessment(dataJSON).success(function(response) {
						$ionicLoading.hide();
						if(response.data.length == 0){
							console.log("No Assessment exist in DB.");
							$scope.showCompleteBtn = false;
							$scope.noAssessmentInDB = true;
						}else{
							console.log("Show basic assessment to user.");
							$scope.showCompleteBtn = true;
							$scope.showNoDataDiv = false;
							$scope.questions  = response.data;
						}
						
					})
				}
			});
		}
	}


	// Format date 
	function formatDate(date) {
	  var weekday = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
      var day = weekday[date.getDay()];
	  var month = date.getMonth()+1;
	  var dateday = date.getDate();
	  month = month < 10 ? '0'+month : month;
	  dateday = dateday < 10 ? '0'+dateday : dateday;
	  var dateReturn =  dateday + "/" + month + "/" + date.getFullYear();
	  return  day + " " + dateReturn;
	}

	// Create the login modal that we will use later
	  $ionicModal.fromTemplateUrl('templates/assessmentModal.html', {
	    scope: $scope
	  }).then(function(modal) {
	    $scope.modal = modal;
	  });

	  // Open the Follow Up Modal modal
	  $scope.openModal = function(disease_id) {
	  	$scope.diseaseId = disease_id;
	    $scope.modal.show();
	  };

	$scope.showDiv = false;
	$scope.mainObject = {};
	$scope.GetValue = function(question_id, question_type, disease_id, disease_name, question_text, answer_data){
		//console.log(question_id, question_type, disease_id, disease_name, question_text, answer_data);
		if(answer_data){
			if(answer_data.answer_value == 2 || answer_data.answer_value == 3){
				console.log("here");
				if($scope.answeredAlready != disease_id){
					$scope.openModal(disease_id);
				}else{
					console.log("here");
				}	
			}
		}else{
			console.log("No Answer Data");
		}
		
		if(answer_data){
			$scope.mainObject[question_id] = {
				'disease' : disease_id,
				'question':question_id,
				'question_type' : question_type,
				'disease_name' : disease_name,
				'question_text':question_text,
				'answer_score':answer_data.answer_value,
				'answer_text':answer_data.answer_text
			}

			window.localStorage['ANSWERS'] = JSON.stringify($scope.mainObject);
		}
		
		if(window.localStorage['ANSWERS']){
	    	$scope.showUpdateBtn = true;
	    }
	}

	$scope.GetModalSelectValue = function(question_id, question_type, disease_id, disease_name, question_text, answer_data){
		//console.log(question_id, disease_id, question_text, answer_data);
		$scope.disease_id_to_pass = disease_id;
		$scope.mainObject[question_id] = {
			'disease' : disease_id,
			'question':question_id,
			'question_type' : question_type,
			'disease_name' : disease_name,
			'question_text':question_text,
			'answer_score':answer_data.answer_value,
			'answer_text':answer_data.answer_text
		}

		window.localStorage['ANSWERS'] = JSON.stringify($scope.mainObject);
		//console.log(JSON.parse(window.localStorage['ANSWERS']));
	}



	$scope.SaveModalAnswers = function () {
		// Answer are saved in local storage Just Close the modal on save button
		$scope.answeredAlready = $scope.disease_id_to_pass;
		$scope.modal.hide();
		$cordovaToast.showLongCenter('Your assessment answers are saved.').then(function(success) {
				    // success
		  }, function (error) {
		    // error
		});
	}
	$scope.completeAssessment = function(){
		$scope.sendAnswers = {};
		$scope.sendAnswers.user = userData._id;
		$scope.sendAnswers.user_type = userData.user_type;
		$scope.sendAnswers.clinic = userData.parent;
		$scope.sendAnswers.answers =[];
		if(caregiverUserData){
			$scope.sendAnswers.patient = caregiverUserData._id;
		}else{
			$scope.sendAnswers.patient = userData._id;
		}
		$scope.answersObject = JSON.parse(window.localStorage['ANSWERS']);
		for( var i in $scope.answersObject ) {
		    if ($scope.answersObject.hasOwnProperty(i)){
		       $scope.sendAnswers.answers.push($scope.answersObject[i]);
		    }
		}

		console.log(JSON.stringify($scope.sendAnswers));
		$ionicLoading.show({
		    content: 'Loading',
		    animation: 'fade-in',
		    showBackdrop: true,
		    maxWidth: 200,
		    showDelay: 0
		});
		AssessmentService.saveBasicAssessment($scope.sendAnswers).success(function(response) {
			console.log(response);
			$ionicLoading.hide();
			if(response.messageId == 200){
				$scope.showConfirm();
				var alertPopup = $ionicPopup.alert({
					title: 'Success!',
		            template: "Your assessment answers are saved."
				});
				alertPopup.then(function(res) {
					$scope.showNoDataDiv = true;
	            	$scope.showCompleteBtn = false;
	            	$scope.showUpdateBtn = false;
	            	$scope.assessmentDiv = false;

	            	// Update Assessment Done Flag
	            	var user_id = userData._id
	            	var inputdata = {};
	            	inputdata.next_assessment_available = false;
	            	UserService.updateProfile(user_id, inputdata).success(function(data, status) {
						console.log(data);
						if(data.status == "success"){
							console.log("Here");
						}
					});
        		});
			}else{
				$scope.showConfirm();
		        var confirmPopup = $ionicPopup.confirm({
		            title: 'Warning!',
		            template: "Sorry. Something went wrong."
		        });
				confirmPopup.then(function(res) {
        		});
			}
		});
	}

	$scope.showConfirm = function() {
    	var animation = 'bounceInDown';
        $timeout(function(){
        var popupElements = document.getElementsByClassName("popup-container");
        if (popupElements.length) {
          var popupElement = angular.element(popupElements[0]);
            popupElement.addClass('animated')
            popupElement.addClass(animation)
          };
      	}, 1)
    }

    $scope.showUpdateBtn = false;
    //$scope.updateMessage = "Saved";
    //$scope.updateAssessmentSpan = false;
    // Update Assessment
	$scope.updateAssessment = function(){	
		if(window.localStorage['ANSWERS']){
			console.log($scope.intervalStatus);
			if($scope.intervalStatus){
				console.log("Show saved message.");
				//console.log($scope.updateAssessmentSpan);
				//$scope.updateAssessmentSpan = true;
				if($state.current.name == "tabs.assessment"){
					$cordovaToast.showLongCenter('Your assessment answers are saved.').then(function(success) {
				    	// success
					  }, function (error) {
					    // error
					});
				}else{
					console.log("Don't Display Toast");
				}
				//$scope.$apply();
				// setTimeout(function(){
				// 	console.log("Here");
				// 	//$scope.updateAssessmentSpan = false;
				// 	$scope.intervalStatus = false;
				// 	$scope.$apply();
				// }, 3000); 	
			}else{
				console.log("Show Update PopUp.");
				$scope.showConfirm();
				var alertPopup = $ionicPopup.alert({
					title: 'Success!',
		            template: "Your assessment answers are updated."
				});
				alertPopup.then(function(res){});
			}
		}else{
			console.log("Nothing to Update");
		}
	}

	// Update Assessment After Every 2 minutes
	setInterval(function(){
		$scope.intervalStatus = true;
		$scope.updateAssessment();
	},120000);
})

.controller('goalsCtrl', function ($scope, $ionicLoading, $stateParams, GoalService, UserService){
	var userData = JSON.parse(window.localStorage['USER_DATA']);
	var user = {};
	user.username = userData.username;
	user.password = userData.password;
	
	UserService.logInUser(user).success(function(data) {
		if(data.status == "success"){
			// Check User Status Active or Inactive
			if(data.data.is_status == true){
				window.localStorage['ACCESS_TOKEN'] = data.access_token;
				window.localStorage['USER_DATA'] = JSON.stringify(data.data);
				var userData = JSON.parse(window.localStorage['USER_DATA']);
			}else{
				showConfirm(animation);
				var alertPopup = $ionicPopup.alert({
				title: 'Error!',
				   template: LOGIN_STATUS_ERROR,
				});
				alertPopup.then(function(res) {
					$state.go("signin");
				});
			}
		}else{
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
		if(status == 401 || status == -1){
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
	if(window.localStorage['CAREGIVER_USER_DATA']){
		caregiverUserData = JSON.parse(window.localStorage['CAREGIVER_USER_DATA']);
		$scope.patient_name = "(" + caregiverUserData.first_name + " " + caregiverUserData.last_name + ")";
	}
	// Set User Type in Mid-Terms Goals
	if(userData.user_type == 3){
		$scope.User_Type = "Patient";
	}else if(userData.user_type == 4){
		$scope.User_Type = "Caregiver";
	}
	$scope.noDataMessage = NO_DATA;
	$scope.patientGoals = function(){
		$ionicLoading.show({
		    content: 'Loading',
		    animation: 'fade-in',
		    showBackdrop: true,
		    maxWidth: 200,
		    showDelay: 0
		});
		var dataJSON = {
			"patient" : userData._id
		}
		GoalService.getPatientGoal(dataJSON).success(function(response) {
			$ionicLoading.hide();
			if(response.data.length == 0){
				$scope.showGoalDiv = false;
				$scope.showNoDataDiv = true;
			}else{
				$scope.showGoalDiv = true;
				$scope.showNoDataDiv = false;
				$scope.showNextSession = false;
				$scope.showMidTerm = false;
				$scope.showTherapy = false;
				for(var i = 0; i < response.data.length; i++){
					if(response.data[i].goal_type_id == 1){
						$scope.showNextSession = true;
					}
					if(response.data[i].goal_type_id == 2){
						$scope.showMidTerm = true;
					}
					if(response.data[i].goal_type_id == 3){
						$scope.showTherapy = true;
					}
				}
				$scope.goalData = response.data;
			}
		});
	}
})

.controller('checkInCtrl', function ($scope, $ionicLoading, $stateParams, ionicMaterialInk, GoalService, UserService, CheckInService, $timeout, $ionicPopup){
	ionicMaterialInk.displayEffect();

	var userData = JSON.parse(window.localStorage['USER_DATA']);
	var user = {};
	user.username = userData.username;
	user.password = userData.password;
	
	UserService.logInUser(user).success(function(data) {
		if(data.status == "success"){
			// Check User Status Active or Inactive
			if(data.data.is_status == true){
				window.localStorage['ACCESS_TOKEN'] = data.access_token;
				window.localStorage['USER_DATA'] = JSON.stringify(data.data);
				var userData = JSON.parse(window.localStorage['USER_DATA']);
			}else{
				showConfirm(animation);
				var alertPopup = $ionicPopup.alert({
				title: 'Error!',
				   template: LOGIN_STATUS_ERROR,
				});
				alertPopup.then(function(res) {
					$state.go("signin");
				});
			}
		}else{
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
		if(status == 401 || status == -1){
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
	var date = mm + '/' + dd + '/' + yyyy;
	var dataJSON = {};
	dataJSON.patient = userData._id;

	$scope.findPatientCheckIn = {};
	$scope.findPatientCheckIn.patient = userData._id;
	$scope.findPatientCheckIn.checkin_date = date;

	$scope.generalQuestionCheckIn = [{
	      "id": 1,
	      "title": "Alcohol/drugs?",
	      "is_enable" : false,
	      "checked" : false
	    },
	    {
	      "id": 2,
	      "title": "Exercise?",
	      "is_enable" : false,
	      "checked" : false
	    },
	    {
	      "id": 3,
	      "title": "Caffeine?",
	      "is_enable" : false,
	      "checked" : false
	    }];

	$scope.staticQuestions = [{
			"id" : "1",
			"title" : "Good Mood?",
			"rating" : 0
		},
		{
			"id" : "2",
			"title" : "Good Energy?",
			"rating" : 0
		},
		{
			"id" : "3",
			"title" : "Low Stress?",
			"rating" : 0
		},
		{
			"id" : "4",
			"title" : "Good Sleep?",
			"rating" : 0
		},
		{
			"id" : "5",
			"title" : "Eating Healthy?",
			"rating" : 0
		}];

	// Check in Init Function
	$scope.checkInDataGet = function(){
		$ionicLoading.show({
		    content: 'Loading',
		    animation: 'fade-in',
		    showBackdrop: true,
		    maxWidth: 200,
		    showDelay: 0
		});
		$scope.dailyMetricData = [];
		$scope.weeklyMetricData = []
		$scope.weekly_Metric_Data = {};
		$scope.daily_metric_data = {};
		GoalService.getPatientGoal(dataJSON).success(function(response) {
			if(response.messageId == 200) {
				if(response.data.length == 0){
					$scope.nodata = true;
				}else{
					$scope.generalMetricAvailable = true;
					$scope.staticMetricAvailable = true;
					$scope.updateButton = true;
					$scope.checkInData = response.data;
					for(var i = 0; i < response.data.length; i++){
						$scope.checkInData = response.data;
						if(response.data[i].goal_type_id == 1){
							$scope.dailyMetricAvailable = true;
							$scope.daily_metric_data[i] = {
								"goal" :  $scope.checkInData[i]._id,
								"goal_question": $scope.checkInData[i].goal_question,
								"checked" : false
							}
						}
						if(response.data[i].goal_type_id == 2){
							$scope.weeklyMetricAvailable = true;
							$scope.weekly_Metric_Data[i] = {
								"goal" :  $scope.checkInData[i]._id,
								"goal_question": $scope.checkInData[i].goal_question,
								"rating" : 0
							}
						}
					}
				}
				for( var i in $scope.daily_metric_data ) {
				    if ($scope.daily_metric_data.hasOwnProperty(i)){
				       $scope.dailyMetricData.push($scope.daily_metric_data[i]);
				    }
				}

				for( var i in $scope.weekly_Metric_Data ) {
				    if ($scope.weekly_Metric_Data.hasOwnProperty(i)){
				       $scope.weeklyMetricData.push($scope.weekly_Metric_Data[i]);
				    }
				}
				// Getting Patient General Questions
				$scope.getPatientGeneralQuestions();
			}

		});
	}

	$scope.getPatientGeneralQuestions = function(){
		CheckInService.listPatientGeneralQuestions(dataJSON).success(function(response) {
			if(response.messageId == 200) {
				if(response.data.length != 0){
					$scope.generalQuestionCheckIn = [
					   {
					      "id": 1,
					      "title": "Alcohol/drugs?",
					      "is_enable" : response.data[0].is_alcohal_drugs,
					      "checked" : false
					    },
					    {
					      "id": 2,
					      "title": "Exercise?",
					      "is_enable" : response.data[0].is_exercise,
					      "checked" : false
					    },
					    {
					      "id": 3,
					      "title": "Caffeine?",
					      "is_enable" : response.data[0].is_caffeine,
					      "checked" : false
					    }
					];
				}else{
					$scope.GeneralDataAvailable = false;
				}
				$scope.getPatientCheckInData();
			}
		});
	}

	$scope.getPatientCheckInData = function(){
		CheckInService.getPatientCheckIn($scope.findPatientCheckIn).success(function(response) {
			$ionicLoading.hide();
			if(response.messageId == 200) {
				if(response.data.length != 0){
					$scope.showCheckInData = false;
					$scope.hideCheckInData = true;
					$scope.alreadySubmiited = CHECK_IN_MESSAGE;
				}else{
					$scope.showCheckInData = true;
					$scope.hideCheckInData = false;
				}
			}else{
				console.log("Error.")
			}
		});
	}

	var inputJsonData = {};
	inputJsonData.static_metric = [];
	inputJsonData.weekly_metric = [];
	inputJsonData.daily_metric = [];
	inputJsonData.general_metric = [];

	$scope.saveCheckInData = function(){
		$ionicLoading.show({
		    content: 'Loading',
		    animation: 'fade-in',
		    showBackdrop: true,
		    maxWidth: 200,
		    showDelay: 0
		});
		inputJsonData.patient = userData._id;
	 	inputJsonData.checkin_date = date;

	 	for( var i in $scope.dailyMetricData ) {
		    if ($scope.dailyMetricData.hasOwnProperty(i)){
		       inputJsonData.daily_metric.push($scope.dailyMetricData[i]);
		    }
		}

		for( var i in $scope.weeklyMetricData ) {
		    if ($scope.weeklyMetricData.hasOwnProperty(i)){
		       inputJsonData.weekly_metric.push($scope.weeklyMetricData[i]);
		    }
		}


		for( var i in $scope.staticQuestions ) {
		    if ($scope.staticQuestions.hasOwnProperty(i)){
		       inputJsonData.static_metric.push($scope.staticQuestions[i]);
		    }
		}

		for( var i in $scope.generalQuestionCheckIn ) {
		    if ($scope.generalQuestionCheckIn.hasOwnProperty(i)){
		       inputJsonData.general_metric.push($scope.generalQuestionCheckIn[i]);
		    }
		}
		// Save check in on daily basis
		CheckInService.savePatientCheckIn(inputJsonData).success(function(response) {
			$ionicLoading.hide();
			if(response.messageId == 200) {
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
			}else{
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
      	$timeout(function(){
        var popupElements = document.getElementsByClassName("popup-container");
        if (popupElements.length) {
          var popupElement = angular.element(popupElements[0]);
            popupElement.addClass('animated')
            popupElement.addClass(animation)
          };
      	}, 1)
    }
})

.controller('stateOfMindCtrl', function ($scope, GoalService, $stateParams, UserService, CheckInService, $ionicLoading){
	var userData = JSON.parse(window.localStorage['USER_DATA']);
	var user = {};
	user.username = userData.username;
	user.password = userData.password;

	UserService.logInUser(user).success(function(data) {
		if(data.status == "success"){
			// Check User Status Active or Inactive
			if(data.data.is_status == true){
				window.localStorage['ACCESS_TOKEN'] = data.access_token;
				window.localStorage['USER_DATA'] = JSON.stringify(data.data);
				var userData = JSON.parse(window.localStorage['USER_DATA']);
			}else{
				showConfirm(animation);
				var alertPopup = $ionicPopup.alert({
				title: 'Error!',
				   template: LOGIN_STATUS_ERROR,
				});
				alertPopup.then(function(res) {
					$state.go("signin");
				});
			}
		}else{
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
		if(status == 401 || status == -1){
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
	if(window.localStorage['CAREGIVER_USER_DATA']){
		caregiverUserData = JSON.parse(window.localStorage['CAREGIVER_USER_DATA']);
		$scope.patient_name = "(" + caregiverUserData.first_name + " " + caregiverUserData.last_name + ")";
	}
	
	// Set User Type in Charts
	if(userData.user_type == 3){
		$scope.User_Type = "Patient";
	}else if(userData.user_type == 4){
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
	  	var weekday = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
      	var day = weekday[date.getDay()];
	 	var hours = date.getHours();
	  	var minutes = date.getMinutes();
	  	var month = date.getMonth()+1;
	  	var dateday = date.getDate();
	  	var ampm = hours >= 12 ? 'pm' : 'am';
	  	hours = hours % 12;
	  	hours = hours ? hours : 12; // the hour '0' should be '12'
	  	minutes = minutes < 10 ? '0'+minutes : minutes;
	  	month = month < 10 ? '0'+month : month;
	  	dateday = dateday < 10 ? '0'+dateday : dateday;
	  	var strTime = hours + ':' + minutes + ' ' + ampm;
	  	var dateReturn =  dateday + "/" + month + "/" + date.getFullYear();
	  	return strTime + " " + day + " " + dateReturn;
	}

	// Set Appointment Date End

	// Show Loader 

	$scope.getStateofMindData = function(){
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
		d.setDate(d.getDate()-10);
		var newdate = (d.getMonth()+1) + '/' + d.getDate() + '/' + d.getFullYear();
		inputJsonString.patient = userData._id;
		inputJSONcheckIn.patient = userData._id;
		inputJSONcheckIn.created_date 	= {$gte: d.toISOString()};
		/** Get all goals for patients Start**/
		$scope.dailyMetricData = {};
		$scope.weeklyMetricData = {}; $scope.patient_goal_data = {};
		GoalService.getPatientGoal(inputJsonString).success(function(response) {
			$ionicLoading.hide();
			if(response.messageId == 200) {
				if(response.data.length == 0){
					// no data in goals
					$scope.NoDataAvailable = true;
				}else{
					for(var i = 0; i < response.data.length; i++){
						$scope.patient_goal_data = response.data;
						if(response.data[i].goal_type_id == 1){
							$scope.dailyMetricData[i] = {
								"goal_id" :  $scope.patient_goal_data[i]._id,
								"goal_question": $scope.patient_goal_data[i].goal_question,
								"title": $scope.patient_goal_data[i].title,
								"checked" : false
							}
						}
						if(response.data[i].goal_type_id == 2){
							$scope.weeklyMetricData[i] = {
								"goal_id" :  $scope.patient_goal_data[i]._id,
								"goal_question": $scope.patient_goal_data[i].goal_question,
								"title": $scope.patient_goal_data[i].title,
								"rating" : 0
							}
						}
					}
				}
				
			}
		});
		/** Get all goals for patients end **/

		/** Get Patient General Questions Start**/
		CheckInService.listPatientGeneralQuestions(inputJsonString).success(function(response) {
			$ionicLoading.hide();
			if(response.messageId == 200) {
				if(response.data.length != 0){
					$scope.generalQuestionCheckIn = [
					   {
					      "id": 1,
					      "title": "Alcohol/drugs?",
					      "is_enable" : response.data[0].is_alcohal_drugs,
					      "checked" : false
					    },
					    {
					      "id": 2,
					      "title": "Exercise?",
					      "is_enable" : response.data[0].is_exercise,
					      "checked" : false
					    },
					    {
					      "id": 3,
					      "title": "Caffeine?",
					      "is_enable" : response.data[0].is_caffeine,
					      "checked" : false
					    }
					];
				}
			}
		});
		/** Get Patient General Questions end **/

		/** List CheckIn Data Start Start**/
		$scope.CheckInDailyMetricData = {};
		$scope.CheckInWeeklyMetricData = {}; $scope.checkInData = {};
		$scope.chartlabels = [];
		$scope.FirstChartData = [];
		$scope.SecondChartData = [];
		$scope.weeklyChartSeries = [];
		$scope.WeeklyChartData = [];
		CheckInService.getPatientCheckIn(inputJSONcheckIn).success(function(response) {
			console.log(response);
			$ionicLoading.hide();
			if(response.messageId == 200) {
				$scope.totalDays = response.data.length;
				if($scope.totalDays == 0){
					console.log("Here");
					$scope.NoDataAvailable = true;
					$scope.DataAvailable = false;
				}else{
					$scope.NoDataAvailable = false;
					$scope.DataAvailable = true;
					// Set Appointment Date Start
					if(userData.next_appointment_date){
						var nextApptDate = userData.next_appointment_date;
						var nextApptTime = userData.next_appointment_time;
						var newTime = nextApptTime.split(":");
						var d = new Date(nextApptDate);
						d.setHours(newTime[0]);
						d.setMinutes(newTime[1]);
						$scope.nextApptDateTime = formatDate(d);
						var currentDt =  new Date();
						if(d >= currentDt){
							$scope.showAppointmentDiv = true;
						}else{
							$scope.showAppointmentDiv = false;
						}
					}
					$scope.newObj = {};
					$scope.newObj1 = {};
					$scope.newObj2 = {};
					for(var i = 0; i < response.data.length; i++){
						$scope.checkInData = response.data;
						if($scope.checkInData[i].daily_metric){
							var checkIn_daily_metric = $scope.checkInData[i].daily_metric;
							if(checkIn_daily_metric.length == 0){
								$scope.showDailyMetricDiv = false;
							}else{
								$scope.showDailyMetricDiv = true;
								for(var j = 0; j < checkIn_daily_metric.length; j++){
									$scope.checkIn_dm = checkIn_daily_metric[j];
									// Changed by Rajesh
									if(j == 0){
										$scope.CheckInDailyMetricData[$scope.checkIn_dm.goal] = 0;
									}
									if($scope.checkIn_dm.checked == true){
										$scope.CheckInDailyMetricData[$scope.checkIn_dm.goal] += 1;
									}
								}
							}
						}
						var str = $scope.checkInData[i].checkin_date;
						var res = str.split("/");
						var dateForChart = res[0] + "/" + res[1];
						$scope.chartlabels.push(dateForChart);

						if($scope.checkInData[i].static_metric){
							var checkIn_static_metric = $scope.checkInData[i].static_metric;
							if(checkIn_static_metric.length == 0){
								$scope.showDailyMetricCharts = false;
							}else{
								$scope.showDailyMetricCharts = true;
								for(var k = 0; k < checkIn_static_metric.length; k++){
    								if(checkIn_static_metric[k].id == 1 || checkIn_static_metric[k].id == 2 || checkIn_static_metric[k].id == 3){
										if(typeof $scope.newObj[checkIn_static_metric[k].id] == "undefined"){
											$scope.newObj[checkIn_static_metric[k].id] = new Array();
										}
										$scope.newObj[checkIn_static_metric[k].id].push(checkIn_static_metric[k].rating);
									}
									if(checkIn_static_metric[k].id == 1 || checkIn_static_metric[k].id == 4 || checkIn_static_metric[k].id == 5){
										if(typeof $scope.newObj1[checkIn_static_metric[k].id] == "undefined"){
											$scope.newObj1[checkIn_static_metric[k].id] = new Array();
										}
    										$scope.newObj1[checkIn_static_metric[k].id].push(checkIn_static_metric[k].rating);
    									}
    								}
								}
							}

						if($scope.checkInData[i].weekly_metric){
							var checkIn_weekly_metric = $scope.checkInData[i].weekly_metric;
							$scope.thirdchartData = [];
							if(checkIn_weekly_metric.length == 0){
								$scope.showWeeklyMetricDiv = false;
							}else{
								$scope.showWeeklyMetricDiv = true;
								for(var k = 0; k < checkIn_weekly_metric.length; k++){
									if(typeof $scope.newObj2[checkIn_weekly_metric[k].goal] == "undefined"){
										$scope.newObj2[checkIn_weekly_metric[k].goal] = new Array();
									}
									$scope.newObj2[checkIn_weekly_metric[k].goal].push(checkIn_weekly_metric[k].rating); 
    							}
							}

						}
					}
					if(response.data[0].weekly_metric){
						for(var c = 0; c < response.data[0].weekly_metric.length; c++){
							var yourString = response.data[0].weekly_metric[c].goal_question;
							var maxLength = 20 // maximum number of characters to extract

							//trim the string to the maximum length
							var trimmedString = yourString.substr(0, maxLength);

							//re-trim if we are in the middle of a word
							trimmedString = trimmedString.substr(0, Math.min(trimmedString.length, trimmedString.lastIndexOf(" ")));
							
							$scope.weeklyChartSeries.push(trimmedString);
						}
					}
					for(key in $scope.newObj){
						var dailydetail1 = (typeof $scope.newObj[key] != "undefined")?$scope.newObj[key]:null;
						$scope.FirstChartData.push(dailydetail1);	
					}
					for(key in $scope.newObj1){
						var dailydetail2 = (typeof $scope.newObj1[key] != "undefined")?$scope.newObj1[key]:null;
						$scope.SecondChartData.push(dailydetail2);	
					}
					for(key in $scope.newObj2){
						var detail = (typeof $scope.newObj2[key] != "undefined")?$scope.newObj2[key]:null;
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

.controller('emergencyCallCtrl', function ($scope,$stateParams, ionicMaterialInk){
	ionicMaterialInk.displayEffect();
})




