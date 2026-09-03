// src/pages/admin/AdminAnalyticsPage.jsx

import React, {
  useEffect,
  useState,
} from "react";

import {
  collection,
  getDocs,
} from "firebase/firestore";

import { db } from "../../services/firebase";

export default function AdminAnalyticsPage() {
  const [stats, setStats] =
    useState({
      news: 0,
      published: 0,
      views: 0,
      users: 0,
    });

  useEffect(() => {
    load();
  }, []);

  async function load() {
    const [
      newsSnapshot,
      usersSnapshot,
    ] = await Promise.all([
      getDocs(
        collection(db, "news")
      ),
      getDocs(
        collection(db, "users")
      ),
    ]);

    const news =
      newsSnapshot.docs.map(
        (item) => item.data()
      );

    setStats({
      news: news.length,

      published: news.filter(
        (item) =>
          item.status ===
          "PUBLISHED"
      ).length,

      views: news.reduce(
        (total, item) =>
          total +
          Number(item.views || 0),
        0
      ),

      users: usersSnapshot.size,
    });
  }

  return (
    <div className="staff-page">
      <div className="staff-page-header">
        <div>
          <span className="staff-eyebrow">
            INSIGHTS
          </span>

          <h1>Analytics</h1>

          <p>
            NewsRoom performance
            overview.
          </p>
        </div>
      </div>

      <div className="staff-stat-grid">
        <div className="staff-stat-card">
          <span>Total Stories</span>
          <strong>{stats.news}</strong>
        </div>

        <div className="staff-stat-card">
          <span>Published</span>
          <strong>
            {stats.published}
          </strong>
        </div>

        <div className="staff-stat-card">
          <span>Total Views</span>
          <strong>
            {stats.views}
          </strong>
        </div>

        <div className="staff-stat-card">
          <span>Users</span>
          <strong>
            {stats.users}
          </strong>
        </div>
      </div>

      <div className="staff-panel">
        <h2>
          Content Performance
        </h2>

        <p>
          Detailed analytics can be
          connected to Firebase
          Analytics later.
        </p>
      </div>
    </div>
  );
}