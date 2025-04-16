document.addEventListener('DOMContentLoaded', function() {
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const confirmPasswordInput = document.getElementById('confirm-password');
    const errorMessage = document.getElementById('error-message');
    const successMessage = document.getElementById('success-message');
    const registerBtn = document.getElementById('register-btn');
    
    // Check if user is already logged in
    firebase.auth().onAuthStateChanged(function(user) {
        if (user) {
            window.location.href = 'dashboard.html';
        }
    });
    
    // Function to handle registration
    function attemptRegistration() {
        const email = emailInput.value.trim();
        const password = passwordInput.value;
        const confirmPassword = confirmPasswordInput.value;
        
        errorMessage.textContent = '';
        errorMessage.style.display = 'none';
        successMessage.textContent = '';
        successMessage.style.display = 'none';
        
        if (!email || !password || !confirmPassword) {
            errorMessage.textContent = 'Please fill in all fields.';
            errorMessage.style.display = 'block';
            return;
        }
        
        if (password !== confirmPassword) {
            errorMessage.textContent = 'Passwords do not match.';
            errorMessage.style.display = 'block';
            return;
        }
        
        if (password.length < 6) {
            errorMessage.textContent = 'Password must be at least 6 characters.';
            errorMessage.style.display = 'block';
            return;
        }
        
        registerBtn.disabled = true;
        
        firebase.auth().createUserWithEmailAndPassword(email, password)
            .then(function(userCredential) {
                successMessage.textContent = 'Registration successful! Redirecting to login...';
                successMessage.style.display = 'block';
                
                firebase.auth().signOut().then(function() {
                    setTimeout(function() {
                        window.location.href = 'index.html';
                    }, 2000);
                });
            })
            .catch(function(error) {
                errorMessage.textContent = error.message;
                errorMessage.style.display = 'block';
                registerBtn.disabled = false;
            });
    }
    
    // Register button click handler
    registerBtn.addEventListener('click', attemptRegistration);
    
    // Add keydown event listeners for Enter key (using keydown instead of keypress)
    emailInput.addEventListener('keydown', function(e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            passwordInput.focus();
        }
    });
    
    passwordInput.addEventListener('keydown', function(e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            confirmPasswordInput.focus();
        }
    });
    
    confirmPasswordInput.addEventListener('keydown', function(e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            attemptRegistration();
        }
    });
    
    // Alternative approach: handle Enter key for the entire form
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Enter') {
            // If focus is on confirm password field, attempt registration
            if (document.activeElement === confirmPasswordInput) {
                e.preventDefault();
                attemptRegistration();
            }
            // If focus is on password field, move to confirm password
            else if (document.activeElement === passwordInput) {
                e.preventDefault();
                confirmPasswordInput.focus();
            }
            // If focus is on email field, move to password
            else if (document.activeElement === emailInput) {
                e.preventDefault();
                passwordInput.focus();
            }
        }
    });
});
