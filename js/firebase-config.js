const firebaseConfig = {
    apiKey: "AIzaSyBcZO18FS3lLoNG3MGRqla1qyOCUWypY3A",
    authDomain: "comp3421-65d4a.firebaseapp.com",
    projectId: "comp3421-65d4a",
    storageBucket: "comp3421-65d4a.firebasestorage.app",
    messagingSenderId: "1027414564286",
    appId: "1:1027414564286:web:b5857415144cc8622f6def",
    measurementId: "G-VM6X9DP7PH"
};

firebase.initializeApp(firebaseConfig);
console.log("Firebase initialized");

const auth = firebase.auth();
const db = firebase.firestore();
