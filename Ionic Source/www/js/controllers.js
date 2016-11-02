function gotochange(name, phone, id) {

	console.log(name);
	console.log(phone);
	console.log(id);

	localStorage.setItem('name', name);
	localStorage.setItem('phone', phone);
	localStorage.setItem('id', id);
	window.location = "#/changeRole";
}

var domain = "rebrand.im";
angular.module('starter.controllers', ['ionic.closePopup'])

.controller('areacodeCtrl', function($scope, $ionicModal, Areacode){
 	$scope.areacodes = Areacode;
	$ionicModal.fromTemplateUrl('templates/sign/areacode.html', {
    scope: $scope
	}).then(function(modal) {
    $scope.areaCode = modal;
	});
	$scope.closeareaCode = function() {
    $scope.areaCode.hide();
	};
	$scope.showareaCode = function() {
    $scope.areaCode.show();
	};
  $scope.choseAreaCode = function(name,areacode){
	  $scope.choseArea.name = name;
	  $scope.choseArea.areacode = areacode;
	  $scope.closeareaCode();
  };
})

.controller('signCtrl', function($scope, $state, $http, $ionicPopup, Login, User, Camera, $filter, $localStorage){
	$scope.data = {};
	$scope.choseArea = {name:"United Kingdom","areacode":"44"};
	$scope.showValue = {"type":"password","text":"Show"};
	$scope.login = function(){
	if(!angular.isDefined($scope.data.phone)){
		$scope.data.notification = "Plese enter your phone number to continue";
	} else {
		$scope.showLoading("Loading...");
		$scope.data.notification = false;
		$scope.data.fullPhone = $scope.choseArea.areacode + $scope.data.phone;
		$scope.userLogin = Login().get($scope.data.fullPhone);
		$scope.userLogin.$loaded(function(){
			$scope.hideLoading();
			// if(angular.isDefined($scope.userLogin.active)){
			// 	$scope.data.notification = "Your account is inactive, please active mail for register";
			// } else {
				if($scope.userLogin.password == $scope.data.password) {
					$localStorage.userLogin = {};
					$localStorage.userLogin.isLogin = true;
					$localStorage.userLogin.id = $scope.userLogin.id;
					$localStorage.userLogin.phone = $scope.userLogin.$id;
					$localStorage.userLogin.password = $scope.data.password;
					$localStorage.userLogin.areacode = Number($scope.choseArea.areacode);
					if ($scope.userLogin.role == "admin") {
						$localStorage.role = "admin";
						$state.go("tab.admin");
					} else {
						$localStorage.role = "normal";
						$state.go("tab.messages");
					}
				} else {
					$scope.data.notification = "The password you entered is incorrect";
				}
			// }
		});
	}
  };
	$scope.register = function(){
	if(!$scope.data.phone || !$scope.data.password){
		$scope.data.notification = "Plese enter data to continue";
	} else if($scope.data.password != $scope.data.repassword) {
		$scope.data.notification = "Confirmation password do not match";
	} else if(!(isValidEmailAddress($scope.data.email))) {
      $scope.data.notification = "Please enter a rebrand.im valid email address";
  } else {
		$scope.showLoading("Loading...");
		$scope.data.notification = false;
		$scope.data.fullPhone = $scope.choseArea.areacode + $scope.data.phone;
		$scope.userLogin = Login().get($scope.data.fullPhone);
		$scope.userLogin.$loaded(function(){
			if(angular.isUndefined($scope.userLogin.$value)){
				$scope.data.notification = "Phone number is already registered";
				$scope.hideLoading();
			} else {
				$scope.checkEmail = Login().getEmail($scope.data.email);
				$scope.checkEmail.$loaded(function(){
					if(angular.isDefined($scope.checkEmail.$value)){
						Login().set($scope.data.fullPhone,$scope.data.email);
						Login().changePass($scope.data.fullPhone,$scope.data.password);
						$http.head($scope.hostMail+'?email='+$scope.data.email+'&phone='+$scope.data.fullPhone).then(function(){
							$scope.hideLoading();
							$state.go('login');
						});
					} else {
						$scope.hideLoading();
						$scope.data.notification = "Email is already registered";
					}
				});
			}
		});
	}
  };
    $scope.showForgot = function() {
		if(!$scope.data.phone){
			$scope.data.notification = "Plese enter your phone number to continue";
		} else {
			$scope.showLoading("Loading...");
			$scope.data.notification = false;
			$scope.data.fullPhone = $scope.choseArea.areacode + $scope.data.phone;
			$scope.userForgot = Login().get($scope.data.fullPhone);
			$scope.userForgot.$loaded(function(){
				if(angular.isDefined($scope.userForgot.$value)){
					$scope.hideLoading();
					$scope.data.notification = "Phone number is not registered";
				} else {
					$scope.hideLoading();
					var confirmPopup = $ionicPopup.confirm({
					 scope: $scope,
					 title: 'Confirm number',
					 cssClass: 'popup-forgot text-center',
					 templateUrl: 'templates/sign/forgot.html',
					 buttons: [
					 { text:'Change'},
					 {
						text: 'Confirm',
						onTap: function(e){
							$scope.showLoading("Loading...");
							$http.head($scope.hostMail+'?action=forgot&phone='+$scope.data.fullPhone).then(function(){
								$scope.hideLoading();
							});
						}
					 }
					 ]
					});
				}
			});
		}
	};
  $scope.showPassword = function(){
	if($scope.showValue.type == "password"){
		$scope.showValue = {"type":"text","text":"Hide"}
	} else {
		$scope.showValue = {"type":"password","text":"Show"}
	}
  };
	$scope.takeAvatar = function(){
		var options = {
			sourceType:0,
			allowEdit:true,
			targetWidth:160,
			targetHeight:160,
			destinationType:0
		};
		Camera.getPicture(options).then(function(imageData) {
		 $scope.data.avatar = "data:image/jpeg;base64,"+imageData;
		}, function(err) {
		 console.log(err);
		});
	};
	$scope.editInfomation = function(){
		delete $scope.data.notification;
		if(angular.isUndefined($scope.data.name) || angular.isUndefined($scope.data.birthday)){
			$scope.data.notification = "Plese enter Name and Birthday to continue";
		} else {
			$scope.data.birthday = $filter('date')($scope.data.birthday,'dd/MM/yyyy');
			$scope.data.phone = $localStorage.userLogin.phone;
			$scope.data.role = 'normal';
			User($localStorage.userLogin.id).set($scope.data);
			$state.go('tab.messages');
		}
	};
})

.controller('tabCtrl', function($scope, $localStorage, Notification){
	if ($localStorage.role === "normal") {
		$scope.showTab = true;
	} else {
		$scope.showTab = false;
	}
	$scope.notification = Notification($localStorage.userLogin.id).get();
})

