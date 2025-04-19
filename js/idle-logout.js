(function() {
    const idleTime = 15 * 60 * 1000;
    let idleTimer = null;
    let isIdle = false;
    
    document.addEventListener('DOMContentLoaded', function() {
        setupIdleLogout();
    });
    
    function setupIdleLogout() {
        const activityEvents = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
        
        activityEvents.forEach(function(eventName) {
            document.addEventListener(eventName, resetIdleTimer, true);
        });
        
        resetIdleTimer();
    }
    
    function resetIdleTimer() {
        if (idleTimer) {
            clearTimeout(idleTimer);
        }
        
        if (isIdle) {
            isIdle = false;
        }
        
        idleTimer = setTimeout(logoutUser, idleTime);
    }
    
    function logoutUser() {
        isIdle = true;
        
        if (typeof firebase !== 'undefined' && firebase.auth) {
            if (confirm('You have been inactive for a while. For security reasons, you will be logged out. Click OK to continue.')) {
                firebase.auth().signOut()
                    .then(function() {
                        window.location.href = 'index.html?logout=idle';
                    })
                    .catch(function(error) {
                        alert('An error occurred during logout. Please refresh the page and try again.');
                    });
            } else {
                resetIdleTimer();
            }
        } else {
            alert('Session management is not available. Please refresh the page.');
        }
    }
})();

