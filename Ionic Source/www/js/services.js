angular.module('starter.services', ['firebase'])

.factory("Areacode", function($firebaseArray) {
	var item = firebase.database().ref('areacode');
	return $firebaseArray(item);
})

.factory("Test", function($firebaseArray) {
	var item = firebase.database().ref('user');
	return $firebaseArray(item);
})

.factory("Login", function($firebaseObject) {
	return function(){
		var item = firebase.database().ref('login');
		return {
			get: function(phone){
				item = item.child(phone);
				return $firebaseObject(item)
			},
			getId: function(phone){
				item = item.child(phone+'/id');
				return $firebaseObject(item);
			},
			getEmail: function(email){
				item = item.orderByChild('email/value').equalTo(email);
				return $firebaseObject(item);
			},
			set: function(phone, email){
				item = item.child('maxID');
				maxID = $firebaseObject(item);
				maxID.$loaded(function(){
					userID = maxID.$value +1;
					var user = firebase.database().ref('login').child(phone);
					user.child('id').set(userID);
					user.child('role').set('normal');
					user.child('email').set(email);
					item.set(userID);
				});
			},
			changePass: function(phone,pass){
				item.child(phone+'/password').set(pass);
			},
			changeRole: function(key, role){
				item.child(key+'/role').set(role);
			}
		}
	}
})

.factory("Users", function($firebaseArray) {
	return function(){
		var item = firebase.database().ref('user');
		return {
			get: function() {
				return $firebaseArray(item);
			},
			changeRole: function(name, role) {
				item.child(name+'/role').set(role);
			}
		}
	}
})

.factory("User", function($firebaseObject, $firebaseArray) {
	return function(id){
		var item = firebase.database().ref('user/'+id);
		return {
			get: function(){ return $firebaseObject(item) },
			set: function(data){ item.set(data); },
			getAvatar: function(){
				item = item.child('avatar');
				return $firebaseObject(item)
			},
			getName: function(){
				item = item.child('name');
				return $firebaseObject(item)
			},
			getPhone: function(){
				item = item.child('phone');
				return $firebaseObject(item)
			},
			getRole: function(){
				item = item.child('role');
				return $firebaseObject(item)
			},
			getLastSign: function(){
				item = item.child('lastSign');
				return $firebaseObject(item)
			},
			editAvatar: function(avatar){
				item = item.child('avatar').set(avatar);
			},
			editName: function(name){
				item.child('name').set(name);
			},
			editPhone: function(phone){
				item.child('phone').set(phone);
			},
			editGender: function(gender){
				item.child('gender').set(gender);
			},
			update: function(){
				var now = new Date().getTime();
				item.child('lastSign').set(now);
			},
			filter: function(gender){
				var filter = firebase.database().ref('user');
				if(gender != 'All') filter = filter.orderByChild('gender').equalTo(gender);
				return $firebaseArray(filter);
			},
			changeRole: function(name, role) {
				item.child(name+'/role').set(role);
			}
		}
	}
})

.factory("Block", function($firebaseObject){
	return function(id){
		var item = firebase.database().ref('block/'+id);
		return {
			get: function(user){
				item = item.child(user);
				return $firebaseObject(item)
			},
			remove: function(user){
				item.child(user).remove();
				var friend = firebase.database().ref('block/'+user);
				friend.child(id).remove();
			},
			block: function(user){
				item.child(user).set(true);
				var friend = firebase.database().ref('block/'+user);
				friend.child(id).set(true);
			}
		}
	}
})

.factory("Notification", function($firebaseObject) {
	return function(id){
		var item = firebase.database().ref('notification/'+id);
		return {
			get: function(){ return $firebaseObject(item) },
			post: function(friend){
				item = firebase.database().ref('notification/'+friend);
				var data = $firebaseObject(item.child('messagesNew'));
				data.$loaded(function(){
					var newNotification = Number(data.$value) + 1;
					item.child('messagesNew').set(newNotification);
				});
			},
			update: function(readed){
				var data = $firebaseObject(item.child('messagesNew'));
				data.$loaded(function(){
					var newNotification = Number(data.$value) - readed;
					if(angular.isNumber(data.$value) && newNotification > 0) item.child('messagesNew').set(newNotification);
					else item.child('messagesNew').remove();
				});
			}
		}
	}
})

