import { useEffect, useState } from "react";
import { Button, Table } from "react-bootstrap";
import { RiGroupFill } from "react-icons/ri";
import collaborationApi from "../../../api/collaborationApi";
import Contributors from "./Contributors"; // Import Contributors component

const CollaborationList = () => {
  const [collaborations, setCollaborations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCollab, setSelectedCollab] = useState(null); // State to store selected collaboration
  const userEmail = JSON.parse(localStorage.getItem("user"))?.userEmail;

  useEffect(() => {
    if (userEmail) {
      // Fetch collaborations based on the user's email
      collaborationApi
        .getCollabInfoByEmail(userEmail)
        .then((response) => {
          const data = response.data.map((collab) => ({
            collabId: collab.id,
            collaborationName: collab.collaborationName,
            createdOn: collab.createdOn,
            deadline: collab.deadline,
            // collaborationDuration: collab.collaborationDuration,
            // cost: collab.cost,
            // costChargedTo: collab.costChargedTo,
            forCompany: collab.forCompany,
            companyName: collab.companyName,
            forPerson: collab.forPerson,
            personName: collab.personName,
            status: collab.status,
          }));
          setCollaborations(data);
          setLoading(false);
        })
        .catch((err) => {
          setError("Failed to load collaborations.");
          setLoading(false);
        });
    }
  }, [userEmail]);

  const handleContributorsClick = (collabId, collaborationName) => {
    setSelectedCollab({ collabId, collaborationName }); // Update selected collaboration
  };

  const handleBackClick = () => {
    setSelectedCollab(null); // Go back to collaboration list
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <>
      <br />
      <p>After saving all details you can see contributors list</p>
      {selectedCollab ? (
        <>
          <div className="d-flex justify-content-end align-items-end mt-2">
            <Button variant="secondary" onClick={handleBackClick}>
              Back to Collaboration List
            </Button>
          </div>
          <Contributors
            collabId={selectedCollab.collabId}
            collaborationName={selectedCollab.collaborationName}
          />
        </>
      ) : (
        <>
          <br />
          <Table striped bordered hover>
            <thead>
              <tr>
                <th>#</th>
                <th>Collaboration Name</th>
                <th>Created On</th>
                {/* <th>Duration</th>
                <th>Max Charge</th> */}
                <th>Company</th>
                <th>Person</th>
                <th>status</th>
                <th>Contributors</th>
              </tr>
            </thead>
            <tbody>
              {collaborations.map((collab, index) => (
                <tr key={collab.collabId}>
                  <td>{index + 1}</td>
                  <td>{collab.collaborationName}</td>
                  <td>{collab.createdOn}</td>
                  <td>{collab.forCompany ? collab.companyName : "-"}</td>

                  {/* Person Column */}
                  <td>{collab.forPerson ? collab.personName : "-"}</td>
                  {/* <td>{collab.collaborationDuration}</td>
                  <td>{collab.cost} credits</td> */}
                  {/* <td>{collab.costChargedTo}</td> */}
                  <td>
                    {collab.status ? (
                      <span style={{ color: "green" }}>Active</span>
                    ) : (
                      <span style={{ color: "red" }}>Inactive</span>
                    )}
                  </td>
                  <td>
                    <Button
                      variant="outline-primary"
                      size="sm"
                      onClick={() =>
                        handleContributorsClick(
                          collab.collabId,
                          collab.collaborationName
                        )
                      }
                    >
                      <RiGroupFill />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </>
      )}
    </>
  );
};

export default CollaborationList;
