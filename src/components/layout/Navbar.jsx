import { Button, Dropdown } from "react-bootstrap";
import { FaUser } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import './navbar.css';

const Navbar = () => {
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('user'));
    const userName = user?.userName;
    const handleLogout = () => {
        localStorage.clear();
        navigate('/');
    };

    const toggleFullScreen = () => {
        if (document.fullscreenEnabled) {
            if (!document.fullscreenElement) {
                document.documentElement.requestFullscreen();
            } else {
                document.exitFullscreen();
            }
        }
    };



    return (
        <div className="navbar navbar-expand-lg navbar-light shadow-sm px-3">
            {/* Left - Logo */}
            <Link to="/" className="navbar-brand d-flex align-items-center">
                <img src="/assets/images/logo.png" alt="Logo" height="50" />
            </Link>


            {/* Center - Nav Links */}
            <div className="d-flex align-items-center gap-4 ms-3">
                <Link to="/" className="nav-link">Home</Link>
                <Link to="/about" className="nav-link">About</Link>
                <Link to="/services" className="nav-link">Services</Link>
                <Link to="/contact" className="nav-link">Contact</Link>
            </div>

            {/* Center - Welcome Message */}
            {user && (
                <div className="mx-auto d-none d-lg-block">
                    <h5 className="mb-0 fw-semibold">Welcome, {userName}</h5>
                </div>
            )}

            {/* Right - Icons + User Dropdown or Auth Buttons */}
            <div className="ms-auto d-flex align-items-center gap-3">

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


                {/* User Dropdown or Login/Register */}
                {user ? (
                    <>
                        <Dropdown align="end">
                            <Dropdown.Toggle
                                id="dropdown-user"
                                className="fw-semibold  border-0"
                            >
                                <FaUser />
                            </Dropdown.Toggle>

                            <Dropdown.Menu>
                                <Dropdown.Item as={Link} to="/profile">Profile</Dropdown.Item>
                                <Dropdown.Item as={Link} to="/settings">Settings</Dropdown.Item>
                                <Dropdown.Item as={Link} to='/dashboard'>Dashboard</Dropdown.Item>
                                <Dropdown.Divider />
                                <Dropdown.Item onClick={handleLogout}>Logout</Dropdown.Item>
                            </Dropdown.Menu>
                        </Dropdown>

                        <Button onClick={handleLogout}>Logout</Button>
                    </>
                ) : (
                    <>
                        <Button variant="outline-primary" onClick={() => navigate('/register')}>
                            Register
                        </Button>
                        <Button variant="outline-secondary" onClick={() => navigate('/signin')}>
                            Login
                        </Button>
                    </>
                )}
            </div>
        </div>
    );
};

export default Navbar;
