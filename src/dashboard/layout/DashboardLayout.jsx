

import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import './DashboardLayout.css'; // Custom styles
import Dashboardnavbar from './Dashboardnavbar';
import Sidebar from './Sidebar';

const DashboardLayout = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    const toggleSidebar = () => {
        setIsSidebarOpen(prev => !prev);
    };

    return (
        <div className="dashboard-layout" style={{ '--navbar-height': '60px' }}>

            <Dashboardnavbar toggleSidebar={toggleSidebar} />



            <div className="sidebar-container">
                {isSidebarOpen && <Sidebar />}
            </div>

            <div className="content-container">
                <Outlet />
            </div>
        </div>
    );
};

export default DashboardLayout;
