import { useEffect, useState } from "react";
import { Button, Spinner, Table } from "react-bootstrap";
import { BsWechat } from "react-icons/bs";
import { useNavigate } from "react-router-dom";
import reviewerApi from "../../../api/reviewerApi";

const Reviwers = ({ documentId, documentName }) => {
  const [reviewers, setReviewers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const [senderEmailFromReviewer, setSenderEmailFromReviewwer] = useState();
  useEffect(() => {
    if (documentId) {
      reviewerApi
        .getDetailsOfReviewerById(documentId)
        .then((response) => {
          console.log("Reviewers data:", response.data);
          setReviewers(response.data);
          if (
            response.data &&
            response.data.length > 0 &&
            response.data[0].senderEmail
          ) {
            setSenderEmailFromReviewwer(response.data[0].senderEmail);
          } else {
            console.error("senderEmail not found in signers");
          }

          setLoading(false);
        })
        .catch((err) => {
          setError("Failed to fetch reviewer details.");
          console.error("Error fetching reviewers:", err);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [documentId]);

  console.log(documentId, documentName, reviewers, senderEmailFromReviewer);

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

  if (!reviewers.length) {
    return <div>No reviewers found for this document.</div>;
  }
  const handleChatHubClick = () => {
    navigate("/dashboard/chat-app-reviewers", {
      state: {
        documentId,
        documentName,
        chatType: "document",
      },
    });
  };
  return (
    <div>
      <br />
      <div className="d-flex justify-content-between align-items-center">
        <h4>
          <strong>Details of Contributors</strong>
        </h4>
        <Button variant="secondary" onClick={handleChatHubClick}>
          <BsWechat /> Chat Hub
        </Button>
      </div>
      <Table striped bordered hover className="mt-4">
        <thead>
          <tr>
            <th>Email</th>
            <th>Approved</th>
            <th>Approved At</th>
          </tr>
        </thead>
        <tbody>
          {reviewers.map((reviewer, index) => (
            <tr key={index}>
              <td>{reviewer.email}</td>
              <td>{reviewer.approved ? "Yes" : "No"}</td>
              <td>{reviewer.approvedAt ? reviewer.approvedAt : "N/A"}</td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
};

export default Reviwers;
