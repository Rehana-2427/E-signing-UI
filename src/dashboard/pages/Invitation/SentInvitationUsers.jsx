import { useEffect, useState } from "react";
import { Table } from "react-bootstrap";
import companyUserApi from "../../../api/companyUsers";

const SentInvitationUsers = () => {
  const [invitations, setInvitations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Get invitedByEmail from localStorage (assuming it's stored under 'userEmail')
  const user = JSON.parse(localStorage.getItem("user"));

  const invitedByEmail = user?.userEmail;

  useEffect(() => {
    if (!invitedByEmail) {
      setError("User email not found in localStorage.");
      setLoading(false);
      return;
    }

    const fetchInvitations = async () => {
      try {
        const response = await companyUserApi.getListOfSentInvitations(
          invitedByEmail
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
  }, [invitedByEmail]);

  if (loading) return <p>Loading invitations...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div>
    <Table hover>
        <thead>
          <tr>
            <th>User Email</th>
            <th>Company Name</th>
            <th>Role</th>
            <th>Invitation Status</th>
            <th>Accepted At</th>
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
                <td>{invitation.userEmail}</td>
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
    </div>
  );
};

export default SentInvitationUsers;
