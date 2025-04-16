document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('login-form');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const errorMessage = document.getElementById('error-message');
    const loginBtn = document.getElementById('login-btn');
    
    firebase.auth().onAuthStateChanged(function(user) {
        if (user) {
            window.location.href = 'dashboard.html';
        }
    });
    
    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const email = emailInput.value.trim();
        const password = passwordInput.value;
        
        errorMessage.textContent = '';
        errorMessage.style.display = 'none';
        
        if (!email || !password) {
            errorMessage.textContent = 'Please enter both email and password.';
            errorMessage.style.display = 'block';
            return;
        }
        
        loginBtn.disabled = true;
        
        firebase.auth().signInWithEmailAndPassword(email, password)
            .then((userCredential) => {
                window.location.href = 'dashboard.html';
            })
            .catch((error) => {
                errorMessage.textContent = 'Invalid email or password.';
                errorMessage.style.display = 'block';
                loginBtn.disabled = false;
            });
    });
});
