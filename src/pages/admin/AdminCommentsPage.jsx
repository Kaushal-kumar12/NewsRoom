// src/pages/admin/AdminCommentsPage.jsx

import React, {
  useEffect,
  useState,
} from "react";

import {
  Trash2,
  CheckCircle,
} from "lucide-react";

import {
  collection,
  getDocs,
  deleteDoc,
  doc,
  updateDoc,
} from "firebase/firestore";

import { db } from "../../services/firebase";

import {
  PERMISSIONS,
  hasPermission,
} from "../../config/rolePermissions";

import { useStaffAuth } from "../../components/auth/StaffRoute";

export default function AdminCommentsPage() {
  const { role } = useStaffAuth();

  const [comments, setComments] =
    useState([]);

  useEffect(() => {
    loadComments();
  }, []);

  async function loadComments() {
    try {
      const snapshot =
        await getDocs(
          collection(db, "comments")
        );

      setComments(
        snapshot.docs.map((item) => ({
          id: item.id,
          ...item.data(),
        }))
      );
    } catch (error) {
      console.error(error);
    }
  }

  async function approve(id) {
    await updateDoc(
      doc(db, "comments", id),
      {
        status: "APPROVED",
      }
    );

    loadComments();
  }

  async function remove(id) {
    if (
      !window.confirm(
        "Delete this comment?"
      )
    ) {
      return;
    }

    await deleteDoc(
      doc(db, "comments", id)
    );

    loadComments();
  }

  return (
    <div className="staff-page">
      <div className="staff-page-header">
        <div>
          <span className="staff-eyebrow">
            COMMUNITY
          </span>

          <h1>Comments</h1>

          <p>
            Moderate comments submitted
            by readers.
          </p>
        </div>
      </div>

      <div className="staff-panel">
        {comments.length === 0 ? (
          <div className="staff-empty">
            No comments found.
          </div>
        ) : (
          <div className="comment-list">
            {comments.map(
              (comment) => (
                <article
                  className="comment-card"
                  key={comment.id}
                >
                  <div>
                    <strong>
                      {comment.userName ||
                        "User"}
                    </strong>

                    <p>
                      {comment.text ||
                        comment.content ||
                        ""}
                    </p>
                  </div>

                  {hasPermission(
                    role,
                    PERMISSIONS.COMMENTS_MANAGE
                  ) && (
                    <div className="staff-row-actions">
                      <button
                        onClick={() =>
                          approve(
                            comment.id
                          )
                        }
                      >
                        <CheckCircle
                          size={17}
                        />
                      </button>

                      <button
                        onClick={() =>
                          remove(
                            comment.id
                          )
                        }
                      >
                        <Trash2
                          size={17}
                        />
                      </button>
                    </div>
                  )}
                </article>
              )
            )}
          </div>
        )}
      </div>
    </div>
  );
}