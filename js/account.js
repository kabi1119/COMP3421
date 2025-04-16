document.addEventListener('DOMContentLoaded', function() {
    const userEmail = document.getElementById('user-email');
    const accountEmail = document.getElementById('account-email');
    const verificationBadge = document.getElementById('verification-badge');
    const resendVerificationBtn = document.getElementById('resend-verification');
    const passwordForm = document.getElementById('password-form');
    const currentPasswordInput = document.getElementById('current-password');
    const newPasswordInput = document.getElementById('new-password');
    const confirmPasswordInput = document.getElementById('confirm-password');
    const changePasswordBtn = document.getElementById('change-password-btn');
    const passwordMessage = document.getElementById('password-message');
    const resetPasswordBtn = document.getElementById('reset-password-btn');
    const resetMessage = document.getElementById('reset-message');
    const deleteAccountBtn = document.getElementById('delete-account-btn');
    const dashboardBtn = document.getElementById('dashboard-btn');
    const logoutBtn = document.getElementById('logout-btn');
    
    let currentUser;
    
    firebase.auth().onAuthStateChanged(function(user) {
        if (user) {
            currentUser = user;
            userEmail.textContent = user.email;
            accountEmail.textContent = user.email;
            
            updateVerificationStatus(user.emailVerified);
            
            if (!user.emailVerified) {
                resendVerificationBtn.style.display = 'inline-block';
            } else {
                resendVerificationBtn.style.display = 'none';
            }
        } else {
            window.location.href = 'index.html';
        }
    });
    
    dashboardBtn.addEventListener('click', function() {
        window.location.href = 'dashboard.html';
    });
    
    logoutBtn.addEventListener('click', function() {
        firebase.auth().signOut().then(() => {
            window.location.href = 'index.html';
        }).catch((error) => {
            console.error('Error signing out:', error);
        });
    });
    
    resendVerificationBtn.addEventListener('click', function() {
        if (!currentUser) return;
        
        currentUser.sendEmailVerification().then(() => {
            showMessage(resetMessage, 'Verification email sent! Please check your inbox.', 'success');
        }).catch((error) => {
            showMessage(resetMessage, error.message, 'error');
        });
    });
    
    passwordForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const currentPassword = currentPasswordInput.value;
        const newPassword = newPasswordInput.value;
        const confirmPassword = confirmPasswordInput.value;
        
        if (newPassword !== confirmPassword) {
            showMessage(passwordMessage, 'New passwords do not match', 'error');
            return;
        }
        
        if (newPassword.length < 6) {
            showMessage(passwordMessage, 'New password must be at least 6 characters', 'error');
            return;
        }
        
        changePasswordBtn.disabled = true;
        
        const credential = firebase.auth.EmailAuthProvider.credential(
            currentUser.email,
            currentPassword
        );
        
        currentUser.reauthenticateWithCredential(credential).then(() => {
            return currentUser.updatePassword(newPassword);
        }).then(() => {
            showMessage(passwordMessage, 'Password updated successfully!', 'success');
            passwordForm.reset();
        }).catch((error) => {
            showMessage(passwordMessage, error.message, 'error');
        }).finally(() => {
            changePasswordBtn.disabled = false;
        });
    });
    
    resetPasswordBtn.addEventListener('click', function() {
        if (!currentUser) return;
        
        resetPasswordBtn.disabled = true;
        
        firebase.auth().sendPasswordResetEmail(currentUser.email)
            .then(() => {
                showMessage(resetMessage, 'Password reset email sent! Check your inbox.', 'success');
            })
            .catch((error) => {
                showMessage(resetMessage, error.message, 'error');
            })
            .finally(() => {
                resetPasswordBtn.disabled = false;
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
            
            currentUser.reauthenticateWithCredential(credential).then(() => {
                return currentUser.delete();
            }).then(() => {
                alert('Your account has been deleted.');
                window.location.href = 'index.html';
            }).catch((error) => {
                alert('Error: ' + error.message);
            });
        }
    });
    
    function updateVerificationStatus(isVerified) {
        if (isVerified) {
            verificationBadge.textContent = 'Verified';
            verificationBadge.className = 'badge verified';
        } else {
            verificationBadge.textContent = 'Not Verified';
            verificationBadge.className = 'badge not-verified';
        }
    }
    
    function showMessage(element, message, type) {
        element.textContent = message;
        element.className = `message ${type}`;
        
        setTimeout(() => {
            element.textContent = '';
            element.className = 'message';
        }, 5000);
    }
});