.factory("Messages", function($firebaseArray, $firebaseObject) {
	return function(id){
		var item = firebase.database().ref('messages/'+id);
		return {
			get: function(){ return $firebaseArray(item) },
			getUnread: function(friend){
				item = item.child(friend);
				return $firebaseObject(item.child('unread'));
			},
			post: function(friend,data){
				item = item.child(friend);
				item.set(data);
				var messages = firebase.database().ref('messages/'+friend).child(id);
				messages.child('content').set(data.content);
				messages.child('time').set(data.time);
				var unread = $firebaseObject(messages.child('unread'));
				unread.$loaded(function(){
					var newUnread = unread.$value + 1;
					if(angular.isNumber(unread.$value)) messages.child('unread').set(newUnread);
					else messages.child('unread').set(1);
				});
			},
			delete: function(friend, unread){
				var userUnread = firebase.database().ref('notification/'+id+'/messagesNew');
				var nowUnread = $firebaseObject(userUnread);
				nowUnread.$loaded(function(){
					if(angular.isNumber(nowUnread.$value) && nowUnread.$value >0){
						userUnread.set(nowUnread.$value -unread)
					}
					item.child(friend).remove();
					item = firebase.database().ref('detailMessages/'+id).child(friend);
					item.remove();
				});
			},
			reset: function(friend){
				item = item.child(friend);
				item.child('unread').remove();
			},
			clear: function(friend){ item.child(friend).remove() }
		}
	}
})

.factory("DetailMessages", function($firebaseArray, $ionicScrollDelegate) {
	return function(id){
		var item = firebase.database().ref('detailMessages/'+id);
		return {
			get: function(friend){
				item = item.child(friend);
				return $firebaseArray(item)
			},
			post: function(friend,data){
				item = item.child(friend);
				var onComplete = function(){
					$ionicScrollDelegate.$getByHandle('mainScroll').scrollBottom();
				};
				item.push().set(data, onComplete);
				var friend = firebase.database().ref('detailMessages/'+friend).child(id);
				data.from = 1;
				friend.push().set(data);
			},
			delete: function(friend,id){
				item.child(friend+'/'+id).remove();
			},
			clear: function(friend){ item.child(friend).remove() }
		}
	}
})

.factory("Contacts", function($firebaseArray, $firebaseObject) {
	return function(id){
		var item = firebase.database().ref('contacts/'+id);
		return {
			get: function(){ return $firebaseArray(item) },
			getFriend: function(){ return $firebaseObject(item) },
			post: function(friend){
				item.child(friend).set(true);
				var friend = firebase.database().ref('contacts/'+friend);
				friend.child(id).set(true);
			},
			remove: function(friend){
				item.child(friend).remove();
				var friend = firebase.database().ref('contacts/'+friend);
				friend.child(id).remove();
			}
		}
	}
})

.factory("ContactsRecommended", function($firebaseArray) {
	return function(){
		var item = firebase.database().ref('user');
		return {
			get: function(){ return $firebaseArray(item) },
			remove: function(id){
				item.child(id).remove();
			}
		}
	}
})

