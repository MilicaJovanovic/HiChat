document.addEventListener("deviceready", onDeviceReady, false);

function onDeviceReady() {
  alert("The script is loaded!");
  navigator.splashscreen.hide();
  window.plugins.phonenumber.get(success, failed);

}

function success(phonenumber) {
    alert("My number is " + phonenumber);
}

function failed(error) {
	alert(error);
}

// Android only: check permission
function hasReadPermission() {
  window.plugins.sim.hasReadPermission(successCallback, errorCallback);
}

// Android only: request permission
function requestReadPermission() {
  window.plugins.sim.requestReadPermission(successCallback, errorCallback);
}