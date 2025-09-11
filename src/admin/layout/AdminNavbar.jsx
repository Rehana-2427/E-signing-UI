import { useEffect, useState } from "react";
import { Button, Spinner } from "react-bootstrap";
import { FaBars, FaCheckCircle } from "react-icons/fa";
import { Link } from "react-router-dom";
import adminUserCreditApi from "../../api/adminUserCreditApi";

const AdminNavbar = ({ toggleSidebar }) => {
    const [unseenRequests, setUnseenRequests] = useState([]);
    const [showDropdown, setShowDropdown] = useState(false);
    const [loading, setLoading] = useState(false);


    const toggleFullScreen = () => {
        if (document.fullscreenEnabled) {
            if (!document.fullscreenElement) {
                document.documentElement.requestFullscreen();
            } else {
                document.exitFullscreen();
            }
        }
    };
    useEffect(() => {
        fetchUnseenRequests(); // Initial fetch

        const interval = setInterval(() => {
            fetchUnseenRequests();
        }, 15000); // 15 seconds

        return () => clearInterval(interval); // Cleanup on unmount
    }, []);

    const fetchUnseenRequests = async () => {
        try {
            setLoading(true);
            const response = await adminUserCreditApi.getUnseenRequests();
            setUnseenRequests(response.data);
        } catch (error) {
            console.error("Error fetching unseen requests:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUnseenRequests();
    }, []);

    const handleBellClick = () => {
        setShowDropdown(!showDropdown);
        if (!showDropdown) {
            fetchUnseenRequests(); // Refresh when opening dropdown
        }
    };

    const handleMarkAsSeen = async (id) => {
        try {
            await adminUserCreditApi.markAsSeen(id);
            setUnseenRequests(prev => prev.filter(req => req.id !== id));
        } catch (error) {
            console.error("Failed to mark request as seen:", error);
        }
    };

    console.log(unseenRequests)

    return (
        <div className="navbar navbar-expand-lg navbar-light shadow-sm px-3 ">
            <Link to="/" className="navbar-brand d-flex align-items-center">
                <img src="/assets/images/logo.png" alt="Logo" height="50" />
            </Link>

            <FaBars size={20} onClick={toggleSidebar} style={{ cursor: "pointer", marginLeft: "1rem" }} />

            <div className="ms-auto d-flex align-items-center gap-3">
                {/* Fullscreen */}
                <i
                    datafullscreen="true"
                    className="i-Full-Screen header-icon d-none d-sm-inline-block"
                    onClick={toggleFullScreen}
                    style={{ cursor: "pointer", fontSize: "1.5rem" }}
                />

                {/* Notification Bell */}
                <div className="position-relative" style={{ cursor: "pointer", fontSize: "1.5rem" }}>
                    <i className="i-Bell text-muted header-icon" onClick={handleBellClick} />

                    {/* Show count */}
                    {unseenRequests.length > 0 && (
                        <span
                            className="badge bg-danger position-absolute top-0 start-100 translate-middle rounded-circle"
                            style={{
                                width: "20px",
                                height: "20px",
                                fontSize: "0.75rem",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                            }}
                        >
                            {unseenRequests.length}
                        </span>
                    )}


                    {/* Dropdown */}
                    {showDropdown && (
                        <div
                            className="dropdown-menu dropdown-menu-end p-3 shadow show"
                            style={{
                                width: "350px",
                                maxHeight: "400px",
                                right: 0,
                                left: "auto",
                                overflowY: "auto",
                                zIndex: 9999,
                            }}
                        >

                            {loading ? (
                                <div className="text-center py-2">
                                    <Spinner animation="border" size="sm" />
                                </div>
                            ) : unseenRequests.length === 0 ? (
                                <div className="dropdown-item text-muted">No new requests</div>
                            ) : (
                                unseenRequests.map((req) => (
                                    <div
                                        key={req.id}
                                        className="dropdown-item d-flex flex-column align-items-start border-bottom pb-2 mb-2"
                                    >
                                        <div className="w-100 d-flex justify-content-between">
                                            <div>
                                                <strong>{req.userName}</strong>
                                                <div className="w-100 d-flex align-items-center gap-2">
                                                    <Button
                                                        size="sm"
                                                        variant="outline-success"
                                                        className="p-1 d-flex align-items-center justify-content-center"
                                                        style={{ width: "28px", height: "28px" }}
                                                        onClick={() => handleMarkAsSeen(req.id)}
                                                    >
                                                        <FaCheckCircle size={12} />
                                                    </Button>

                                                    <div className="text-muted small">
                                                        {req.userEmail} – Requested: <strong>{req.requestedCredits}</strong> credits
                                                    </div>
                                                </div>


                                            </div>


                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    )}

                </div>

                <Button>Logout</Button>
            </div>
        </div>
    );
};

export default AdminNavbar;
