import { openDB } from "idb";

export const dbPromise = openDB("news-pwa-db", 1, {
  upgrade(db) {
    if (!db.objectStoreNames.contains("news")) {
      db.createObjectStore("news", { keyPath: "id" });
    }

    if (!db.objectStoreNames.contains("bookmarks")) {
      db.createObjectStore("bookmarks", { keyPath: "id" });
    }
  },
});

/* ---------- NEWS ---------- */
export const saveNewsToDB = async (articles) => {
  const db = await dbPromise;
  const tx = db.transaction("news", "readwrite");
  const store = tx.objectStore("news");

  await store.clear(); // prevent duplicates
  for (const article of articles) {
    await store.put(article);
  }
  await tx.done;
};

export const getNewsFromDB = async () => {
  const db = await dbPromise;
  return db.getAll("news");
};

/* ---------- BOOKMARKS ---------- */
export const saveBookmarkToDB = async (article) => {
  const db = await dbPromise;
  await db.put("bookmarks", article); // put = overwrite if exists
};

export const getBookmarksFromDB = async () => {
  const db = await dbPromise;
  return db.getAll("bookmarks");
};

export const removeBookmarkFromDB = async (id) => {
  const db = await dbPromise;
  await db.delete("bookmarks", id);
};
