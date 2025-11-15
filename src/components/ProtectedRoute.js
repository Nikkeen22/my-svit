// src/components/ProtectedRoute.js

import React from 'react';
import { useAuth } from '../context/AuthContext'; // Беремо дані про користувача
import { Navigate } from 'react-router-dom';

// Список ADMIN_UIDS ми звідси видалили, бо він тепер у AuthContext

function ProtectedRoute({ children }) {
  // 1. Дістаємо 'currentUser' ТА нашу нову змінну 'isAdmin'
  const { currentUser, isAdmin } = useAuth();

  // 2. Перевірка: чи хтось увійшов?
  if (!currentUser) {
    return <Navigate to="/login" />;
  }

  // 3. Перевірка: чи це АДМІН?
  if (!isAdmin) {
    // Увійшов, але це не адмін.
    console.warn("Спроба неавторизованого доступу від:", currentUser.uid);
    return <Navigate to="/" />;
  }

  // Все добре - це адмін
  return children;
}

export default ProtectedRoute;