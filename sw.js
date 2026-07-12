importScripts('https://www.gstatic.com/firebasejs/11.1.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/11.1.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyDgi3--q8nDGfps5MV4AmC8B4PYPMfAPZo",
  authDomain: "yousef-a3438.firebaseapp.com",
  projectId: "yousef-a3438",
  storageBucket: "yousef-a3438.firebasestorage.app",
  messagingSenderId: "645915709487",
  appId: "1:645915709487:web:588dae85e94d33daa636da"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  const title = (payload.notification && payload.notification.title) || '🏠 رزق البنات';
  const options = {
    body: (payload.notification && payload.notification.body) || '',
    icon: '/icon-192.png'
  };
  self.registration.showNotification(title, options);
});
