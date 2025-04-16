document.addEventListener('DOMContentLoaded', function() {
    const loginBtn = document.getElementById('login-btn');

    firebase.auth().onAuthStateChanged(function(user) {
        if (user) {
            window.location.href = 'dashboard.html';
        }
    });

    loginBtn.addEventListener('click', function() {
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        
        if (!email || !password) {
            alert('Please enter both email and password');
            return;
        }
        
        firebase.auth().signInWithEmailAndPassword(email, password)
            .then(function() {
                window.location.href = 'dashboard.html';
            })
            .catch(function(error) {
                alert('Login failed: ' + error.message);
            });
    });
});
