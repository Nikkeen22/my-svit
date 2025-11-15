// src/components/VideoManager.js

import React, { useState, useEffect } from 'react'; // 1. Імпортували 'useEffect'
// 2. Імпортували інструменти для роботи з Firestore
import { db } from '../firebase';
import { collection, getDocs, addDoc, serverTimestamp } from "firebase/firestore";

function VideoManager() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [youtubeUrl, setYoutubeUrl] = useState('');
  
  // 3. Тут буде список категорій, завантажений з Firestore
  const [allCategories, setAllCategories] = useState([]); // [{ id: '1', name: 'Тваринки' }, ...]
  
  // 4. Тут ми будемо зберігати ID категорій, які обрав адмін
  const [selectedCategories, setSelectedCategories] = useState([]); // ['1', 'abc', ...]
  
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  // 5. --- НОВА ЛОГІКА: Завантаження категорій ---
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        // Отримуємо всі документи з колекції 'categories'
        const querySnapshot = await getDocs(collection(db, "categories"));
        
        const categoriesList = querySnapshot.docs.map(doc => ({
          id: doc.id,         // Унікальний ID документа (напр: 'aBcDeF123')
          name: doc.data().name // Назва (напр: 'Тваринки')
        }));
        
        setAllCategories(categoriesList);
        
      } catch (error) {
        console.error("Помилка завантаження категорій: ", error);
        setMessage("Не вдалося завантажити категорії.");
      }
    };

    fetchCategories(); // Викликаємо функцію при завантаженні компонента
  }, []); // Порожній масив означає "виконати це один раз"

  // 6. --- НОВА ЛОГІКА: Обробка вибору чекбоксів ---
  const handleCategoryChange = (e) => {
    const categoryId = e.target.value;
    const isChecked = e.target.checked;

    if (isChecked) {
      // Якщо поставили "галочку" - додаємо ID до списку
      setSelectedCategories(prev => [...prev, categoryId]);
    } else {
      // Якщо "галочку" зняли - видаляємо ID зі списку
      setSelectedCategories(prev => prev.filter(id => id !== categoryId));
    }
  };

  // 7. --- ОНОВЛЕНА ЛОГІКА: Збереження відео ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !youtubeUrl || selectedCategories.length === 0) {
      setMessage('Будь ласка, заповніть Назву, URL та оберіть хоча б одну Категорію');
      return;
    }

    setLoading(true);
    setMessage('Додавання відео...');
    
    try {
      // ЗБЕРІГАЄМО ВІДЕО У КОЛЕКЦІЮ 'videos'
      await addDoc(collection(db, "videos"), {
        title: title,
        description: description,
        youtubeUrl: youtubeUrl,
        // Ми зберігаємо МАСИВ з ID обраних категорій
        categories: selectedCategories, 
        viewCount: 0, // Початкова кількість переглядів
        createdAt: serverTimestamp()
      });

      setMessage('Відео успішно додано!');
      setLoading(false);
      setTitle('');
      setDescription('');
      setYoutubeUrl('');
      setSelectedCategories([]);
      
      // Очищуємо всі чекбокси
      // (Це складно, простіше скинути стан, що ми й зробили вище)
      // Для надійності можна перезавантажити форму, але поки так

    } catch (error) {
      console.error("Помилка додавання відео: ", error);
      setMessage("Ой! Сталася помилка при додаванні відео.");
      setLoading(false);
    }
  };

  return (
    <div style={{ border: '1px solid #ccc', padding: '20px', margin: '20px 0' }}>
      <h2>Менеджер Відео</h2>
      <form onSubmit={handleSubmit}>
        {/* ...поля Назва, Опис, URL залишаються без змін... */}
        <div style={{ margin: '10px 0' }}>
          <label>Назва відео: </label>
          <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} required />
        </div>
        <div style={{ margin: '10px 0' }}>
          <label>Короткий опис (для пошуку): </label>
          <input type="text" value={description} onChange={(e) => setDescription(e.target.value)} />
        </div>
        <div style={{ margin: '10px 0' }}>
          <label>Посилання на YouTube: </label>
          <input type="text" placeholder="https://www.youtube.com/watch?v=..." value={youtubeUrl} onChange={(e) => setYoutubeUrl(e.target.value)} style={{ width: '300px' }} required />
        </div>

        {/* 8. --- ОНОВЛЕНИЙ БЛОК КАТЕГОРІЙ --- */}
        <div style={{ margin: '10px 0' }}>
          <label>Категорії:</label>
          
          {/* Якщо категорії ще завантажуються */}
          {allCategories.length === 0 && <p>Завантаження категорій...</p>}
          
          {/* Відображаємо список чекбоксів */}
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {allCategories.map(category => (
              <label key={category.id}>
                <input 
                  type="checkbox" 
                  value={category.id} // Значення - це ID
                  onChange={handleCategoryChange}
                  // Перевіряємо, чи є ID цієї категорії у списку обраних
                  checked={selectedCategories.includes(category.id)} 
                />
                {category.name} {/* Назва, яку бачить адмін */}
              </label>
            ))}
          </div>
        </div>

        <button type="submit" disabled={loading}>
          {loading ? 'Додаємо...' : 'Додати Відео'}
        </button>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
}

export default VideoManager;