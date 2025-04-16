document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('login-form');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const loginBtn = document.getElementById('login-btn');
    const errorMessage = document.getElementById('error-message');
    const successMessage = document.getElementById('success-message');
    
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('registered') === 'true' && successMessage) {
        successMessage.textContent = 'Registration completed! Please verify your email before logging in.';
        successMessage.style.display = 'block';
    }
    
    loginBtn.addEventListener('click', function(e) {
        e.preventDefault();
        
        const email = emailInput.value.trim();
        const password = passwordInput.value;
        
        if (errorMessage) errorMessage.style.display = 'none';
        if (successMessage) successMessage.style.display = 'none';
        
        if (!email || !password) {
            showError('Please enter both email and password');
            return;
        }
        
        loginBtn.disabled = true;
        
        firebase.auth().signInWithEmailAndPassword(email, password)
            .then((userCredential) => {
                const user = userCredential.user;
                
                if (!user.emailVerified) {
                    return firebase.auth().signOut().then(() => {
                        showError('Please verify your email before logging in. Check your inbox for a verification link.');
                        loginBtn.disabled = false;
                    });
                } else {
                    window.location.href = 'dashboard.html';
                }
            })
            .catch((error) => {
                console.log("Error:", error);
                
                if (error.code === 'auth/invalid-credential' || 
                    error.code === 'auth/user-not-found' || 
                    error.code === 'auth/wrong-password') {
                    showError('Invalid email or password. Please try again.');
                } else if (error.code === 'auth/too-many-requests') {
                    showError('Too many failed login attempts. Please try again later.');
                } else if (error.code === 'auth/user-disabled') {
                    showError('This account has been disabled.');
                } else if (error.message && error.message.includes('INVALID_LOGIN_CREDENTIALS')) {
                    showError('Invalid email or password. Please try again.');
                } else {
                    showError('Login error: ' + error.message);
                }
                
                loginBtn.disabled = false;
            });
    });
    
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            loginBtn.click();
        });
    }
    
    function showError(message) {
        if (errorMessage) {
            errorMessage.textContent = message;
            errorMessage.style.display = 'block';
        } else {
            alert(message);
        }
    }
});
