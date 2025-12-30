import { useEffect, useState } from "react";
import { Button, Table, Toast, ToastContainer } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import adminUserCreditApi from "../api/adminUserCreditApi";
import Pagination from "../components/Pagination";
import AddCreditsModal from "./AddCreditsModal";

const UserManagemnet = () => {
  const [userCredits, setUserCredits] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [sortedColumn, setSortedColumn] = useState(null);
  const [sortOrder, setSortOrder] = useState("asc");
  useEffect(() => {
    fetchUserCredits();
  }, [page, pageSize, sortedColumn, sortOrder]);

  const fetchUserCredits = async () => {
    try {
      const response = await adminUserCreditApi.getUserCreditList(
        page,
        pageSize,
        sortedColumn,
        sortOrder
      );
      setUserCredits(response.data.content || []);
      setTotalPages(response.data.totalPages || 0);
    } catch (error) {
      setUserCredits([]);
      setTotalPages(0);
      console.error("Error fetching user credits", error);
    }
  };

  const handleOpenModal = (user) => {
    setSelectedUser(user);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setSelectedUser(null);
    setShowModal(false);
  };
  const handleSaveCredits = (updatedData, email) => {
    fetchUserCredits();
    setUserCredits(updatedData);
    setToastMessage(`Successfully assigned credits to ${email}`);
    setShowToast(true);
  };

  const handlePageSizeChange = (e) => {
    const size = parseInt(e.target.value);
    setPageSize(size);
    setPage(0);
  };

  const handlePageClick = (data) => {
    const selectedPage = Math.max(0, Math.min(data.selected, totalPages - 1)); // Ensure selectedPage is within range
    setPage(selectedPage);
    localStorage.setItem("userCreditListAdmin", selectedPage); // Store the page number in localStorage
  };

  const handleSort = (column) => {
    if (sortedColumn === column) {
      // Toggle sort order if the same column is clicked
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      // Sort by the new column (default to ascending)
      setSortedColumn(column);
      setSortOrder("asc");
    }
  };
  return (
    <div
      className="scrollable-container"
      style={{
        height: "100%",
        minHeight: "80vh",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <h1>
        <strong>User Credit Management</strong>
      </h1>
      <Table striped bordered hover>
        <thead>
          <tr>
            <th
              onClick={() => handleSort("userName")}
              style={{ cursor: "pointer" }}
            >
              User Name{" "}
              <span>
                <span
                  style={{
                    color:
                      sortedColumn === "userName" && sortOrder === "asc"
                        ? "black"
                        : "gray",
                  }}
                >
                  ↑
                </span>{" "}
                <span
                  style={{
                    color:
                      sortedColumn === "userName" && sortOrder === "desc"
                        ? "black"
                        : "gray",
                  }}
                >
                  ↓
                </span>
              </span>
            </th>
            <th
              onClick={() => handleSort("userEmail")}
              style={{ cursor: "pointer" }}
            >
              User Email{" "}
              <span>
                <span
                  style={{
                    color:
                      sortedColumn === "userEmail" && sortOrder === "asc"
                        ? "black"
                        : "gray",
                  }}
                >
                  ↑
                </span>{" "}
                <span
                  style={{
                    color:
                      sortedColumn === "userEmail" && sortOrder === "desc"
                        ? "black"
                        : "gray",
                  }}
                >
                  ↓
                </span>
              </span>
            </th>
            <th>Credit Bought</th>
            <th>Used Credit</th>
            <th>Balance Credit</th>
            {/* <th>Updated At</th> */}
            <th>Add Credit</th>
            <th>Report</th>
          </tr>
        </thead>
        <tbody>
          {userCredits.map((user, index) => (
            <tr key={index}>
              <td>{user.userName}</td>
              <td>{user.userEmail}</td>
              <td>{user.creditBought}</td>
              <td>{user.usedCredit}</td>
              <td>{user.balanceCredit}</td>
              {/* <td>{user.updatedAt}</td> */}
              <td>
                <Button variant="success" onClick={() => handleOpenModal(user)}>
                  Add Credit
                </Button>
              </td>
              <td>
                <Button
                  onClick={() =>
                    navigate(
                      "/admin-dashboard/user-management/credit-passbook",
                      { state: { userEmail: user.userEmail } }
                    )
                  }
                >
                  Report
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
      <div style={{ marginTop: "auto" }}>
        {userCredits.length > 0 && totalPages > 0 && (
        <div style={{ marginTop: "auto" }}>
          <Pagination
            page={page}
            pageSize={pageSize}
            totalPages={totalPages}
            handlePageSizeChange={handlePageSizeChange}
            handlePageClick={handlePageClick}
          />
        </div>
      )}
      </div>
      {selectedUser && (
        <AddCreditsModal
          show={showModal}
          onHide={handleCloseModal}
          user={selectedUser}
          onSave={handleSaveCredits}
        />
      )}
      <ToastContainer position="top-end" className="p-3">
        <Toast
          onClose={() => setShowToast(false)}
          show={showToast}
          delay={3000}
          autohide
          bg="success"
        >
          <Toast.Header>
            <strong className="me-auto">Credit Assigned</strong>
          </Toast.Header>
          <Toast.Body className="text-white">{toastMessage}</Toast.Body>
        </Toast>
      </ToastContainer>
    </div>
  );
};

export default UserManagemnet;
