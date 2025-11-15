// src/App.js

import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Link, useNavigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { auth } from './firebase'; 
import { signOut } from 'firebase/auth'; 
import ProtectedRoute from './components/ProtectedRoute';

// Імпортуємо наш новий CSS!
import './App.css';

// Всі наші сторінки
import HomePage from './pages/HomePage';
import AdminPage from './pages/AdminPage';
import LoginPage from './pages/LoginPage';
import CategoryPage from './pages/CategoryPage';
import SearchPage from './pages/SearchPage';
import PlayerPage from './pages/PlayerPage';

function AppContent() {
  const { currentUser, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/');
    } catch (error) {
      console.error("Помилка виходу:", error);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    navigate(`/search?q=${searchQuery}`);
    setSearchQuery('');
  };

  return (
    <>
      {/* 1. НАША НОВА КРАСИВА НАВІГАЦІЯ */}
      <nav className="app-nav">

        {/* Логотип "Мій Світ" */}
        <Link to="/" className="app-logo">Мій Світ</Link>

        {/* Форма Пошуку */}
        <form onSubmit={handleSearchSubmit} className="search-form">
          <input 
            type="text" 
            placeholder="Шукай мультики..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button type="submit">Знайти</button>
        </form>

        {/* Дії (Адмінка, Вхід, Вихід) */}
        <div className="nav-actions">
          {!currentUser && (
            <Link to="/login" className="nav-link">Логін</Link>
          )}
          {currentUser && isAdmin && (
            <>
              <Link to="/admin" className="nav-link">Адмінка</Link>
              <button onClick={handleLogout}>Вийти</button>
            </>
          )}
          {currentUser && !isAdmin && (
            <button onClick={handleLogout}>Вийти</button>
          )}
        </div>
      </nav>

      {/* 2. ОБЛАСТЬ ВІДОБРАЖЕННЯ СТОРІНОК */}
      <div className="app-content">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route 
            path="/admin" 
            element={
              <ProtectedRoute>
                <AdminPage />
              </ProtectedRoute>
            } 
          />
          <Route path="/category/:categoryId" element={<CategoryPage />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/video/:videoId" element={<PlayerPage />} />
        </Routes>
      </div>
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

export default App;