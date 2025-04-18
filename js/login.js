document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('login-form');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const errorMessage = document.getElementById('error-message');
    const successMessage = document.getElementById('success-message');
    const forgotPasswordLink = document.getElementById('forgot-password-link');
    
    firebase.auth().onAuthStateChanged(function(user) {
        if (user) {
            window.location.href = 'dashboard.html';
        }
    });
    
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('registered') === 'true') {
        showSuccess('Registration successful! Please check your email to verify your account.');
    }
    
    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const email = emailInput.value.trim();
        const password = passwordInput.value;
        
        errorMessage.style.display = 'none';
        successMessage.style.display = 'none';
        
        if (!email || !password) {
            showError('Please enter both email and password');
            return;
        }
        
        firebase.auth().signInWithEmailAndPassword(email, password)
            .then((userCredential) => {
                const user = userCredential.user;
                
                if (!user.emailVerified) {
                    firebase.auth().signOut();
                    showError('Please verify your email before logging in. Check your inbox for a verification link.');
                    return;
                }
                
                window.location.href = 'dashboard.html';
            })
            .catch((error) => {
                console.log("Login error:", error);
                
                let errorMsg = error.message;
                
                try {
                    if (typeof error.message === 'string' && 
                        (error.message.startsWith('{') || error.message.includes('INVALID_LOGIN_CREDENTIALS'))) {
                        
                        if (error.message.includes('INVALID_LOGIN_CREDENTIALS')) {
                            errorMsg = 'Invalid email or password';
                        } else {
                            const errorObj = JSON.parse(error.message);
                            if (errorObj.error && errorObj.error.message) {
                                if (errorObj.error.message === 'INVALID_LOGIN_CREDENTIALS') {
                                    errorMsg = 'Invalid email or password';
                                } else {
                                    errorMsg = errorObj.error.message;
                                }
                            }
                        }
                    } else if (error.code) {
                        switch(error.code) {
                            case 'auth/wrong-password':
                            case 'auth/user-not-found':
                            case 'auth/invalid-credential':
                                errorMsg = 'Invalid email or password';
                                break;
                            case 'auth/too-many-requests':
                                errorMsg = 'Too many failed login attempts. Please try again later or reset your password.';
                                break;
                            default:
                                errorMsg = error.message;
                        }
                    }
                } catch (e) {
                    if (error.code) {
                        switch(error.code) {
                            case 'auth/wrong-password':
                            case 'auth/user-not-found':
                            case 'auth/invalid-credential':
                                errorMsg = 'Invalid email or password';
                                break;
                            case 'auth/too-many-requests':
                                errorMsg = 'Too many failed login attempts. Please try again later or reset your password.';
                                break;
                            default:
                                errorMsg = error.message;
                        }
                    }
                }
                
                showError(errorMsg);
            });
    });
    
    forgotPasswordLink.addEventListener('click', function(e) {
        e.preventDefault();
        
        const email = prompt('Please enter your email address to receive a password reset link:');
        
        if (!email) return;
        
        if (!isValidEmail(email)) {
            alert('Please enter a valid email address.');
            return;
        }
        
        let accountExists = false;
        
        firebase.auth().fetchSignInMethodsForEmail(email)
            .then((signInMethods) => {
                if (signInMethods.length === 0) {
                    alert('No account found with this email address.');
                    return Promise.reject('no-account');
                }
                
                accountExists = true;
                return firebase.auth().sendPasswordResetEmail(email);
            })
            .then(() => {
                if (accountExists) {
                    alert('Password reset link has been sent to your email.');
                }
            })
            .catch((error) => {
                if (error !== 'no-account') {
                    alert('Error: ' + error.message);
                }
            });
    });
    
    function showError(message) {
        errorMessage.textContent = message;
        errorMessage.style.display = 'block';
    }
    
    function showSuccess(message) {
        successMessage.textContent = message;
        successMessage.style.display = 'block';
    }
    
    function isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }
});