.controller('messagesCtrl', function($scope, $ionicPopup, $rootScope, Messages, User, $state, $localStorage) {
	$scope.checkProfiles = User($localStorage.userLogin.id).get();
	$scope.checkProfiles.$loaded(function(){
		if(angular.isDefined($scope.checkProfiles.$value)) $state.go("editInfomation");
		else User($localStorage.userLogin.id).update();
	});
	$scope.showLoading('Loading...');
	$scope.messages = Messages($localStorage.userLogin.id).get();
	$scope.messages.$loaded(function(){
		$scope.loadMessage = function(){
			angular.forEach($scope.messages, function(value){
				value.name = User(value.$id).getName();
				value.avatar = User(value.$id).getAvatar();
			});
		};
		$scope.loadMessage();
		var watch = firebase.database().ref('messages').child($localStorage.userLogin.id);
		watch.on('value', function(){ $scope.loadMessage(); });
		$scope.hideLoading();
		$scope.$watch('messages.length', function(newVal, oldVal){
			if(oldVal != newVal) $state.reload();
		});
	});
	$scope.message = {};
	$scope.choseMessagesCount = 0;
	$scope.choseMessage = function(message){
        if (message.selected) {
            $scope.choseMessagesCount++
        } else {
            $scope.choseMessagesCount--
        }
		if($scope.choseMessagesCount == 0) $rootScope.hideTabs = false;
		else $rootScope.hideTabs = true;
	};
	$scope.cancelChoseMessages = function () {
        angular.forEach($scope.messages, function(value){
			delete value.selected;
		});
		$scope.choseMessagesCount = 0;
		$rootScope.hideTabs = false;
    };

	$scope.deleteMessages = function() {
	   var confirmPopup = $ionicPopup.confirm({
		template: 'Delete all selected messages?',
		cssClass: 'popup-confirm-delete',
		buttons: [
			{
				text: 'NO',
				type: 'button-clear button-no-delete'
			},
			{
				text: 'DELETE',
				type: 'button-clear',
				onTap: function(e){
					angular.forEach($scope.messages, function(value){
						if(value.selected){ Messages($localStorage.userLogin.id).delete(value.$id,value.unread) }
					});
					location.reload();
				}
			}
		]
	   });
	};
})

.controller('messagesDetail', function($scope, $ionicScrollDelegate, $ionicTabsDelegate, $ionicSideMenuDelegate, $timeout, $ionicPopup, IonicClosePopupService, Notification, Block, Messages, Camera, DetailMessages, User, $localStorage, $state, $stateParams, Location){
	$scope.showLoading('Loading...');
	$scope.Unread = Messages($localStorage.userLogin.id).getUnread($stateParams.id);
	$scope.Unread.$loaded(function(){
		if($scope.Unread.$value > 0){
			Notification($localStorage.userLogin.id).update($scope.Unread.$value);
			Messages($localStorage.userLogin.id).reset($stateParams.id);
		}
	});
	var onNewMessage = firebase.database().ref('detailMessages/'+$localStorage.userLogin.id).child($stateParams.id);
	onNewMessage.on('value', function(){ $ionicScrollDelegate.$getByHandle('mainScroll').scrollBottom(); });
	$scope.Detail = DetailMessages($localStorage.userLogin.id).get($stateParams.id);
	$scope.Me = {};
	$scope.Me.name = User($localStorage.userLogin.id).getName();
	$scope.Me.avatar = User($localStorage.userLogin.id).getAvatar();
	$scope.Friend = User($stateParams.id).get();
	$scope.$watch(function () {
	  return $ionicSideMenuDelegate.getOpenRatio();
	},
	function (right) {
	  if (right === -1) $scope.menuRightActived= true;
	  else $scope.menuRightActived = false;
	});
	$scope.showPopupMenuMessages = function(type,title,id) {
		if(type != "text") title = "Select action";
		var popupMenuMessages = $ionicPopup.show({
		title: '"'+title+'"',
		cssClass: 'popup-menu-messages',
		scope: $scope,
		buttons: [
		  { text: 'Copy',type: 'button-clear' },
		  {
			text: 'Delete',type: 'button-clear',
			onTap: function(e){
				DetailMessages($localStorage.userLogin.id).delete($stateParams.id,id);
			}
		  },
		]
		});
		IonicClosePopupService.register(popupMenuMessages);
	}

	$scope.Block = Block($localStorage.userLogin.id).get($stateParams.id);
	$scope.Block.$loaded(function(){
		if(!$scope.Block.$value) {
			$scope.contentBottom = '100px';
			$scope.messageInput = function(option){
				if(option == "text") $scope.contentBottom = '100px';
				else $scope.contentBottom = '220px';
			};

			$scope.inputText = {"from":0,"type":"text"};
			$scope.sendText = function(){
				if(angular.isDefined($scope.inputText.content) && angular.isString($scope.inputText.content)){
					var now = new Date().getTime();
					$scope.inputText.time = now;
					DetailMessages($localStorage.userLogin.id).post($stateParams.id,$scope.inputText);
					$scope.Messages = {};
					$scope.Messages.content = $scope.inputText.content;
					$scope.Messages.time = $scope.inputText.time;
					$scope.Messages.unread = 0;
					Messages($localStorage.userLogin.id).post($stateParams.id,$scope.Messages);
					Notification().post($stateParams.id);
					$scope.inputText = {"from":0,"type":"text"};
				}
			};

			$scope.inputPicture = {"from":0,"type":"picture"};
			$scope.takePicture = function(){
				$ionicTabsDelegate.select(1);
				var options = {
					quality:75,
					targetWidth:720,
					targetHeight:1280,
					destinationType:0
				};
				Camera.getPicture(options).then(function(imageData) {
				 $scope.inputPicture.content = "data:image/jpeg;base64,"+imageData;
				}, function(err) {
				 console.log(err);
				});
			};
			$scope.sendPicture = function(){
				if(angular.isDefined($scope.inputPicture.content)){
					var now = new Date().getTime();
					$scope.inputPicture.time = now;
					DetailMessages($localStorage.userLogin.id).post($stateParams.id,$scope.inputPicture);
					$scope.Messages = {};
					$scope.Messages.content = "[picture]";
					$scope.Messages.time = $scope.inputPicture.time;
					$scope.Messages.unread = 0;
					Messages($localStorage.userLogin.id).post($stateParams.id,$scope.Messages);
					Notification().post($stateParams.id);
					$scope.inputPicture = {"from":0,"type":"picture"};
				} else $scope.takePicture();
			};

			$scope.showInputImages = function(){
				var options = {
					sourceType:0,
					destinationType:0
				};
				Camera.getPicture(options).then(function(imageData) {
				 $scope.inputPicture.content = "data:image/jpeg;base64,"+imageData;
				 $ionicTabsDelegate.select(1);
				}, function(err) {
				 console.log(err);
				});
			};

			$scope.inputSticker = {"from":0,"type":"sticker"};
			$scope.sendSticker = function(sticker){
				if(angular.isDefined(sticker) && angular.isNumber(sticker)){
					var now = new Date().getTime();
					$scope.inputSticker.time = now;
					$scope.inputSticker.content = sticker;
					DetailMessages($localStorage.userLogin.id).post($stateParams.id,$scope.inputSticker);
					$scope.Messages = {};
					$scope.Messages.content = "[sticker]";
					$scope.Messages.time = $scope.inputSticker.time;
					$scope.Messages.unread = 0;
					Messages($localStorage.userLogin.id).post($stateParams.id,$scope.Messages);
					Notification().post($stateParams.id);
					$scope.inputSticker = {"from":0,"type":"sticker"};
				}
			};

			$scope.showSendLocation = function(){
				$state.go('sendLocation',{id:$stateParams.id});
			};
		}
		$scope.hideLoading();
		$ionicScrollDelegate.scrollBottom();
	});

	$scope.blockPerson = function() {
		if(!$scope.Block.$value){
			Block($localStorage.userLogin.id).remove($stateParams.id);
			location.reload();
		} else {
			var confirmPopup = $ionicPopup.confirm({
			template: 'This person will not be able to send messages to you.Block him/her?',
			cssClass: 'popup-confirm-delete',
			buttons: [
				{
					text: 'NO',
					type: 'button-clear',
					onTap: function(e){ $scope.Block.$value = false }
				},
				{
					text: 'YES',
					type: 'button-clear button-no-delete',
					onTap: function(e){
						Block($localStorage.userLogin.id).block($stateParams.id);
						location.reload();
					}
				},
			]
			});
		}
	};

	$scope.clearHistory = function() {
	   var confirmPopup = $ionicPopup.confirm({
		template: 'Delete chat history with this person?',
		cssClass: 'popup-confirm-delete',
		buttons: [
			{
				text: 'NO',
				type: 'button-clear button-no-delete'
			},
			{
				text: 'YES',
				type: 'button-clear',
				onTap: function(e){
					DetailMessages($localStorage.userLogin.id).clear($stateParams.id);
					Messages($localStorage.userLogin.id).clear($stateParams.id);
				}
			},
		]
	   });
	};
})

