import { Button, Dropdown } from "react-bootstrap";
import { FaBars, FaUser } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import './DashboardLayout.css'; // Custom styles

const Dashboardnavbar = ({ toggleSidebar }) => {
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('user'));
    const userName = user?.userName;
    const toggleFullScreen = () => {
        if (document.fullscreenEnabled) {
            if (!document.fullscreenElement) {
                document.documentElement.requestFullscreen();
            } else {
                document.exitFullscreen();
            }
        }
    };
    const handleLogout = () => {
        localStorage.clear();
        navigate('/');
    };
    return (
        <div className="navbar navbar-expand-lg navbar-light shadow-sm px-3 ">

            <Link to="/" className="navbar-brand d-flex align-items-center">
                <img src="/assets/images/logo.png" alt="Logo" height="50" />
            </Link>

            <FaBars size={20} onClick={toggleSidebar} style={{ cursor: "pointer", marginLeft: "1rem" }} />

            <div className="ms-auto d-flex align-items-center gap-3">
                {/* Center - Welcome Message */}
                {user && (
                    <div className="mx-auto d-none d-lg-block">
                        <h5 className="mb-0 fw-semibold">Welcome, {userName}</h5>
                    </div>
                )}

                {/* Fullscreen Icon */}
                <i
                    datafullscreen="true"
                    className="i-Full-Screen header-icon d-none d-sm-inline-block"
                    onClick={toggleFullScreen}
                    style={{ cursor: "pointer", fontSize: "1.5rem" }} // Increased size
                />
                <div
                    className="notification-icon-container position-relative"
                    style={{ cursor: "pointer", fontSize: "1.5rem" }} // Increased size
                >
                    <span
                        className="badge bg-primary position-absolute top-0 start-100 translate-middle p-1 rounded-circle"
                        style={{ width: "8px", height: "8px" }}
                    ></span>
                    <i className="i-Bell text-muted header-icon" />
                </div>

                <Dropdown align="end" className="ml-2">
                    <Dropdown.Toggle
                        as="span"
                        id="dropdown-user"
                        className="cursor-pointer"
                        onClick={(e) => e.currentTarget.click()} // not recommended, just a fallback
                    >
                        <FaUser />
                    </Dropdown.Toggle>

                    <Dropdown.Menu className="mt-3">
                        <Dropdown.Item as={Link} to="/profile">Profile</Dropdown.Item>
                        <Dropdown.Item as={Link} to="/settings">Settings</Dropdown.Item>
                        <Dropdown.Item as={Link} to="/">Home</Dropdown.Item>
                        <Dropdown.Divider />
                        <Dropdown.Item onClick={handleLogout}>Logout</Dropdown.Item>
                    </Dropdown.Menu>
                </Dropdown>
                <Button onClick={handleLogout}>Logout</Button>
            </div>
        </div>
    )
}

export default Dashboardnavbar
