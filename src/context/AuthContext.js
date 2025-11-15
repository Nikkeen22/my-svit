import React, { useContext, useState, useEffect, createContext } from 'react';
import { auth } from '../firebase';
import { onAuthStateChanged } from 'firebase/auth';


// 1. ЗАМІСТЬ ОДНОГО UID - СТВОРЮЄМО МАСИВ (список)
// Вставте сюди UID всіх, кому ви довіряєте
const ADMIN_UIDS = [
  "ZAGL5kXm1ShhnG2IE7aqp2XfHLr2", // Наприклад, ваш
  "zdqYJXngRieGOkQnR0WdXEip4tj1",  // Наприклад, Даші
  // "МОЖНА_ДОДАТИ_І_ТРЕТЬОГО"
];


const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  // 2. ДОДАЄМО ЛОГІКУ ПЕРЕВІРКИ АДМІНА
  // 'isAdmin' буде true або false
  const isAdmin = currentUser ? ADMIN_UIDS.includes(currentUser.uid) : false;

  const value = {
    currentUser,
    isAdmin // 3. ЕКСПОРТУЄМО 'isAdmin' РАЗОМ З 'currentUser'
  };

  if (loading) {
    return <div>Завантаження...</div>;
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}