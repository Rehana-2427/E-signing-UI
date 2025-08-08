import { useState } from "react";
import { Outlet } from "react-router-dom";
import AdminNavbar from "./AdminNavbar";
import AdminSideBar from "./AdminSideBar";

const AdminLayout = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const toggleSidebar = () => {
        setIsSidebarOpen(prev => !prev);
    };
    return (
        <div className="dashboard-layout" style={{ '--navbar-height': '60px' }}>
            <AdminNavbar toggleSidebar={toggleSidebar} />
            <div className="sidebar-container">
                {isSidebarOpen && <AdminSideBar />}
            </div>
            <div className="content-container">
                <Outlet />
            </div>
        </div>
    )
}

export default AdminLayout
