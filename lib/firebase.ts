import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
    apiKey: "AIzaSyC2tJcJR6YD9ol0jCZETrABv044Wpb_e7U",
    authDomain: "wealthaggregator-b6ba5.firebaseapp.com",
    projectId: "wealthaggregator-b6ba5",
    storageBucket: "wealthaggregator-b6ba5.firebasestorage.app",
    messagingSenderId: "1040313194732",
    appId: "1:1040313194732:web:f3948f8482f08736aa6dc9",
    measurementId: "G-QHB14JRKVW"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export services
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const firestore = getFirestore(app);
export default app;
