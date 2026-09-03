import { NavLink, Link } from "react-router-dom";
import {
  LayoutDashboard,
  Inbox,
  FileCheck2,
  FileX2,
  CalendarClock,
  Newspaper,
  BarChart3,
} from "lucide-react";

const links = [
  ["/editor/dashboard", "Dashboard", LayoutDashboard],
  ["/editor/review", "Review Queue", Inbox],
  ["/editor/pending", "Pending Stories", FileCheck2],
  ["/editor/published", "Published", Newspaper],
  ["/editor/scheduled", "Scheduled", CalendarClock],
  ["/editor/rejected", "Rejected", FileX2],
  ["/editor/analytics", "Analytics", BarChart3],
];

export default function EditorSidebar() {
  return (
    <aside className="editor-sidebar">
      <div className="editor-brand">
        <div className="editor-mark">N</div>
        <div>
          <strong>NewsRoom</strong>
          <span>Editorial Portal</span>
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

      <Link className="editor-back-link" to="/">
        <Newspaper size={18} />
        Back to NewsRoom
      </Link>
    </aside>
  );
}
