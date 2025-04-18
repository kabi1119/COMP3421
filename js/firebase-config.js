const firebaseConfig = {
    apiKey: "AIzaSyDwviP19WkHC_ucfmeAKyvVy4hEcceHfSw",
    authDomain: "comp3421-2f083.firebaseapp.com",
    projectId: "comp3421-2f083",
    storageBucket: "comp3421-2f083.firebasestorage.app",
    messagingSenderId: "965641466118",
    appId: "1:965641466118:web:433392e3716a3be85f2e87",
    measurementId: "G-P7ZCRFHF5M"
};

if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}

const auth = firebase.auth();
const db = firebase.firestore();
