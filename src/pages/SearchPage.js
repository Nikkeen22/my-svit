// src/pages/SearchPage.js

import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { db } from '../firebase';
import { collection, getDocs } from 'firebase/firestore';
// 1. Прибрали 'YouTube' - він тут більше не потрібен

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

function SearchPage() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q');
  const [allVideos, setAllVideos] = useState([]);
  const [filteredVideos, setFilteredVideos] = useState([]);
  const [loading, setLoading] = useState(true);

  // ... (Весь ваш код useEffect() залишається без змін) ...
  useEffect(() => {
    const fetchAllVideos = async () => {
      setLoading(true);
      try {
        const querySnapshot = await getDocs(collection(db, "videos"));
        const videosList = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setAllVideos(videosList);
      } catch (error) {
        console.error("Помилка завантаження всіх відео:", error);
      }
      setLoading(false);
    };
    fetchAllVideos();
  }, []);

  useEffect(() => {
    if (!query) {
      setFilteredVideos([]);
      return;
    }
    if (allVideos.length > 0) {
      const lowerCaseQuery = query.toLowerCase();
      const results = allVideos.filter(video => 
        video.title.toLowerCase().includes(lowerCaseQuery) ||
        video.description.toLowerCase().includes(lowerCaseQuery)
      );
      setFilteredVideos(results);
    }
  }, [query, allVideos]);

  if (loading) {
    return <div>Пошук...</div>;
  }

  return (
    <div>
      <h1>Результати пошуку для: "{query}"</h1>
      {!loading && filteredVideos.length === 0 && (
        <p>На жаль, нічого не знайдено.</p>
      )}

      {/* 2. ОНОВЛЕНА СІТКА З ВІДЕО */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px' }}>
        {filteredVideos.map(video => {
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
              <p style={{ fontSize: '14px' }}>{video.description}</p>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

export default SearchPage;