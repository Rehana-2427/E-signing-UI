import { Button, Dropdown } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import '../style.css';

const Navbar = ({ toggleSidebar }) => {
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('user'));
    const userName = user?.userName;
    const toggleFullScreen = () => {
        if (document.fullscreenEnabled) {
            if (!document.fullscreenElement) document.documentElement.requestFullscreen();
            else document.exitFullscreen();
        }
    };
    const handleLogout = () =>{
        localStorage.clear()
        navigate("/")
    }
    return (
        <div className="main-header">
            <div className="logo">
                <img src="/assets/images/logo.png" alt="Logo" />
            </div>
            <div>
                <h2>Welcome {userName}</h2>
            </div>
          
            <div className="d-none d-lg-flex align-items-center gap-3">
                <Dropdown>
                    <div className="mega-menu">
                        <Dropdown.Menu className="mt-3">
                        </Dropdown.Menu>
                    </div>
                </Dropdown>
            </div>
            <div className="header-part-right">
                <Button onClick={handleLogout}>Logout</Button>
                <i
                    datafullscreen="true"
                    className="i-Full-Screen header-icon d-none d-sm-inline-block"
                    onClick={toggleFullScreen}
                />
                <div className="notification-icon-container">
                    <Dropdown className="ml-2">
                        <Dropdown.Toggle
                            as="div"
                            id="dropdownNotification"
                            className="badge-top-container toggle-hidden ml-2"
                        >
                            <span className="badge bg-primary cursor-pointer">
                                0
                            </span>
                            <i className="i-Bell text-muted header-icon" />
                        </Dropdown.Toggle>

                        <Dropdown.Menu
                            className="notification-dropdown-menu"

                        >
                            <Dropdown.Item>No new notifications</Dropdown.Item>
                            <>
                                <Dropdown.Item
                                    className="text-end"
                                    style={{
                                        color: 'purple',
                                        backgroundColor: 'purple',
                                        cursor: 'pointer',
                                    }}
                                >
                                    Mark all as read
                                </Dropdown.Item>

                            </>

                        </Dropdown.Menu>
                    </Dropdown>
                </div>
            </div>
        </div>
    )
}

export default Navbar
