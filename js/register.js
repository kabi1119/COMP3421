document.addEventListener('DOMContentLoaded', function() {
    const registerForm = document.getElementById('register-form');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const confirmPasswordInput = document.getElementById('confirm-password');
    const registerBtn = document.getElementById('register-btn');
    const errorMessage = document.getElementById('error-message');
    const successMessage = document.getElementById('success-message');
    
    const lengthReq = document.getElementById('length-req');
    const uppercaseReq = document.getElementById('uppercase-req');
    const lowercaseReq = document.getElementById('lowercase-req');
    const numberReq = document.getElementById('number-req');
    const specialReq = document.getElementById('special-req');
    const matchReq = document.getElementById('match-req');
    
    let validLength = false;
    let validUppercase = false;
    let validLowercase = false;
    let validNumber = false;
    let validSpecial = false;
    let validMatch = false;
    
    registerBtn.disabled = true;
    
    passwordInput.addEventListener('input', function() {
        const password = passwordInput.value;
        
        validLength = password.length >= 8;
        updateRequirement(lengthReq, validLength);
        
        validUppercase = /[A-Z]/.test(password);
        updateRequirement(uppercaseReq, validUppercase);
        
        validLowercase = /[a-z]/.test(password);
        updateRequirement(lowercaseReq, validLowercase);
        
        validNumber = /[0-9]/.test(password);
        updateRequirement(numberReq, validNumber);
        
        validSpecial = /[_\-!?@*#$%^&+=]/.test(password);
        updateRequirement(specialReq, validSpecial);
        
        if (confirmPasswordInput.value) {
            validMatch = password === confirmPasswordInput.value;
            updateRequirement(matchReq, validMatch);
        }
        
        updateRegisterButton();
    });
    
    confirmPasswordInput.addEventListener('input', function() {
        validMatch = passwordInput.value === confirmPasswordInput.value;
        updateRequirement(matchReq, validMatch);
        
        updateRegisterButton();
    });
    
    function updateRequirement(element, isValid) {
        if (isValid) {
            element.classList.add('valid');
            element.querySelector('.icon').textContent = '✓';
        } else {
            element.classList.remove('valid');
            element.querySelector('.icon').textContent = '✖';
        }
    }
    
    function updateRegisterButton() {
        registerBtn.disabled = !(validLength && validUppercase && validLowercase && 
                               validNumber && validSpecial && validMatch);
    }
    
    registerForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const email = emailInput.value.trim();
        const password = passwordInput.value;
        
        errorMessage.style.display = 'none';
        successMessage.style.display = 'none';
        
        if (!email) {
            showError('Please enter your email');
            return;
        }
        
        if (!(validLength && validUppercase && validLowercase && validNumber && validSpecial && validMatch)) {
            showError('Please ensure your password meets all requirements');
            return;
        }
        
        registerBtn.disabled = true;
        
        firebase.auth().createUserWithEmailAndPassword(email, password)
            .then((userCredential) => {
                return userCredential.user.sendEmailVerification().then(() => {
                    showSuccess('Registration successful! Please check your email to verify your account.');
                    registerForm.reset();
                    
                    [lengthReq, uppercaseReq, lowercaseReq, numberReq, specialReq, matchReq].forEach(req => {
                        req.classList.remove('valid');
                        req.querySelector('.icon').textContent = '✖';
                    });
                    
                    registerBtn.disabled = true;
                    
                    setTimeout(() => {
                        window.location.href = 'index.html?registered=true';
                    }, 3000);
                });
            })
            .catch((error) => {
                showError(error.message);
                registerBtn.disabled = false;
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
});
