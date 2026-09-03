import { NavLink, Link } from "react-router-dom";
import {
  LayoutDashboard,
  FileText,
  PenSquare,
  Clock3,
  Send,
  BarChart3,
  Newspaper,
} from "lucide-react";

const links = [
  ["/author/dashboard", "Dashboard", LayoutDashboard],
  ["/author/stories", "My Stories", FileText],
  ["/author/create", "Create Story", PenSquare],
  ["/author/drafts", "Drafts", Clock3],
  ["/author/submitted", "Submitted", Send],
  ["/author/analytics", "Analytics", BarChart3],
];

export default function AuthorSidebar() {
  return (
    <aside className="author-sidebar">
      <div className="author-brand">
        <div className="author-mark">N</div>
        <div>
          <strong>NewsRoom</strong>
          <span>Author Portal</span>
        </div>
      </div>

      <nav>
        {links.map(([to, label, Icon]) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) => (isActive ? "active" : "")}
          >
            <Icon size={18} />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      <Link className="author-back-link" to="/">
        <Newspaper size={18} />
        Back to NewsRoom
      </Link>
    </aside>
  );
}
