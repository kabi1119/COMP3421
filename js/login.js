document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('login-form');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const loginBtn = document.getElementById('login-btn');
    const errorMessage = document.getElementById('error-message');
    const forgotPasswordLink = document.getElementById('forgot-password');
    const resetPasswordModal = document.getElementById('reset-password-modal');
    const resetEmailInput = document.getElementById('reset-email');
    const resetPasswordBtn = document.getElementById('reset-password-btn');
    const closeResetModal = document.getElementById('close-reset-modal');
    const resetErrorMessage = document.getElementById('reset-error-message');
    const resetSuccessMessage = document.getElementById('reset-success-message');
    
    Analytics.trackPageView('Login Page');
    
    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const email = emailInput.value.trim();
        const password = passwordInput.value;
        
        if (!email || !password) {
            errorMessage.textContent = 'Please enter both email and password.';
            errorMessage.style.display = 'block';
            
            Analytics.trackEvent('login_validation_error', {
                'error': 'missing_fields',
                'has_email': !!email,
                'has_password': !!password
            });
            
            return;
        }
        
        loginBtn.disabled = true;
        loginBtn.textContent = 'Logging in...';
        errorMessage.style.display = 'none';
        
        Analytics.trackEvent('login_attempt', {
            'email_domain': email.split('@')[1]
        });
        
        firebase.auth().signInWithEmailAndPassword(email, password)
            .then((userCredential) => {
                Analytics.trackUserAuth('login_success', 'email');
                
                const user = userCredential.user;
                
                Analytics.trackEvent('login_user_info', {
                    'is_verified': user.emailVerified,
                    'account_age_days': Math.floor((Date.now() - new Date(user.metadata.creationTime).getTime()) / (1000 * 60 * 60 * 24))
                });
                
                window.location.href = 'dashboard.html';
            })
            .catch((error) => {
                loginBtn.disabled = false;
                loginBtn.textContent = 'Log In';
                
                errorMessage.textContent = getAuthErrorMessage(error.code);
                errorMessage.style.display = 'block';
                
                Analytics.trackUserAuth('login_error', error.code);
            });
    });
    
    forgotPasswordLink.addEventListener('click', function(e) {
        e.preventDefault();
        
        resetEmailInput.value = emailInput.value || '';
        resetErrorMessage.style.display = 'none';
        resetSuccessMessage.style.display = 'none';
        resetPasswordModal.style.display = 'block';
        
        Analytics.trackEvent('forgot_password_clicked', {
            'has_email': !!emailInput.value
        });
    });
    
    resetPasswordBtn.addEventListener('click', function() {
        const email = resetEmailInput.value.trim();
        
        if (!email) {
            resetErrorMessage.textContent = 'Please enter your email address.';
            resetErrorMessage.style.display = 'block';
            resetSuccessMessage.style.display = 'none';
            
            Analytics.trackEvent('reset_password_validation_error', {
                'error': 'missing_email'
            });
            
            return;
        }
        
        resetPasswordBtn.disabled = true;
        resetPasswordBtn.textContent = 'Sending...';
        resetErrorMessage.style.display = 'none';
        resetSuccessMessage.style.display = 'none';
        
        Analytics.trackEvent('reset_password_attempt', {
            'email_domain': email.split('@')[1]
        });
        
        firebase.auth().sendPasswordResetEmail(email)
            .then(() => {
                resetPasswordBtn.disabled = false;
                resetPasswordBtn.textContent = 'Send Reset Link';
                
                resetSuccessMessage.textContent = 'Password reset email sent. Please check your inbox.';
                resetSuccessMessage.style.display = 'block';
                
                Analytics.trackEvent('reset_password_success', {
                    'email_domain': email.split('@')[1]
                });
            })
            .catch((error) => {
                resetPasswordBtn.disabled = false;
                resetPasswordBtn.textContent = 'Send Reset Link';
                
                resetErrorMessage.textContent = getAuthErrorMessage(error.code);
                resetErrorMessage.style.display = 'block';
                
                Analytics.trackEvent('reset_password_error', {
                    'error_code': error.code,
                    'error_message': error.message
                });
            });
    });
    
    closeResetModal.addEventListener('click', function() {
        resetPasswordModal.style.display = 'none';
        
        Analytics.trackEvent('reset_password_modal_closed', {
            'method': 'close_button'
        });
    });
    
    window.addEventListener('click', function(e) {
        if (e.target === resetPasswordModal) {
            resetPasswordModal.style.display = 'none';
            
            Analytics.trackEvent('reset_password_modal_closed', {
                'method': 'outside_click'
            });
        }
    });
    
    function getAuthErrorMessage(errorCode) {
        switch (errorCode) {
            case 'auth/invalid-email':
                return 'Invalid email address format.';
            case 'auth/user-disabled':
                return 'This account has been disabled.';
            case 'auth/user-not-found':
                return 'No account found with this email address.';
            case 'auth/wrong-password':
                return 'Incorrect password.';
            case 'auth/too-many-requests':
                return 'Too many unsuccessful login attempts. Please try again later.';
            case 'auth/network-request-failed':
                return 'Network error. Please check your internet connection.';
            default:
                return 'An error occurred. Please try again.';
        }
    }
    
    window.addEventListener('load', function() {
        Analytics.trackPerformance();
    });

    window.pageLoadTime = new Date();
    window.addEventListener('beforeunload', function() {
        const timeSpent = Math.round((new Date() - window.pageLoadTime) / 1000);
        Analytics.trackEvent('page_exit', {
            'page': 'login',
            'time_spent': timeSpent
        });
    });
});
