import { Outlet } from "react-router-dom";
import UserSidebar from "./UserSidebar";

export default function UserLayout() {
  return (
    <div className="user-portal">
      <UserSidebar />
      <main className="user-content">
        <Outlet />
      </main>
    </div>
  );
}
