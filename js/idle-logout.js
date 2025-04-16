(function() {
    const idleTime = 15 * 60 * 1000;
    let idleTimer;
    
    function resetIdleTimer() {
        clearTimeout(idleTimer);
        idleTimer = setTimeout(logoutUser, idleTime);
    }
    
    function logoutUser() {
        firebase.auth().signOut()
            .then(() => {
                alert('You have been logged out due to inactivity.');
                window.location.href = 'index.html';
            })
            .catch((error) => {
                console.error('Error signing out:', error);
            });
    }
    
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
    events.forEach(event => {
        document.addEventListener(event, resetIdleTimer, false);
    });
    
    resetIdleTimer();
    
    document.addEventListener('visibilitychange', function() {
        if (!document.hidden) {
            resetIdleTimer();
        }
    });
})();
