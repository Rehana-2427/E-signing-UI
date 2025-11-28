import { useEffect, useState } from "react";
import { Button, Spinner } from "react-bootstrap";
import collaborationApi from "../../../api/collaborationApi";

const CollabBrief = ({ collabId, collaborationName }) => {
  const [collabDetails, setCollabDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCollabBrief = async () => {
      try {
        const response = await collaborationApi.getCollaBriefById(collabId);
        setCollabDetails(response.data);
      } catch (err) {
        setError("Failed to fetch collaboration details.");
        console.error("Error fetching collab brief:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchCollabBrief();
  }, [collabId]);

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center">
        <Spinner animation="border" />
      </div>
    );
  }

  if (error) {
    return <div className="text-center text-danger">{error}</div>;
  }

  if (!collabDetails) {
    return <div>No collaboration details found.</div>;
  }

  return (
    <>
      <br />
      <div className="d-flex align-items-center justify-content-between">
        <h5 className="mb-0"><strong>Details of {collaborationName}</strong></h5>
        <Button
          variant={collabDetails.status ? "success" : "danger"} 
          style={{
            marginBottom: 0,
            fontWeight: "bold",
          }}
        >
          {collabDetails.status ? "Active - writable" : "Active - read only"}
        </Button>
      </div>
      <br />{" "}

      {collabDetails.forCompany && (
        <p>
          <strong>For Company:</strong> {collabDetails.companyName}
        </p>
      )}
      {/* For Person */}
      {collabDetails.forPerson && (
        <p>
          <strong>For Person:</strong> {collabDetails.personName}
        </p>
      )}
      <p>
        <strong>Created On:</strong>{" "}
        {new Date(collabDetails.createdOn).toLocaleDateString()}
      </p>
      <p>
        <strong>Deadline:</strong>{" "}
        {new Date(collabDetails.deadline).toLocaleDateString()}
      </p>
      <p>
        <strong>Base Collaboration Credits:</strong>{" "}
        {collabDetails.baseCollabCredits}
      </p>
      <p>
        <strong>Cost:</strong> ${collabDetails.cost.toFixed(2)}
      </p>
      <p>
        <strong>Duration:</strong> {collabDetails.collaborationDuration} days
      </p>
      <p>
        <strong>Cost Charged To:</strong> {collabDetails.costChargedTo}
      </p>
      <p>
        <strong>Collaboration Charge:</strong> $
        {collabDetails.collaborationCharge.toFixed(2)}
      </p>
    </>
  );
};

export default CollabBrief;
