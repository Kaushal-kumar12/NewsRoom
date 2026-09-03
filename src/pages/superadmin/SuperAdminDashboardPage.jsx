import React from "react";
import { Link } from "react-router-dom";

import {
  Users,
  UserCog,
  ShieldCheck,
  Newspaper,
  UserRound,
  UserX,
  FileText,
  Activity,
  Shield,
  KeyRound,
  Settings,
  ClipboardCheck,
  ArrowUpRight,
  CheckCircle2,
} from "lucide-react";

export default function SuperAdminDashboardPage() {
  const statistics = [
    {
      title: "Total Users",
      value: "4",
      icon: Users,
      className: "users",
    },
    {
      title: "Administrators",
      value: "0",
      icon: UserCog,
      className: "admins",
    },
    {
      title: "Super Administrators",
      value: "1",
      icon: ShieldCheck,
      className: "super-admins",
    },
    {
      title: "Authors",
      value: "0",
      icon: Newspaper,
      className: "authors",
    },
    {
      title: "Editors",
      value: "0",
      icon: UserRound,
      className: "editors",
    },
    {
      title: "Active Accounts",
      value: "4",
      icon: Activity,
      className: "active",
    },
    {
      title: "Disabled Accounts",
      value: "0",
      icon: UserX,
      className: "disabled",
    },
    {
      title: "Editorial Queue",
      value: "0",
      icon: ClipboardCheck,
      className: "queue",
    },
  ];

  const quickAccess = [
    {
      title: "User Management",
      description: "Manage platform users",
      icon: Users,
      path: "/super-admin/users",
    },
    {
      title: "Administrators",
      description: "Manage administrators",
      icon: UserCog,
      path: "/super-admin/admins",
    },
    {
      title: "Roles",
      description: "Configure system roles",
      icon: UserRound,
      path: "/super-admin/roles",
    },
    {
      title: "Permissions",
      description: "Manage access permissions",
      icon: KeyRound,
      path: "/super-admin/permissions",
    },
    {
      title: "Editorial",
      description: "Manage editorial system",
      icon: Newspaper,
      path: "/super-admin/editorial",
    },
    {
      title: "Security & Audit",
      description: "Review security activity",
      icon: Shield,
      path: "/super-admin/security",
    },
  ];

  return (
    <div className="sa-dashboard">

      {/* HEADER */}
      <section className="sa-dashboard-header">
        <div>
          <div className="sa-dashboard-eyebrow">
            SUPER ADMINISTRATION
          </div>

          <h2>
            Welcome back, Kaushal
          </h2>

          <p>
            Manage your NewsRoom platform,
            users, editorial system and security
            from one place.
          </p>
        </div>

        <button
          type="button"
          className="sa-refresh-button"
        >
          <Activity size={17} />
          Refresh
        </button>
      </section>

      {/* STATISTICS */}
      <section className="sa-statistics">
        {statistics.map((item) => {
          const Icon = item.icon;

          return (
            <div
              className={`sa-stat-card sa-stat-${item.className}`}
              key={item.title}
            >
              <div className="sa-stat-top">
                <div className="sa-stat-icon">
                  <Icon size={19} />
                </div>

                <ArrowUpRight
                  size={16}
                  className="sa-stat-arrow"
                />
              </div>

              <div className="sa-stat-value">
                {item.value}
              </div>

              <div className="sa-stat-title">
                {item.title}
              </div>
            </div>
          );
        })}
      </section>

      {/* MAIN GRID */}
      <section className="sa-dashboard-grid">

        {/* SYSTEM OVERVIEW */}
        <div className="sa-dashboard-card">
          <div className="sa-card-header">
            <div>
              <h3>System Overview</h3>

              <p>
                Current NewsRoom platform status
              </p>
            </div>

            <div className="sa-card-header-icon">
              <Activity size={18} />
            </div>
          </div>

          <div className="sa-overview-list">
            <div className="sa-overview-row">
              <span>Active Accounts</span>
              <strong>4</strong>
            </div>

            <div className="sa-overview-row">
              <span>Disabled Accounts</span>
              <strong>0</strong>
            </div>

            <div className="sa-overview-row">
              <span>Pending Editorial Items</span>
              <strong>0</strong>
            </div>

            <div className="sa-overview-row">
              <span>System Administrators</span>
              <strong>1</strong>
            </div>
          </div>
        </div>

        {/* SECURITY */}
        <div className="sa-dashboard-card">
          <div className="sa-card-header">
            <div>
              <h3>Security Status</h3>

              <p>
                Core administration security
              </p>
            </div>

            <div className="sa-card-header-icon security">
              <Shield size={18} />
            </div>
          </div>

          <div className="sa-security-list">

            <div className="sa-security-item">
              <CheckCircle2 size={18} />

              <div>
                <strong>Authentication</strong>
                <span>
                  System authentication active
                </span>
              </div>

              <b>Active</b>
            </div>

            <div className="sa-security-item">
              <CheckCircle2 size={18} />

              <div>
                <strong>Access Control</strong>
                <span>
                  Role and permission system active
                </span>
              </div>

              <b>Active</b>
            </div>

            <div className="sa-security-item">
              <CheckCircle2 size={18} />

              <div>
                <strong>Audit System</strong>
                <span>
                  Security activity monitoring
                </span>
              </div>

              <b>Active</b>
            </div>

          </div>
        </div>

      </section>

      {/* QUICK ACCESS */}
      <section className="sa-dashboard-card sa-quick-access">

        <div className="sa-card-header">
          <div>
            <h3>Quick Access</h3>

            <p>
              Frequently used administration modules
            </p>
          </div>

          <div className="sa-card-header-icon">
            <Settings size={18} />
          </div>
        </div>

        <div className="sa-quick-grid">
          {quickAccess.map((item) => {
            const Icon = item.icon;

            return (
              <Link
                to={item.path}
                className="sa-quick-item"
                key={item.title}
              >
                <div className="sa-quick-icon">
                  <Icon size={19} />
                </div>

                <div className="sa-quick-text">
                  <strong>{item.title}</strong>

                  <span>
                    {item.description}
                  </span>
                </div>

                <ArrowUpRight size={16} />
              </Link>
            );
          })}
        </div>

      </section>

      {/* RECENT ACTIVITY */}
      <section className="sa-dashboard-card sa-activity-card">

        <div className="sa-card-header">
          <div>
            <h3>Recent Activity</h3>

            <p>
              Latest system administration events
            </p>
          </div>

          <div className="sa-card-header-icon">
            <FileText size={18} />
          </div>
        </div>

        <div className="sa-empty-activity">

          <div className="sa-empty-icon">
            <FileText size={22} />
          </div>

          <strong>
            No recent activity
          </strong>

          <span>
            Administrative activity will appear here
            when actions are performed.
          </span>

        </div>

      </section>

    </div>
  );
}