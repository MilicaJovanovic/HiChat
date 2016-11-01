angular.module('starter', ['ionic', 'starter.services', 'starter.controllers', 'ngStorage'])

.run(function($ionicPlatform, $rootScope, $ionicPopup, $ionicHistory, $ionicLoading, $localStorage, $location, $filter, Location, $state) {
	$rootScope.hostMail = 'http://dusannesicdevelopment.sytes.net/hichat/active.php';
	$rootScope.keyMap = 'AIzaSyAcrBFpjkE7Zt8M0mqdpGdAl8CgSTd4yLA';
	$rootScope.getMap = 'https://maps.googleapis.com/maps/api/staticmap?key='+$rootScope.keyMap+'&';
	$rootScope.linkDownload = 'http://hichatapp.com/dl?c=1234fmiakqua';
	$rootScope.inviteText = 'Invited you to install Hichat, the free texting application: '+$rootScope.linkDownload;
	$ionicPlatform.ready(function() {
    if (window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
      cordova.plugins.Keyboard.disableScroll(true);
    }
	// navigator.splashscreen.hide();
    if (window.StatusBar) {
      StatusBar.styleDefault();
    }
	});
	$rootScope.goBack = function(){
		$ionicHistory.goBack();
	};
	$rootScope.showLoading = function(template) {
		$ionicLoading.show({
		  template: template
		});
	};
	$rootScope.hideLoading = function(){
		$ionicLoading.hide();
	};
	$rootScope.openLink = function(link){
		var ref = cordova.InAppBrowser.open(link, '_blank', 'location=yes');
	};
	$rootScope.$on('$stateChangeStart', function(event, toState, toParams, fromState, fromParams){
		if(angular.isUndefined($localStorage.userLogin) || !$localStorage.userLogin.isLogin) {
			$location.path('/walkthrough');
		}
	});
	$ionicPlatform.on('pause', function(){
		$rootScope.inBackground = 1;
	});
	$ionicPlatform.on('resume', function(){
		$rootScope.inBackground = 0;
	});
	document.addEventListener("offline", onOffline, false);
	function onOffline() {
		$rootScope.hideLoading();
		var confirmPopup = $ionicPopup.alert({
			title: 'Connection is disconnected',
			template: 'This App only work while Connection connected !'
		}).then(function(){ navigator.app.exitApp(); });
	}
	if(angular.isDefined($localStorage.userLogin)){
	$ionicPlatform.ready(function(){
		$rootScope.showNotification = function(numMessages){
			cordova.plugins.notification.local.schedule({
				id: 1,
				title: "Hichat notification",
				text: "You have new messages",
			});
		};
		var notification = firebase.database().ref('notification').child($localStorage.userLogin.id);
		notification.on('value', function(snapshot){
			var data = snapshot.val();
			if(data){
				if(data.messagesNew > 0 && $rootScope.inBackground === 1)
					$rootScope.showNotification();
			}
		});
	});
	}
	$ionicPlatform.registerBackButtonAction(function(){
		if($state.current.name == "detail") $state.go("tab.messages");
		else if($state.current.name == "groupDetail" || $state.current.name == "createGroup")
			$state.go("tab.group");
		else $rootScope.goBack();
	}, 100);
})

