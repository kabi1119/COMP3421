document.addEventListener('DOMContentLoaded', function() {
    const signupBtn = document.getElementById('signup-btn');
    
    firebase.auth().onAuthStateChanged(function(user) {
        if (user) {
            window.location.href = 'dashboard.html';
        }
    });

    signupBtn.addEventListener('click', function() {
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirm-password').value;
        
        if (!email || !password || !confirmPassword) {
            alert('Please fill in all fields');
            return;
        }
        
        if (password !== confirmPassword) {
            alert('Passwords do not match');
            return;
        }
        
        if (password.length < 6) {
            alert('Password should be at least 6 characters');
            return;
        }
        
        firebase.auth().createUserWithEmailAndPassword(email, password)
            .then(function() {
                window.location.href = 'dashboard.html';
            })
            .catch(function(error) {
                alert('Signup failed: ' + error.message);
            });
    });
});
