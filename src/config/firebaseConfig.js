// Import the functions you need from the SDKs you need
import {initializeApp, getApps} from 'firebase/app';
import {getDatabase} from 'firebase/database';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: 'AIzaSyDgsnBKLtGTaU7Mljd2mY4UgISKq2tJiHs',
  authDomain: 'sevice-provider.firebaseapp.com',
  databaseURL:
    'https://sevice-provider-default-rtdb.asia-southeast1.firebasedatabase.app',
  projectId: 'sevice-provider',
  storageBucket: 'sevice-provider.firebasestorage.app',
  messagingSenderId: '525422508327',
  appId: '1:525422508327:web:f5b487fa3be3034f3ad102',
  measurementId: 'G-KRYT38XCYC',
};

// Initialize Firebase
const app =
  getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const db = getDatabase(app);

export {db};
