import React, {
  useEffect,
  useState,
} from "react";

import {
  listCollection,
  createCollectionItem,
  deleteCollectionItem,
} from "../../services/editorial/staffAdminService";

export default function AdminTagsPage() {

  const [
    rows,
    setRows,
  ] = useState([]);

  const [
    value,
    setValue,
  ] = useState("");

  const [
    loading,
    setLoading,
  ] = useState(true);

  const load =
    async () => {

      setLoading(true);

      try {

        setRows(
          await listCollection(
            "tags"
          )
        );

      } finally {

        setLoading(false);

      }
    };

  useEffect(() => {

    load();

  }, []);

  const add =
    async () => {

      if (!value.trim()) {
        return;
      }

      await createCollectionItem(
        "tags",
        {
          name:
            value.trim(),

          status:
            "ACTIVE",
        }
      );

      setValue("");

      await load();
    };

  const remove =
    async (id) => {

      if (
        !window.confirm(
          "Delete this tag?"
        )
      ) {
        return;
      }

      await deleteCollectionItem(
        "tags",
        id
      );

      await load();
    };

  return (
    <section className="staff-page">

      <div className="staff-page-head">

        <div>

          <small>
            ADMINISTRATION
          </small>

          <h1>
            Tag Management
          </h1>

          <p>
            Manage tags from the
            staff console.
          </p>

        </div>

      </div>

      <div className="staff-card">

        <div className="staff-inline">

          <input
            value={value}
            onChange={(event) =>
              setValue(
                event.target.value
              )
            }
            placeholder="New tag"
          />

          <button
            className="staff-btn primary"
            onClick={add}
          >
            Add
          </button>

        </div>

        {loading ? (

          <p>
            Loading…
          </p>

        ) : (

          <div className="staff-list">

            {rows.map(
              (row) => (

                <div
                  className="staff-list-row"
                  key={row.id}
                >

                  <div>

                    <strong>
                      {row.name ||
                        row.title ||
                        row.id}
                    </strong>

                    <small>
                      {row.status ||
                        ""}
                    </small>

                  </div>

                  <button
                    className="staff-btn danger"
                    onClick={() =>
                      remove(
                        row.id
                      )
                    }
                  >
                    Delete
                  </button>

                </div>

              )
            )}

          </div>

        )}

      </div>

    </section>
  );
}