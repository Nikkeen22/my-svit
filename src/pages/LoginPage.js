// src/pages/LoginPage.js

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../firebase'; // Імпортуємо наш 'замок'
import { 
  signInWithEmailAndPassword, 
  GoogleAuthProvider, 
  signInWithPopup 
} from 'firebase/auth';

function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // --- Логіка для Email/Password ---
  const handleEmailLogin = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate('/admin'); // Успіх -> перехід на /admin
    } catch (err) {
      console.error("Помилка входу (Email):", err);
      setError("Не вдалося увійти. Перевірте email та пароль.");
    }
  };

  // --- Логіка для Google ---
  const handleGoogleLogin = async () => {
    setError('');
    const provider = new GoogleAuthProvider(); // Створюємо провайдера Google
    try {
      await signInWithPopup(auth, provider);
      navigate('/admin'); // Успіх -> перехід на /admin
    } catch (err) {
      console.error("Помилка входу (Google):", err);
      setError("Не вдалося увійти через Google.");
    }
  };

  return (
    <div>
      <h1>Вхід для Адміністратора</h1>
      
      {/* --- Форма Email/Password --- */}
      <form onSubmit={handleEmailLogin} style={{ marginBottom: '20px' }}>
        <div style={{ margin: '10px 0' }}>
          <label>Email: </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="admin@email.com"
          />
        </div>
        <div style={{ margin: '10px 0' }}>
          <label>Пароль: </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
          />
        </div>
        <button type="submit">Увійти з Email</button>
      </form>

      <hr />

      {/* --- Кнопка Google --- */}
      <p style={{ margin: '20px 0' }}>Або</p>
      <button onClick={handleGoogleLogin}>
        Увійти через Google
      </button>

      {/* --- Повідомлення про помилку (для обох методів) --- */}
      {error && <p style={{ color: 'red', marginTop: '15px' }}>{error}</p>}
    </div>
  );
}

export default LoginPage;