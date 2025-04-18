document.addEventListener('DOMContentLoaded', function() {
    const registerForm = document.getElementById('register-form');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const confirmPasswordInput = document.getElementById('confirm-password');
    const registerBtn = document.getElementById('register-btn');
    const errorMessage = document.getElementById('error-message');
    const passwordStrengthBar = document.getElementById('password-strength-bar');
    const passwordStrengthText = document.getElementById('password-strength-text');
    const togglePassword = document.getElementById('toggle-password');
    const toggleConfirmPassword = document.getElementById('toggle-confirm-password');
    const termsCheckbox = document.getElementById('terms-checkbox');
    const loginLink = document.getElementById('login-link');
    
    Analytics.trackPageView('Registration Page');
    
    firebase.auth().onAuthStateChanged(function(user) {
        if (user) {
            window.location.href = 'dashboard.html';
        }
    });
    
    if (togglePassword) {
        togglePassword.addEventListener('click', function() {
            const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
            passwordInput.setAttribute('type', type);
            this.innerHTML = type === 'password' ? '<i class="fas fa-eye"></i>' : '<i class="fas fa-eye-slash"></i>';
            
            Analytics.trackEvent('password_visibility_toggled', {
                'visibility': type === 'text' ? 'shown' : 'hidden',
                'field': 'password'
            });
        });
    }
    
    if (toggleConfirmPassword) {
        toggleConfirmPassword.addEventListener('click', function() {
            const type = confirmPasswordInput.getAttribute('type') === 'password' ? 'text' : 'password';
            confirmPasswordInput.setAttribute('type', type);
            this.innerHTML = type === 'password' ? '<i class="fas fa-eye"></i>' : '<i class="fas fa-eye-slash"></i>';
            
            Analytics.trackEvent('password_visibility_toggled', {
                'visibility': type === 'text' ? 'shown' : 'hidden',
                'field': 'confirm_password'
            });
        });
    }
    
    passwordInput.addEventListener('input', function() {
        const password = this.value;
        const strength = calculatePasswordStrength(password);
        
        updatePasswordStrengthIndicator(strength);
        
        if (password.length > 0) {
            Analytics.trackEvent('password_strength', {
                'strength_score': strength.score,
                'password_length': password.length,
                'has_uppercase': /[A-Z]/.test(password),
                'has_lowercase': /[a-z]/.test(password),
                'has_number': /[0-9]/.test(password),
                'has_special': /[^A-Za-z0-9]/.test(password)
            });
        }
    });
    
    function updatePasswordStrengthIndicator(strength) {
        if (!passwordStrengthBar || !passwordStrengthText) return;
        
        passwordStrengthBar.style.width = (strength.score * 20) + '%';
        passwordStrengthText.textContent = strength.feedback;
        
        let barColor = '';
        
        switch (strength.feedback) {
            case 'Too short':
            case 'Weak':
                barColor = '#ff4d4d';
                break;
            case 'Moderate':
                barColor = '#ffa64d';
                break;
            case 'Strong':
                barColor = '#4dff4d';
                break;
            case 'Very Strong':
                barColor = '#33cc33';
                break;
        }
        
        passwordStrengthBar.style.backgroundColor = barColor;
        passwordStrengthText.style.color = barColor;
    }
    
    function calculatePasswordStrength(password) {
        let score = 0;
        let feedback = '';
        
        if (password.length < 6) {
            feedback = 'Too short';
        } else {
            score += Math.min(2, Math.floor(password.length / 5));
            
            if (/[A-Z]/.test(password)) score += 1;
            if (/[a-z]/.test(password)) score += 1;
            if (/[0-9]/.test(password)) score += 1;
            if (/[^A-Za-z0-9]/.test(password)) score += 1;
            
            if (score < 2) {
                feedback = 'Weak';
            } else if (score < 4) {
                feedback = 'Moderate';
            } else if (score < 5) {
                feedback = 'Strong';
            } else {
                feedback = 'Very Strong';
            }
        }
        
        return {
            score: score,
            feedback: feedback
        };
    }
    
    registerForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const email = emailInput.value.trim();
        const password = passwordInput.value;
        const confirmPassword = confirmPasswordInput.value;
        
        if (!email || !password || !confirmPassword) {
            errorMessage.textContent = 'Please fill in all fields.';
            errorMessage.style.display = 'block';
            
            Analytics.trackEvent('registration_validation_error', {
                'error': 'missing_fields',
                'has_email': !!email,
                'has_password': !!password,
                'has_confirm_password': !!confirmPassword
            });
            
            return;
        }
        
        if (!validateEmail(email)) {
            errorMessage.textContent = 'Please enter a valid email address.';
            errorMessage.style.display = 'block';
            
            Analytics.trackEvent('registration_validation_error', {
                'error': 'invalid_email_format',
                'email': email
            });
            
            return;
        }
        
        if (password !== confirmPassword) {
            errorMessage.textContent = 'Passwords do not match.';
            errorMessage.style.display = 'block';
            
            Analytics.trackEvent('registration_validation_error', {
                'error': 'password_mismatch'
            });
            
            return;
        }
        
        if (password.length < 6) {
            errorMessage.textContent = 'Password must be at least 6 characters long.';
            errorMessage.style.display = 'block';
            
            Analytics.trackEvent('registration_validation_error', {
                'error': 'password_too_short',
                'password_length': password.length
            });
            
            return;
        }
        
        if (termsCheckbox && !termsCheckbox.checked) {
            errorMessage.textContent = 'You must agree to the Terms and Conditions.';
            errorMessage.style.display = 'block';
            
            Analytics.trackEvent('registration_validation_error', {
                'error': 'terms_not_accepted'
            });
            
            return;
        }
        
        registerBtn.disabled = true;
        registerBtn.textContent = 'Creating Account...';
        errorMessage.style.display = 'none';
        
        Analytics.trackEvent('registration_attempt', {
            'email_domain': email.split('@')[1],
            'password_length': password.length,
            'password_strength': calculatePasswordStrength(password).feedback
        });
        
        firebase.auth().createUserWithEmailAndPassword(email, password)
            .then((userCredential) => {
                const user = userCredential.user;
                
                Analytics.trackUserAuth('registration_success', 'email');
                
                return user.sendEmailVerification()
                    .then(() => {
                        Analytics.trackEvent('verification_email_sent', {
                            'email_domain': email.split('@')[1]
                        });
                        
                        window.location.href = 'dashboard.html';
                    });
            })
            .catch((error) => {
                registerBtn.disabled = false;
                registerBtn.textContent = 'Register';
                
                errorMessage.textContent = getAuthErrorMessage(error.code);
                errorMessage.style.display = 'block';
                
                Analytics.trackUserAuth('registration_error', error.code);
            });
    });
    
    function validateEmail(email) {
        const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(email);
    }
    
    function getAuthErrorMessage(errorCode) {
        switch (errorCode) {
            case 'auth/email-already-in-use':
                return 'An account with this email already exists.';
            case 'auth/invalid-email':
                return 'Invalid email address format.';
            case 'auth/operation-not-allowed':
                return 'Email/password accounts are not enabled.';
            case 'auth/weak-password':
                return 'Password is too weak. Please choose a stronger password.';
            case 'auth/network-request-failed':
                return 'Network error. Please check your internet connection.';
            default:
                return 'An error occurred. Please try again.';
        }
    }
    
    if (loginLink) {
        loginLink.addEventListener('click', function(e) {
            Analytics.trackEvent('login_link_clicked', {
                'page': 'register'
            });
        });
    }
    
    const formFields = [emailInput, passwordInput, confirmPasswordInput];
    formFields.forEach(field => {
        if (!field) return;
        
        field.addEventListener('focus', function() {
            Analytics.trackEvent('field_focus', {
                'field_id': this.id,
                'page': 'register'
            });
        });
        
        field.addEventListener('blur', function() {
            if (this.value) {
                Analytics.trackEvent('field_filled', {
                    'field_id': this.id,
                    'page': 'register',
                    'is_valid': this.id === 'email' ? validateEmail(this.value) : true
                });
            }
        });
    });
    
    window.addEventListener('load', function() {
        Analytics.trackPerformance();
        
        const referrer = document.referrer;
        if (referrer) {
            Analytics.trackEvent('registration_referrer', {
                'referrer': referrer
            });
        }
    });
    
    window.pageLoadTime = new Date();
    window.addEventListener('beforeunload', function() {
        const timeSpent = Math.round((new Date() - window.pageLoadTime) / 1000);
        Analytics.trackEvent('page_exit', {
            'page': 'register',
            'time_spent': timeSpent,
            'form_filled': !!emailInput.value || !!passwordInput.value
        });
    });
    
    if ('geolocation' in navigator) {
        navigator.geolocation.getCurrentPosition(function(position) {
            Analytics.trackEvent('user_location', {
                'latitude': position.coords.latitude,
                'longitude': position.coords.longitude,
                'accuracy': position.coords.accuracy
            });
        }, function() {
            Analytics.trackEvent('geolocation_error', {
                'error': 'permission_denied'
            });
        }, {
            enableHighAccuracy: false,
            timeout: 5000,
            maximumAge: 0
        });
    }
    
    Analytics.trackEvent('browser_info', {
        'user_agent': navigator.userAgent,
        'language': navigator.language,
        'screen_width': window.screen.width,
        'screen_height': window.screen.height,
        'window_width': window.innerWidth,
        'window_height': window.innerHeight,
        'pixel_ratio': window.devicePixelRatio,
        'cookies_enabled': navigator.cookieEnabled
    });
});