.controller('sendLocation', function($scope, Location, $state, $stateParams, $localStorage, Messages, DetailMessages, DetailGroups, $ionicModal){
	Location($localStorage.userLogin.id).update();
	$scope.inputLocation = {"from":0,"type":"location"};
	if(angular.isUndefined($localStorage.recentLocation)) $localStorage.recentLocation = [];
	$scope.recent = $localStorage.recentLocation;
	$scope.Me = Location($localStorage.userLogin.id).get();
	$scope.Me.$loaded(function(){
		if(angular.isDefined($scope.Me.$value)) $scope.Me = {lat:21.036728,lng:105.8346994};
		$scope.location = {};
		$scope.location.lat = $scope.Me.lat;
		$scope.location.lng = $scope.Me.lng;
		var mapOptions = {
			center: {lat: $scope.location.lat, lng: $scope.location.lng},
			zoom: 18,
		};
		$scope.map = new google.maps.Map(document.getElementById("map"), mapOptions);
		//Marker location of user logined
		$scope.markerIcon = {
			url: 'css/img/icon-location-marker.png',
			scaledSize: new google.maps.Size(32, 32)
		};
		$scope.createMarker = function(){
			$scope.marker = new google.maps.Marker({
				map: $scope.map,
				position: $scope.location,
				icon: $scope.markerIcon
			});
		};
		$scope.createMarker();
		$scope.data = {};
		$scope.$watch('data.search', function(){
			if($scope.data.search){
				var request = {};
				request.query = $scope.data.search;
				$scope.search = new google.maps.places.PlacesService($scope.map);
				$scope.search.textSearch(request, function(resuilt, status){
					if (status == google.maps.places.PlacesServiceStatus.OK) {
						$scope.resuilt = resuilt;
					}
				});
			}
		});
		$scope.selectLocation = function(location){
			$scope.location.lat = location.geometry.location.lat();
			$scope.location.lng = location.geometry.location.lng();
			$scope.data.name = location.name;
			$scope.data.address = location.formatted_address;
			$scope.createMarker();
			$scope.map.panTo($scope.location);
			$scope.closeSearchLocation();
		};
		$scope.selectRecent = function(location){
			$scope.location = location.location;
			$scope.data.name = location.name;
			$scope.data.address = location.address;
			$scope.createMarker();
			$scope.map.panTo($scope.location);
		};
	});

	$ionicModal.fromTemplateUrl('templates/messages/search-location.html', {
    scope: $scope
	}).then(function(modal) {
		$scope.modalsearchLocation = modal;
	});
	$scope.showSearchLocation = function() {
		$scope.modalsearchLocation.show();
	};
	$scope.closeSearchLocation = function() {
		$scope.modalsearchLocation.hide();
	};

	$scope.sendLocation = function(){
		$scope.inputLocation.content = $scope.location;
		if(angular.isDefined($scope.inputLocation.content)){
			if(angular.isDefined($scope.data.name)){
				var check = true;
				angular.forEach($localStorage.recentLocation, function(value){
					if(value.name = $scope.data.name) check = false;
				});
				if(check == true){
					var newRecent = {};
					newRecent.location = $scope.inputLocation.content;
					newRecent.name = $scope.data.name;
					newRecent.address = $scope.data.address;
					$localStorage.recentLocation.push(newRecent);
				}
			}
			var now = new Date().getTime();
			$scope.inputLocation.time = now;
			if($stateParams.source == 'group'){
				$state.go('groupDetail', {id:$stateParams.id});
				$scope.inputLocation.from = $localStorage.userLogin.id;
				DetailGroups($stateParams.id).post($scope.inputLocation);
				$scope.inputLocation = {"from":0,"type":"location"};
			} else {
				$state.go('detail', {id:$stateParams.id});
				DetailMessages($localStorage.userLogin.id).post($stateParams.id,$scope.inputLocation);
				$scope.Messages = {};
				$scope.Messages.content = '[location]';
				$scope.Messages.time = $scope.inputLocation.time;
				$scope.Messages.unread = 0;
				Messages($localStorage.userLogin.id).post($stateParams.id,$scope.Messages);
				Notification().post($stateParams.id);
				$scope.inputLocation = {"from":0,"type":"location"};
			}
		}
	};
})

.controller('messagesCall', function($scope, $ionicModal, $timeout){
	$scope.callStatus = "Calling";
	$scope.callTime = {};
	$scope.callTime = {"minute":0,"second":0};
	$scope.call = {};
	$scope.call.recount = 0;
	$scope.call.size = 140;
	$scope.call.spacing = 20;
	$scope.call.margin = -70;
	$scope.call.top = -40;
	$scope.changeBackground = function(){
		if($scope.call.size >= 300) {
			$scope.call.size = 140;
			$scope.call.spacing = 20;
			$scope.call.margin = -70;
			$scope.call.top = -40;
			$scope.call.recount++;
		} else {
			$scope.call.size += 40;
			$scope.call.spacing += 10;
			$scope.call.margin -= 20;
			$scope.call.top -= 20;
		}
		if($scope.call.recount >= 2) $scope.callStatus = "Ringing...";
		if($scope.call.recount >= 3) {
			$scope.callStatus = "Quality:";
			$scope.callListing = true;
		}
		if($scope.callStatus == "Quality:"){
			$scope.callTime.second++;
			if($scope.callTime.second >= 60){
				$scope.callTime.minute++;
				$scope.callTime.second = 0;
			}
		}
		$scope.autoChange = $timeout(function(){$scope.changeBackground();}, 1000);
	}
	$scope.changeBackground();
	$ionicModal.fromTemplateUrl('templates/messages/call.html', {
    scope: $scope
	}).then(function(modal) {
    $scope.modalmessagesCall = modal;
	});
	$scope.showMessagesCall = function() {
		$scope.modalmessagesCall.show();
	};
	$scope.closeMessagesCall = function() {
		$scope.modalmessagesCall.hide();
		location.reload();
	};
})