.config(function($stateProvider, $urlRouterProvider) {
  $stateProvider

    .state('tab', {
	cache: false,
    url: '/tab',
    abstract: true,
    templateUrl: 'templates/tabs.html',
	controller: 'tabCtrl'
  })

	.state('walkthrough', {
    url: '/walkthrough',
    templateUrl: 'templates/sign/walkthrough.html',
	})

	.state('register', {
    url: '/register',
    templateUrl: 'templates/sign/register.html',
	controller: 'signCtrl'
	})

	.state('login', {
    url: '/login',
    templateUrl: 'templates/sign/login.html',
	controller: 'signCtrl'
	})

	.state('editInfomation', {
    url: '/editInfomation',
    templateUrl: 'templates/sign/edit-infomation.html',
	controller: 'signCtrl'
	})

  .state('tab.messages', {
	cache: false,
    url: '/messages',
    views: {
      'tab-messages': {
        templateUrl: 'templates/messages/index.html',
        controller: 'messagesCtrl'
      }
    }
  })

  .state('detail', {
	  cache: false,
      url: '/messages/detail/:id',
      templateUrl: 'templates/messages/detail.html',
	  controller: 'messagesDetail'
    })

  .state('sendLocation', {
	  cache:false,
      url: '/messages/location/:id/:source',
      templateUrl: 'templates/messages/location.html',
	  controller: 'sendLocation'
    })

  .state('tab.contacts', {
	  cache: false,
      url: '/contacts',
      views: {
        'tab-contacts': {
          templateUrl: 'templates/contacts/index.html',
          controller: 'contactsCtrl'
        }
      }
    })

	.state('tab.admin', {
	  cache: false,
      url: '/admin',
      views: {
        'tab-admin': {
          templateUrl: 'templates/admin/admin.html',
          controller: 'adminCtrl'
        }
      }
    })

  .state('tab.recommended', {
      url: '/contacts/recommended',
      views: {
        'tab-contacts': {
          templateUrl: 'templates/contacts/recommended.html',
		  controller: 'contactsRecommended'
        }
      }
    })

  .state('tab.addContacts', {
	  cache: false,
      url: '/contacts/add',
      views: {
        'tab-contacts': {
          templateUrl: 'templates/contacts/add.html',
		  controller: 'contactsAdd'
        }
      }
    })

  .state('tab.searchContacts', {
	  cache: false,
      url: '/contacts/search/:id',
      views: {
        'tab-contacts': {
          templateUrl: 'templates/contacts/search.html',
		  controller: 'contactsSearch'
        }
      }
    })

  .state('tab.inviteContacts', {
      url: '/contacts/invite/:id',
      views: {
        'tab-contacts': {
          templateUrl: 'templates/contacts/invite.html',
		  controller: 'contactsInvite'
        }
      }
    })

  .state('tab.updateContacts', {
      url: '/contacts/update',
      views: {
        'tab-contacts': {
          templateUrl: 'templates/contacts/update.html',
		  controller: 'contactsUpdate'
        }
      }
    })

  .state('tab.nearbyContacts', {
	  cache: false,
      url: '/contacts/nearby',
      views: {
        'tab-contacts': {
          templateUrl: 'templates/contacts/nearby.html',
		  controller: 'contactsNearby'
        }
      }
    })

  .state('tab.nearbyLocation', {
	  cache: false,
      url: '/contacts/location',
      views: {
        'tab-contacts': {
          templateUrl: 'templates/contacts/location.html',
		  controller: 'nearbyLocation'
        }
      }
    })

  .state('tab.group', {
      url: '/group',
      views: {
        'tab-group': {
          templateUrl: 'templates/group/index.html',
		  controller: 'groupCtrl'
        }
      }
    })

  .state('createGroup', {
	  cache: false,
      url: '/group/create',
      templateUrl: 'templates/group/create.html',
	  controller: 'groupCreate'
    })

  .state('tab.addGroup', {
    url: '/group/add/:id',
    views: {
      'tab-group': {
        templateUrl: 'templates/group/add.html',
		controller: 'groupAdd'
      }
    }
  })
  .state('tab.viewGroup', {
	cache: false,
    url: '/group/view/:id',
    views: {
      'tab-group': {
        templateUrl: 'templates/group/view.html',
		controller: 'groupView'
      }
    }
  })

  .state('groupDetail', {
	  cache: false,
      url: '/group/detail/:id',
      templateUrl: 'templates/group/detail.html',
	  controller: 'groupDetail'
    })

  .state('tab.settings', {
	cache: false,
    url: '/settings',
    views: {
      'tab-settings': {
        templateUrl: 'templates/settings/index.html',
		controller: 'settingsCtrl'
      }
    }
  })

  .state('profiles', {
      url: '/settings/profiles',
      templateUrl: 'templates/settings/profiles.html',
	  controller: 'settingsCtrl'
    })

  .state('settingsMessages', {
      url: '/settings/messages',
		templateUrl: 'templates/settings/messages.html',
		controller: 'settingsCtrl'
    })

  .state('settingsContacts', {
      url: '/settings/contacts',
      templateUrl: 'templates/settings/contacts.html',
	  controller: 'settingsCtrl'
    })

  .state('settingsLanguages', {
      url: '/settings/languages',
      templateUrl: 'templates/settings/languages.html',
	  controller: 'settingsCtrl'
    })

  .state('about', {
      url: '/settings/about',
      templateUrl: 'templates/settings/about.html',
    })

  .state('settingsAccount', {
      url: '/settings/account',
      templateUrl: 'templates/settings/account.html',
	  controller: 'settingsCtrl'
    })

  .state('settingsPassword', {
      url: '/settings/password',
      templateUrl: 'templates/settings/password.html',
	  controller: 'changePasswordCtrl'
    })

  .state('search', {
	  cache: false,
      url: '/search',
      templateUrl: 'templates/search.html',
	  controller: 'searchCtrl'
    })

  .state('changeRole', {
    cache: false,
    url: '/changeRole',
    templateUrl: 'templates/admin/changeRole.html',
    controller: 'ChangeRoleCtrl'
  })
  ;

  $urlRouterProvider.otherwise('/tab/messages');

})

.directive('hideTabs', function($rootScope) {
  return {
      restrict: 'A',
      link: function(scope, element, attributes) {
          scope.$watch(attributes.hideTabs, function(value){
              $rootScope.hideTabs = value;
          });
          scope.$on('$ionicView.beforeLeave', function() {
              $rootScope.hideTabs = false;
          });
      }
  };
})

.filter('firstChar', function(){
	return function(string){
		if(angular.isDefined(string) && string != '') return string.substring(0,1).toUpperCase();
	};
})

.filter('sinceTime', function($filter){
	return function(time){
		time = Number(time);
		if(angular.isDefined(time) && angular.isNumber(time)) {
			var now = new Date().getTime();
			var since = now - time;
			if(since > 432000000){
				return $filter('date')(time,'dd/MM/yyyy');
			} else {
				if(since < 120000) return 'Just Now';
				else {
					if(since < 3600000) return $filter('date')(since,'mm')+' minutes';
					else if(since < 86400000) return Math.floor(since/1000/60/60)+' hours';
					else return $filter('date')(since,'dd')+' days';
				}
			}
		}
	};
})

.filter('isEmpty', function () {
	var bar;
	return function (obj) {
		for (bar in obj) {
			if (obj.hasOwnProperty(bar)) {
				return false;
			}
		}
		return true;
	};
})

.config(function($ionicConfigProvider){
	$ionicConfigProvider.tabs.position('top');
})

;
