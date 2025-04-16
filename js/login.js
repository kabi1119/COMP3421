document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('login-form');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const errorMessage = document.getElementById('error-message');
    const loginBtn = document.getElementById('login-btn');
    
    console.log("Login script loaded");
    
    firebase.auth().onAuthStateChanged(function(user) {
        console.log("Auth state changed", user);
        if (user) {
            console.log("User is signed in, redirecting to dashboard");
            window.location.href = 'dashboard.html';
        }
    });
    
    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        console.log("Login form submitted");
        
        const email = emailInput.value.trim();
        const password = passwordInput.value;
        
        console.log("Email:", email);
        console.log("Password length:", password.length);
        
        errorMessage.textContent = '';
        errorMessage.style.display = 'none';
        
        if (!email || !password) {
            console.log("Email or password missing");
            errorMessage.textContent = 'Please enter both email and password.';
            errorMessage.style.display = 'block';
            return;
        }
        
        loginBtn.disabled = true;
        console.log("Attempting to sign in");
        
        firebase.auth().signInWithEmailAndPassword(email, password)
            .then((userCredential) => {
                console.log("Sign in successful");
                window.location.href = 'dashboard.html';
            })
            .catch((error) => {
                console.error("Sign in error:", error);
                errorMessage.textContent = 'Invalid email or password.';
                errorMessage.style.display = 'block';
                loginBtn.disabled = false;
            });
    });
});
