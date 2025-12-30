import { useEffect, useState } from "react";
import { Table } from "react-bootstrap";
import companyUserApi from "../../../api/companyUsers";
import Pagination from "../../../components/Pagination";
import InvitationStatus from "./InvitationStatus"; // adjust the path if needed

const RecivedInvitationFromAdmin = () => {
  const [invitations, setInvitations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const user = JSON.parse(localStorage.getItem("user"));
  const userEmail = user?.userEmail;
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [sortedColumn, setSortedColumn] = useState(null);
  const [sortOrder, setSortOrder] = useState("asc");
  useEffect(() => {
    if (!userEmail) {
      setError("User email not found in localStorage.");
      setLoading(false);
      return;
    }

    const fetchInvitations = async () => {
      try {
        const response = await companyUserApi.getListofRecievedInvitations(
          userEmail,
          page,
          pageSize,
          sortedColumn,
          sortOrder
        );
        const content = response?.data?.content;

        setInvitations(Array.isArray(content) ? content : []);
        setTotalPages(response.data.totalPages || 0);
      } catch (err) {
        setError("Failed to fetch invitations.");
        setInvitations([]);
        setTotalPages(0);
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchInvitations();
  }, [userEmail, page, pageSize, sortedColumn, sortOrder]);

  // Optional: function to handle status change for a single invitation
  const handleStatusChange = async (newStatus, index) => {
    const updated = [...invitations];
    const invitation = updated[index];

    // Optimistically update UI
    invitation.invitationStatus = newStatus;
    setInvitations(updated);

    // Prepare request payload
    const requestPayload = {
      userEmail: userEmail,
      mobileNumber: invitation.mobileNumber,
      invitedByEmail: invitation.invitedByEmail,
      companyName: invitation.companyName,
      invitationStatus: newStatus,
    };

    try {
      await companyUserApi.acceptInvitation(requestPayload);
      console.log("Invitation status updated successfully.");
    } catch (error) {
      console.error("Failed to update invitation status:", error);

      // Optionally rollback UI change on failure
      updated[index].invitationStatus = invitation.invitationStatus;
      setInvitations(updated);
      alert("Failed to update invitation status. Please try again.");
    }
  };

  if (loading) return <p>Loading invitations...</p>;
  if (error) return <p>{error}</p>;
  const handlePageSizeChange = (e) => {
    const size = parseInt(e.target.value);
    setPageSize(size);
    setPage(0);
  };

  const handlePageClick = (data) => {
    const selectedPage = Math.max(0, Math.min(data.selected, totalPages - 1)); // Ensure selectedPage is within range
    setPage(selectedPage);
    localStorage.setItem("receivedInvitations", selectedPage); // Store the page number in localStorage
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
      style={{
        minHeight: "80vh",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Table hover>
        <thead>
          <tr>
            <th>Admin Email</th>
            <th>Company Name</th>
            <th>mobileNumber</th>
            <th>Role</th>
            <th>Invitation Status</th>
            <th>Recevied At</th>
          </tr>
        </thead>
        <tbody>
          {invitations.length === 0 ? (
            <tr>
              <td colSpan="5">No invitations found.</td>
            </tr>
          ) : (
            invitations.map((invitation, index) => (
              <tr key={index}>
                <td>{invitation.invitedByEmail}</td>
                <td>{invitation.companyName}</td>
                <td>{invitation.mobileNumber}</td>
                <td>{invitation.role}</td>
                <td>
                  <InvitationStatus
                    initialStatus={invitation.invitationStatus}
                    onChangeStatus={(newStatus) =>
                      handleStatusChange(newStatus, index)
                    }
                  />
                </td>
                <td>{invitation.createdAt || "Pending"}</td>
              </tr>
            ))
          )}
        </tbody>
      </Table>
      {invitations.length > 0 && totalPages > 0 && (
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
  );
};

export default RecivedInvitationFromAdmin;
