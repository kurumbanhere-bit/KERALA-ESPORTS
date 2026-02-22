importScripts('https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.23.0/firebase-messaging-compat.js');

// Ninte athe config ivideyum kodukkanam
const firebaseConfig = {
    apiKey: "AIzaSyBrHcONT6y0he3fzrtRGqdQMZfIMpGxcNo",
    authDomain: "kl-esports.firebaseapp.com",
    databaseURL: "https://kl-esports-default-rtdb.firebaseio.com",
    projectId: "kl-esports",
    storageBucket: "kl-esports.appspot.com",
    messagingSenderId: "440301376580",
    appId: "1:440301376580:web:fb0b8ae0df3fe096bd1811"
};

firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

// Background-il message vannal ithu handle cheyyum
messaging.onBackgroundMessage((payload) => {
    console.log('Background message received: ', payload);
    const notificationTitle = payload.notification.title;
    const notificationOptions = {
        body: payload.notification.body,
        icon: 'https://cdn-icons-png.flaticon.com/512/5607/5607065.png' // Icon ninte ishtathinu maattaam
    };
    self.registration.showNotification(notificationTitle, notificationOptions);
});
