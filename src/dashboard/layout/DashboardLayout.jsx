// import { useState } from 'react';
// import { Col, Row } from 'react-bootstrap';
// import { Outlet } from 'react-router-dom'; // Import Outlet for nested routes
// import Dashboardnavbar from './Dashboardnavbar';
// import Sidebar from './Sidebar';

// const DashboardLayout = () => {
//     const [isSidebarOpen, setIsSidebarOpen] = useState(true); // Sidebar is visible by default

//     const toggleSidebar = () => {
//         setIsSidebarOpen(prev => !prev);
//     };

//     return (
//         <>
//             <Row className="dashboard-container">
//                 <Dashboardnavbar toggleSidebar={toggleSidebar} />
//             </Row>
//             <Row>
//                 <Col md={2}>
//                     <div className="dashboard-body d-flex">
//                         {isSidebarOpen && <Sidebar />}
//                     </div>
//                 </Col>
//                 <Col md={10}>
//                     <div className="content-area">
//                         <Outlet /> 
//                     </div>
//                 </Col>
//             </Row>
//         </>
//     );
// };

// export default DashboardLayout;


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
