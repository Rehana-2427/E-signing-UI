import { useEffect, useState } from "react";
import { Button, OverlayTrigger, Table, Tooltip } from "react-bootstrap";
import { FaCheckCircle } from "react-icons/fa";
import { ImCross } from "react-icons/im";
import recivedCollabsApi from "../../../api/recivedCollabsApi";

const RecivedCollaborations = () => {
  const email = JSON.parse(localStorage.getItem("user"))?.userEmail;
  const [loading, setLoading] = useState(true);
  const [collaborations, setCollaborations] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (email) {
      // Fetch collaborations based on the user's email
      recivedCollabsApi
        .getRecievedCollabs(email)
        .then((response) => {
          const data = response.data.map((collab) => ({
            collaborationId: collab.collaborationId,
            collaborationName: collab.collaborationName,
            costChargedTo: collab.costChargedTo,
            companyName: collab.companyName,
            personName: collab.personName,
            deadline: collab.deadline,
            collaborationCharge: collab.collaborationCharge,
            contributors: collab.contributors.map((contributor) => ({
              name: contributor.name,
              role: contributor.role,
            })),
          }));
          setCollaborations(data);
          setLoading(false);
        })
        .catch((err) => {
          setError("Error fetching collaborations");
          setLoading(false);
        });
    }
  }, [email]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  if (collaborations.length === 0) {
    return <div>No collaborations received</div>;
  }

  return (
    <>
      <br />
      <p>Details of recived collabrations</p>
      <Table striped bordered hover>
        <thead>
          <tr>
            <th>Collaboration ID</th>
            <th>Collaboration Name</th>
            <th>Cost Charged To</th>
            <th>Company/Person Name</th>
            <th>Deadline</th>
            <th>Collaboration Charge</th>
            <th>Role</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {collaborations.map((collab) => (
            <tr key={collab.collaborationId}>
              <td>{collab.collaborationId}</td>
              <td>{collab.collaborationName}</td>
              <td>{collab.costChargedTo}</td>
              <td>{collab.companyName || collab.personName}</td>
              <td>{collab.deadline}</td>
              <td>{collab.collaborationCharge}</td>
              <td>
                {collab.contributors.map((contributor, index) => (
                  <div key={index}>{contributor.role}</div>
                ))}
              </td>
              <td>
                <OverlayTrigger
                  placement="top"
                  overlay={
                    <Tooltip id="accept-tooltip">Accept Collaboration</Tooltip>
                  }
                >
                  <Button variant="primary" size="sm">
                    <FaCheckCircle className="me-2" /> 
                  </Button>
                </OverlayTrigger>{" "}
                <OverlayTrigger
                  placement="top"
                  overlay={
                    <Tooltip id="decline-tooltip">
                      Decline Collaboration
                    </Tooltip>
                  }
                >
                  <Button variant="danger" size="sm">
                    <ImCross className="me-2" /> 
                  </Button>
                </OverlayTrigger>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </>
  );
};

export default RecivedCollaborations;
