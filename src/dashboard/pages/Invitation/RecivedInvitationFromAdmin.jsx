import { useEffect, useState } from "react";
import { Table } from "react-bootstrap";
import companyUserApi from "../../../api/companyUsers";
import InvitationStatus from "./InvitationStatus"; // adjust the path if needed

const RecivedInvitationFromAdmin = () => {
  const [invitations, setInvitations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const user = JSON.parse(localStorage.getItem("user"));
  const userEmail = user?.userEmail;

  useEffect(() => {
    if (!userEmail) {
      setError("User email not found in localStorage.");
      setLoading(false);
      return;
    }

    const fetchInvitations = async () => {
      try {
        const response = await companyUserApi.getListofRecievedInvitations(
          userEmail
        );
        setInvitations(response.data);
      } catch (err) {
        setError("Failed to fetch invitations.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchInvitations();
  }, [userEmail]);

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

  return (
    <div>
      <Table hover>
        <thead>
          <tr>
            <th>Admin Email</th>
            <th>Company Name</th>
            <th>Role</th>
            <th>Invitation Status</th>
            <th>Recevied At</th>
          </tr>
        </thead>
        <tbody>
          {invitations.length === 0 ? (
            <tr>
              <td colSpan="5" style={{ textAlign: "center" }}>
                No invitations found.
              </td>
            </tr>
          ) : (
            invitations.map((invitation, index) => (
              <tr key={index}>
                <td>{invitation.invitedByEmail}</td>
                <td>{invitation.companyName}</td>
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
    </div>
  );
};

export default RecivedInvitationFromAdmin;