.controller('contactsCtrl', function($scope, $ionicPopup, IonicClosePopupService, Block, Contacts, ContactsRecommended, User, $localStorage, $filter) {
	$scope.showLoading('Loading...');
	$scope.timeNow = new Date().getTime();
	$scope.contactRecommended = ContactsRecommended().get();
    $scope.contacts = Contacts($localStorage.userLogin.id).get();
	$scope.contacts.$loaded(function(){
		$scope.hideLoading();
		angular.forEach($scope.contacts, function(value){
			value.name = User(value.$id).getName();
			value.avatar = User(value.$id).getAvatar();
			value.lastSign = User(value.$id).getLastSign();
		});
		$scope.getAlpha = function(id){
			if(id >= 1){
				$scope.contacts = $filter('orderBy')($scope.contacts, 'name.$value');
				var lastName = $filter('firstChar')($scope.contacts[id-1].name.$value);
				var nowName = $filter('firstChar')($scope.contacts[id].name.$value);
				if(lastName == nowName) return false;
				else return true;
			}
		};
	});
	$scope.showMenuSearch = function(name,id){
	var confirmPopup = $ionicPopup.confirm({
		title: name,
		cssClass: 'popup-menu-contact',
		buttons: [
			{
				text: 'Block',
				type: 'button-clear',
				onTap: function(e){
				$scope.Block = Block($localStorage.userLogin.id).get(id);
				$scope.Block.$loaded(function(){
					if($scope.Block.$value){
						Block($localStorage.userLogin.id).remove(id);
						location.reload();
					} else {
						var confirmPopup = $ionicPopup.confirm({
						template: 'This person will not be able to send messages to you.Block him/her?',
						cssClass: 'popup-confirm-delete',
						buttons: [
							{
								text: 'NO',
								type: 'button-clear',
							},
							{
								text: 'YES',
								type: 'button-clear button-no-delete',
								onTap: function(e){
									Block($localStorage.userLogin.id).block(id);
									location.reload();
								}
							},
						]
						});
					}
				});
				}
			},
			{
				text: 'Remove friend',
				type: 'button-clear',
				onTap: function(e){
					Contacts($localStorage.userLogin.id).remove(id);
				}
			}
		]
	});
	IonicClosePopupService.register(confirmPopup);
	};
})

.controller('contactsRecommended', function($scope, ContactsRecommended, Contacts, User, $localStorage) {
	$scope.showLoading('Loading...');
	$scope.contacts = ContactsRecommended().get();
	$scope.id = $localStorage.userLogin.id;
	$scope.contacts.$loaded(function(){
		$scope.hideLoading();
		angular.forEach($scope.contacts, function(value){
			value.id = value.$id;
			value.name = User(value.$id).getName();
			value.avatar = User(value.$id).getAvatar();
			value.phone = User(value.$id).getPhone();
			value.role = User(value.$id).getRole();
		});
	});
	$scope.accept = function(id){
		Contacts($localStorage.userLogin.id).post(id);
		ContactsRecommended($localStorage.userLogin.id).remove(id);
	};
})

.controller('contactsAdd', function($scope, $state, $localStorage, $ionicPopup, Login) {
  $scope.choseArea = {name:"United Kingdom","areacode":"44"};
  $scope.warning = false;

  $scope.searchPerson = function(email) {
  	var result = firebase.database().ref('login');
	result.on('value', card => {
		let rawList = [];
		card.forEach( snap => {
			rawList.push({
				id: snap.key,
				email: snap.val().email
			});
		});
		for (var i = 0; i < rawList.length; i++) {
			if (rawList[i].email === email) {
				$state.go('tab.searchContacts', {id:rawList[i].id});
			}
		}
	});
  }

 //  $scope.searchPerson = function(phone){
	// $scope.warning = false;
	// $scope.phoneFull = $scope.choseArea.areacode + phone;
	// if($scope.phoneFull.length < 9) { $scope.warning = true }
	// else {
	// 	$scope.person = Login().get($scope.phoneFull);
	// 	$scope.person.$loaded(function(){
	// 		if(angular.isDefined($scope.person.id) && $scope.person.id != $localStorage.userLogin.id){
	// 			$state.go('tab.searchContacts', {id:$scope.person.id});
	// 		} else { $scope.warning = true }
	// 	});
	// }
 //  };
	$scope.inviteSms = function(){
		window.plugins.socialsharing.shareViaSMS(
			$scope.inviteText,
			null,
			function(msg) {
				console.log('ok: ' + msg)
			},
			function(msg) {
				alert('Error: ' + msg)
			}
		);
	};
})

.controller('contactsSearch', function($scope, $state, $stateParams, User, Contacts, $localStorage){
	$scope.showLoading("Loading...");
	$scope.contact = User($stateParams.id).get();
	$scope.contact.$loaded(function(){
		$scope.myFriend = Contacts($localStorage.userLogin.id).getFriend();
		$scope.myFriend.$loaded(function(){
			$scope.myFriend = Object.keys($scope.myFriend);
			if($scope.myFriend.indexOf($scope.contact.$id) != -1) $scope.isFriend = true;
			$scope.hideLoading();
		});
	});
	$scope.inviteFriend = function(id){
		$state.go('tab.inviteContacts', {id:id});
	};
})

.controller('contactsUpdate', function($scope, $timeout, $localStorage, Login, ContactsRecommended) {
	$scope.lastupdate = $localStorage.lastUpdate;
	document.addEventListener("deviceready", onDeviceReady, false);
	function onDeviceReady() {
		$scope.showLoading("Loading...");
		function onSuccess(contacts) {
			$scope.contacts = {};
			var nowPhone;
			angular.forEach(contacts, function(value){
				if(angular.isArray(value.phoneNumbers)){
					angular.forEach(value.phoneNumbers, function(phone){
						if(phone.type == "mobile") {
							nowPhone = phone.value.match(/\d/g);
							if(nowPhone != null) {
								nowPhone = Number(nowPhone.join(""));
								nowPhone = $localStorage.userLogin.areacode + nowPhone.toString();
								$scope.contacts[nowPhone] = Login().getId(nowPhone);
							}
						}
					});
				}
			});
			$scope.hideLoading();
			$scope.updateContacts = function(){
				$scope.showLoading("Loading...");
				angular.forEach($scope.contacts, function(valuePhone){
					ContactsRecommended($localStorage.userLogin.id).post(valuePhone.$value);
				});
				$localStorage.lastUpdate = new Date().getTime();
				$scope.lastupdate = $localStorage.lastUpdate;
				$scope.hideLoading();
			};
		};
		function onError(contactError) {
			$scope.hideLoading();
			alert(contactError);
		};
		var fields = ["phoneNumbers"];
		navigator.contacts.find(fields, onSuccess, onError);
	}
})

