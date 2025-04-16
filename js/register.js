document.addEventListener('DOMContentLoaded', function() {
    const registerForm = document.getElementById('register-form');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const confirmPasswordInput = document.getElementById('confirm-password');
    const errorMessage = document.getElementById('error-message');
    const successMessage = document.getElementById('success-message');
    const registerBtn = document.getElementById('register-btn');
    
    registerForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
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
            .then((userCredential) => {
                successMessage.textContent = 'Registration successful! Redirecting to login...';
                successMessage.style.display = 'block';
                
                registerForm.reset();
                
                setTimeout(() => {
                    window.location.href = 'index.html';
                }, 2000);
            })
            .catch((error) => {
                errorMessage.textContent = error.message;
                errorMessage.style.display = 'block';
                registerBtn.disabled = false;
            });
    });
});
