// src/pages/editorial/EditorialQueuePage.jsx

import React, {
  useEffect,
  useState,
} from "react";

import {
  Link,
} from "react-router-dom";

import {
  collection,
  getDocs,
  doc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";

import {
  CheckCircle,
  XCircle,
  Eye,
} from "lucide-react";

import { db } from "../../services/firebase";

import {
  PERMISSIONS,
  hasPermission,
} from "../../config/rolePermissions";

import { useStaffAuth } from "../../components/auth/StaffRoute";

export default function EditorialQueuePage() {
  const { role } = useStaffAuth();

  const [items, setItems] =
    useState([]);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    const snapshot =
      await getDocs(
        collection(db, "news")
      );

    setItems(
      snapshot.docs
        .map((item) => ({
          id: item.id,
          ...item.data(),
        }))
        .filter(
          (item) =>
            item.status ===
              "PENDING_ADMIN_REVIEW" ||
            item.status ===
              "PENDING_SUPERADMIN_REVIEW"
        )
    );
  }

  async function approve(item) {
    if (
      !hasPermission(
        role,
        PERMISSIONS.NEWS_APPROVE
      )
    )
      return;

    await updateDoc(
      doc(db, "news", item.id),
      {
        status:
          "PENDING_SUPERADMIN_REVIEW",
        reviewedAt:
          serverTimestamp(),
        updatedAt:
          serverTimestamp(),
      }
    );

    load();
  }

  async function reject(item) {
    await updateDoc(
      doc(db, "news", item.id),
      {
        status: "REJECTED",
        rejectionReason:
          "Returned by editorial review.",
        updatedAt:
          serverTimestamp(),
      }
    );

    load();
  }

  return (
    <div className="staff-page">
      <div className="staff-page-header">
        <div>
          <span className="staff-eyebrow">
            EDITORIAL
          </span>

          <h1>
            Editorial Queue
          </h1>

          <p>
            Review stories waiting
            for editorial action.
          </p>
        </div>
      </div>

      <div className="staff-panel">
        {items.length === 0 ? (
          <div className="staff-empty">
            No stories are waiting
            for review.
          </div>
        ) : (
          <div className="editorial-queue-list">
            {items.map((item) => (
              <article
                className="editorial-queue-item"
                key={item.id}
              >
                <div>
                  <span>
                    {item.category ||
                      "General"}
                  </span>

                  <h2>
                    {item.title ||
                      "Untitled"}
                  </h2>

                  <p>
                    {item.summary ||
                      ""}
                  </p>
                </div>

                <div className="staff-row-actions">
                  <Link
                    to={`/admin/news/${item.id}/preview`}
                  >
                    <Eye size={17} />
                  </Link>

                  {hasPermission(
                    role,
                    PERMISSIONS.NEWS_APPROVE
                  ) && (
                    <button
                      onClick={() =>
                        approve(item)
                      }
                    >
                      <CheckCircle
                        size={17}
                      />
                    </button>
                  )}

                  <button
                    onClick={() =>
                      reject(item)
                    }
                  >
                    <XCircle size={17} />
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}