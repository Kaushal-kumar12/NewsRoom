// src/pages/admin/AdminAdvertisementsPage.jsx

import React, {
  useEffect,
  useState,
} from "react";

import {
  collection,
  addDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
} from "firebase/firestore";

import { db } from "../../services/firebase";

export default function AdminAdvertisementsPage() {
  const [ads, setAds] =
    useState([]);

  const [title, setTitle] =
    useState("");

  const [url, setUrl] =
    useState("");

  useEffect(() => {
    load();
  }, []);

  async function load() {
    const snapshot =
      await getDocs(
        collection(
          db,
          "advertisements"
        )
      );

    setAds(
      snapshot.docs.map((item) => ({
        id: item.id,
        ...item.data(),
      }))
    );
  }

  async function createAd(e) {
    e.preventDefault();

    if (!title.trim()) return;

    await addDoc(
      collection(
        db,
        "advertisements"
      ),
      {
        title,
        url,
        active: true,
        createdAt:
          serverTimestamp(),
        updatedAt:
          serverTimestamp(),
      }
    );

    setTitle("");
    setUrl("");

    load();
  }

  async function toggleAd(ad) {
    await updateDoc(
      doc(
        db,
        "advertisements",
        ad.id
      ),
      {
        active: !ad.active,
        updatedAt:
          serverTimestamp(),
      }
    );

    load();
  }

  async function removeAd(id) {
    await deleteDoc(
      doc(
        db,
        "advertisements",
        id
      )
    );

    load();
  }

  return (
    <div className="staff-page">
      <div className="staff-page-header">
        <div>
          <span className="staff-eyebrow">
            MONETIZATION
          </span>

          <h1>
            Advertisements
          </h1>

          <p>
            Manage advertisement
            placements.
          </p>
        </div>
      </div>

      <div className="staff-two-column">
        <div className="staff-panel">
          <h2>Create Advertisement</h2>

          <form
            className="staff-form"
            onSubmit={createAd}
          >
            <input
              value={title}
              onChange={(e) =>
                setTitle(
                  e.target.value
                )
              }
              placeholder="Advertisement title"
            />

            <input
              value={url}
              onChange={(e) =>
                setUrl(
                  e.target.value
                )
              }
              placeholder="Target URL"
            />

            <button className="staff-primary-button">
              Create Advertisement
            </button>
          </form>
        </div>

        <div className="staff-panel">
          <h2>Advertisements</h2>

          {ads.map((ad) => (
            <div
              className="staff-list-item"
              key={ad.id}
            >
              <div>
                <strong>
                  {ad.title}
                </strong>

                <small>
                  {ad.url}
                </small>
              </div>

              <div className="staff-row-actions">
                <button
                  onClick={() =>
                    toggleAd(ad)
                  }
                >
                  {ad.active
                    ? "Disable"
                    : "Enable"}
                </button>

                <button
                  onClick={() =>
                    removeAd(ad.id)
                  }
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}