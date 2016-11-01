1) Creating the release build:
cordova build --release android

2) Creating a keystore for Google Play Store app sign (only first time):
keytool -genkey -v -keystore my-release-key.keystore -alias alias_name -keyalg RSA -keysize 2048 -validity 10000
Keystore password: demopassword

3) Jarsigner tool, for creating a trusted Play Store application:
jarsigner -verbose -sigalg SHA1withRSA -digestalg SHA1 -keystore my-release-key.keystore "C:\Users\Dusan Nesic\Documents\HiChat\Ionic Source\platforms\android\build\outputs\apk\android-release-unsigned.apk" alias_name

4) Switching to the directory where Android SDK is installed:
cd "C:\Users\Dusan Nesic\AppData\Local\Android\android-sdk\build-tools\24.0.1"

5) Running Zipalign tool that creates final APK file ready for upload on Google Play Store:
.\zipalign.exe -v 4 "C:\Users\Dusan Nesic\Documents\HiChat\Ionic Source\platforms\android\build\outputs\apk\android-release-unsigned.apk" "C:\Users\Dusan Nesic\Documents\HiChat\Ionic Source\platforms\android\build\outputs\apk\RebrandIm.apk"