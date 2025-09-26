import { useState } from "react";
import { Outlet } from "react-router-dom";
import "./DashboardLayout.css";
import Dashboardnavbar from "./Dashboardnavbar";
import Sidebar from "./Sidebar";

const DashboardLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const toggleSidebar = () => {
    setIsSidebarOpen((prev) => !prev);
  };

  return (
    <div className="dashboard-layout">
      <Dashboardnavbar toggleSidebar={toggleSidebar} />

      <div className="layout-wrapper">
        <div className={`sidebar-container ${isSidebarOpen ? "open" : "closed"}`}>
          <Sidebar />
        </div>

        <div className={`content-container ${isSidebarOpen ? "shrink" : "expand"}`}>
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default DashboardLayout;
