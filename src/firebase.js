// src/firebase.js

// 1. Імпортуємо потрібні функції
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
// getAnalytics нам поки не потрібен

// 2. Ваша конфігурація (виглядає ідеально)
const firebaseConfig = {
  apiKey: "AIzaSyBgGaLm8DGfrG8wfvs2LaPKOQ1h4kDh6Xc",
  authDomain: "my-svit.firebaseapp.com",
  projectId: "my-svit",
  storageBucket: "my-svit.firebasestorage.app",
  messagingSenderId: "601293643908",
  appId: "1:601293643908:web:401384e5cd5954732d22d1",
  measurementId: "G-RTMXZWWT5T"
};

// 3. Ініціалізуємо Firebase
const app = initializeApp(firebaseConfig);

// 4. Ініціалізуємо та ЕКСПОРТУЄМО сервіси, які будемо використовувати
// (щоб ми могли імпортувати їх в інших файлах нашого додатку)
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app; // Експортуємо `app` за замовчуванням