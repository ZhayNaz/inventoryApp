import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { 
  initializeFirestore, 
  persistentLocalCache, 
  persistentMultipleTabManager 
} from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAc0LP-SaH_9aRPL0CXAggM_jerN5B46SE",
  authDomain: "inventorypro-51beb.firebaseapp.com",
  projectId: "inventorypro-51beb",
  storageBucket: "inventorypro-51beb.firebasestorage.app",
  messagingSenderId: "469015977281",
  appId: "1:469015977281:web:8f5a1d5986b8072e2915c0",
  measurementId: "G-9S7LF0RZ92"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore with modern persistent cache
export const db = initializeFirestore(app, {
  localCache: persistentLocalCache({
    tabManager: persistentMultipleTabManager()
  })
});

// Initialize other services
export const auth = getAuth(app);
export const storage = getStorage(app);

export default app;
