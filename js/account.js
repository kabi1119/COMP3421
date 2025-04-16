document.addEventListener('DOMContentLoaded', function() {
    const userEmail = document.getElementById('user-email');
    const changePasswordForm = document.getElementById('change-password-form');
    const deleteAccountBtn = document.getElementById('delete-account-btn');
    const logoutBtn = document.getElementById('logout-btn');
    
    const newPasswordInput = document.getElementById('new-password');
    const confirmNewPasswordInput = document.getElementById('confirm-new-password');
    const changePasswordBtn = document.getElementById('change-password-btn');
    
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
    
    changePasswordBtn.disabled = true;
    
    let currentUser = null;
    
    firebase.auth().onAuthStateChanged(function(user) {
        if (user) {
            currentUser = user;
            userEmail.textContent = user.email;
        } else {
            window.location.href = 'index.html';
        }
    });
    
    newPasswordInput.addEventListener('input', function() {
        const password = newPasswordInput.value;
        
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
        
        if (confirmNewPasswordInput.value) {
            validMatch = password === confirmNewPasswordInput.value;
            updateRequirement(matchReq, validMatch);
        }
        
        updateChangePasswordButton();
    });
    
    confirmNewPasswordInput.addEventListener('input', function() {
        validMatch = newPasswordInput.value === confirmNewPasswordInput.value;
        updateRequirement(matchReq, validMatch);
        
        updateChangePasswordButton();
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
    
    function updateChangePasswordButton() {
        changePasswordBtn.disabled = !(validLength && validUppercase && validLowercase && 
                                   validNumber && validSpecial && validMatch);
    }
    
    changePasswordForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        if (!currentUser) return;
        
        const currentPassword = document.getElementById('current-password').value;
        const newPassword = newPasswordInput.value;
        
        if (!currentPassword || !newPassword) {
            alert('Please fill in all fields');
            return;
        }
        
        if (!(validLength && validUppercase && validLowercase && validNumber && validSpecial && validMatch)) {
            alert('Please ensure your new password meets all requirements');
            return;
        }
        
        const credential = firebase.auth.EmailAuthProvider.credential(
            currentUser.email,
            currentPassword
        );
        
        currentUser.reauthenticateWithCredential(credential)
            .then(() => {
                return currentUser.updatePassword(newPassword);
            })
            .then(() => {
                alert('Password updated successfully');
                changePasswordForm.reset();
                
                [lengthReq, uppercaseReq, lowercaseReq, numberReq, specialReq, matchReq].forEach(req => {
                    req.classList.remove('valid');
                    req.querySelector('.icon').textContent = '✖';
                });
                
                changePasswordBtn.disabled = true;
            })
            .catch((error) => {
                alert('Error: ' + error.message);
            });
    });
    
    deleteAccountBtn.addEventListener('click', function() {
        if (!currentUser) return;
        
        if (confirm('Are you sure you want to delete your account? This action cannot be undone and all your data will be lost.')) {
            const password = prompt('Please enter your password to confirm account deletion:');
            
            if (!password) return;
            
            const credential = firebase.auth.EmailAuthProvider.credential(
                currentUser.email,
                password
            );
            
            currentUser.reauthenticateWithCredential(credential)
                .then(() => {
                    return currentUser.delete();
                })
                .then(() => {
                    alert('Your account has been deleted.');
                    window.location.href = 'index.html';
                })
                .catch((error) => {
                    console.log("Delete account error:", error);
                    
                    let errorMessage = 'An error occurred while deleting your account.';
                    
                    try {
                        if (typeof error.message === 'string' && 
                            (error.message.startsWith('{') || error.message.includes('INVALID_LOGIN_CREDENTIALS'))) {
                            
                            if (error.message.includes('INVALID_LOGIN_CREDENTIALS')) {
                                errorMessage = 'Incorrect password. Account deletion aborted.';
                            } else {
                                const errorObj = JSON.parse(error.message);
                                if (errorObj.error && errorObj.error.message) {
                                    if (errorObj.error.message === 'INVALID_LOGIN_CREDENTIALS') {
                                        errorMessage = 'Incorrect password. Account deletion canceled.';
                                    } else {
                                        errorMessage = errorObj.error.message;
                                    }
                                }
                            }
                        } else if (error.code) {
                            switch(error.code) {
                                case 'auth/wrong-password':
                                case 'auth/invalid-credential':
                                    errorMessage = 'Incorrect password. Account deletion canceled.';
                                    break;
                                case 'auth/too-many-requests':
                                    errorMessage = 'Too many attempts. Please try again later.';
                                    break;
                                case 'auth/requires-recent-login':
                                    errorMessage = 'For security reasons, please log out and log back in before deleting your account.';
                                    break;
                                default:
                                    errorMessage = error.message;
                            }
                        }
                    } catch (e) {
                        if (error.code) {
                            switch(error.code) {
                                case 'auth/wrong-password':
                                case 'auth/invalid-credential':
                                    errorMessage = 'Incorrect password. Account deletion aborted.';
                                    break;
                                default:
                                    errorMessage = error.message;
                            }
                        } else {
                            errorMessage = error.message;
                        }
                    }
                    
                    alert('Error: ' + errorMessage);
                });
        }
    });
    
    logoutBtn.addEventListener('click', function() {
        firebase.auth().signOut()
            .then(() => {
                window.location.href = 'index.html';
            })
            .catch((error) => {
                alert('Error signing out: ' + error.message);
            });
    });
});
