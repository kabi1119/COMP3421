document.addEventListener('DOMContentLoaded', function() {
    const fileGrid = document.getElementById('file-grid');
    const emptyState = document.getElementById('empty-state');
    const uploadArea = document.getElementById('upload-area');
    const fileInput = document.getElementById('file-input');
    const uploadBtn = document.getElementById('upload-btn');
    const uploadProgress = document.getElementById('upload-progress');
    const progressBarFill = document.getElementById('progress-bar-fill');
    const progressText = document.getElementById('progress-text');
    const logoutBtn = document.getElementById('logout-btn');
    const deleteModal = document.getElementById('delete-modal');
    const closeDeleteModal = document.getElementById('close-delete-modal');
    const cancelDeleteBtn = document.getElementById('cancel-delete-btn');
    const confirmDeleteBtn = document.getElementById('confirm-delete-btn');
    const deleteFileName = document.getElementById('delete-file-name');
    const notification = document.getElementById('notification');
    const searchInput = document.getElementById('search-input');
    const searchBtn = document.getElementById('search-btn');
    
    let currentUser = null;
    let fileToDelete = null;
    let allFiles = [];
    
    function handleDragOver(e) {
        e.preventDefault();
        uploadArea.classList.add('dragover');
    }

    function handleDragLeave() {
        uploadArea.classList.remove('dragover');
    }

    function handleDrop(e) {
        e.preventDefault();
        uploadArea.classList.remove('dragover');
        
        const files = e.dataTransfer.files;
        
        if (files.length > 0) {
            uploadFiles(files);
        }
    }
    
    firebase.auth().onAuthStateChanged(function(user) {
        if (user) {
            currentUser = user;
            
            const welcomeMessage = document.getElementById('welcome-message');
            if (welcomeMessage) {
                welcomeMessage.textContent = `Welcome! ${user.email}`;
            }
            
            if (!user.emailVerified) {
                const bannerHTML = `
                    <div class="verification-banner">
                        <div class="verification-banner-message">
                            <span>
                                Your email address is not verified. Please check your inbox or 
                                <a href="#" id="resend-verification">
                                    resend verification email
                                </a>.
                            </span>
                        </div>
                        <div class="verification-banner-close">
                            <button id="close-verification-banner">
                                &times;
                            </button>
                        </div>
                    </div>
                `;
                
                const container = document.querySelector('.container');
                container.insertAdjacentHTML('afterbegin', bannerHTML);
                
                document.getElementById('resend-verification').addEventListener('click', function(e) {
                    e.preventDefault();
                    sendVerificationEmail();
                });
                
                document.getElementById('close-verification-banner').addEventListener('click', function() {
                    this.closest('.verification-banner').style.display = 'none';
                });
                
                if (uploadBtn) {
                    uploadBtn.disabled = true;
                    uploadBtn.title = 'Please verify your email to upload files';
                }
                
                if (uploadArea) {
                    uploadArea.classList.add('disabled');
                    uploadArea.title = 'Please verify your email to upload files';
                    
                    const disabledMessage = document.createElement('p');
                    disabledMessage.className = 'disabled-message';
                    disabledMessage.textContent = 'Please verify your email to upload files';
                    uploadArea.appendChild(disabledMessage);
                    
                    uploadArea.removeEventListener('dragover', handleDragOver);
                    uploadArea.removeEventListener('dragleave', handleDragLeave);
                    uploadArea.removeEventListener('drop', handleDrop);
                }
            } else {
                uploadArea.addEventListener('dragover', handleDragOver);
                uploadArea.addEventListener('dragleave', handleDragLeave);
                uploadArea.addEventListener('drop', handleDrop);
                loadFiles();
            }
        } else {
            window.location.href = 'index.html';
        }
    });
    
    function sendVerificationEmail() {
        if (!currentUser) return;
        
        currentUser.sendEmailVerification()
            .then(() => {
                showNotification('Verification email sent. Please check your inbox.', 'success');
            })
            .catch((error) => {
                console.error('Error sending verification email:', error);
                showNotification('Error sending verification email. Please try again later.', 'error');
            });
    }
    
    function loadFiles() {
        fileGrid.innerHTML = '';
        
        const db = firebase.firestore();
        db.collection('files')
            .where('userId', '==', currentUser.uid)
            .get()
            .then((querySnapshot) => {
                allFiles = [];
                
                if (querySnapshot.empty) {
                    showEmptyState();
                } else {
                    hideEmptyState();
                    
                    querySnapshot.forEach((doc) => {
                        const fileData = doc.data();
                        fileData.id = doc.id;
                        allFiles.push(fileData);
                    });
                    
                    displayFiles(allFiles);
                }
            })
            .catch((error) => {
                console.error('Error loading files:', error);
                showNotification('Error loading files. Please try again.', 'error');
            });
    }
    
    function displayFiles(files) {
        fileGrid.innerHTML = '';
        
        if (files.length === 0) {
            showEmptyState();
            return;
        }
        
        hideEmptyState();
        
        files.forEach((file) => {
            const fileCard = document.createElement('div');
            fileCard.className = 'file-card';
            
            const fileType = getFileType(file.name);
            const iconClass = getFileIconClass(fileType);
            
            fileCard.innerHTML = `
                <div class="file-thumbnail">
                    <i class="fas ${iconClass} file-type-${fileType}"></i>
                </div>
                <div class="file-info">
                    <div class="file-name">${file.name}</div>
                    <div class="file-size">${formatFileSize(file.size)}</div>
                    <div class="file-date">Uploaded on ${formatDate(file.uploadedAt)}</div>
                    <div class="file-actions">
                        <button class="download-btn" data-url="${file.downloadURL}">View & Save</button>
                        <button class="delete-btn" data-id="${file.id}" data-name="${file.name}" data-path="${file.path}">Delete</button>
                        <button class="share-btn" data-url="${file.downloadURL}">Share</button>
                    </div>
                </div>
            `;
            
            fileGrid.appendChild(fileCard);
            
            const downloadBtn = fileCard.querySelector('.download-btn');
            downloadBtn.addEventListener('click', function() {
                const fileUrl = this.dataset.url;
                
                window.open(fileUrl, '_blank');
                
                showNotification('File opened in new tab. Right-click and select "Save As" to download.', 'info');
            });
            
            const deleteBtn = fileCard.querySelector('.delete-btn');
            deleteBtn.addEventListener('click', function() {
                fileToDelete = {
                    id: this.dataset.id,
                    name: this.dataset.name,
                    path: this.dataset.path
                };
                
                deleteFileName.textContent = fileToDelete.name;
                deleteModal.style.display = 'block';
            });
            
            const shareBtn = fileCard.querySelector('.share-btn');
            shareBtn.addEventListener('click', function() {
                const fileUrl = this.dataset.url;
                navigator.clipboard.writeText(fileUrl).then(() => {
                    showNotification('Link copied to clipboard!', 'success');
                }).catch((err) => {
                    showNotification('Failed to copy link!', 'error');
                });
            });
        });
    }
    
    function getFileType(fileName) {
        const extension = fileName.split('.').pop().toLowerCase();
        return extension;
    }
    
    function getFileIconClass(fileType) {
        switch (fileType) {
            case 'pdf':
                return 'fa-file-pdf';
            case 'doc':
            case 'docx':
                return 'fa-file-word';
            case 'xls':
            case 'xlsx':
                return 'fa-file-excel';
            case 'ppt':
            case 'pptx':
                return 'fa-file-powerpoint';
            case 'jpg':
            case 'jpeg':
            case 'png':
            case 'gif':
                return 'fa-file-image';
            case 'zip':
            case 'rar':
                return 'fa-file-archive';
            case 'txt':
                return 'fa-file-alt';
            default:
                return 'fa-file';
        }
    }
    
    function formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
    
    function formatDate(timestamp) {
        const date = new Date(timestamp);
        return date.toLocaleDateString();
    }
    
    function showEmptyState() {
        fileGrid.style.display = 'none';
        emptyState.style.display = 'block';
    }
    
    function hideEmptyState() {
        fileGrid.style.display = 'grid';
        emptyState.style.display = 'none';
    }
    
    uploadBtn.addEventListener('click', function() {
        fileInput.click();
    });
    
    fileInput.addEventListener('change', function(e) {
        const files = e.target.files;
        
        if (files.length > 0) {
            uploadFiles(files);
        }
    });
    
    function uploadFiles(files) {
        if (!currentUser) return;
        
        uploadProgress.style.display = 'block';
        progressBarFill.style.width = '0%';
        progressText.textContent = 'Uploading... 0%';
        
        let totalBytes = 0;
        let uploadedBytes = 0;
        let completedFiles = 0;
        
        for (let i = 0; i < files.length; i++) {
            totalBytes += files[i].size;
        }
        
        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            const storageRef = firebase.storage().ref();
            const fileRef = storageRef.child(`users/${currentUser.uid}/${file.name}`);
            
            const uploadTask = fileRef.put(file);
            
            uploadTask.on('state_changed', 
                (snapshot) => {
                    const fileProgress = snapshot.bytesTransferred / snapshot.totalBytes;
                    
                    uploadedBytes = 0;
                    for (let j = 0; j < i; j++) {
                        uploadedBytes += files[j].size;
                    }
                    uploadedBytes += snapshot.bytesTransferred;
                    
                    const progress = Math.min(Math.round((uploadedBytes / totalBytes) * 100), 100);
                    progressBarFill.style.width = progress + '%';
                    progressText.textContent = `Uploading... ${progress}%`;
                },
                (error) => {
                    console.error('Upload error:', error);
                    uploadProgress.style.display = 'none';
                    showNotification('Error uploading file: ' + error.message, 'error');
                },
                () => {
                    uploadTask.snapshot.ref.getDownloadURL().then((downloadURL) => {
                        const db = firebase.firestore();
                        
                        db.collection('files').add({
                            name: file.name,
                            size: file.size,
                            type: file.type,
                            path: `users/${currentUser.uid}/${file.name}`,
                            downloadURL: downloadURL,
                            uploadedAt: Date.now(),
                            userId: currentUser.uid
                        })
                        .then(() => {
                            completedFiles++;
                            if (completedFiles === files.length) {
                                uploadProgress.style.display = 'none';
                                fileInput.value = '';
                                showNotification('Files uploaded successfully!', 'success');
                                loadFiles();
                            }
                        })
                        .catch((error) => {
                            console.error('Firestore error:', error);
                            showNotification('Error saving file information.', 'error');
                        });
                    });
                }
            );
        }
    }
    
    confirmDeleteBtn.addEventListener('click', function() {
        if (!fileToDelete) return;
        
        const db = firebase.firestore();
        const storageRef = firebase.storage().ref();
        const fileRef = storageRef.child(fileToDelete.path);
        
        db.collection('files').doc(fileToDelete.id).delete()
            .then(() => {
                return fileRef.delete();
            })
            .then(() => {
                deleteModal.style.display = 'none';
                showNotification('File deleted successfully!', 'success');
                loadFiles();
            })
            .catch((error) => {
                console.error('Delete error:', error);
                showNotification('Error deleting file.', 'error');
            });
    });
    
    closeDeleteModal.addEventListener('click', function() {
        deleteModal.style.display = 'none';
    });
    
    cancelDeleteBtn.addEventListener('click', function() {
        deleteModal.style.display = 'none';
    });
    
    window.addEventListener('click', function(e) {
        if (e.target === deleteModal) {
            deleteModal.style.display = 'none';
        }
    });
    
    searchBtn.addEventListener('click', function() {
        searchFiles();
    });
    
    searchInput.addEventListener('keyup', function(e) {
        if (e.key === 'Enter') {
            searchFiles();
        }
    });
    
    function searchFiles() {
        const searchTerm = searchInput.value.trim().toLowerCase();
        
        if (searchTerm === '') {
            displayFiles(allFiles);
            return;
        }
        
        const filteredFiles = allFiles.filter(file => 
            file.name.toLowerCase().includes(searchTerm)
        );
        
        displayFiles(filteredFiles);
    }
    
    function showNotification(message, type = 'info') {
        notification.textContent = message;
        notification.className = 'notification ' + type;
        notification.classList.add('show');
        
        setTimeout(() => {
            notification.classList.remove('show');
        }, 3000);
    }
    
    logoutBtn.addEventListener('click', function() {
        firebase.auth().signOut()
            .then(() => {
                window.location.href = 'index.html';
            })
            .catch((error) => {
                console.error('Sign out error:', error);
                showNotification('Error signing out.', 'error');
            });
    });
    
    (function() {
        window.Analytics = window.Analytics || {};
        
        Analytics.trackPageView = function(pageName) {
            if (typeof gtag === 'function') {
                gtag('event', 'page_view', {
                    page_title: pageName || 'Dashboard',
                    page_location: window.location.href,
                    page_path: window.location.pathname
                });
            }
        };
        
        Analytics.trackUserAuth = function(eventName, method) {
            if (typeof gtag === 'function') {
                gtag('event', eventName, {
                    method: method || 'email'
                });
            }
        };
        
        Analytics.trackEvent = function(eventName, eventParams) {
            if (typeof gtag === 'function') {
                gtag('event', eventName, eventParams || {});
            }
        };
        
        Analytics.trackPerformance = function() {
            if (typeof gtag === 'function' && window.performance) {
                const perfData = window.performance.timing;
                const pageLoadTime = perfData.loadEventEnd - perfData.navigationStart;
                const domReadyTime = perfData.domComplete - perfData.domLoading;
                
                gtag('event', 'performance', {
                    page_load_time: pageLoadTime,
                    dom_ready_time: domReadyTime,
                    url: window.location.pathname
                });
            }
        };
        
        if (firebase.auth().currentUser) {
            const user = firebase.auth().currentUser;
            
            if (typeof gtag === 'function') {
                gtag('set', 'user_properties', {
                    user_id: user.uid,
                    email_domain: user.email ? user.email.split('@')[1] : null,
                    is_verified: user.emailVerified,
                    has_display_name: !!user.displayName,
                    has_photo: !!user.photoURL
                });
                
                gtag('config', 'GA_MEASUREMENT_ID', {
                    'user_id': user.uid
                });
            }
        }
        
        Analytics.trackPageView('Dashboard');
        
        window.addEventListener('load', function() {
            Analytics.trackPerformance();
        });
        
        const fileCount = document.querySelectorAll('.file-item').length;
        if (fileCount > 0) {
            Analytics.trackEvent('files_loaded', {
                'file_count': fileCount
            });
        }
        
        Analytics.trackEvent('browser_info', {
            'user_agent': navigator.userAgent,
            'language': navigator.language,
            'screen_width': window.screen.width,
            'screen_height': window.screen.height,
            'window_width': window.innerWidth,
            'window_height': window.innerHeight,
            'device_memory': navigator.deviceMemory || 'unknown',
            'connection_type': navigator.connection ? navigator.connection.effectiveType : 'unknown'
        });
    })();
    
    function createFilePreview(file) {
        const previewContainer = document.createElement('div');
        previewContainer.className = 'file-preview';
        
        const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'];
        const videoExtensions = ['mp4', 'webm', 'ogg', 'mov', 'avi'];
        const fileExtension = file.name.split('.').pop().toLowerCase();
        
        if (imageExtensions.includes(fileExtension)) {
            const img = document.createElement('img');
            img.src = file.downloadURL;
            img.alt = file.name;
            img.className = 'preview-image';
            img.style.maxWidth = '100%';
            img.style.maxHeight = '300px';
            previewContainer.appendChild(img);
        } else if (videoExtensions.includes(fileExtension)) {
            const video = document.createElement('video');
            video.src = file.downloadURL;
            video.controls = true;
            video.autoplay = false;
            video.className = 'preview-video';
            video.style.maxWidth = '100%';
            video.style.maxHeight = '300px';
            previewContainer.appendChild(video);
        } else if (fileExtension === 'pdf') {
            const iframe = document.createElement('iframe');
            iframe.src = file.downloadURL;
            iframe.className = 'preview-pdf';
            iframe.style.width = '100%';
            iframe.style.height = '500px';
            iframe.style.border = 'none';
            previewContainer.appendChild(iframe);
        } else {
            const noPreview = document.createElement('div');
            noPreview.className = 'no-preview';
            noPreview.style.textAlign = 'center';
            noPreview.style.padding = '40px';
            
            const icon = document.createElement('i');
            icon.className = `fas ${getFileIconClass(fileExtension)} fa-5x`;
            icon.style.marginBottom = '20px';
            icon.style.color = '#4285f4';
            
            const text = document.createElement('p');
            text.textContent = 'No preview available for this file type';
            text.style.marginBottom = '20px';
            
            const link = document.createElement('a');
            link.href = file.downloadURL;
            link.target = '_blank';
            link.className = 'btn btn-primary';
            link.textContent = 'Download to view';
            link.style.display = 'inline-block';
            link.style.padding = '10px 20px';
            link.style.backgroundColor = '#4285f4';
            link.style.color = 'white';
            link.style.textDecoration = 'none';
            link.style.borderRadius = '4px';
            
            noPreview.appendChild(icon);
            noPreview.appendChild(text);
            noPreview.appendChild(link);
            
            previewContainer.appendChild(noPreview);
        }
        
        return previewContainer;
    }
    
    function renderFileItem(file) {
        const fileItem = document.createElement('div');
        fileItem.className = 'file-item';
        fileItem.dataset.id = file.id;

        const previewButton = document.createElement('button');
        previewButton.className = 'btn btn-sm btn-info preview-btn';
        previewButton.innerHTML = '<i class="fas fa-eye"></i>';
        previewButton.title = 'Preview file';
        previewButton.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            const modal = document.createElement('div');
            modal.className = 'preview-modal';
            modal.innerHTML = `
                <div class="preview-modal-content">
                    <div class="preview-header">
                        <h3>${file.name}</h3>
                        <button class="close-preview">&times;</button>
                    </div>
                    <div class="preview-body"></div>
                </div>
            `;
            
            const previewBody = modal.querySelector('.preview-body');
            previewBody.appendChild(createFilePreview(file));
            
            modal.querySelector('.close-preview').addEventListener('click', function() {
                document.body.removeChild(modal);
            });
            
            modal.addEventListener('click', function(e) {
                if (e.target === modal) {
                    document.body.removeChild(modal);
                }
            });
            
            document.body.appendChild(modal);
        });
        
        return fileItem;
    }
});
