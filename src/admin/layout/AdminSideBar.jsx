import { useRef } from "react";
import { Nav } from "react-bootstrap";
import {
    FaBuilding,
    FaFileAlt,
    FaFolderOpen,
    FaPlusCircle,
    FaTachometerAlt
} from "react-icons/fa";
import { useLocation, useNavigate } from "react-router-dom";

const AdminSideBar = () => {
    const scrollContainerRef = useRef(null);
    const location = useLocation();
    const navigate = useNavigate();

    const navLinks = [
        { to: "/admin-dashboard", label: "Dashboard", icon: <FaTachometerAlt size={30} /> },
        { to: "/admin-dashboard/credit", label: "Credits", icon: <FaFileAlt size={30} /> },
        { to: "/admin-dashboard/user-management", label: "User Management", icon: <FaPlusCircle size={30} /> },
        { to: '/admin-dashboard/company-management', label: "Company Management", icon: <FaBuilding size={30} /> },
        { to: "/admin-dashboard/settings", label: "Settings", icon: <FaFolderOpen size={30} /> },
        // { to: "/admin-dashboard/logout", label: "Logout", icon: <FaAddressBook size={30} /> }
    ];

    const isLinkActive = (link) => location.pathname === link.to;

    const handleLinkClick = (to) => {
        navigate(to);
    };

    const renderNavLinks = () => (
        <Nav className="flex-column full-height align-items-center">
            {navLinks.map((link, index) => (
                <div key={index} style={{ position: "relative", width: "100%", marginBottom: '20px' }}>
                    <div
                        onClick={() => handleLinkClick(link.to)}
                        className={`nav-link d-flex flex-column align-items-center ${isLinkActive(link) ? "active" : ""}`}
                        style={{
                            fontSize: "1.1rem",
                            color: isLinkActive(link) ? "#663399" : "#332e38",
                            textAlign: "center",
                            padding: "10px",
                            transition: "color 0.3s",
                            cursor: "pointer",
                        }}
                    >
                        <div
                            style={{
                                display: "flex",
                                alignItems: "center",
                                flexDirection: "column",
                                position: "relative",
                                height: "50px",
                                minWidth: "100px",
                                justifyContent: "center",
                            }}
                        >
                            {link.icon && <span style={{ marginBottom: "10px" }}>{link.icon}</span>}
                            {link.label}
                        </div>

                        {/* Triangle indicator for active link */}
                        <div
                            className="triangle"
                            style={{
                                width: "0",
                                height: "0",
                                borderStyle: "solid",
                                borderWidth: "0 0 30px 30px",
                                borderColor: "transparent transparent #663399 transparent",
                                position: "absolute",
                                top: "70%",
                                left: "100%",
                                marginLeft: "10px",
                                display: isLinkActive(link) ? "block" : "none",
                            }}
                        />
                    </div>
                    <hr style={{ width: "100%", borderColor: "black", margin: "5px 0" }} />
                </div>
            ))}
        </Nav>
    );

    return (
        <div ref={scrollContainerRef} className="sidebar" style={{ width: "220px", backgroundColor: "#f8f9fa", height: "100vh", paddingTop: "30px" }}>
            {renderNavLinks()}
        </div>
    );
};

export default AdminSideBar;
