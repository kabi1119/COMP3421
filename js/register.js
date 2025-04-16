document.addEventListener('DOMContentLoaded', function() {
    const registerForm = document.getElementById('register-form');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const confirmPasswordInput = document.getElementById('confirm-password');
    const errorMessage = document.getElementById('error-message');
    const successMessage = document.getElementById('success-message');
    const registerBtn = document.getElementById('register-btn');
    
    console.log("Register script loaded");
    
    registerBtn.addEventListener('click', function() {
        console.log("Register button clicked");
        
        const email = emailInput.value.trim();
        const password = passwordInput.value;
        const confirmPassword = confirmPasswordInput.value;
        
        console.log("Email:", email);
        console.log("Password length:", password.length);
        console.log("Confirm password length:", confirmPassword.length);
        
        errorMessage.textContent = '';
        errorMessage.style.display = 'none';
        successMessage.textContent = '';
        successMessage.style.display = 'none';
        
        if (!email || !password || !confirmPassword) {
            console.log("Missing fields");
            errorMessage.textContent = 'Please fill in all fields.';
            errorMessage.style.display = 'block';
            return;
        }
        
        if (password !== confirmPassword) {
            console.log("Passwords don't match");
            errorMessage.textContent = 'Passwords do not match.';
            errorMessage.style.display = 'block';
            return;
        }
        
        if (password.length < 6) {
            console.log("Password too short");
            errorMessage.textContent = 'Password must be at least 6 characters.';
            errorMessage.style.display = 'block';
            return;
        }
        
        registerBtn.disabled = true;
        console.log("Attempting to create user");
        
        firebase.auth().createUserWithEmailAndPassword(email, password)
            .then((userCredential) => {
                console.log("User creation successful");
                successMessage.textContent = 'Registration successful! Redirecting to login...';
                successMessage.style.display = 'block';
                
                setTimeout(() => {
                    console.log("Redirecting to login page");
                    window.location.href = 'index.html';
                }, 2000);
            })
            .catch((error) => {
                console.error("User creation error:", error);
                errorMessage.textContent = error.message;
                errorMessage.style.display = 'block';
                registerBtn.disabled = false;
            });
    });
});