.controller('contactsNearby', function($scope, $http, $ionicModal, $ionicPopup, User, Contacts, $localStorage){
	$scope.settings = {"gender":"All","fromage":15,"toage":80,"visible":"All"};
	$scope.getRangeAge = function(){
		$scope.beforefrom = $scope.settings.fromage - 1;
		$scope.afterfrom = $scope.settings.fromage + 1;
		$scope.beforeto = $scope.settings.toage - 1;
		$scope.afterto = $scope.settings.toage + 1;
		if($scope.beforefrom < 15) $scope.beforefrom = 80;
		if($scope.beforeto < 15) $scope.beforeto = 80;
		if($scope.afterfrom > 80) $scope.afterfrom = 15;
		if($scope.afterto > 80) $scope.afterto = 15;
	};
	$scope.getRangeAge();
	$scope.selectRange = function(to,number){
		if(to == 1){
			$scope.settings.toage = number;
		} else {
			$scope.settings.fromage = number;
		}
		$scope.getRangeAge();
	};
	$scope.plusFromAge = function(){
		$scope.settings.fromage = $scope.afterfrom;
		$scope.getRangeAge();
	};
	$scope.minusFromAge = function(){
		$scope.settings.fromage = $scope.beforefrom;
		$scope.getRangeAge();
	};
	$scope.plusToAge = function(){
		$scope.settings.toage = $scope.afterto;
		$scope.getRangeAge();
	};
	$scope.minusToAge = function(){
		$scope.settings.toage = $scope.beforeto;
		$scope.getRangeAge();
	};

	$ionicModal.fromTemplateUrl('templates/contacts/nearby-setting.html', {
    scope: $scope
	}).then(function(modal) {
    $scope.modalnearbySetting = modal;
	});
	$scope.showNearbySetting = function() {
		$scope.iSettings = angular.copy($scope.settings);
		$scope.modalnearbySetting.show();
	};
	$scope.closeNearbySetting = function() {
		$scope.modalnearbySetting.hide();
	};
	$scope.cancelNearbySetting = function(){
		$scope.settings = $scope.iSettings;
		$scope.closeNearbySetting();
	};
	$scope.updateNearbySetting = function(){
		$scope.closeNearbySetting();
		$scope.updateNearby();
	};

	$scope.selectRangeAge = function() {
		$scope.iRangeAge = angular.copy($scope.settings);
		var selectRangeAge = $ionicPopup.confirm({
		title: 'Select age',
		templateUrl: 'templates/contacts/select-range-age.html',
		scope: $scope,
		cssClass: 'popup-select-age',
		buttons: [
			{
				text: 'CANCEL',
				type: 'button-clear',
				onTap: function(e){
					$scope.settings = $scope.iRangeAge;
					$scope.closeSelectRangeAge();
				}
			},
			{
				text: 'OK',
				type: 'button-clear button-ok',
				onTap: function(e){
					if($scope.settings.toage < $scope.settings.fromage){
						var tg = angular.copy($scope.settings.toage);
						$scope.settings.toage = angular.copy($scope.settings.fromage);
						$scope.settings.fromage = tg;
					}
					$scope.closeSelectRangeAge();
				}
			}
		]
		});
	   $scope.closeSelectRangeAge = function(){ selectRangeAge.close(); };
	};
	$scope.updateNearby = function(){
		$scope.showLoading('Loading...');
		$scope.nearby = new Array;
		var currentYear = new Date().getFullYear();
		$scope.myFriend = Contacts($localStorage.userLogin.id).getFriend();
		$scope.myFriend.$loaded(function(){
			$scope.myFriend = Object.keys($scope.myFriend);
			$scope.iNearby = User().filter($scope.settings.gender);
			$scope.iNearby.$loaded(function(){
				var userYear;
				angular.forEach($scope.iNearby, function(value){
					value.age = currentYear - Number(value.birthday.split('/')[2]);
					if(value.age >= $scope.settings.fromage && value.age <= $scope.settings.toage && $scope.myFriend.indexOf(value.$id) == -1)
						$scope.nearby.push(value);
				});
				$scope.hideLoading();
			});
		});
	};
	$scope.updateNearby();
})

.controller('nearbyLocation', function($scope, $ionicPopover, $localStorage, Location, User){
	Location($localStorage.userLogin.id).update();
	$scope.Me = Location($localStorage.userLogin.id).get();
	$scope.Me.$loaded(function(){
		if(angular.isDefined($scope.Me.$value)) $scope.Me = {lat:21.036728,lng:105.8346994};
		$scope.location = {};
		$scope.location.lat = $scope.Me.lat;
		$scope.location.lng = $scope.Me.lng;
		var mapOptions = {
			center: {lat: $scope.location.lat, lng: $scope.location.lng},
			zoom: 18,
		};
		$scope.map = new google.maps.Map(document.getElementById("map"), mapOptions);
		//Marker location of user logined
		$scope.markerIcon = {
			url: 'css/img/icon-location-marker.png',
			scaledSize: new google.maps.Size(32, 32)
		};
		$scope.marker = new google.maps.Marker({
			map: $scope.map,
			position: $scope.location,
			icon: $scope.markerIcon
		});
		$scope.nearby = Location().getNearby($scope.Me.nearby);
		$scope.nearby.$loaded(function(){
			delete $scope.nearby[$localStorage.userLogin.id];
			angular.forEach($scope.nearby, function(value,key){
				value.user = User(key).get();
				value.user.$loaded(function(){
					var currentYear = new Date().getFullYear();
					var userAge = value.user.birthday.split('/');
					var userAge = currentYear-Number(userAge[2]);
					if(angular.isDefined(value.user.avatar)) $scope.markerAvatar = value.user.avatar;
					else $scope.markerAvatar = 'css/img/icon-avatar.png';
					$scope.markerIcon = {
						url: $scope.markerAvatar,
						scaledSize: new google.maps.Size(32, 32)
					};
					$scope.marker = new google.maps.Marker({
						map: $scope.map,
						position: {lat:value.lat,lng:value.lng},
						icon: $scope.markerIcon,
					});
					var content = '<div class="list"><div class="item item-avatar"><img src="';
					if(angular.isDefined(value.user.avatar)) content = content+value.user.avatar;
					else content = content+'css/img/icon-avatar.png';
					content = content+'"><div>'+value.user.name+'</div><span class="positive margin-right ';
					if(value.user.gender == 'Male') content = content+'ion-male';
					else content = content+'ion-female';
					content = content+'"></span> '+userAge+'<a class="button button-outline button-positive" href="#/tab/contacts/invite/'+key+'">+ Add</a></div></div>';
					$scope.infowindow = new google.maps.InfoWindow({
						content: content
					});
					$scope.marker.addListener('click', function() {
						$scope.infowindow.open($scope.map, this);
					});
				});
			});
		});
	});
})

.controller('contactsInvite', function($scope, $stateParams, ContactsRecommended, $localStorage, User){
	$scope.Me = User($localStorage.userLogin.id).getName();
	$scope.Friend = {};
	$scope.Friend.name = User($stateParams.id).getName();
	$scope.Friend.phone = User($stateParams.id).getPhone();
	$scope.acceptInvite = function(){
		ContactsRecommended($localStorage.userLogin.id).post($stateParams.id);
		$scope.goBack();
	}
})

