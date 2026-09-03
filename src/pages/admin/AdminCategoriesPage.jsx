// src/pages/admin/AdminCategoriesPage.jsx

import React, {
  useEffect,
  useState,
} from "react";

import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  serverTimestamp,
} from "firebase/firestore";

import {
  Plus,
  Trash2,
} from "lucide-react";

import { db } from "../../services/firebase";

export default function AdminCategoriesPage() {
  const [categories, setCategories] =
    useState([]);

  const [name, setName] =
    useState("");

  useEffect(() => {
    load();
  }, []);

  async function load() {
    const snapshot =
      await getDocs(
        collection(db, "categories")
      );

    setCategories(
      snapshot.docs.map((item) => ({
        id: item.id,
        ...item.data(),
      }))
    );
  }

  async function addCategory(e) {
    e.preventDefault();

    if (!name.trim()) return;

    await addDoc(
      collection(db, "categories"),
      {
        name: name.trim(),
        createdAt:
          serverTimestamp(),
      }
    );

    setName("");
    load();
  }

  async function removeCategory(id) {
    if (
      !window.confirm(
        "Delete category?"
      )
    )
      return;

    await deleteDoc(
      doc(db, "categories", id)
    );

    load();
  }

  return (
    <div className="staff-page">
      <div className="staff-page-header">
        <div>
          <span className="staff-eyebrow">
            CONTENT
          </span>
          <h1>Categories</h1>
        </div>
      </div>

      <div className="staff-two-column">
        <div className="staff-panel">
          <h2>Add Category</h2>

          <form
            onSubmit={addCategory}
            className="staff-form"
          >
            <input
              value={name}
              onChange={(e) =>
                setName(
                  e.target.value
                )
              }
              placeholder="Category name"
            />

            <button className="staff-primary-button">
              <Plus size={17} />
              Add Category
            </button>
          </form>
        </div>

        <div className="staff-panel">
          <h2>Categories</h2>

          <div className="staff-list">
            {categories.map(
              (category) => (
                <div
                  className="staff-list-item"
                  key={category.id}
                >
                  <span>
                    {category.name}
                  </span>

                  <button
                    onClick={() =>
                      removeCategory(
                        category.id
                      )
                    }
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
}