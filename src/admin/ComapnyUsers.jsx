import { useEffect, useState } from "react";
import { Alert, Spinner, Table } from "react-bootstrap";
import { useLocation } from "react-router-dom";
import companyUserApi from "../api/companyUsers";

const CompanyUsers = () => {
  const location = useLocation();
  const { companyName } = location.state || {};

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ✅ Fetch users by company name
  useEffect(() => {
    const fetchUsers = async () => {
      if (!companyName) return;
      try {
        const response = await companyUserApi.getUsersByCompanyName(companyName);
        setUsers(response.data);
      } catch (err) {
        console.error("Error fetching company users:", err);
        setError("Failed to load users. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [companyName]);

  return (
    <div className="container mt-4">
      <h2 className="mb-3">
        User details of Company:{" "}
        <strong>{companyName || "Not Provided"}</strong>
      </h2>

      {/* ✅ Loading Spinner */}
      {loading && (
        <div className="text-center mt-4">
          <Spinner animation="border" role="status" variant="primary">
            <span className="visually-hidden">Loading...</span>
          </Spinner>
        </div>
      )}

      {/* ✅ Error Message */}
      {!loading && error && (
        <Alert variant="danger" className="mt-3">
          {error}
        </Alert>
      )}

      {/* ✅ No Data */}
      {!loading && !error && users.length === 0 && (
        <Alert variant="info" className="mt-3">
          No accepted users found for this company.
        </Alert>
      )}

      {/* ✅ Users Table */}
      {!loading && users.length > 0 && (
        <Table striped bordered hover responsive className="mt-3">
          <thead>
            <tr>
              <th>User Email</th>
              <th>Mobile Number</th>
              <th>Role</th>
              <th>Invited By</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user, index) => (
              <tr key={user.id}>
                <td>{user.userEmail}</td>
                <td>{user.mobileNumber}</td>
                <td>{user.role}</td>
                <td>{user.invitedByEmail}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </div>
  );
};

export default CompanyUsers;
