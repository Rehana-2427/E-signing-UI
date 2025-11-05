import Cookies from "js-cookie";
import { useEffect, useState } from "react";
import { Button, Spinner } from "react-bootstrap";
import { FaBars, FaCheckCircle, FaUser } from "react-icons/fa";
import { Link } from "react-router-dom";
import documentApi from "../../api/documentapi";
import "./DashboardLayout.css"; // Custom styles

const Dashboardnavbar = ({ toggleSidebar }) => {
  const user = JSON.parse(localStorage.getItem("user"));
  const userName = user?.userName;
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
  const handleLogout = () => {
    const isLocalhost = window.location.hostname === "localhost";
    const domain = isLocalhost ? undefined : ".signbook.co";

    document.cookie.split(";").forEach((cookie) => {
      const cookieName = cookie.split("=")[0].trim();

      Cookies.remove(cookieName, { domain, path: "/" });
      Cookies.remove(cookieName, { path: "/" });
    });

    localStorage.clear();
    window.location.href = "/";
  };

  const goToHome = () => {
    const isLocalhost = window.location.hostname === "localhost";
    window.location.href = isLocalhost
      ? "http://localhost:3035"
      : "https://signbook.co";
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
      const senderEmail = user?.userEmail; // assuming user email is stored in localStorage
      const response = await documentApi.getUnseenRequests(senderEmail);
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

  const handleMarkAsSeen = async (documentId) => {
    try {
      await documentApi.markAsSeen(documentId);
      setUnseenRequests((prev) =>
        prev.filter((req) => req.documentId !== documentId)
      );
    } catch (error) {
      console.error("Failed to mark request as seen:", error);
    }
  };
  return (
    <div className="navbar navbar-expand-lg navbar-light shadow-sm px-3 ">
      <Link to="/" className="navbar-brand d-flex align-items-center">
        <img src="/assets/images/logo.png" alt="Logo" height="50" />
      </Link>

      <FaBars
        size={20}
        onClick={toggleSidebar}
        style={{ cursor: "pointer", marginLeft: "1rem" }}
      />

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
          className="position-relative"
          style={{ cursor: "pointer", fontSize: "1.5rem" }}
        >
          <i
            className="i-Bell text-muted header-icon"
            onClick={handleBellClick}
          />

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


          {unseenRequests.length == 0 && (
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
              0
            </span>
          )}
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
                    key={req.documentId}
                    className="dropdown-item d-flex flex-column align-items-start border-bottom pb-2 mb-2"
                  >
                    <div className="w-100 d-flex justify-content-between">
                      <div>
                        <strong>{req.documentId}</strong> -
                        <strong>{req.documentName}</strong>
                        <div className="text-muted small">
                          Reviewer <strong>{req.reviewerEmail}</strong> approved
                          your document.
                        </div>
                        <Button
                          size="sm"
                          variant="outline-success"
                          className="mt-2"
                          onClick={() => handleMarkAsSeen(req.documentId)}
                        >
                          <FaCheckCircle /> Mark as seen
                        </Button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        <Link
          to="/dashboard/profile"
          className="text-dark"
          style={{ fontSize: "1.5rem" }}
        >
          <FaUser style={{ cursor: "pointer" }} />
        </Link>

        <Button onClick={goToHome}>Go to Home</Button>
        <Button onClick={handleLogout}>Logout</Button>
      </div>
    </div>
  );
};

export default Dashboardnavbar;
