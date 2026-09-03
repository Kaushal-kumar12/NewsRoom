import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from "firebase/firestore";

import { db } from "../../lib/firebase/firebaseClient";

const NEWS_COLLECTION = "news";

const newsCollection = collection(
  db,
  NEWS_COLLECTION
);

function mapDoc(snapshot) {
  return {
    id: snapshot.id,
    ...snapshot.data(),
  };
}

/* ============================================================
   NEWS
============================================================ */

export async function listStaffNews({
  status,
  max = 200,
} = {}) {

  let newsQuery = query(
    newsCollection,
    orderBy(
      "updatedAt",
      "desc"
    ),
    limit(max)
  );

  if (status) {
    newsQuery = query(
      newsCollection,

      where(
        "status",
        "==",
        status
      ),

      orderBy(
        "updatedAt",
        "desc"
      ),

      limit(max)
    );
  }

  const snapshot =
    await getDocs(newsQuery);

  return snapshot.docs.map(
    mapDoc
  );
}

export async function getStaffNews(
  newsId
) {
  const snapshot =
    await getDoc(
      doc(
        db,
        NEWS_COLLECTION,
        newsId
      )
    );

  if (!snapshot.exists()) {
    return null;
  }

  return mapDoc(snapshot);
}

export async function createStaffNews(
  data,
  actor
) {
  const ref = await addDoc(
    newsCollection,
    {
      title:
        data.title || "",

      subtitle:
        data.subtitle || "",

      summary:
        data.summary || "",

      content:
        data.content || "",

      category:
        data.category ||
        "General",

      subcategory:
        data.subcategory ||
        "",

      blocks:
        Array.isArray(
          data.blocks
        )
          ? data.blocks
          : [],

      featuredImage:
        data.featuredImage ||
        "",

      featuredImageUrl:
        data.featuredImageUrl ||
        "",

      breaking:
        Boolean(
          data.breaking
        ),

      trending:
        Boolean(
          data.trending
        ),

      status: "DRAFT",

      authorId:
        actor.uid,

      authorName:
        actor.displayName ||
        actor.email ||
        "NewsRoom",

      authorRole:
        actor.role || "",

      views: 0,

      createdAt:
        serverTimestamp(),

      updatedAt:
        serverTimestamp(),
    }
  );

  return ref.id;
}

export async function updateStaffNews(
  newsId,
  data
) {
  await updateDoc(
    doc(
      db,
      NEWS_COLLECTION,
      newsId
    ),
    {
      ...data,

      updatedAt:
        serverTimestamp(),
    }
  );
}

export async function changeNewsStatus(
  newsId,
  status,
  actor,
  extra = {}
) {
  await updateDoc(
    doc(
      db,
      NEWS_COLLECTION,
      newsId
    ),
    {
      status,

      statusChangedBy:
        actor.uid,

      statusChangedAt:
        serverTimestamp(),

      updatedAt:
        serverTimestamp(),

      ...extra,
    }
  );
}

export async function removeDraft(
  newsId
) {
  await deleteDoc(
    doc(
      db,
      NEWS_COLLECTION,
      newsId
    )
  );
}

/* ============================================================
   USERS
============================================================ */

export async function listUsers(
  max = 500
) {
  const snapshot =
    await getDocs(
      query(
        collection(
          db,
          "users"
        ),
        limit(max)
      )
    );

  return snapshot.docs.map(
    mapDoc
  );
}

export async function updateUserRole(
  userId,
  role
) {
  await updateDoc(
    doc(
      db,
      "users",
      userId
    ),
    {
      role,

      updatedAt:
        serverTimestamp(),
    }
  );
}

/* ============================================================
   GENERIC COLLECTION
============================================================ */

export async function listCollection(
  name,
  max = 300
) {
  const snapshot =
    await getDocs(
      query(
        collection(
          db,
          name
        ),
        limit(max)
      )
    );

  return snapshot.docs.map(
    mapDoc
  );
}

export async function createCollectionItem(
  name,
  data
) {
  const ref =
    await addDoc(
      collection(
        db,
        name
      ),
      {
        ...data,

        createdAt:
          serverTimestamp(),

        updatedAt:
          serverTimestamp(),
      }
    );

  return ref.id;
}

export async function updateCollectionItem(
  name,
  id,
  data
) {
  await updateDoc(
    doc(
      db,
      name,
      id
    ),
    {
      ...data,

      updatedAt:
        serverTimestamp(),
    }
  );
}

export async function deleteCollectionItem(
  name,
  id
) {
  await deleteDoc(
    doc(
      db,
      name,
      id
    )
  );
}