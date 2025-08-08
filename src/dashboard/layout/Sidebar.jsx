import React, { useEffect, useRef, useState } from "react";
import { Nav } from "react-bootstrap";
import {
    FaAddressBook,
    FaFileAlt,
    FaFolderOpen,
    FaPlusCircle,
    FaTachometerAlt
} from "react-icons/fa";
import { Link, useLocation, useNavigate } from "react-router-dom";
import "./Sidebar.css"; // Optional for styling

const Sidebar = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const user = JSON.parse(localStorage.getItem('user'));
    const userName = user?.userName;
    const [activeLink, setActiveLink] = useState(location.pathname);
    const scrollContainerRef = useRef(null);

    useEffect(() => {
        if (scrollContainerRef.current) {
            const savedScrollPosition = sessionStorage.getItem('leftSideScrollPosition');
            if (savedScrollPosition) {
                scrollContainerRef.current.scrollTop = parseInt(savedScrollPosition, 10);
            }
        }
        const handleScroll = () => {
            if (scrollContainerRef.current) {
                const scrollPosition = scrollContainerRef.current.scrollTop;
                sessionStorage.setItem('leftSideScrollPosition', scrollPosition.toString());
            }
        };

        const currentRef = scrollContainerRef.current;
        if (currentRef) {
            currentRef.addEventListener('scroll', handleScroll);
        }

        return () => {
            if (currentRef) {
                currentRef.removeEventListener('scroll', handleScroll);
            }
        };
    }, [location]);

    const navLinks = [
        { to: "/dashboard", label: "Dashboard", icon: <FaTachometerAlt size={30} /> },
        { to: "/dashboard/my-consents", label: "My Consents & Agreements", icon: <FaFileAlt size={30} /> },
        { to: "/dashboard/new-consent", label: "New Consent", icon: <FaPlusCircle size={30} /> },
        { to: "/dashboard/my-docs", label: "My Docs", icon: <FaFolderOpen size={30} /> },
        { to: "/dashboard/contacts", label: "Contacts", icon: <FaAddressBook size={30} /> }
    ];

    const handleLinkClick = (to) => {
        if (to === activeLink) {
            return;
        }
        setActiveLink(to);
        sessionStorage.setItem('scrollPosition', scrollContainerRef.current.scrollTop);
        navigate(to, { state: { userName } });
    };

    const isLinkActive = (link) => {
        const currentPath = location.pathname;

        const specialCases = {
            '/dashboard/my-docs': '/dashboard/my-docs/view'
        }
        for (const [key, basePath] of Object.entries(specialCases)) {
            if (link.to === key && currentPath.startsWith(basePath)) {
                return true;
            }
        }
        if (currentPath.startsWith('/dashboard/my-docs') || currentPath.startsWith('/hr-dashboard/evergreenjobs-applications')) {
            return link.to === '/dashboard/my-docs'; // Mark /hr-dashboard as active
        }
        return currentPath === link.to;
    };

    const renderNavLinks = () => (
        <Nav className="flex-column full-height align-items-center">
            {navLinks.map((link, index) => (
                <React.Fragment key={index}>
                    <div style={{ position: "relative", width: "100%", marginBottom: '20px' }}>
                        <Link
                            to={link.to}
                            onClick={(e) => {
                                e.preventDefault();
                                handleLinkClick(link.to);
                            }}
                            className={`nav-link d-flex flex-column align-items-center ${isLinkActive(link) ? "active" : ""}`}
                            style={{
                                fontSize: "1.1rem",
                                color: isLinkActive(link) ? "#663399" : "#332e38",
                                textAlign: "center",
                                padding: "10px",
                                transition: "color 0.3s",
                            }}
                        >
                            {/* <span style={{ marginBottom: "5px" }}>{link.icon}</span> */}
                            {/* {link.label} */}
                            <div style={{ display: "flex", alignItems: "center", flexDirection: "column", position: "relative", }}>
                                <div
                                    style={{
                                        display: "flex",
                                        alignItems: "center",
                                        flexDirection: "column",
                                        position: "relative",
                                        height: "50px",
                                        width: "auto",
                                        minWidth: "100px",
                                        justifyContent: "center",
                                    }}
                                >
                                    {link.icon && <span style={{ marginBottom: "10px" }}>{link.icon}</span>}
                                    {link.label}

                                </div>
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
                        </Link>
                        <hr style={{ width: "100%", borderColor: "black", margin: "5px 0" }} />
                    </div>
                </React.Fragment>
            ))}
        </Nav>
    );

    return (
        <div ref={scrollContainerRef} className="sidebar">
            {renderNavLinks()}
        </div>
    );
};

export default Sidebar;
