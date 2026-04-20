/**
 * Firebase Configuration
 * Replace these values with your Firebase project credentials
 */

// Your Firebase config
const firebaseConfig = {
    apiKey: "YOUR_API_KEY_HERE",
    authDomain: "YOUR_AUTH_DOMAIN",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_STORAGE_BUCKET",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID"
};

// Initialize Firebase
let app;
let auth;
let db;
let storage;

try {
    app = firebase.initializeApp(firebaseConfig);
    auth = firebase.auth(app);
    db = firebase.firestore(app);
    storage = firebase.storage(app);
    
    console.log('✅ Firebase initialized successfully');
    
    // Enable offline persistence
    db.enablePersistence().catch((err) => {
        if (err.code == 'failed-precondition') {
            console.warn('Multiple tabs open, persistence can only be enabled in one tab at a time.');
        } else if (err.code == 'unimplemented') {
            console.warn('Browser does not support offline persistence.');
        }
    });
} catch (error) {
    console.error('❌ Firebase initialization error:', error);
}

// Export for use in other modules
window.firebaseConfig = {
    app,
    auth,
    db,
    storage
};
