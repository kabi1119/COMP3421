document.addEventListener('DOMContentLoaded', function() {
    const logoutBtn = document.getElementById('logout-btn');
    const userEmailDisplay = document.getElementById('user-email-display');
    const fileInput = document.getElementById('file-input');
    const uploadProgress = document.getElementById('upload-progress');
    const progressFill = document.getElementById('progress-fill');
    const progressText = document.getElementById('progress-text');
    const loadingIndicator = document.getElementById('loading-indicator');
    
    const uploadedFiles = {};
    
    firebase.auth().onAuthStateChanged(function(user) {
        if (user) {
            userEmailDisplay.textContent = user.email;
            loadingIndicator.classList.remove('hidden');
            
            setTimeout(() => {
                loadingIndicator.classList.add('hidden');
            }, 1500);
        } else {
            window.location.href = 'index.html';
        }
    });

    logoutBtn.addEventListener('click', function() {
        firebase.auth().signOut()
            .then(function() {
                window.location.href = 'index.html';
            })
            .catch(function(error) {
                console.error('Logout error:', error);
            });
    });

    fileInput.addEventListener('change', function(e) {
        if (fileInput.files.length > 0) {
            const files = fileInput.files;
            for (let i = 0; i < files.length; i++) {
                simulateFileUpload(files[i]);
            }
        }
    });

    function simulateFileUpload(file) {
        uploadProgress.classList.remove('hidden');
        
        const fileId = 'file_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        
        uploadedFiles[fileId] = file;
        
        let progress = 0;
        const interval = setInterval(() => {
            progress += 5;
            progressFill.style.width = progress + '%';
            progressText.textContent = progress + '%';
            
            if (progress >= 100) {
                clearInterval(interval);
                
                setTimeout(() => {
                    uploadProgress.classList.add('hidden');
                    progressFill.style.width = '0%';
                    progressText.textContent = '0%';
                    
                    const fileSize = formatFileSize(file.size);
                    const now = new Date();
                    const dateStr = now.toISOString().split('T')[0];
                    
                    const newFile = {
                        id: fileId,
                        name: file.name,
                        size: fileSize,
                        date: dateStr
                    };
                    
                    addFileToList(newFile);
                }, 500);
            }
        }, 100);
    }

    function formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
    }

    function addFileToList(file) {
        const fileListElement = document.getElementById('file-list');
        if (!fileListElement) return;
        
        const fileItem = createFileItem(file);
        fileListElement.insertBefore(fileItem, fileListElement.firstChild);
    }

    function createFileItem(file) {
        const li = document.createElement('li');
        li.className = 'file-item';
        li.dataset.fileId = file.id;
        
        let iconClass = 'fa-file';
        const ext = file.name.split('.').pop().toLowerCase();
        
        if (['pdf'].includes(ext)) {
            iconClass = 'fa-file-pdf';
        } else if (['doc', 'docx'].includes(ext)) {
            iconClass = 'fa-file-word';
        } else if (['xls', 'xlsx'].includes(ext)) {
            iconClass = 'fa-file-excel';
        } else if (['jpg', 'jpeg', 'png', 'gif'].includes(ext)) {
            iconClass = 'fa-file-image';
        }
        
        li.innerHTML = `
            <div class="file-info">
                <i class="fas ${iconClass} file-icon"></i>
                <div class="file-name">${file.name}</div>
            </div>
            <div class="file-size">${file.size}</div>
            <div class="file-date">${file.date}</div>
            <div class="file-actions">
                <button class="download-btn" title="Download">
                    <i class="fas fa-download"></i>
                </button>
                <button class="share-btn" title="Share">
                    <i class="fas fa-share-alt"></i>
                </button>
                <button class="delete-btn" title="Delete">
                    <i class="fas fa-trash-alt"></i>
                </button>
            </div>
        `;
        
        const downloadBtn = li.querySelector('.download-btn');
        const shareBtn = li.querySelector('.share-btn');
        const deleteBtn = li.querySelector('.delete-btn');
        
        downloadBtn.addEventListener('click', function() {
            const fileId = li.dataset.fileId;
            if (uploadedFiles[fileId]) {
                const url = URL.createObjectURL(uploadedFiles[fileId]);
                const a = document.createElement('a');
                a.href = url;
                a.download = file.name;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
            } else {
                alert(`File "${file.name}" is not available for download in this demo.`);
            }
        });
        
        shareBtn.addEventListener('click', function() {
            const shareDialog = document.createElement('div');
            shareDialog.className = 'share-dialog';
            shareDialog.innerHTML = `
                <div class="share-dialog-content">
                    <h3>Share "${file.name}"</h3>
                    <p>Enter email addresses to share with (comma separated):</p>
                    <input type="text" id="share-emails" placeholder="example@email.com">
                    <div class="share-dialog-buttons">
                        <button id="share-cancel">Cancel</button>
                        <button id="share-confirm">Share</button>
                    </div>
                </div>
            `;
            document.body.appendChild(shareDialog);
            
            document.getElementById('share-cancel').addEventListener('click', function() {
                document.body.removeChild(shareDialog);
            });
            
            document.getElementById('share-confirm').addEventListener('click', function() {
                const emails = document.getElementById('share-emails').value;
                if (emails) {
                    alert(`File "${file.name}" shared with: ${emails}`);
                } else {
                    alert('Please enter at least one email address');
                    return;
                }
                document.body.removeChild(shareDialog);
            });
        });
        
        deleteBtn.addEventListener('click', function() {
            const fileId = li.dataset.fileId;
            if (uploadedFiles[fileId]) {
                delete uploadedFiles[fileId];
            }
            li.remove();
        });
        
        return li;
    }
    
    const style = document.createElement('style');
    style.textContent = `
        .share-dialog {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background-color: rgba(0, 0, 0, 0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 1000;
        }
        
        .share-dialog-content {
            background-color: white;
            padding: 20px;
            border-radius: 8px;
            width: 90%;
            max-width: 500px;
        }
        
        .share-dialog h3 {
            margin-top: 0;
        }
        
        .share-dialog input {
            width: 100%;
            padding: 8px;
            margin: 10px 0;
            border: 1px solid #ddd;
            border-radius: 4px;
        }
        
        .share-dialog-buttons {
            display: flex;
            justify-content: flex-end;
            gap: 10px;
            margin-top: 15px;
        }
        
        .share-dialog-buttons button {
            padding: 8px 16px;
            border: none;
            border-radius: 4px;
            cursor: pointer;
        }
        
        #share-cancel {
            background-color: #f3f4f6;
            color: #4b5563;
        }
        
        #share-confirm {
            background-color: #4f46e5;
            color: white;
        }
    `;
    document.head.appendChild(style);
});
