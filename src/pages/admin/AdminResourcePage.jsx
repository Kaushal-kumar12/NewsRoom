import { useEffect, useState } from "react";
import { Plus, Trash2, Save, Search } from "lucide-react";
import { createDocument, deleteDocument, getCollection, updateDocument } from "../../services/admin/adminService";

const config = {
  users: { title: "Users", fields: ["name", "email", "role"], placeholder: "Search users..." },
  categories: { title: "Categories", fields: ["name", "description"], placeholder: "Search categories..." },
  tags: { title: "Tags", fields: ["name", "slug"], placeholder: "Search tags..." },
  media: { title: "Media Library", fields: ["name", "url", "type"], placeholder: "Search media..." },
  advertisements: { title: "Advertisements", fields: ["title", "image", "targetUrl", "status"], placeholder: "Search advertisements..." },
  polls: { title: "Polls", fields: ["question", "status"], placeholder: "Search polls..." },
};

export default function AdminResourcePage({ resource }) {
  const meta = config[resource] || config.categories;
  const [items, setItems] = useState([]);
  const [queryText, setQueryText] = useState("");
  const [draft, setDraft] = useState({});
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState("");

  const load = () => getCollection(resource).then(setItems).catch((e) => setError(e?.message || "Unable to load data."));

  useEffect(() => { load(); }, [resource]);

  const save = async (event) => {
    event.preventDefault();
    setError("");
    try {
      if (editingId) await updateDocument(resource, editingId, draft);
      else await createDocument(resource, draft);
      setDraft({});
      setEditingId(null);
      await load();
    } catch (e) { setError(e?.message || "Save failed."); }
  };

  const remove = async (id) => {
    if (!window.confirm("Delete this record?")) return;
    try { await deleteDocument(resource, id); await load(); }
    catch (e) { setError(e?.message || "Delete failed."); }
  };

  const filtered = items.filter((item) =>
    JSON.stringify(item).toLowerCase().includes(queryText.toLowerCase())
  );

  return (
    <div className="admin-page">
      <header className="admin-header">
        <div><p className="eyebrow">Content management</p><h1>{meta.title}</h1><p>Create, edit and remove records from Firestore.</p></div>
        <button className="admin-primary" onClick={() => { setEditingId(null); setDraft({}); }}>
          <Plus size={17}/> New record
        </button>
      </header>

      {error && <div className="admin-error">{error}</div>}

      <section className="admin-panel admin-form-panel">
        <h2>{editingId ? "Edit record" : "Create record"}</h2>
        <form onSubmit={save} className="admin-form">
          {meta.fields.map((field) => (
            <label key={field}>{field.replace(/([A-Z])/g, " $1")}
              <input value={draft[field] || ""} onChange={(e) => setDraft({ ...draft, [field]: e.target.value })} />
            </label>
          ))}
          <div className="admin-form-actions">
            <button className="admin-primary" type="submit"><Save size={16}/> Save</button>
            {editingId && <button type="button" className="admin-secondary" onClick={() => { setEditingId(null); setDraft({}); }}>Cancel</button>}
          </div>
        </form>
      </section>

      <section className="admin-panel">
        <div className="admin-toolbar">
          <div className="admin-search"><Search size={17}/><input value={queryText} onChange={(e) => setQueryText(e.target.value)} placeholder={meta.placeholder}/></div>
          <span>{filtered.length} records</span>
        </div>
        <div className="admin-table">
          {filtered.map((item) => (
            <div className="admin-row" key={item.id}>
              <div><strong>{item.name || item.title || item.question || item.email || "Untitled"}</strong><span>{item.description || item.url || item.role || item.status || item.slug || item.id}</span></div>
              <button className="admin-link" onClick={() => { setEditingId(item.id); setDraft(item); }}>Edit</button>
              <button className="admin-danger-icon" onClick={() => remove(item.id)} title="Delete"><Trash2 size={16}/></button>
            </div>
          ))}
          {!filtered.length && <div className="admin-empty">No records found.</div>}
        </div>
      </section>
    </div>
  );
}