.factory("Groups", function($firebaseArray, $firebaseObject) {
	return function(id){
		var item = firebase.database().ref('groups/'+id);
		return {
			getUser: function(number){
				if(angular.isDefined(number) && angular.isNumber(number)){
					item = item.child('user').limitToFirst(number);
				} else item = item.child('user');
				return $firebaseArray(item)
			},
			getName: function(){
				var name = item.child('name');
				return $firebaseObject(name);
			},
			getLast: function(){
				var last = firebase.database().ref('groups').child('last');
				return $firebaseObject(last);
			},
			getNumUser: function(){
				item = item.child('countUser');
				return $firebaseObject(item)
			},
			create: function(id,me,count,list,name){
				var groups = firebase.database().ref('groups');
				groups.child('last').set(id);
				groups = groups.child(id);
				groups.child('countUser').set(count+1);
				groups.child('user/'+me).set(true);
				if(name && angular.isString(name)) groups.child('name').set(name);
				angular.forEach(list, function(value,key){
					groups.child('user/'+key).set(true);
				});
			},
			add: function(list,count){
				var numUser = $firebaseObject(item.child('countUser'));
				numUser.$loaded(function(){
					item.child('countUser').set(numUser.$value +count);
					angular.forEach(list, function(value,key){
						item.child('user/'+key).set(true);
					});
				});
			},
			leave: function(userid){
				item.child('user/'+userid).remove();
				var numUser = $firebaseObject(item.child('countUser'));
				numUser.$loaded(function(){
					if(numUser.$value <= 3){
						var user = $firebaseArray(item.child('user'));
						var userGroups = firebase.database().ref('userGroups');
						user.$loaded(function(){
							angular.forEach(user, function(value){
								userGroups.child(value.$id+'/'+id).remove();
							});
							item.remove();
						});
					}
					item.child('countUser').set((numUser.$value)-1);
				});
			},
			changeName: function(name){
				item.child('name').set(name);
			}
		}
	}
})

.factory("DetailGroups", function($firebaseArray, $ionicScrollDelegate) {
	return function(id){
		var item = firebase.database().ref('detailGroups/'+id);
		return {
			get: function(){ return $firebaseArray(item) },
			post: function(data){
				var onComplete = function(){
					$ionicScrollDelegate.scrollBottom();
				};
				item.push().set(data, onComplete);
			}
		}
	}
})

.factory("UserGroups", function($firebaseArray) {
	return function(id){
		var item = firebase.database().ref('userGroups/'+id);
		return {
			get: function(){ return $firebaseArray(item) },
			post: function(me,list,id){
				var groups = firebase.database().ref('userGroups');
				groups.child(me+'/'+id).set(true);
				angular.forEach(list, function(value,key){
					groups.child(key+'/'+id).set(true);
				});
			},
			add: function(id,list){
				var groups = firebase.database().ref('userGroups');
				angular.forEach(list, function(value,key){
					groups.child(key+'/'+id).set(true);
				});
			},
			leave: function(id){
				item.child(id).remove();
			}
		}
	}
})

.factory("Settings", function($firebaseObject) {
	return function(id){
		var item = firebase.database().ref('settings/'+id);
		return {
			get: function(child){
				item = item.child(child);
				return $firebaseObject(item)
			},
			change: function(child,data){
				item.child(child).set(data);
			}
		}
	}
})

.factory('Camera', function($q) {
   return {
      getPicture: function(options) {
         var q = $q.defer();
         navigator.camera.getPicture(function(result) {
            q.resolve(result);
         }, function(err) {
            q.reject(err);
         }, options);
         return q.promise;
      }
   }
})

.factory('Location', function($firebaseObject, $ionicPopup){
	return function(id){
		var item = firebase.database().ref('location/'+id);
		return {
			get: function(){ return $firebaseObject(item) },
			getNearby: function(location){
				item = item.parent.orderByChild('nearby').equalTo(location);
				return $firebaseObject(item);
			},
			update: function(){
				function onSuccess(data){
					var location = {};
					location.lat = data.coords.latitude;
					location.lng = data.coords.longitude;
					location.nearby = data.coords.latitude.toFixed(2)+'_'+data.coords.longitude.toFixed(2);
					item.set(location);
				}
				function onError(err){
					var confirmPopup = $ionicPopup.confirm({
					template: '<p><b class="dark">Error: The Geolocation service failed.</b></p>You should enable to share your position on your mobile',
					cssClass: 'popup-confirm-delete',
					buttons: [
						{
							text: 'Read More',
							type: 'button-clear col-66 button-no-delete',
							onTap: function(){
								var ref = cordova.InAppBrowser.open('https://support.google.com/maps/answer/2839911?co=GENIE.Platform%3DAndroid&hl=en&oco=1', '_blank', 'location=yes');
							}
						},
						{
							text: 'OK',
							type: 'button-clear col-33 button-no-delete'
						}
					]
					});
				}
				navigator.geolocation.getCurrentPosition(onSuccess, onError);
			}
		}
	}
})

;