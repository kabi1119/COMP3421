COMP3421 Interactive Web-based File Sharing System

A secure and user-friendly file sharing system built with HTML, CSS, JavaScript, and Firebase. This project allows users to register, upload, manage, and share files through a responsive web interface.

Features
User Authentication

Email/password registration and login
Email verification
Password reset functionality
Account management
File Management

File upload with drag-and-drop support
File download
File deletion
File search
File sharing via link
Security

Secure authentication via Firebase
Email verification requirement
Automatic logout on inactivity
Secure file storage
User Experience

Responsive design for desktop and mobile
Real-time upload progress
File type recognition and icons
Notification system
Search functionality

Setup Guide
Prerequisites
A Google account
Basic knowledge of HTML, CSS, and JavaScript
A code editor (like VS Code, Sublime Text, etc.)

Step 1: Create a Firebase Project
Go to Firebase Console
Click "Add project"
Enter a project name (e.g., "COMP3421-File-Sharing")
Accept the terms and click "Continue"
Configure Google Analytics (optional)
Click "Create project"

Step 2: Set Up Firebase Authentication
In your Firebase project console, click "Authentication" in the left sidebar
Click "Get started"
Select "Email/Password" from the Sign-in method tab
Enable "Email/Password" option
Click "Save"

Step 3: Set Up Firebase Firestore
In the left sidebar, click "Firestore Database"
Click "Create database"
Choose "Start in test mode" (for development)
Click "Next"
Choose a location for your database
Click "Enable"

Step 4: Set Up Firebase Storage
In the left sidebar, click "Storage"
Click "Get started"
Click "Next"
Choose a location for your storage (same as your Firestore location)
Click "Done"

Step 5: Register Your Web App
Go to the project overview page
Click the web icon (</>) to add a web app
Enter a nickname for your app (e.g., "COMP3421-Web")
Check "Also set up Firebase Hosting" if you want to host your app on Firebase
Click "Register app"
Copy the Firebase configuration object
Click "Next" and then "Continue to console"

Step 6: Configure the Project
Clone this repository or download the project files
Create a file named js/firebase-config.js with the following content:
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_PROJECT_ID.appspot.com",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID",
    measurementId: "YOUR_MEASUREMENT_ID" // Optional if you enabled Analytics
};

if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}

const auth = firebase.auth();
const db = firebase.firestore();


Replace the placeholder values with your Firebase configuration values from Step 5.

Step 7: Set Up Firebase Rules
Firestore Rules
Go to Firestore Database > Rules
Replace the rules with:

rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /files/{fileId} {
      allow read, update, delete: if request.auth != null && request.auth.uid == resource.data.userId;
      allow create: if request.auth != null && request.auth.uid == request.resource.data.userId;
    }
  }
}



Storage Rules
Go to Storage > Rules
Replace the rules with:

rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /users/{userId}/{allPaths=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}



Step 8: Deploy Your Application

Option 1: Local Testing
Install a local server like Live Server for VS Code
Open the project folder in VS Code
Right-click on index.html and select "Open with Live Server"

Option 2: Firebase Hosting
Install Firebase CLI:
``npm install -g firebase-tools``


Login to Firebase:
``firebase login``


Initialize Firebase in your project folder:
``firebase init``


Select Hosting
Select your Firebase project
Use "." as your public directory
Configure as a single-page app: No
Set up automatic builds and deploys: No

Deploy your app:
``firebase deploy``


Your app will be available at https://YOUR_PROJECT_ID.web.app


Usage Guide

Registration and Login
Open the application and click "Register Here" on the login page
Enter your email and create a password that meets the requirements
Submit the form and check your email for a verification link
Click the verification link in your email
Return to the application and log in with your credentials

File Management
After logging in, you'll be directed to the dashboard
Upload files by clicking the "Select Files" button or by dragging and dropping files
View your uploaded files in the grid below
Use the search bar to find specific files
View or download files by clicking the "View & Save" button
Share files by clicking the "Share" button and copying the link
Delete files by clicking the "Delete" button and confirming

Account Management
Click "Account" in the navigation bar to access account settings
View your account information

Change your password
Request a password reset email
Delete your account (requires password confirmation)

Security Features
Email Verification: Users must verify their email before accessing the system
Password Requirements: Strong password requirements with real-time validation
Automatic Logout: Users are logged out after 10 minutes of inactivity
Secure Storage: Files are stored securely in Firebase Storage
Access Control: Users can only access their own files

Troubleshooting
Common Issues
Authentication Issues

Make sure email/password authentication is enabled in Firebase
Check if your email is verified
Try resetting your password
Upload Errors

Verify your email address
Check your internet connection
Ensure the file size is within limits
Download Issues

Try using the "Save As" option when the file opens in a new tab
Check your browser's download settings
CORS Errors

You might need to configure CORS in your Firebase Storage settings
Firebase Quotas
The free tier of Firebase has certain limitations:

1GB of storage
10GB/month of downloads
20,000 document writes per day
50,000 document reads per day
Monitor your usage in the Firebase console to avoid exceeding these limits.


Acknowledgements
Firebase for authentication, storage, and hosting
Font Awesome for icons
Google Analytics for usage tracking
Developed for COMP3421-25-P1 Interactive Web-based File Sharing System