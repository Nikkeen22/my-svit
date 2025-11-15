import React, { useState, useEffect, useRef } from 'react';
import { db } from '../firebase';
import { collection, getDocs } from 'firebase/firestore';
import { Link } from 'react-router-dom';
import styles from './HomePage.module.css'; 

// --- Функція-помічник для YouTube ID (без змін) ---
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

// --- Компонент "Відео-картка" (без змін) ---
function VideoCard({ video }) {
  const videoId = getYouTubeVideoId(video.youtubeUrl);
  if (!videoId) return null;

  return (
    <Link to={`/video/${video.id}`} className={styles.videoCard}>
      <img 
        src={`https://img.youtube.com/vi/${videoId}/mqdefault.jpg`} 
        alt={video.title}
      />
      <div className={styles.videoInfo}>
        <h4>{video.title}</h4>
      </div>
    </Link>
  );
}

function HomePage() {
  const [categories, setCategories] = useState([]);
  const [videos, setVideos] = useState([]);
  const [frequentVideos, setFrequentVideos] = useState([]);
  const [loading, setLoading] = useState(true);

  // 2. СТВОРЮЄМО "ЯКОРІ" (Refs) ДЛЯ НАШИХ КАРУСЕЛЕЙ
  const frequentCarouselRef = useRef(null);
  const categoryCarouselRef = useRef(null);

  // 3. ФУНКЦІЯ ПРОКРУТКИ
  const handleScroll = (ref, direction) => {
    // Прокручуємо на 80% ширини вікна
    const scrollAmount = ref.current.clientWidth * 0.8; 

    if (direction === 'left') {
      ref.current.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
    } else {
      ref.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  // useEffect для завантаження даних (без змін)
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const categoriesSnapshot = await getDocs(collection(db, "categories"));
        const categoriesList = categoriesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setCategories(categoriesList);

        const videosSnapshot = await getDocs(collection(db, "videos"));
        const videosList = videosSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setVideos(videosList);

        const rawHistory = localStorage.getItem('mySvitHistory');
        const history = rawHistory ? JSON.parse(rawHistory) : {};
        const sortedVideoIds = Object.keys(history).sort((a, b) => history[b] - history[a]);
        const frequentList = sortedVideoIds.map(id => videosList.find(video => video.id === id)).filter(video => video !== undefined); 
        setFrequentVideos(frequentList.slice(0, 5));
      } catch (error) {
        console.error("Помилка завантаження даних:", error);
      }
      setLoading(false);
    };
    fetchData();
  }, []);

  if (loading) {
    return <div>Завантаження мультиків...</div>;
  }

  // 4. ОНОВЛЕНИЙ HTML (JSX)
  return (
    <div>
      {/* === Блок 1: Найчастіше дивитесь === */}
      {frequentVideos.length > 0 && (
        <>
          <h2 className={styles.sectionTitle}>Найчастіше дивитесь</h2>
          {/* Додаємо обгортку .carouselContainer */}
          <div className={styles.carouselContainer}>
            {/* Додаємо кнопки */}
            <button 
              className={`${styles.scrollButton} ${styles.scrollButtonLeft}`}
              onClick={() => handleScroll(frequentCarouselRef, 'left')}
            >
              &lsaquo;
            </button>
            <div className={styles.carousel} ref={frequentCarouselRef}> 
              {frequentVideos.map(video => (
                <VideoCard key={video.id} video={video} />
              ))}
            </div>
            <button 
              className={`${styles.scrollButton} ${styles.scrollButtonRight}`}
              onClick={() => handleScroll(frequentCarouselRef, 'right')}
            >
              &rsaquo;
            </button>
          </div>
          <hr style={{ margin: '40px 0', border: '1px solid #f0f0f0' }} />
        </>
      )}

      {/* === Блок 2: Категорії === */}
      <h2 className={styles.sectionTitle}>Категорії</h2>
      {/* Додаємо обгортку .carouselContainer ТА НОВИЙ КЛАС .categoryCarouselContainer */}
      <div className={`${styles.carouselContainer} ${styles.categoryCarouselContainer}`}>
        {/* Додаємо кнопки */}
        <button 
          className={`${styles.scrollButton} ${styles.scrollButtonLeft}`}
          onClick={() => handleScroll(categoryCarouselRef, 'left')}
        >
          &lsaquo;
        </button>
        <div className={styles.carousel} ref={categoryCarouselRef}> 
          {categories.map(category => (
            <Link 
              key={category.id} 
              to={`/category/${category.id}`}
              className={styles.categoryCard}
            >
              <img src={category.iconUrl} alt={category.name} />
              <p>{category.name}</p>
            </Link>
          ))}
        </div>
        <button 
          className={`${styles.scrollButton} ${styles.scrollButtonRight}`}
          onClick={() => handleScroll(categoryCarouselRef, 'right')}
        >
          &rsaquo;
        </button>
      </div>
      <hr style={{ margin: '40px 0', border: '1px solid #f0f0f0' }} />

      {/* === Блок 3: Усі Відео (без змін) === */}
      <h2 className={styles.sectionTitle}>Усі Відео</h2>
      <div className={styles.grid}> 
        {videos.map(video => (
          <VideoCard key={video.id} video={video} />
        ))}
      </div>
    </div>
  );
}

export default HomePage;