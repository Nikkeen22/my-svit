// src/pages/AdminPage.js

import React from 'react';
import CategoryManager from '../components/CategoryManager';
import VideoManager from '../components/VideoManager'; // 1. Імпортуємо

function AdminPage() {
  return (
    <div>
      <h1>Сторінка Адміністратора</h1>
      <p>Тут ви можете управляти контентом вашого додатку.</p>
      
      <CategoryManager />
      
      <hr style={{ margin: '40px 0' }} /> {/* Розділювач */}

      <VideoManager /> {/* 2. Додаємо наш новий компонент сюди */}
    </div>
  );
}

export default AdminPage;