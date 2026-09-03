import {
  deleteObject,
  getDownloadURL,
  ref,
  uploadBytes,
} from "firebase/storage";

import { storage } from "../../lib/firebase/firebaseClient";

function requireStorage() {
  if (!storage) {
    throw new Error(
      "Firebase Storage is not configured."
    );
  }
}

function cleanFileName(name) {
  return String(name || "file")
    .replace(
      /[^a-zA-Z0-9._-]/g,
      "_"
    );
}

const IMAGE_MAX_SIZE =
  10 * 1024 * 1024; // 10 MB

const VIDEO_MAX_SIZE =
  100 * 1024 * 1024; // 100 MB


export async function uploadNewsMedia(
  file,
  userId,
  newsId,
  mediaType
) {
  requireStorage();

  if (!file) {
    throw new Error(
      "No file selected."
    );
  }

  if (!userId) {
    throw new Error(
      "User ID is required."
    );
  }


  // ---------------------------------------------------------
  // IMAGE VALIDATION
  // ---------------------------------------------------------

  if (
    mediaType === "image" &&
    !file.type.startsWith("image/")
  ) {
    throw new Error(
      "Please select a valid image file."
    );
  }


  // ---------------------------------------------------------
  // VIDEO VALIDATION
  // ---------------------------------------------------------

  if (
    mediaType === "video" &&
    !file.type.startsWith("video/")
  ) {
    throw new Error(
      "Please select a valid video file."
    );
  }


  // ---------------------------------------------------------
  // SIZE VALIDATION
  // ---------------------------------------------------------

  if (
    mediaType === "image" &&
    file.size > IMAGE_MAX_SIZE
  ) {
    throw new Error(
      "Image must be 10 MB or smaller."
    );
  }

  if (
    mediaType === "video" &&
    file.size > VIDEO_MAX_SIZE
  ) {
    throw new Error(
      "Video must be 100 MB or smaller."
    );
  }


  // ---------------------------------------------------------
  // STORAGE PATH
  // ---------------------------------------------------------

  const articleId =
    newsId || "draft";

  const path =
    `news/${userId}/${articleId}/` +
    `${Date.now()}-${cleanFileName(file.name)}`;


  const storageReference =
    ref(
      storage,
      path
    );


  // ---------------------------------------------------------
  // UPLOAD
  // ---------------------------------------------------------

  const snapshot =
    await uploadBytes(
      storageReference,
      file,
      {
        contentType:
          file.type,
      }
    );


  // ---------------------------------------------------------
  // DOWNLOAD URL
  // ---------------------------------------------------------

  const url =
    await getDownloadURL(
      snapshot.ref
    );


  return {
    url,
    path,
    name: file.name,
    size: file.size,
    type: file.type,
    uploadedBy: userId,
    mediaType,
  };
}


export async function deleteNewsMedia(
  path
) {
  requireStorage();

  if (!path) {
    return;
  }

  await deleteObject(
    ref(storage, path)
  );
}


export function getYoutubeEmbedUrl(
  url
) {
  if (!url) {
    return "";
  }

  try {
    const parsed =
      new URL(url);

    if (
      parsed.hostname.includes(
        "youtube.com"
      )
    ) {
      const videoId =
        parsed.searchParams.get(
          "v"
        );

      return videoId
        ? `https://www.youtube.com/embed/${videoId}`
        : "";
    }

    if (
      parsed.hostname.includes(
        "youtu.be"
      )
    ) {
      return `https://www.youtube.com/embed/${parsed.pathname.slice(
        1
      )}`;
    }

    return "";
  } catch {
    return "";
  }
}