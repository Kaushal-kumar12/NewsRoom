import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";

import App from "./App";

import { AuthProvider } from "./context/AuthContext";
import { AppProvider } from "./context/AppContext";

// ============================================================
// GLOBAL STYLES
// ============================================================

// import "./styles/global.css";


// ============================================================
// AUTH / COMMON STYLES
// ============================================================

import "./styles/auth.css";


// Super Admin CSS
import "./styles/superadmin/superadmin-layout.css";
import "./styles/superadmin/superadmin-sidebar.css";
import "./styles/superadmin/superadmin-dashboard.css";
import "./styles/superadmin/footer.css";

// User Management
import "./styles/superadmin/users.css";

// Administrators
import "./styles/superadmin/administrators.css";
import "./styles/superadmin/superadmin-management.css";


// Roles
import "./styles/superadmin/roles.css";

// Permissions
// import "./styles/superadmin/permissions.css";

// Editorial
import "./styles/superadmin/editorial.css";
import "./styles/superadmin/editorial-editor.css";
import "./styles/superadmin/editorial-review.css";

// Admin
import "./styles/admin/staff-admin.css";
import "./styles/admin/admin-dashboard.css";
import "./styles/admin/editorial.css";
import "./styles/admin/super-admin.css";

// Staff
import "./styles/author/workspace.css";
import "./styles/editor/workspace.css";
import "./styles/staff-profile.css";
// import "./styles/admin/staff-topbar.css";
// import "./styles/admin/staff-dashboard.css";
// import "./styles/admin/staff-editorial.css";

// Security & Audit
// import "./styles/superadmin/security.css";

// System Settings
// import "./styles/superadmin/settings.css";

// My Profile
// import "./styles/superadmin/profile.css";

// Public
import "./styles/public/article.css";
import "./styles/public/publicNews.css";
import "./styles/public/public.css";
import "./styles/publicNews.css";
import "./styles/public/home.css";
import "./styles/public/public-header.css";
import "./styles/public/article-modern.css";
import "./styles/public/latest-modern.css";

ReactDOM.createRoot(
  document.getElementById("root")
).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <AppProvider>
          <App />
        </AppProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);