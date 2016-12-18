document.addEventListener("DOMContentLoaded", function() {
	document.addEventListener("deviceready", onDeviceReady, false);
});

function onDeviceReady() {
    window.plugins.phonenumber.get(success, failed);
}

function success(phonenumber) {
    localStorage.setItem('number', phonenumber);
}

function failed(phonenumber) {
    alert("Error " + phonenumber);
}