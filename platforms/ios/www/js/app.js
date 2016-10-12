/**
 *  Sleepapp Patient App
 *  Developer : Gurpreet Singh
 *  Date started : 16 Aug 2016
 *  Platforms : Android & iOS
**/

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'sleepapp_patient' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
angular.module('sleepapp_patient', ['ionic','sleepapp_patient.controllers','sleepapp_patient.services','sleepapp_patient.directives','ngCordova','ionic.rating', 'ionic-material', 'ionic-timepicker','ionic-durationpicker','ionic-datepicker','chart.js', 'ngMask'])

.run(function($ionicPlatform, $state, $ionicPopup, $rootScope, $timeout, $cordovaStatusbar, $cordovaNetwork, $cordovaToast) {
  $ionicPlatform.ready(function() {
    if(window.cordova && window.cordova.plugins.Keyboard) {
      // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
      // for form inputs)
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);

      // Don't remove this line unless you know what you are doing. It stops the viewport
      // from snapping when text inputs are focused. Ionic handles this internally for
      // a much nicer keyboard experience.
      cordova.plugins.Keyboard.disableScroll(true);
    }
    
    if(window.StatusBar) {
      StatusBar.styleDefault();
      $cordovaStatusbar.styleColor('black');
    }

/*
    var myPopup;
    // Check for network connection
    var CheckInternetConnection = function() {
      if(window.Connection) {
        if(navigator.connection.type == Connection.NONE) {
          myPopup = $ionicPopup.alert({
            title: 'Warning!',
            template: 'Sorry, no internet connection detected. Please reconnect and try again.',
            buttons: [{
                  text: '<b>OK</b>',
                  type: 'button-positive',
                  onTap: function(e) {
                      if(ionic.Platform.isIOS()){
                          if(navigator.connection.type == Connection.NONE) {
                            $cordovaToast.showLongBottom('Connect to your internet connection first.');
                            e.preventDefault();
                          }
                      }
                      if(ionic.Platform.isAndroid()){
                          if(navigator.connection.type == Connection.NONE) {
                            $cordovaToast.showLongBottom('Connect to your internet connection first.');
                            e.preventDefault();
                          }
                      }
                  }
              }]
          });
        }
      }
    }
    CheckInternetConnection();

    $rootScope.$on('$cordovaNetwork:online', function(event, networkState){
        $cordovaToast.showLongBottom('Connected successfully.');
        myPopup.close();
        //$state.go($state.current, {}, {reload: true});
    })
    $rootScope.$on('$cordovaNetwork:offline', function(event, networkState){
      CheckInternetConnection();
    })
    */
    
    /* PUSH NOTIFICATIONS CONFIGURATION as on ngCordova-- start */
    var push = PushNotification.init({
      android: {senderID: "117882864904"},
      ios: {alert: "true",badge: "false",sound: "true"}
    });
    push.on('registration', function(data) {
      var d = new Date();
      window.localStorage["DEVICE_ID"] = data.registrationId;
      window.localStorage['PLATFORM'] = ionic.Platform.platform();
      window.localStorage['TIME_ZONE'] = d.getTimezoneOffset();
    });

    push.on('notification', function(data) {
      // data.message, data.title, data.count, data.sound, data.image, data.additionalData, alert(JSON.stringify(data));
    });
    push.on('error', function(e) {
      console.log(e.message);
    });
  
    /* PUSH NOTIFICATIONS CONFIGURATION -- end. */

    /* HANDLE ANDROID DEVICE BACK BUTTON -- start. */
    $ionicPlatform.registerBackButtonAction(function (event) {  
      if($state.current.name == "app.tabs.checkIn" || $state.current.name == "signin"){
        $rootScope.$broadcast('Call_Custom_Alert');
        var confirmPopup = $ionicPopup.confirm({
          title: 'Warning!',
          template: 'Are you sure you want to exit?'
        });
        confirmPopup.then(function(res) {
          if(res) {
            navigator.app.exitApp();
          }
        });   
      }else{ 
        navigator.app.backHistory();
      }
    }, 100);
    /* HANDLE ANDROID DEVICE BACK BUTTON -- end. */
    
    // Broadcast method for Custom pop up
    $rootScope.$on('Call_Custom_Alert', function(events, args){
      var animation = 'bounceInDown';
      $timeout(function() {
        var popupElements = document.getElementsByClassName("popup-container");
        if (popupElements.length) {
          var popupElement = angular.element(popupElements[0]);
          popupElement.addClass('animated')
          popupElement.addClass(animation)
        };
      }, 1)
    });
    
  });
})
/* all routing here */
.config(function($stateProvider, $ionicConfigProvider, $urlRouterProvider) {

  $ionicConfigProvider.views.swipeBackEnabled(false);
  // Check user completed Carousel Tutorial or Not
  var checkSlider = function($q, $state, $ionicLoading, $timeout, $location){
    var deferred = $q.defer();
    var IsCompleted = window.localStorage['IsCompleted'];
    if (IsCompleted) {
      $location.path('/signin');
    }else{
      $timeout(deferred.resolve, 0);
    }
    return deferred.promise;
  };

  // Check user completed Carousel Tutorial or Not
  var checkLogin = function($q, $state, $ionicLoading, $timeout, $location){
    var deferred = $q.defer();
    if (window.localStorage['USER_DATA']) {
      console.log("HERE");
      $location.path('/app/tab/page1');
    }else{
      $timeout(deferred.resolve, 0);
    }
    return deferred.promise;
  };

  // display tabs at bottom in device
  $ionicConfigProvider.tabs.position('bottom');
  $ionicConfigProvider.navBar.alignTitle('center');
  
  $stateProvider
  .state('welcome', {
    cache: false,
    url: '/welcome',
    templateUrl: 'templates/welcome.html',
    controller: 'welcomeCtrl',
    resolve: {checked:checkSlider}
  })

  .state('signup', {
    cache: false,
    url: '/signup',
    templateUrl: 'templates/user/signup.html',
    controller: 'SignUpController'
  })

  .state('signin', {
    cache: false,
    url: '/signin',
    templateUrl: 'templates/user/signin.html',
    controller: 'SignInController',
    resolve: {checked:checkLogin}
  })

  .state('forgotpassword', {
    cache: false,
    url: '/forgotpassword',
    templateUrl: 'templates/user/forgotpassword.html',
    controller: 'ForgotPasswordController'
  })

  .state('enterOTP', {
    cache: false,
    url: '/enterOTP',
    templateUrl: 'templates/user/enterOTP.html',
    controller: 'enterOTPController'
  })

  .state('resetpassword', {
    cache: false,
    url: '/resetpassword',
    templateUrl: 'templates/user/resetpassword.html',
    controller: 'resetPasswordController'
  })

  .state('app', {
    cache: false,
    url: '/app',
    abstract: true,
    templateUrl: 'templates/menu.html',
    controller: 'menuCtrl'
  })

  .state('app.changePassword', {
    cache: false,
    url: '/changePassword',
    views: {
      'menuContent': {
        templateUrl: 'templates/user/changePassword.html',
        controller:'ChangePasswordController'
      }
    }
  })

  .state('app.settings', {
    cache: false,
    url: '/settings',
    views: {
      'menuContent': {
        templateUrl: 'templates/user/settings.html',
        controller: 'settingsCtrl'
      }
    }
  })

  .state('app.tabs', {
    url: '/tab',
    views: {
      'menuContent': {
        templateUrl: 'templates/tabsController.html'
      }
    }
  })

  .state('app.tabs.checkIn', {
    cache: false,
    url: '/page1',
    views: {
      'tab1': {
        templateUrl: 'templates/checkIn.html',
        controller: 'checkInCtrl',
      }
    }
  })
     .state('app.tabs.jetLag', {
    cache: false,
    url: '/page2',
    views: {
      'tab2': {
        templateUrl: 'templates/jetLag.html',
        controller: 'jetLagCtrl'
      }
    }
  })

  .state('app.tabs.stateOfMind', {
    cache: false,
    url: '/page3',
    views: {
      'tab3': {
        templateUrl: 'templates/stateOfMind.html',
        controller: 'stateOfMindCtrl'
      }
    }
  })
  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/welcome');
 
});