.controller('groupCtrl', function($scope, $http, $state, IonicClosePopupService, UserGroups, Groups, User, $ionicPopup, $localStorage){
	$scope.showLoading("Loading...");
	$scope.groups = UserGroups($localStorage.userLogin.id).get();
	$scope.groups.$loaded(function(){
		angular.forEach($scope.groups, function(item){
			item.avatar = new Array;
			item.numUser = Groups(item.$id).getNumUser();
			item.nameGroup = Groups(item.$id).getName();
			item.user = Groups(item.$id).getUser(4);
			item.user.$loaded(function(){
				item.name = new Array;
				angular.forEach(item.user, function(user){
					item.name.push(User(user.$id).getName());
					item.avatar.push(User(user.$id).getAvatar());
				});
			});
		});
		$scope.hideLoading();
	});
	$scope.showPopupMenuGroup = function(id,nameGroup,title) {
		if(nameGroup && angular.isString(nameGroup)) var name = nameGroup;
		else {
			var name = '';
			for(var i=0; i<=2; i++){
				if(title[i].$value) name += title[i].$value + ', ';
			}
		}
		var popupMenuGroup = $ionicPopup.show({
		title: name,
		cssClass: 'popup-menu-group',
		scope: null,
		buttons: [
		  { text: 'Leave group',type: 'button-clear',onTap: function(e){$scope.confirmLeave(id)} },
		  { text: 'Change name',type: 'button-clear',onTap: function(e){$scope.changeName(id,nameGroup)} },
		  { text: 'Add user',type: 'button-clear',onTap: function(e){$state.go('tab.addGroup',{id:id});} },
		  { text: 'View user',type: 'button-clear',onTap: function(e){$state.go('tab.viewGroup',{id:id});} },
		]
		});
		IonicClosePopupService.register(popupMenuGroup);
	};
	$scope.confirmLeave = function(id) {
	   var confirmPopup = $ionicPopup.confirm({
		template: 'Leave group chat will delete chat history. Leave?',
		cssClass: 'popup-confirm-leave',
		buttons: [
			{
				text: 'NO',
				type: 'button-clear'
			},
			{
				text: 'YES',
				type: 'button-clear button-no-delete',
				onTap: function(e){
					Groups(id).leave($localStorage.userLogin.id);
					UserGroups($localStorage.userLogin.id).leave(id);
				}
			},
		]
	   });
	};
	$scope.changeName = function(id,name){
		$scope.data = {name:name};
		var myPopup = $ionicPopup.show({
			template: '<input type="text" ng-model="data.name" class="light-bg">',
			cssClass: 'popup-confirm-leave',
			scope: $scope,
			buttons: [
			  {
				  text: 'Cancel',
				  type: 'button-clear'
			  },
			  {
				text: '<b>Save</b>',
				type: 'button-clear button-no-delete',
				onTap: function(e) {
					Groups(id).changeName($scope.data.name);
				}
			  }
			]
		});
	};
})

.controller('groupCreate', function($scope, $state, Groups, UserGroups, Contacts, User, $localStorage, $filter) {
	$scope.showLoading('Loading...');
    $scope.contacts = Contacts($localStorage.userLogin.id).get();
	$scope.contacts.$loaded(function(){
		$scope.hideLoading();
		angular.forEach($scope.contacts, function(value){
			value.name = User(value.$id).getName();
			value.avatar = User(value.$id).getAvatar();
		});
		$scope.getAlpha = function(id){
			if(id >= 1){
				$scope.contacts = $filter('orderBy')($scope.contacts, 'name.$value');
				var lastName = $filter('firstChar')($scope.contacts[id-1].name.$value);
				var nowName = $filter('firstChar')($scope.contacts[id].name.$value);
				if(lastName == nowName) return false;
				else return true;
			}
		};
	});
	$scope.contactsSelected = {};
	$scope.selectedCount = 0;
    $scope.change = function(contact){
        if (contact.selected) {
			$scope.contactsSelected[contact.$id] = true;
            $scope.selectedCount++;
        } else {
			delete $scope.contactsSelected[contact.$id];
            $scope.selectedCount--
        }
    };
	$scope.createGroup = function(){
		if($scope.selectedCount > 0){
			$scope.last = Groups().getLast();
			$scope.last.$loaded(function(){
				$scope.last = Number($scope.last.$value) + 1;
				Groups().create($scope.last,$localStorage.userLogin.id,$scope.selectedCount,$scope.contactsSelected,$scope.nameGroup);
				UserGroups().post($localStorage.userLogin.id,$scope.contactsSelected,$scope.last);
				$state.go('groupDetail', {id:$scope.last});
			});
		}
	};
})

.controller('groupAdd', function($scope, $stateParams, $state, Groups, UserGroups, Contacts, User, $localStorage, $filter){
	$scope.showLoading('Loading...');
    $scope.contacts = Contacts($localStorage.userLogin.id).get();
	$scope.contacts.$loaded(function(){
		$scope.hideLoading();
		angular.forEach($scope.contacts, function(value){
			value.name = User(value.$id).getName();
			value.avatar = User(value.$id).getAvatar();
		});
		$scope.getAlpha = function(id){
			if(id >= 1){
				$scope.contacts = $filter('orderBy')($scope.contacts, 'name.$value');
				var lastName = $filter('firstChar')($scope.contacts[id-1].name.$value);
				var nowName = $filter('firstChar')($scope.contacts[id].name.$value);
				if(lastName == nowName) return false;
				else return true;
			}
		};
	});
	$scope.contactsSelected = {};
	$scope.selectedCount = 0;
    $scope.change = function(contact){
        if (contact.selected) {
			$scope.contactsSelected[contact.$id] = true;
            $scope.selectedCount++;
        } else {
			delete $scope.contactsSelected[contact.$id];
            $scope.selectedCount--
        }
    };
	$scope.addGroup = function(){
		if($scope.selectedCount > 0){
			Groups($stateParams.id).add($scope.contactsSelected,$scope.selectedCount);
			UserGroups().add($stateParams.id,$scope.contactsSelected);
			$state.go('tab.group');
		}
	};
})

.controller('groupView', function($scope, $stateParams, Groups, User, $filter){
	$scope.showLoading("Loading...");
	$scope.name = Groups($stateParams.id).getName();
	$scope.count = Groups($stateParams.id).getNumUser();
	$scope.contacts = Groups($stateParams.id).getUser();
	$scope.contacts.$loaded(function(){
		angular.forEach($scope.contacts, function(value){
			value.name = User(value.$id).getName();
			value.avatar = User(value.$id).getAvatar();
		});
		$scope.getAlpha = function(id){
			if(id >= 1){
				$scope.contacts = $filter('orderBy')($scope.contacts, 'name.$value');
				var lastName = $filter('firstChar')($scope.contacts[id-1].name.$value);
				var nowName = $filter('firstChar')($scope.contacts[id].name.$value);
				if(lastName == nowName) return false;
				else return true;
			}
		};
		$scope.hideLoading();
	});
})

