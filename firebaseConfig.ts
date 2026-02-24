import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyAY14ZV-JRccAfQv5qnbMB7V9va14Kgqp4",
  authDomain: "neko-mental.firebaseapp.com",
  projectId: "neko-mental",
  storageBucket: "neko-mental.firebasestorage.app",
  messagingSenderId: "918005580303",
  appId: "1:918005580303:web:228b1fcf07c0ae8193d97a",
  measurementId: "G-1P2S7LYFHT"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);