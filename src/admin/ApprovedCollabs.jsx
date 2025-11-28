import { useEffect, useState } from "react";
import { Table } from "react-bootstrap";
import collaborationApi from "../api/collaborationApi";

const ApprovedCollabs = () => {
  const [collaborations, setCollaborations] = useState([]);

  // Function to fetch collaborations
  useEffect(() => {
    const fetchCollaborations = async () => {
      try {
        const response = await collaborationApi.getApprovedCollabs();
        setCollaborations(response.data);
      } catch (error) {
        console.error("Error fetching collaborations:", error);
      }
    };

    fetchCollaborations();
  }, []);

  return (
    <>
      <h2 className="mt-3">Approved Collaborations</h2>
      {collaborations.length === 0 ? (
        <p>No collaborations to display.</p>
      ) : (
        <Table striped bordered hover className="mt-3">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Company Name</th>
              <th>Person Name</th>
              <th>Created By</th>
              <th>Created On</th>
              <th>UpdatedAt</th>
              <th>Deadline</th>
              <th>Request Time</th>
              <th>Request Credits</th>
              <th>Total Duration</th>
              <th>Total Credits</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {collaborations.map((collab) => (
              <tr key={collab.id}>
                <td>{collab.id}</td>
                <td>{collab.collaborationName}</td>
                <td>{collab.companyName || "N/A"}</td>
                <td>{collab.personName || "N/A"}</td>
                <td>{collab.createdBy}</td>
                <td>{collab.createdOn}</td>
                <td>{collab.updateAt}</td>
                <td>{collab.deadline}</td>
                <td>{collab.extraTime}</td>
                <td>{collab.extraCharge}</td>
                <td>{collab.collaborationDuration}</td>
                <td>{collab.cost}</td>
                <td style={{ color: collab.status ? "green" : "red" }}>
                  {collab.status ? "Writable" : "Readable"}
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </>
  );
};

export default ApprovedCollabs;
