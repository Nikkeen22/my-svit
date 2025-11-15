import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { db } from '../firebase';
import { doc, getDoc, collection, getDocs } from 'firebase/firestore'; 
import YouTube from 'react-youtube';
import styles from './PlayerPage.module.css'; 

// --- (Функція getYouTubeVideoId - без змін) ---
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

// --- (Компонент RecommendationCard - без змін) ---
function RecommendationCard({ video }) {
  const videoId = getYouTubeVideoId(video.youtubeUrl);
  if (!videoId) return null;
  return (
    <Link to={`/video/${video.id}`} className={styles.recCard}>
      <img src={`https://img.youtube.com/vi/${videoId}/mqdefault.jpg`} alt={video.title} />
      <div className={styles.recCardInfo}><h4>{video.title}</h4></div>
    </Link>
  );
}


function PlayerPage() {
  const { videoId } = useParams();
  const [video, setVideo] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const [recommendedVideos, setRecommendedVideos] = useState([]);
  const [frequentVideos, setFrequentVideos] = useState([]);
  const [popularVideos, setPopularVideos] = useState([]);
  
  const navigate = useNavigate();

  // --- (Всі useEffect - без змін) ---
  useEffect(() => {
    const fetchVideo = async () => {
      setLoading(true);
      setRecommendedVideos([]);
      setFrequentVideos([]);
      setPopularVideos([]);
      try {
        const docRef = doc(db, 'videos', videoId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setVideo({ id: docSnap.id, ...docSnap.data() });  
        } else {
          setVideo(null);
        }
      } catch (error) {
        console.error("Помилка завантаження відео:", error);
      }
      setLoading(false);
    };
    if (videoId) fetchVideo();
  }, [videoId]);

  useEffect(() => {
    if (videoId) {
      const rawHistory = localStorage.getItem('mySvitHistory');
      const history = rawHistory ? JSON.parse(rawHistory) : {};
      const currentViews = history[videoId] || 0;
      history[videoId] = currentViews + 1;
      localStorage.setItem('mySvitHistory', JSON.stringify(history));
    }
  }, [videoId]);
  
  useEffect(() => {
    const fetchAllRecommendations = async () => {
      try {
        const videosSnapshot = await getDocs(collection(db, "videos"));
        const allVideos = videosSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        const rawHistory = localStorage.getItem('mySvitHistory');
        const history = rawHistory ? JSON.parse(rawHistory) : {};
        const sortedVideoIds = Object.keys(history).sort((a, b) => history[b] - history[a]);
        const frequentList = sortedVideoIds.map(id => allVideos.find(v => v.id === id)).filter(v => v && v.id !== videoId);  
        setFrequentVideos(frequentList.slice(0, 5));

        let shuffledVideos = [...allVideos];
        for (let i = shuffledVideos.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [shuffledVideos[i], shuffledVideos[j]] = [shuffledVideos[j], shuffledVideos[i]];
        }
        setPopularVideos(shuffledVideos.filter(v => v.id !== videoId).slice(0, 5));

        if (video && video.categories && video.categories.length > 0) {
          const firstCategoryId = video.categories[0];
          const similarList = allVideos.filter(v => v.id !== videoId && v.categories.includes(firstCategoryId));
          setRecommendedVideos(similarList.slice(0, 10));
        }
      } catch (error) {
        console.error("Помилка завантаження рекомендацій:", error);
      }
    };
    if (video) {
      fetchAllRecommendations();
    }
  }, [video, videoId]);
  
  
  // --- (handleNextVideo - без змін) ---
  const handleNextVideo = () => {
    let nextVideo = null;
    if (recommendedVideos.length > 0) {
      nextVideo = recommendedVideos[0];
    } else if (frequentVideos.length > 0) {
      nextVideo = frequentVideos[0];
    } else if (popularVideos.length > 0) {
      nextVideo = popularVideos[0];
    }
    if (nextVideo) {
      navigate(`/video/${nextVideo.id}`);
    } else {
      navigate('/');
    }
  };

  if (loading) { return <div>Завантаження...</div>; }
  
  if (!video) {
    return (
      <div className={styles.pageLayout}>
        <div className={styles.mainContent}>
          <h2 className={styles.title}>Ой, відео не знайдено!</h2>
          <Link to="/" className={styles.backButton}>
            <span style={{ marginRight: '8px' }}>←</span> Назад до мультиків
          </Link>
        </div>
      </div>
    );
  }

  const videoPlayerId = getYouTubeVideoId(video.youtubeUrl);
  
  const playerOptions = {
    playerVars: {
      autoplay: 1,
      controls: 1,
      rel: 0,
      modestbranding: 1,
    },
  };

  // --- HTML (JSX) ---
  return (
    <div className={styles.pageLayout}>
      
      <div className={styles.mainContent}>
        
        <Link to="/" className={styles.backButton}>
          <span style={{ marginRight: '8px' }}>←</span> Назад до мультиків
        </Link>
        
        <div className="youtube-player-wrapper">  
          {videoPlayerId ? (
            <YouTube  
              videoId={videoPlayerId}  
              opts={playerOptions}  
              
              /* === ОСЬ ВИПРАВЛЕННЯ === */
              iframeClassName="youtube-player-frame" /* БУЛО: className */
              /* === КІНЕЦЬ ВИПРАВЛЕННЯ === */

              onEnd={handleNextVideo}  
            />
          ) : (
            <p>Неправильне посилання на YouTube.</p>
          )}
        </div>

        <h2 className={styles.title}>{video.title}</h2>

        {video.description && (
          <p className={styles.description}>{video.description}</p>
        )}
        
        <button className={styles.nextButton} onClick={handleNextVideo}>
          Наступний ролик ❯
        </button>

      </div>

      <div className={styles.sidebar}>
        
        {recommendedVideos.length > 0 && (
          <>
            <h3>Схожі мультики</h3>
            <div>{recommendedVideos.map(recVideo => (<RecommendationCard key={recVideo.id} video={recVideo} />))}</div>
          </>
        )}

        {frequentVideos.length > 0 && (
          <>
            <h3>Ви дивились раніше</h3>
            <div>{frequentVideos.map(recVideo => (<RecommendationCard key={recVideo.id} video={recVideo} />))}</div>
          </>
        )}

        {popularVideos.length > 0 && (
          <>
            <h3>Популярні</h3>
            <div>{popularVideos.map(recVideo => (<RecommendationCard key={recVideo.id} video={recVideo} />))}</div>
          </>
        )}
      </div>
    </div>
  );
}

export default PlayerPage;