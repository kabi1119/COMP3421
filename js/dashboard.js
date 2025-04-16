document.addEventListener('DOMContentLoaded', function() {
    const userEmail = document.getElementById('user-email');
    const logoutBtn = document.getElementById('logout-btn');
    const fileList = document.getElementById('file-list');
    const loadingIndicator = document.getElementById('loading-indicator');
    const uploadArea = document.getElementById('upload-area');
    const fileInput = document.getElementById('file-input');
    const uploadBtn = document.getElementById('upload-btn');
    const uploadProgress = document.getElementById('upload-progress');
    const progressFill = document.getElementById('progress-fill');
    const progressText = document.getElementById('progress-text');
    const searchInput = document.querySelector('.search-bar input');
    
    let storageRef;
    let currentUser;
    
    firebase.auth().onAuthStateChanged(function(user) {
        if (user) {
            currentUser = user;
            userEmail.textContent = user.email;
            
            storageRef = firebase.storage().ref();
            
            loadUserFiles();
        } else {
            window.location.href = 'index.html';
        }
    });
    
    logoutBtn.addEventListener('click', function() {
        firebase.auth().signOut().then(() => {
            window.location.href = 'index.html';
        }).catch((error) => {
            console.error('Error signing out:', error);
        });
    });
    
    uploadBtn.addEventListener('click', function() {
        fileInput.click();
    });
    
    uploadArea.addEventListener('dragover', function(e) {
        e.preventDefault();
        uploadArea.classList.add('active');
    });
    
    uploadArea.addEventListener('dragleave', function() {
        uploadArea.classList.remove('active');
    });
    
    uploadArea.addEventListener('drop', function(e) {
        e.preventDefault();
        uploadArea.classList.remove('active');
        
        if (e.dataTransfer.files.length) {
            handleFiles(e.dataTransfer.files);
        }
    });
    
    fileInput.addEventListener('change', function() {
        if (fileInput.files.length) {
            handleFiles(fileInput.files);
        }
    });
    
    searchInput.addEventListener('input', function() {
        const searchTerm = searchInput.value.toLowerCase();
        const fileItems = fileList.querySelectorAll('.file-item');
        
        fileItems.forEach(item => {
            const fileName = item.querySelector('.file-name').textContent.toLowerCase();
            if (fileName.includes(searchTerm)) {
                item.style.display = 'grid';
            } else {
                item.style.display = 'none';
            }
        });
    });
    
    function sanitizeFileName(fileName) {
        return fileName.replace(/[^a-zA-Z0-9._-]/g, '_');
    }
    
    function handleFiles(files) {
        if (!currentUser) return;
        
        uploadProgress.style.display = 'block';
        progressFill.style.width = '0%';
        progressText.textContent = '0%';
        
        let totalBytes = 0;
        let uploadedBytes = 0;
        
        for (let i = 0; i < files.length; i++) {
            totalBytes += files[i].size;
        }
        
        for (let i = 0; i < files.length; i++) {
            uploadFile(files[i], totalBytes, uploadedBytes, i === files.length - 1);
            uploadedBytes += files[i].size;
        }
    }
    
    function uploadFile(file, totalBytes, previousUploadedBytes, isLastFile) {
        const originalFileName = file.name;
        const sanitizedFileName = sanitizeFileName(originalFileName);
        const fileSize = file.size;
        const fileRef = storageRef.child(`users/${currentUser.uid}/files/${Date.now()}_${sanitizedFileName}`);
        
        const metadata = {
            contentType: file.type,
            customMetadata: {
                'originalFileName': originalFileName,
                'uploadedBy': currentUser.email,
                'uploadedAt': new Date().toISOString()
            }
        };
        
        const uploadTask = fileRef.put(file, metadata);
        
        uploadTask.on('state_changed', 
            (snapshot) => {
                const fileProgress = snapshot.bytesTransferred / fileSize;
                const overallProgress = (previousUploadedBytes + snapshot.bytesTransferred) / totalBytes;
                const progressPercentage = Math.round(overallProgress * 100);
                
                progressFill.style.width = `${progressPercentage}%`;
                progressText.textContent = `${progressPercentage}%`;
            },
            (error) => {
                console.error('Upload failed:', error);
                alert(`Failed to upload ${originalFileName}: ${error.message}`);
                
                if (isLastFile) {
                    setTimeout(() => {
                        uploadProgress.style.display = 'none';
                    }, 2000);
                }
            },
            () => {
                if (isLastFile) {
                    progressFill.style.width = '100%';
                    progressText.textContent = '100%';
                    
                    setTimeout(() => {
                        uploadProgress.style.display = 'none';
                        loadUserFiles();
                    }, 2000);
                }
            }
        );
    }
    
    function loadUserFiles() {
        if (!currentUser) return;
        
        loadingIndicator.style.display = 'flex';
        fileList.innerHTML = '';
        
        const userFilesRef = storageRef.child(`users/${currentUser.uid}`);
        
        listAllFiles(userFilesRef, [])
            .then(allItems => {
                if (allItems.length === 0) {
                    loadingIndicator.style.display = 'none';
                    fileList.innerHTML = '<p class="no-files">No files found. Upload some files to get started.</p>';
                    return;
                }
                
                let filesProcessed = 0;
                
                allItems.forEach((itemRef) => {
                    Promise.all([
                        itemRef.getMetadata(),
                        itemRef.getDownloadURL()
                    ])
                    .then(([metadata, downloadURL]) => {
                        const fileItem = createFileItem(metadata, downloadURL);
                        fileList.appendChild(fileItem);
                        
                        filesProcessed++;
                        if (filesProcessed === allItems.length) {
                            loadingIndicator.style.display = 'none';
                        }
                    })
                    .catch((error) => {
                        console.error('Error getting file details:', error);
                        filesProcessed++;
                        if (filesProcessed === allItems.length) {
                            loadingIndicator.style.display = 'none';
                        }
                    });
                });
            })
            .catch((error) => {
                console.error('Error listing files:', error);
                loadingIndicator.style.display = 'none';
                fileList.innerHTML = '<p class="error-message">Error loading files. Please try again later.</p>';
            });
    }
    
    function listAllFiles(ref, allItems = []) {
        return ref.listAll()
            .then(res => {
                const itemPromises = res.items.map(itemRef => {
                    allItems.push(itemRef);
                    return Promise.resolve();
                });
                
                const folderPromises = res.prefixes.map(folderRef => {
                    return listAllFiles(folderRef, allItems);
                });
                
                return Promise.all([...itemPromises, ...folderPromises]).then(() => allItems);
            });
    }
    
    function createFileItem(metadata, downloadURL) {
        const fileItem = document.createElement('li');
        fileItem.className = 'file-item';
        
        const formattedSize = formatFileSize(metadata.size);
        
        const uploadDate = new Date(metadata.timeCreated);
        const formattedDate = formatDate(uploadDate);
        
        const fileIcon = getFileIcon(metadata.contentType);
        
        const displayName = metadata.customMetadata && metadata.customMetadata.originalFileName ? 
                           metadata.customMetadata.originalFileName : metadata.name;
        
        fileItem.innerHTML = `
            <div class="file-info">
                <div class="file-icon"><i class="${fileIcon}"></i></div>
                <div class="file-name">${displayName}</div>
            </div>
            <div class="file-size">${formattedSize}</div>
            <div class="file-date">${formattedDate}</div>
            <div class="file-actions">
                <button class="download-btn" title="Download"><i class="fas fa-download"></i></button>
                <button class="share-btn" title="Share"><i class="fas fa-share-alt"></i></button>
                <button class="delete-btn" title="Delete"><i class="fas fa-trash"></i></button>
            </div>
        `;
        
        const downloadBtn = fileItem.querySelector('.download-btn');
        const shareBtn = fileItem.querySelector('.share-btn');
        const deleteBtn = fileItem.querySelector('.delete-btn');
        
        downloadBtn.addEventListener('click', function() {
            window.open(downloadURL, '_blank');
        });
        
        shareBtn.addEventListener('click', function() {
            navigator.clipboard.writeText(downloadURL).then(() => {
                alert('Download link copied to clipboard!');
            }).catch(err => {
                console.error('Could not copy text: ', err);
            });
        });
        
        deleteBtn.addEventListener('click', function() {
            if (confirm(`Are you sure you want to delete ${displayName}?`)) {
                const fileRef = storageRef.child(metadata.fullPath);
                
                fileRef.delete().then(() => {
                    fileItem.remove();
                    
                    if (fileList.children.length === 0) {
                        fileList.innerHTML = '<p class="no-files">No files found. Upload some files to get started.</p>';
                    }
                }).catch((error) => {
                    console.error('Error deleting file:', error);
                    alert(`Failed to delete ${displayName}: ${error.message}`);
                });
            }
        });
        
        return fileItem;
    }
    
    function formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
    
    function formatDate(date) {
        const options = { year: 'numeric', month: 'short', day: 'numeric' };
        return date.toLocaleDateString(undefined, options);
    }
    
    function getFileIcon(contentType) {
        if (contentType.startsWith('image/')) {
            return 'fas fa-file-image';
        } else if (contentType.startsWith('video/')) {
            return 'fas fa-file-video';
        } else if (contentType.startsWith('audio/')) {
            return 'fas fa-file-audio';
        } else if (contentType.includes('pdf')) {
            return 'fas fa-file-pdf';
        } else if (contentType.includes('word') || contentType.includes('document')) {
            return 'fas fa-file-word';
        } else if (contentType.includes('excel') || contentType.includes('spreadsheet')) {
            return 'fas fa-file-excel';
        } else if (contentType.includes('powerpoint') || contentType.includes('presentation')) {
            return 'fas fa-file-powerpoint';
        } else if (contentType.includes('zip') || contentType.includes('compressed')) {
            return 'fas fa-file-archive';
        } else if (contentType.includes('text/')) {
            return 'fas fa-file-alt';
        } else if (contentType.includes('code') || contentType.includes('javascript') || contentType.includes('html') || contentType.includes('css')) {
            return 'fas fa-file-code';
        } else {
            return 'fas fa-file';
        }
    }
});
