// src/pages/CategoryPage.js

import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom'; // 1. Додали Link
import { db } from '../firebase';
import { collection, doc, getDoc, query, where, getDocs } from 'firebase/firestore';
// 2. Прибрали 'YouTube' - він тут більше не потрібен

// --- Функція-помічник для YouTube ID (ВЖЕ МАЄ БУТИ У ВАС) ---
const getYouTubeVideoId = (url) => {
  try {
    const urlObj = new URL(url);
    if (urlObj.hostname === 'www.youtube.com' || urlObj.hostname === 'youtube.com') {
      return urlObj.searchParams.get('v');
    }
    if (urlObj.hostname === 'youtu.be') {
      return urlObj.pathname.slice(1);
    }
  } catch (error) {
    return null;
  }
};
// --- Кінець функції-помічника ---

function CategoryPage() {
  const { categoryId } = useParams();
  const [videos, setVideos] = useState([]);
  const [categoryName, setCategoryName] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // ... (Весь ваш код fetchData() залишається без змін) ...
    const fetchData = async () => {
      setLoading(true);
      try {
        const categoryDocRef = doc(db, 'categories', categoryId);
        const categoryDocSnap = await getDoc(categoryDocRef);
        if (categoryDocSnap.exists()) {
          setCategoryName(categoryDocSnap.data().name);
        } else {
          setCategoryName('Невідома категорія');
        }
        const videosCollectionRef = collection(db, 'videos');
        const q = query(videosCollectionRef, where("categories", "array-contains", categoryId));
        const querySnapshot = await getDocs(q);
        const videosList = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setVideos(videosList);
      } catch (error) {
        console.error("Помилка завантаження даних категорії:", error);
      }
      setLoading(false);
    };
    if (categoryId) fetchData();
  }, [categoryId]);

  if (loading) {
    return <div>Завантаження відео...</div>;
  }

  return (
    <div>
      <h1>Відео у категорії: "{categoryName}"</h1>
      {videos.length === 0 && (
        <p>У цій категорії ще немає мультиків.</p>
      )}

      {/* 3. ОНОВЛЕНА СІТКА З ВІДЕО */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px' }}>
        {videos.map(video => {
          const videoId = getYouTubeVideoId(video.youtubeUrl);
          if (!videoId) return null; 

          return (
            <Link 
              key={video.id} 
              to={`/video/${video.id}`}
              style={{ textDecoration: 'none', color: 'inherit', width: '300px' }}
            >
              <img 
                src={`https://img.youtube.com/vi/${videoId}/mqdefault.jpg`} 
                alt={video.title}
                style={{ width: '100%', borderRadius: '8px' }}
              />
              <h4 style={{ marginTop: '5px' }}>{video.title}</h4>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

export default CategoryPage;