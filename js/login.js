document.addEventListener('DOMContentLoaded', function() {
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const errorMessage = document.getElementById('error-message');
    const successMessage = document.getElementById('success-message');
    const loginBtn = document.getElementById('login-btn');
    
    // Check if user is already logged in
    firebase.auth().onAuthStateChanged(function(user) {
        if (user) {
            window.location.href = 'dashboard.html';
        }
    });
    
    // Function to handle login
    function attemptLogin() {
        const email = emailInput.value.trim();
        const password = passwordInput.value;
        
        errorMessage.textContent = '';
        errorMessage.style.display = 'none';
        successMessage.textContent = '';
        successMessage.style.display = 'none';
        
        if (!email || !password) {
            errorMessage.textContent = 'Please enter both email and password.';
            errorMessage.style.display = 'block';
            return;
        }
        
        loginBtn.disabled = true;
        
        firebase.auth().signInWithEmailAndPassword(email, password)
            .then((userCredential) => {
                successMessage.textContent = 'Login successful! Redirecting...';
                successMessage.style.display = 'block';
                
                setTimeout(function() {
                    window.location.href = 'dashboard.html';
                }, 1000);
            })
            .catch((error) => {
                errorMessage.textContent = 'Invalid email or password.';
                errorMessage.style.display = 'block';
                loginBtn.disabled = false;
            });
    }
    
    // Login button click handler
    loginBtn.addEventListener('click', attemptLogin);
    
    // Add keydown event listeners for Enter key
    emailInput.addEventListener('keydown', function(e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            passwordInput.focus();
        }
    });
    
    passwordInput.addEventListener('keydown', function(e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            attemptLogin();
        }
    });
    
    // Alternative approach: handle Enter key for the entire form
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Enter') {
            // If focus is on password field, attempt login
            if (document.activeElement === passwordInput) {
                e.preventDefault();
                attemptLogin();
            }
            // If focus is on email field, move to password
            else if (document.activeElement === emailInput) {
                e.preventDefault();
                passwordInput.focus();
            }
        }
    });
});
