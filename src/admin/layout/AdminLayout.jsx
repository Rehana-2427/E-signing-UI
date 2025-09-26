import { useState } from "react";
import { Outlet } from "react-router-dom";
import "../../dashboard/layout/DashboardLayout.css";
import AdminNavbar from "./AdminNavbar";
import AdminSideBar from "./AdminSideBar";

const AdminLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const toggleSidebar = () => {
    setIsSidebarOpen((prev) => !prev);
  };
  return (
    <div className="dashboard-layout">
      <AdminNavbar toggleSidebar={toggleSidebar} />
      <div className="layout-wrapper">
        <div
          className={`sidebar-container ${isSidebarOpen ? "open" : "closed"}`}
        >
          <AdminSideBar />
        </div>

        <div
          className={`content-container ${isSidebarOpen ? "shrink" : "expand"}`}
        >
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;
