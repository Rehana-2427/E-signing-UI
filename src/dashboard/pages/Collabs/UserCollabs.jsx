import { useEffect, useState } from "react";
import { Button, OverlayTrigger, Table, Tooltip } from "react-bootstrap";
import { CgGoogleTasks } from "react-icons/cg";
import { MdDelete } from "react-icons/md";
import { useNavigate } from "react-router-dom";
import collaborationApi from "../../../api/collaborationApi";

const UserCollabs = () => {
  const [collaborations, setCollaborations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCollab, setSelectedCollab] = useState(null);
  const userEmail = JSON.parse(localStorage.getItem("user"))?.userEmail;
  const navigate = useNavigate();

  useEffect(() => {
    if (userEmail) {
      collaborationApi
        .getCollabInfoByEmail(userEmail)
        .then((response) => {
          const data = response.data.map((collab) => ({
            collabId: collab.id,
            createdBy: collab.createdBy,
            collaborationName: collab.collaborationName,
            collaborationDuration: collab.collaborationDuration,
            cost: collab.cost,
            costChargedTo: collab.costChargedTo,
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
          // setError("Failed to load collaborations.");
          setLoading(false);
        });
    }
  }, [userEmail]);

  const handleBackClick = () => {
    setSelectedCollab(null);
  };

  const handleTask = (collabId, collaborationName) => {
    navigate(
      `/dashboard/my-collabs/collab-object?collabId=${collabId}&collaborationName=${collaborationName}&tab=brief`
    );
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
      {/* <p>After saving all details you can see contributors list</p> */}
      {selectedCollab ? (
        <>
          <div className="d-flex justify-content-end align-items-end mt-2">
            <Button variant="secondary" onClick={handleBackClick}>
              Back to Collaboration List
            </Button>
          </div>
          {/* <Contributors
            collabId={selectedCollab.collabId}
            collaborationName={selectedCollab.collaborationName}
          /> */}
        </>
      ) : (
        <>
          <br />
          {collaborations.length === 0 ? (
            <div>No collaborations added yet.</div>
          ) : (
            <Table striped bordered hover>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Collaboration Name</th>
                  <th>Created By</th>
                  <th>Company</th>
                  <th>Person</th>
                  <th>Duration</th>
                  <th>Max Charge</th>
                  <th>Charged To</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {collaborations.map((collab) => (
                  <tr key={collab.collabId}>
                    <td>{collab.collabId}</td>
                    <td>{collab.collaborationName}</td>
                    <td>
                      {userEmail === collab.createdBy
                        ? "You"
                        : collab.createdBy}
                    </td>
                    <td>{collab.forCompany ? collab.companyName : "-"}</td>
                    <td>{collab.forPerson ? collab.personName : "-"}</td>
                    <td>{collab.collaborationDuration}</td>
                    <td>{collab.cost} credits</td>
                    <td>{collab.costChargedTo}</td>
                    <td>
                      {collab.status ? (
                        <span style={{ color: "green" }}>Active</span>
                      ) : (
                        <span style={{ color: "red" }}>Inactive</span>
                      )}
                    </td>
                    <td>
                      <OverlayTrigger
                        placement="top"
                        overlay={
                          <Tooltip id="tooltip-task">CollabTask</Tooltip>
                        }
                      >
                        <Button
                          variant="info"
                          onClick={() =>
                            handleTask(
                              collab.collabId,
                              collab.collaborationName
                            )
                          }
                        >
                          <CgGoogleTasks />
                        </Button>
                      </OverlayTrigger>
                      <OverlayTrigger
                        placement="top"
                        overlay={
                          <Tooltip id="tooltip-delete">Delete Collab</Tooltip>
                        }
                      >
                        <Button variant="danger" className="ms-2">
                          <MdDelete />
                        </Button>
                      </OverlayTrigger>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </>
      )}
    </>
  );
};

export default UserCollabs;
