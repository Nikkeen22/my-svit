// src/components/CategoryManager.js

import React, { useState } from 'react';
// 1. ІМПОРТИ ЗМІНИЛИСЯ: нам більше не потрібен 'storage'
import { db } from '../firebase';
import { collection, addDoc, serverTimestamp } from "firebase/firestore"; 

function CategoryManager() {
  const [categoryName, setCategoryName] = useState('');
  
  // 2. ЗАМІСТЬ 'iconFile' МИ ЗБЕРІГАЄМО 'iconUrl' (ТЕКСТ)
  const [iconUrl, setIconUrl] = useState(''); 
  
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  // 3. Функція handleFileChange більше не потрібна

  // 4. ЛОГІКА ЗБЕРЕЖЕННЯ СТАЛА ПРОСТІШОЮ
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!categoryName || !iconUrl) {
      setMessage('Будь ласка, введіть назву та посилання на іконку');
      return;
    }
    
    setLoading(true);
    setMessage('Створення...');

    try {
      // Ми одразу зберігаємо дані у БАЗУ ДАНИХ (Firestore)
      await addDoc(collection(db, "categories"), {
        name: categoryName,   // Назва категорії
        iconUrl: iconUrl,     // Пряме посилання на іконку
        createdAt: serverTimestamp() // Позначаємо час створення
      });

      setMessage(`Категорію "${categoryName}" успішно створено!`);
      setLoading(false);
      setCategoryName('');
      setIconUrl(''); // Очищуємо поле посилання
      
    } catch (error) {
      console.error("Помилка при створенні категорії:", error);
      setMessage("Ой! Сталася помилка. Спробуйте ще раз.");
      setLoading(false);
    }
  };

  return (
    <div style={{ border: '1px solid #ccc', padding: '20px', margin: '20px 0' }}>
      <h2>Менеджер Категорій</h2>
      <p>Знайдіть іконку в Google (наприклад, "іконка машинки png"), натисніть правою кнопкою "Копіювати адресу зображення" і вставте її сюди.</p>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Назва нової категорії: </label>
          <input 
            type="text" 
            value={categoryName}
            onChange={(e) => setCategoryName(e.target.value)}
            required
          />
        </div>
        <div style={{ margin: '10px 0' }}>
          {/* 5. МИ ЗАМІНИЛИ 'input type="file"' НА 'input type="text"' */}
          <label>Посилання на іконку (.png, .jpg, .svg): </label>
          <input 
            type="text"
            placeholder="https://example.com/icon.png"
            value={iconUrl}
            onChange={(e) => setIconUrl(e.target.value)}
            style={{ width: '300px' }}
            required
          />
        </div>
        <button type="submit" disabled={loading}>
          {loading ? 'Створюємо...' : 'Створити Категорію'}
        </button>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
}

export default CategoryManager;