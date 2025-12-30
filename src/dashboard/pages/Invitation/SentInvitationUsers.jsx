import { useEffect, useState } from "react";
import { Table } from "react-bootstrap";
import companyUserApi from "../../../api/companyUsers";
import Pagination from "../../../components/Pagination";

const SentInvitationUsers = () => {
  const [invitations, setInvitations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Get invitedByEmail from localStorage (assuming it's stored under 'userEmail')
  const user = JSON.parse(localStorage.getItem("user"));

  const invitedByEmail = user?.userEmail;
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [sortedColumn, setSortedColumn] = useState(null);
  const [sortOrder, setSortOrder] = useState("asc");

  useEffect(() => {
    if (!invitedByEmail) {
      setError("User email not found in localStorage.");
      setLoading(false);
      return;
    }

    const fetchInvitations = async () => {
      try {
        const response = await companyUserApi.getListOfSentInvitations(
          invitedByEmail,
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
        console.error(err);
        setInvitations([]);
        setTotalPages(0);
      } finally {
        setLoading(false);
      }
    };

    fetchInvitations();
  }, [invitedByEmail, page, pageSize, sortedColumn, sortOrder]);

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
    localStorage.setItem("sentInvitations", selectedPage); // Store the page number in localStorage
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
            <th>User Email</th>
            <th>Mobile Number</th>
            <th>Role</th>
            <th>Company Name</th>
            <th>Invitation Status</th>
            <th>Accepted At</th>
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
                <td>{invitation.userEmail}</td>
                <td>{invitation.mobileNumber}</td>
                <td>{invitation.companyName}</td>
                <td>{invitation.role}</td>
                <td>{invitation.invitationStatus}</td>
                <td>
                  {invitation.acceptedAt ? invitation.acceptedAt : "Pending"}
                </td>
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

export default SentInvitationUsers;