.controller('groupDetail', function($scope, $state, $localStorage, $ionicModal, $ionicTabsDelegate, $timeout, $ionicScrollDelegate, User, Groups, DetailGroups, Camera, $stateParams, Location){
	$scope.contentBottom = '100px';
	$scope.showLoading('Loading...');
	$scope.Me = $localStorage.userLogin.id;
	$scope.Groups = {};
	$scope.Groups.nameGroup = Groups($stateParams.id).getName();
	$scope.Groups.countUser = Groups($stateParams.id).getNumUser();
	$scope.Groups.user = Groups($stateParams.id).getUser();
	$scope.Groups.user.$loaded(function(){
		$scope.Groups.name = {};
		$scope.Groups.avatar = {};
		angular.forEach($scope.Groups.user, function(item){
			$scope.Groups.name[item.$id] = User(item.$id).getName();
			$scope.Groups.avatar[item.$id] = User(item.$id).getAvatar();
		});
	});
	$scope.Detail = DetailGroups($stateParams.id).get();
	$scope.Detail.$loaded(function(){
		$scope.hideLoading();
		$ionicScrollDelegate.scrollBottom();
	});
	var onNewMessage = firebase.database().ref('detailGroups').child($stateParams.id);
	onNewMessage.on('value', function(){ $ionicScrollDelegate.$getByHandle('mainScroll').scrollBottom(); });

	$scope.messageInput = function(option){
		if(option == "text") $scope.contentBottom = '100px';
		else $scope.contentBottom = '220px';
	};

	$scope.inputText = {"type":"text"};
	$scope.sendText = function(){
		if(angular.isDefined($scope.inputText.content) && angular.isString($scope.inputText.content)){
			var now = new Date().getTime();
			$scope.inputText.time = now;
			$scope.inputText.from = $scope.Me;
			DetailGroups($stateParams.id).post($scope.inputText);
			$scope.inputText = {"type":"text"};
		}
	};

	$scope.inputPicture = {"type":"picture"};
	$scope.takePicture = function(){
		$ionicTabsDelegate.select(1);
		var options = {
			quality:75,
			targetWidth:720,
			targetHeight:1280,
			destinationType:0
		};
		Camera.getPicture(options).then(function(imageData) {
		 $scope.inputPicture.content = "data:image/jpeg;base64,"+imageData;
		}, function(err) {
		 console.log(err);
		});
	};
	$scope.sendPicture = function(){
		if(angular.isDefined($scope.inputPicture.content)){
			var now = new Date().getTime();
			$scope.inputPicture.time = now;
			$scope.inputPicture.from = $scope.Me;
			DetailGroups($stateParams.id).post($scope.inputPicture);
			$scope.inputPicture = {"type":"picture"};
		} else $scope.takePicture();
	};

	$scope.showInputImages = function(){
		var options = {
			sourceType:0,
			destinationType:0
		};
		Camera.getPicture(options).then(function(imageData) {
		 $scope.inputPicture.content = "data:image/jpeg;base64,"+imageData;
		 $ionicTabsDelegate.select(1);
		}, function(err) {
		 console.log(err);
		});
	};

	$scope.inputSticker = {"type":"sticker"};
	$scope.sendSticker = function(sticker){
		if(angular.isDefined(sticker) && angular.isNumber(sticker)){
			var now = new Date().getTime();
			$scope.inputSticker.time = now;
			$scope.inputSticker.from = $scope.Me;
			$scope.inputSticker.content = sticker;
			DetailGroups($stateParams.id).post($scope.inputSticker);
			$scope.inputSticker = {"type":"sticker"};
		}
	};

	$scope.showSendLocation = function(){
		$state.go('sendLocation',{id:$stateParams.id,source:'group'});
	};
})

.controller('settingsCtrl', function($scope, $ionicModal, $http, $ionicPopup, IonicClosePopupService, $state, $localStorage, User, Settings, Camera) {
	$scope.profile = User($localStorage.userLogin.id).get();
	$scope.changeAvatar = function(){
		var options = {
			sourceType:0,
			allowEdit:true,
			targetWidth:160,
			targetHeight:160,
			destinationType:0
		};
		Camera.getPicture(options).then(function(imageData) {
		 $scope.avatar = "data:image/jpeg;base64,"+imageData;
		 User($localStorage.userLogin.id).editAvatar($scope.avatar);
		}, function(err) {
		 console.log(err);
		});
	};
	$ionicModal.fromTemplateUrl('templates/settings/name.html', {
    scope: $scope
	}).then(function(modal) {
    $scope.modalChangeName = modal;
	});
	$scope.showChangeName = function() {
    $scope.modalChangeName.show();
	};
	$scope.closeChangeName = function() {
	$scope.modalChangeName.hide();
	};
	$scope.changeName = function(){
		if($scope.profile.name.length <= 20){
			User($localStorage.userLogin.id).editName($scope.profile.name);
			$scope.closeChangeName();
		}
	};
	$ionicModal.fromTemplateUrl('templates/settings/phone.html', {
    scope: $scope
	}).then(function(modal) {
    $scope.modalChangePhone = modal;
	});
	$scope.showChangePhone = function() {
    $scope.modalChangePhone.show();
	};
	$scope.closeChangePhone = function() {
	$scope.modalChangePhone.hide();
	};
	$scope.dataPhone = {};
	$scope.dataPhone.areacode = $localStorage.userLogin.areacode;
	$scope.alertPhone = function(){
		var confirmPopup = $ionicPopup.confirm({
		template: 'Your phone number is too short in the country enter<br/><br/>Enter the country code if you have not entered',
		cssClass: 'popup-confirm-delete',
		buttons: [
			{
				text: 'OK',
				type: 'button-clear button-no-delete col-50 col-offset-50'
			}
		]
		});
	};
	$scope.changePhone = function(){
		if($scope.dataPhone.areacode && $scope.dataPhone.phone){
			$scope.phoneFull = $scope.dataPhone.areacode.toString() + $scope.dataPhone.phone;
			alert($scope.phoneFull.length);
			if($scope.phoneFull.length >= 10){
				User($localStorage.userLogin.id).editPhone($scope.phoneFull);
				$scope.closeChangePhone();
			} else $scope.alertPhone();
		} else $scope.alertPhone();
	};
	$scope.changeGender = function(gender){
		if(gender == 0) gender = "Male";
		else gender = "Female";
		User($localStorage.userLogin.id).editGender(gender);
	};

	$scope.settings = {};
	$scope.settings.messages = Settings($localStorage.userLogin.id).get('messages');
	$scope.changeMessages = function(child){
		var data = $scope.settings.messages[child];
		child = 'messages/'+child;
		Settings($localStorage.userLogin.id).change(child,data);
	};

	$scope.lastUpdate = $localStorage.lastUpdate;
	$scope.settings.contacts = Settings($localStorage.userLogin.id).get('contacts');
	$scope.changeContacts = function(child){
		var data = $scope.settings.contacts[child];
		child = 'contacts/'+child;
		Settings($localStorage.userLogin.id).change(child,data);
	};
	$scope.showPopupSettingsListFriends = function() {
		var popupSettingsListFriends = $ionicPopup.show({
		title: 'Friends list show in contacts',
		cssClass: 'popup-select-radio',
		scope: $scope,
		template: '<ion-radio ng-model="settings.contacts.show_friend" ng-value="true" ng-click="changeContacts(\'show_friend\'); closePopupSettingsListFriends()">All friends</ion-radio><ion-radio ng-model="settings.contacts.show_friend" ng-value="false" ng-click="changeContacts(\'show_friend\'); closePopupSettingsListFriends()">Friends who use Hichat</ion-radio>'
		});
		$scope.closePopupSettingsListFriends = function(){
			popupSettingsListFriends.close();
		};
		IonicClosePopupService.register(popupSettingsListFriends);
	};

	$scope.settings.languages = Settings($localStorage.userLogin.id).get('languages');
	$scope.showPopupSettingsLanguages = function() {
		var popupSettingsLanguages = $ionicPopup.show({
		title: 'Language',
		cssClass: 'popup-select-radio',
		scope: $scope,
		templateUrl: 'templates/settings/language.html'
		});
		$scope.closePopupSettingsLanguages = function(){
			popupSettingsLanguages.close();
		};
		IonicClosePopupService.register(popupSettingsLanguages);
	};
	$scope.changeLanguage = function(){
		Settings($localStorage.userLogin.id).change('languages/language',$scope.settings.languages.language);
	}
	$scope.showPopupSettingsFonts = function() {
		var popupSettingsFonts = $ionicPopup.show({
		title: 'Select font',
		cssClass: 'popup-select-radio',
		scope: $scope,
		template: '<ion-radio ng-model="settings.languages.font" ng-value="true" ng-click="changeFont(); closePopupSettingsFonts()">Hichat font</ion-radio><ion-radio ng-model="settings.languages.font" ng-value="false" ng-click="changeFont(); closePopupSettingsFonts()">System font</ion-radio>'
		});
		$scope.closePopupSettingsFonts = function(){
			popupSettingsFonts.close();
		};
		IonicClosePopupService.register(popupSettingsFonts);
	};
	$scope.changeFont = function(){
		Settings($localStorage.userLogin.id).change('languages/font',$scope.settings.languages.font);
	};

	$scope.showPopupLogout = function() {
	   var confirmPopup = $ionicPopup.confirm({
		template: 'Log out?',
		cssClass: 'popup-confirm-logout',
		buttons: [
			{
				text: 'NO',
				type: 'button-clear button-no-logout'
			},
			{
				text: 'YES',
				type: 'button-clear',
				onTap: function(e){
					delete $localStorage.userLogin;
					$state.go('walkthrough');
				}
			},
		]
	   });
	};
})

