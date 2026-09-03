import { NavLink } from "react-router-dom";
import {
  LayoutDashboard, UserRound, Bookmark, Bell, Heart,
  MessageSquare, Settings, Newspaper
} from "lucide-react";

const links = [
  ["/user/dashboard", "Dashboard", LayoutDashboard],
  ["/user/profile", "My Profile", UserRound],
  ["/user/bookmarks", "Bookmarks", Bookmark],
  ["/user/notifications", "Notifications", Bell],
  ["/user/following", "Following", Heart],
  ["/user/comments", "My Comments", MessageSquare],
  ["/user/settings", "Settings", Settings],
];

export default function UserSidebar() {
  return (
    <aside className="user-sidebar">
      <div className="user-sidebar-brand">
        <div className="auth-brand-mark">N</div>
        <div><strong>NewsRoom</strong><span>Reader Portal</span></div>
      </div>

      <nav>
        {links.map(([to, label, Icon]) => (
          <NavLink key={to} to={to} className={({ isActive }) => isActive ? "active" : ""}>
            <Icon size={18} />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      <NavLink className="user-sidebar-news" to="/">
        <Newspaper size={18} /> Back to NewsRoom
      </NavLink>
    </aside>
  );
}
