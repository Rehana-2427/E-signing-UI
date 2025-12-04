import { useEffect, useState } from "react";
import { Button, OverlayTrigger, Table, Tooltip } from "react-bootstrap";
import { FcApprove } from "react-icons/fc";
import Swal from "sweetalert2"; // Import Swal for SweetAlert
import collaborationApi from "../api/collaborationApi";

const NotApprovedCollabs = () => {
  const [collaborations, setCollaborations] = useState([]);

  // Function to fetch collaborations
  useEffect(() => {
    const fetchCollaborations = async () => {
      try {
        const response = await collaborationApi.getCollabNotApproved();

        // Make sure it's an array
        const data = Array.isArray(response.data) ? response.data : [];
        setCollaborations(data);
      } catch (error) {
        console.error("Error fetching collaborations:", error);
        setCollaborations([]); // fallback
      }
    };

    fetchCollaborations();
  }, []);

  const handleApprove = async (
    collabId,
    collaborationName,
    extraCharge,
    extraTime,
    deadline
  ) => {
    try {
      const response = await collaborationApi.updateApproval(collabId);
      if (response.data) {
        setCollaborations((prevCollaborations) =>
          prevCollaborations.map((collab) =>
            collab.id === collabId ? { ...collab, isApproved: true } : collab
          )
        );
        console.log("Collaboration approved successfully!");

        // Trigger SweetAlert after success
        Swal.fire({
          icon: "success",
          title: "Approval Successful",
          text: `Approval successful for Collaboration: ${collaborationName} -  ${collabId})\nCredits: ${extraCharge} for ${extraTime} days\nNew Deadline: ${deadline}`,
          confirmButtonText: "OK",
        });
      }
    } catch (error) {
      console.error("Error approving collaboration:", error);
    }
  };

  return (
    <>
      <h2 className="mt-3">Not Approved Collaborations</h2>
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
              <th>Status</th>
              <th>Actions</th>
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
                <td style={{ color: collab.status ? "green" : "red" }}>
                  {collab.status ? "Writable" : "Readable"}
                </td>

                <td>
                  {/* Approve Button with Tooltip */}
                  <OverlayTrigger
                    placement="top"
                    overlay={
                      <Tooltip id={`approve-tooltip-${collab.id}`}>
                        Approve Collaboration
                      </Tooltip>
                    }
                  >
                    <Button
                      variant="secondary"
                      onClick={() =>
                        handleApprove(
                          collab.id,
                          collab.collaborationName,
                          collab.extraCharge,
                          collab.extraTime,
                          collab.deadline
                        )
                      }
                    >
                      <FcApprove />
                    </Button>
                  </OverlayTrigger>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </>
  );
};

export default NotApprovedCollabs;
