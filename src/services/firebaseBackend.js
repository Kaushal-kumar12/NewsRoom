import {
  collection,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDoc,
  serverTimestamp
} from "firebase/firestore";

import { db } from "./firebase";

/*
|--------------------------------------------------------------------------
| News Collection
|--------------------------------------------------------------------------
*/

const NEWS_COLLECTION = "news";


/*
|--------------------------------------------------------------------------
| Convert Firebase document into frontend news object
|--------------------------------------------------------------------------
*/

function mapNewsDocument(snapshot) {
  const data = snapshot.data();

  return {
    id: snapshot.id,

    title: data.title || "",
    summary: data.summary || "",
    content: data.content || "",

    category: data.category || "General",
    subcategory: data.subcategory || "",

    author: data.author || "NewsRoom",
    authorId: data.authorId || "",

    status: data.status || "PUBLISHED",

    breaking: Boolean(data.breaking),
    trending: Boolean(data.trending),

    views: Number(data.views || 0),

    featuredImage: data.featuredImage || "",

    publishedAt:
      data.publishedAt?.toDate?.()?.toISOString() ||
      data.createdAt?.toDate?.()?.toISOString() ||
      data.publishedAt ||
      new Date().toISOString(),

    createdAt:
      data.createdAt?.toDate?.()?.toISOString() ||
      null,

    updatedAt:
      data.updatedAt?.toDate?.()?.toISOString() ||
      null,

    blocks: Array.isArray(data.blocks) ? data.blocks : []
  };
}


/*
|--------------------------------------------------------------------------
| Get all published news
|--------------------------------------------------------------------------
*/

export async function loadFirebaseNews() {
  try {
    const newsRef = collection(db, NEWS_COLLECTION);

    const newsQuery = query(
      newsRef,
      where("status", "==", "PUBLISHED"),
      orderBy("publishedAt", "desc")
    );

    const snapshot = await getDocs(newsQuery);

    return snapshot.docs.map(mapNewsDocument);
  } catch (error) {
    console.error("Failed to load news from Firebase:", error);

    throw error;
  }
}


/*
|--------------------------------------------------------------------------
| Get latest news
|--------------------------------------------------------------------------
*/

export async function loadLatestNews(maxItems = 20) {
  try {
    const newsRef = collection(db, NEWS_COLLECTION);

    const newsQuery = query(
      newsRef,
      where("status", "==", "PUBLISHED"),
      orderBy("publishedAt", "desc"),
      limit(maxItems)
    );

    const snapshot = await getDocs(newsQuery);

    return snapshot.docs.map(mapNewsDocument);
  } catch (error) {
    console.error("Failed to load latest news:", error);

    throw error;
  }
}


/*
|--------------------------------------------------------------------------
| Get breaking news
|--------------------------------------------------------------------------
*/

export async function loadBreakingNews() {
  try {
    const newsRef = collection(db, NEWS_COLLECTION);

    const newsQuery = query(
      newsRef,
      where("status", "==", "PUBLISHED"),
      where("breaking", "==", true),
      orderBy("publishedAt", "desc")
    );

    const snapshot = await getDocs(newsQuery);

    return snapshot.docs.map(mapNewsDocument);
  } catch (error) {
    console.error("Failed to load breaking news:", error);

    throw error;
  }
}


/*
|--------------------------------------------------------------------------
| Get trending news
|--------------------------------------------------------------------------
*/

export async function loadTrendingNews() {
  try {
    const newsRef = collection(db, NEWS_COLLECTION);

    const newsQuery = query(
      newsRef,
      where("status", "==", "PUBLISHED"),
      where("trending", "==", true),
      orderBy("views", "desc"),
      limit(10)
    );

    const snapshot = await getDocs(newsQuery);

    return snapshot.docs.map(mapNewsDocument);
  } catch (error) {
    console.error("Failed to load trending news:", error);

    throw error;
  }
}


/*
|--------------------------------------------------------------------------
| Get news by ID
|--------------------------------------------------------------------------
*/

export async function getNewsById(newsId) {
  try {
    const newsRef = doc(db, NEWS_COLLECTION, newsId);

    const snapshot = await getDoc(newsRef);

    if (!snapshot.exists()) {
      return null;
    }

    return mapNewsDocument(snapshot);
  } catch (error) {
    console.error("Failed to load news article:", error);

    throw error;
  }
}


/*
|--------------------------------------------------------------------------
| Get news by category
|--------------------------------------------------------------------------
*/

export async function loadNewsByCategory(category) {
  try {
    const newsRef = collection(db, NEWS_COLLECTION);

    const newsQuery = query(
      newsRef,
      where("status", "==", "PUBLISHED"),
      where("category", "==", category),
      orderBy("publishedAt", "desc")
    );

    const snapshot = await getDocs(newsQuery);

    return snapshot.docs.map(mapNewsDocument);
  } catch (error) {
    console.error("Failed to load category news:", error);

    throw error;
  }
}


/*
|--------------------------------------------------------------------------
| Search news
|--------------------------------------------------------------------------
|
| Firestore does not provide full-text search.
| This function loads published news and performs
| basic client-side searching.
|
*/

export async function searchFirebaseNews(searchText) {
  try {
    const allNews = await loadFirebaseNews();

    const keyword = searchText.trim().toLowerCase();

    if (!keyword) {
      return allNews;
    }

    return allNews.filter((news) => {
      return (
        news.title.toLowerCase().includes(keyword) ||
        news.summary.toLowerCase().includes(keyword) ||
        news.category.toLowerCase().includes(keyword) ||
        news.author.toLowerCase().includes(keyword)
      );
    });
  } catch (error) {
    console.error("Failed to search news:", error);

    throw error;
  }
}


/*
|--------------------------------------------------------------------------
| Create news
|--------------------------------------------------------------------------
|
| Used later by Author/Admin/Editor dashboard.
|
*/

export async function createNews(newsData) {
  try {
    const newsRef = collection(db, NEWS_COLLECTION);

    const documentData = {
      ...newsData,

      status: newsData.status || "DRAFT",

      views: Number(newsData.views || 0),

      breaking: Boolean(newsData.breaking),
      trending: Boolean(newsData.trending),

      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };

    const document = await addDoc(newsRef, documentData);

    return {
      id: document.id,
      ...newsData
    };
  } catch (error) {
    console.error("Failed to create news:", error);

    throw error;
  }
}


/*
|--------------------------------------------------------------------------
| Update news
|--------------------------------------------------------------------------
*/

export async function updateNews(newsId, newsData) {
  try {
    const newsRef = doc(db, NEWS_COLLECTION, newsId);

    await updateDoc(newsRef, {
      ...newsData,
      updatedAt: serverTimestamp()
    });

    return true;
  } catch (error) {
    console.error("Failed to update news:", error);

    throw error;
  }
}


/*
|--------------------------------------------------------------------------
| Delete news
|--------------------------------------------------------------------------
*/

export async function deleteNews(newsId) {
  try {
    const newsRef = doc(db, NEWS_COLLECTION, newsId);

    await deleteDoc(newsRef);

    return true;
  } catch (error) {
    console.error("Failed to delete news:", error);

    throw error;
  }
}