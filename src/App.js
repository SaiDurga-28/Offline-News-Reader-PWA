import React, { useEffect, useState } from "react";
import "./App.css";
import {
  saveNewsToDB,
  getNewsFromDB,
  saveBookmarkToDB,
  getBookmarksFromDB,
  removeBookmarkFromDB,
} from "./services/db";

const API_URL = `https://gnews.io/api/v4/top-headlines?lang=en&country=in&max=10&apikey=${process.env.REACT_APP_NEWS_API_KEY}`;

const getArticleId = (article) =>
  article.url || article.title.trim().toLowerCase();

function App() {
  const [news, setNews] = useState([]);
  const [bookmarks, setBookmarks] = useState([]);
  const [online, setOnline] = useState(navigator.onLine);

  /* Load IndexedDB data */
  useEffect(() => {
    const loadDB = async () => {
      const cachedNews = await getNewsFromDB();
      const savedBookmarks = await getBookmarksFromDB();

      if (cachedNews.length) setNews(cachedNews);
      if (savedBookmarks.length) setBookmarks(savedBookmarks);
    };
    loadDB();
  }, []);

  /* Fetch news */
  const fetchLatestNews = async () => {
    if (!navigator.onLine) return;

    try {
      const res = await fetch(API_URL);
      const data = await res.json();

      if (data.articles) {
        const articlesWithId = data.articles.map((a) => ({
          ...a,
          id: getArticleId(a),
        }));

        setNews(articlesWithId);
        await saveNewsToDB(articlesWithId);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchLatestNews();
  }, []);

  /* Online / Offline */
  useEffect(() => {
    const on = () => {
      setOnline(true);
      fetchLatestNews();
    };
    const off = () => setOnline(false);

    window.addEventListener("online", on);
    window.addEventListener("offline", off);

    return () => {
      window.removeEventListener("online", on);
      window.removeEventListener("offline", off);
    };
  }, []);

  /* Bookmark toggle */
  const toggleBookmark = async (article) => {
    const exists = bookmarks.some((b) => b.id === article.id);

    if (exists) {
      await removeBookmarkFromDB(article.id);
      setBookmarks(bookmarks.filter((b) => b.id !== article.id));
    } else {
      await saveBookmarkToDB(article);
      setBookmarks([...bookmarks, article]);
    }
  };

  return (
    <div className="app-container">
      <h1 className="app-title">Offline News Reader PWA</h1>

      <p className="subtitle">
        Read latest news online and access saved articles offline
      </p>

      <div className={`status ${online ? "online" : "offline"}`}>
        {online ? "🟢 Online" : "🔴 Offline"}
      </div>

      <h2>⭐ Saved Articles</h2>
      {bookmarks.length === 0 ? (
        <p>No bookmarks yet.</p>
      ) : (
        bookmarks.map((b) => (
          <div key={b.id} className="card">
            <h3>{b.title}</h3>
            <p>{b.description}</p>
          </div>
        ))
      )}

      <hr />

      <h2>Latest News</h2>
      {news.map((item) => (
        <div key={item.id} className="card">
          <h3>{item.title}</h3>
          <p>{item.description}</p>

          <button
            className={
              bookmarks.some((b) => b.id === item.id)
                ? "btn remove"
                : "btn add"
            }
            onClick={() => toggleBookmark(item)}
          >
            {bookmarks.some((b) => b.id === item.id)
              ? "Remove Bookmark"
              : "Bookmark"}
          </button>
        </div>
      ))}
    </div>
  );
}

export default App;
