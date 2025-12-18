import React, { useEffect, useState } from "react";
import "./App.css";

const API_URL =
  "https://gnews.io/api/v4/top-headlines?lang=en&country=in&max=10&apikey=4a9c7db621d64b1b2b484eb909a01de0";

/* Helper to uniquely identify articles */
const getArticleId = (article) => {
  return article.url || article.title?.trim().toLowerCase();
};

function App() {
  const [news, setNews] = useState([]);
  const [bookmarks, setBookmarks] = useState([]);
  const [online, setOnline] = useState(navigator.onLine);

  /* =========================
     Load cached data
  ========================= */
  useEffect(() => {
    const cachedNews = localStorage.getItem("cachedNews");
    const savedBookmarks = localStorage.getItem("bookmarks");

    if (cachedNews) setNews(JSON.parse(cachedNews));
    if (savedBookmarks) setBookmarks(JSON.parse(savedBookmarks));
  }, []);

  /* =========================
     Fetch news (ONLINE ONLY)
  ========================= */
  const fetchLatestNews = async () => {
    if (!navigator.onLine) return;

    try {
      const res = await fetch(API_URL);
      const data = await res.json();

      if (data.articles && data.articles.length > 0) {
        setNews(data.articles);
        localStorage.setItem(
          "cachedNews",
          JSON.stringify(data.articles)
        );
      }
    } catch (err) {
      console.error("Fetch failed:", err);
    }
  };

  /* Initial fetch */
  useEffect(() => {
    fetchLatestNews();
  }, []);

  /* =========================
     ONLINE / OFFLINE STATUS
     (NO background checks)
  ========================= */
  useEffect(() => {
    const handleOnline = () => {
      setOnline(true);
      fetchLatestNews(); // refresh when internet returns
    };

    const handleOffline = () => {
      setOnline(false);
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  /* =========================
     Bookmark logic
  ========================= */
  const toggleBookmark = (article) => {
    const id = getArticleId(article);

    const exists = bookmarks.find(
      (b) => getArticleId(b) === id
    );

    let updated;
    if (exists) {
      updated = bookmarks.filter(
        (b) => getArticleId(b) !== id
      );
    } else {
      updated = [...bookmarks, article];
    }

    setBookmarks(updated);
    localStorage.setItem("bookmarks", JSON.stringify(updated));
  };

  /* =========================
     UI
  ========================= */
  return (
    <div className="app-container">
      <h1 className="app-title"> Offline News Reader PWA</h1>
      <p className="subtitle">
  Read latest news online and access saved articles offline
</p>
      <div
  className={`status ${online ? "online" : "offline"}`}
>
  {online ? "🟢 Online" : "🔴 Offline"}
</div>


      {!online && (
        <p style={{ color: "#666", fontStyle: "italic" }}>
          You are offline. Showing cached content.
        </p>
      )}

  <h2>⭐ Saved Articles</h2>

<p className="hint">Available even when you are offline</p>


{bookmarks.length === 0 ? (
  <p style={{ color: "#666", fontStyle: "italic" }}>
    No bookmarks yet. Save articles to read offline.
  </p>
) : (
  bookmarks.map((item, index) => (
    <div key={index} className="card">
      <h3>{item.title}</h3>
      <p>{item.description}</p>
    </div>
  ))
      )}
      <hr className="divider" />

      {/* ========== NEWS ========== */}
      <h2>Latest News</h2>

      {news.length === 0 && (
        <p>No news available.</p>
      )}

      {news.map((item, index) => (
        <div key={index} className="card">
          <h3>{item.title}</h3>
          <p>{item.description}</p>
          <button
  className={
    bookmarks.find(
      (b) => getArticleId(b) === getArticleId(item)
    )
      ? "btn remove"
      : "btn add"
  }
  onClick={() => toggleBookmark(item)}
>
  {bookmarks.find(
    (b) => getArticleId(b) === getArticleId(item)
  )
    ? "Remove Bookmark"
    : "Bookmark"}
</button>

        </div>
      ))}
    </div>
  );
}

export default App;
