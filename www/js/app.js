/**
 *  Sleepapp Patient App
 *  Developer : Gurpreet Singh
 *  Date started : 16 Aug 2016
 *  Platforms : Android & iOS
**/

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'sleepapp_patient' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
angular.module('sleepapp_patient', ['ionic','sleepapp_patient.controllers','sleepapp_patient.services','sleepapp_patient.directives','ngCordova','ionic.rating', 'ionic-material', 'ionic-timepicker','ionic-durationpicker','ionic-datepicker'])

.run(function($ionicPlatform, $state, $ionicPopup, $timeout, $cordovaStatusbar) {
  $ionicPlatform.ready(function() {
    // Handle the App Minimize/Resume event for Auto Logout
    document.addEventListener("resume", onResume, false);
    function onResume() {
        $state.go('signin');
    }
    
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
    
    window.localStorage['PLATFORM'] = ionic.Platform.platform();
    /* PUSH NOTIFICATIONS CONFIGURATION as on ngCordova-- start */
      if (PushNotification) {
        var push = PushNotification.init({
          android: {senderID: "780443469261"},
          ios: {alert: "true",badge: "false",sound: "true"}
        });
      }
      push.on('registration', function(data) {
        window.localStorage["device_id"] =  data.registrationId;
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
      var animation = 'bounceInRight';
      console.log($state.current.name);
      if($state.current.name == "tabs.assessment" || $state.current.name == "signup"){
        showConfirm(animation);
        var confirmPopup = $ionicPopup.confirm({
          title: 'Warning!',
          template: 'Are you sure you want to exit?'
        });
        confirmPopup.then(function(res) {
          if(res) {
            navigator.app.exitApp();
          } else {
            console.log('You are not sure');
          }
        });   
      }else if($state.current.name == "signin"){
        showConfirm(animation);
        var confirmPopup = $ionicPopup.confirm({
          title: 'Warning!',
          template: 'Are you sure you want to exit?'
        });
        confirmPopup.then(function(res) {
          if(res) {
            navigator.app.exitApp();
          } else {
            console.log('You are not sure');
          }
        });   
      }else{ 
        navigator.app.backHistory();
      }
    }, 100);
    /* HANDLE ANDROID DEVICE BACK BUTTON -- end. */
    
    // A confirm dialog
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
    
  });
})
/* all routing here */
.config(function($stateProvider, $ionicConfigProvider, $urlRouterProvider) {
  // display tabs at bottom in device
  $ionicConfigProvider.tabs.position('bottom');
  $ionicConfigProvider.navBar.alignTitle('center');
  google.charts.load('current', { 'packages': ['corechart'] });
  $stateProvider
  .state('welcome', {
    cache: false,
    url: '/welcome',
    templateUrl: 'templates/welcome.html',
    controller: 'welcomeCtrl'
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
    controller: 'SignInController'
  })

  .state('forgotpassword', {
    cache: false,
    url: '/forgotpassword',
    templateUrl: 'templates/user/forgotpassword.html',
    controller: 'ForgotPasswordController'
  })


  .state('tabs', {
    url: '/tab',
    cache: false,
    abstract: true,
    templateUrl: 'templates/tabsController.html'
  })

  .state('tabs.checkIn', {
    cache: false,
    url: '/page1',
    views: {
      'tab1': {
        templateUrl: 'templates/checkIn.html',
        controller: 'checkInCtrl'
      }
    }
  })
     .state('tabs.jetLag', {
    cache: false,
    url: '/page2',
    views: {
      'tab2': {
        templateUrl: 'templates/jetLag.html',
        controller: 'jetLagCtrl'
      }
    }
  })

  .state('tabs.stateOfMind', {
    cache: false,
    url: '/page3',
    views: {
      'tab3': {
        templateUrl: 'templates/stateOfMind.html',
        controller: 'stateOfMindCtrl'
      }
    }
  })

  .state('settings', {
    cache: false,
    url: '/settings/:pageId',
    templateUrl: 'templates/user/settings.html',
    controller: 'settingsCtrl'
  })
  
 

  // if none of the above states are matched, use this as the fallback
    $urlRouterProvider.otherwise('/welcome');
 
});