.controller('adminCtrl', function($scope, $ionicModal, $firebase, $firebaseArray) {
	var result = firebase.database().ref('user');
	console.log(result);
	result.on('value', card => {
		let rawList = [];
		card.forEach( snap => {
			rawList.push({
				id: snap.key,
				name: snap.val().name,
				phone: snap.val().phone,
				role: snap.val().role
			});
		});
		for (var i = 0; i < rawList.length; i++) {
			if (rawList[i].role === 'normal') {
				var table = document.getElementById('list');
				var name = "'" + rawList[i].name + "'";
				var phone = "'" + rawList[i].phone + "'";
				var id = "'" + rawList[i].id + "'"
				var newElement = '<div class="eachItem"><div class="listInfo">' + rawList[i].name + '</div><div class="listInfo">' + rawList[i].phone + '</div><div class="listEdit" onclick="gotochange(' + name + ', ' + phone + ', ' + id + ')">Edit</div></div>';
				table.innerHTML = table.innerHTML + newElement;
			}
		}
	});
})

.controller('changePasswordCtrl', function($scope, $ionicPopup, $state, $localStorage, Login){
  $scope.data = {};
  $scope.warning = false;
  $scope.showValue = {"type":"password","text":"Show"}
  $scope.showPassword = function(){
	if($scope.showValue.type == "password"){
		$scope.showValue = {"type":"text","text":"Hide"}
	} else {
		$scope.showValue = {"type":"password","text":"Show"}
	}
  };
  $scope.showcurrentValue = {"type":"password","text":"Show"}
  $scope.showcurrentPassword = function(){
	if($scope.showcurrentValue.type == "password"){
		$scope.showcurrentValue = {"type":"text","text":"Hide"}
	} else {
		$scope.showcurrentValue = {"type":"password","text":"Show"}
	}
  }
  $scope.updatePassword = function(){
	$scope.warning = false;
	if(!$scope.data.oldpassword || !$scope.data.password || !$scope.data.repassword){
		$scope.warning = true;
	} else {
		if($scope.data.password != $scope.data.repassword) $scope.showPopupError();
		else {
			$scope.User = Login().get($localStorage.userLogin.phone);
			$scope.User.$loaded(function(){
				if($scope.data.oldpassword != $scope.User.password) $scope.warning = true;
				else {
					Login().changePass($localStorage.userLogin.phone,$scope.data.password);
					$scope.data = {};
					$state.go('settingsAccount');
				}
			});
		}
	}
  };
	$scope.showPopupError = function() {
	   var confirmPopup = $ionicPopup.confirm({
		template: 'Invalid confirm password, please check and try again.',
		cssClass: 'popup-confirm-logout',
		buttons: [
			{
				text: 'CLOSE',
				type: 'button-clear button-no-logout'
			}
		]
	   });
	};
})

.controller('ChangeRoleCtrl', function($scope, $ionicModal, $firebase, $firebaseArray, Users, Login) {
	$scope.username = localStorage.getItem('name');
	$scope.phone = localStorage.getItem('phone');
	$scope.key = localStorage.getItem('id');
	$scope.goBack = function() {
		window.location = "#/tab/admin";
	}
	$scope.updateRole = function() {
		var e = document.getElementById("roleSelect");
		var newRole = e.options[e.selectedIndex].value;

		Users().changeRole($scope.key, newRole);
		Login().changeRole($scope.phone, newRole);
	}
})

.controller('searchCtrl', function($scope, $state, $localStorage, $ionicPopup, IonicClosePopupService, Contacts, User, Block){
	$scope.showLoading('Loading...');
	if(angular.isUndefined($localStorage.searchRecent)) $localStorage.searchRecent = new Object;
	$scope.Recent = $localStorage.searchRecent;
	$scope.Search = new Array;
	$scope.Contacts = Contacts($localStorage.userLogin.id).get();
	$scope.Contacts.$loaded(function(){
		angular.forEach($scope.Contacts, function(value){
			var Person = {"id":value.$id};
			Person.name = User(value.$id).getName();
			Person.avatar = User(value.$id).getAvatar();
			$scope.Search.push(Person);
		});
		$scope.hideLoading();
	});
	$scope.viewMessages = function(id){
		$state.go('detail',{id:id});
	};
	$scope.deleteRecent = function(name,id){
		var confirmPopup = $ionicPopup.confirm({
			title: name,
			cssClass: 'popup-menu-contact',
			buttons: [
				{
					text: 'Clear search history',
					type: 'button-clear',
					onTap: function(e){
						delete $localStorage.searchRecent[id];
					}
				},
			]
		});
		IonicClosePopupService.register(confirmPopup);
	};
	$scope.choseContact = function(contact){
		$localStorage.searchRecent[contact.id] = contact;
		$scope.viewMessages(contact.id);
	};
	$scope.showMenuSearch = function(name,id){
	var confirmPopup = $ionicPopup.confirm({
		title: name,
		cssClass: 'popup-menu-contact',
		buttons: [
			{
				text: 'Block',
				type: 'button-clear',
				onTap: function(e){
				$scope.Block = Block($localStorage.userLogin.id).get(id);
				$scope.Block.$loaded(function(){
					if($scope.Block.$value){
						Block($localStorage.userLogin.id).remove(id);
						location.reload();
					} else {
						var confirmPopup = $ionicPopup.confirm({
						template: 'This person will not be able to send messages to you.Block him/her?',
						cssClass: 'popup-confirm-delete',
						buttons: [
							{
								text: 'NO',
								type: 'button-clear',
							},
							{
								text: 'YES',
								type: 'button-clear button-no-delete',
								onTap: function(e){
									Block($localStorage.userLogin.id).block(id);
									location.reload();
								}
							},
						]
						});
					}
				});
				}
			},
			{
				text: 'Remove friend',
				type: 'button-clear',
				onTap: function(e){
					Contacts($localStorage.userLogin.id).remove(id);
				}
			}
		]
	});
	IonicClosePopupService.register(confirmPopup);
};
})

function isValidEmailAddress(emailAddress) {
	var emailParams = emailAddress.split("@");

	if (emailParams[1] === domain) {
		return true;
	}

	return false;
};
