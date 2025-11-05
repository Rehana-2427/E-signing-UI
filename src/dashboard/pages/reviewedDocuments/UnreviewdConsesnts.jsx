import { useEffect, useState } from "react";
import { Button, Table } from "react-bootstrap";
import { VscPreview } from "react-icons/vsc";
import { useNavigate } from "react-router-dom";
import reviewerApi from "../../../api/reviewerApi";

const UnreviewdConsesnts = () => {
  const navigate = useNavigate();
  const [unreviewedDocs, setUnreviewedDocs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const user = JSON.parse(localStorage.getItem("user"));
  const reviewerEmail = user?.userEmail;

  useEffect(() => {
    const fetchUnreviewedDocs = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await reviewerApi.getUnRevieweDocsByEmail(
          reviewerEmail
        );
        setUnreviewedDocs(Array.isArray(response.data) ? response.data : []);
      } catch (err) {
        setError("Failed to fetch unreviewed documents");
      } finally {
        setLoading(false);
      }
    };

    fetchUnreviewedDocs();
  }, [reviewerEmail]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  const handleReviewClick = async (
    documentName,
    documentId,
    senderEmail,
    companyName,
    editedFile
  ) => {
    try {
      navigate(
        `/dashboard/review-documents/review-file?documentName=${documentName}&documentId=${documentId}&senderEmail=${senderEmail}&companyName=${
          companyName || ""
        }`,
        { state: { editedFile } }
      );
    } catch (error) {
      setError("Failed to fetch document content");
    }
  };

  return (
    <div>
      <h2>Unreviewed Documents</h2>
      <Table striped bordered hover>
        <thead>
          <tr>
            <th>Document Name</th>
            <th>Company Name</th>
            <th>Sender</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {unreviewedDocs.length > 0 ? (
            unreviewedDocs.map((doc, index) => (
              <tr key={index}>
                <td>{doc.documentName}</td>
                <td>{doc.companyName || "N/A"}</td>
                <td>{doc.senderEmail}</td>
                <td>
                  <Button
                    variant="primary"
                    onClick={() =>
                      handleReviewClick(
                        doc.documentName,
                        doc.documentId,
                        doc.senderEmail,
                        doc.companyName,
                        doc.editedFile
                      )
                    }
                  >
                    <VscPreview />
                  </Button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="5">No unreviewed documents available</td>
            </tr>
          )}
        </tbody>
      </Table>
    </div>
  );
};

export default UnreviewdConsesnts;
