import { useEffect, useState } from "react";
import { Button, Table } from "react-bootstrap";
import { IoChatbubbles } from "react-icons/io5";
import { useNavigate } from "react-router-dom";
import reviewerApi from "../../../api/reviewerApi";

const ReviewdConsents = () => {
  const navigate = useNavigate();
  const [reviewedDocs, setReviewedDocs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const user = JSON.parse(localStorage.getItem("user"));
  const reviewerEmail = user?.userEmail;

  useEffect(() => {
    const fetchreviewedDocs = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await reviewerApi.getRevieweDocsByEmail(reviewerEmail);
        setReviewedDocs(Array.isArray(response.data) ? response.data : []);
      } catch (err) {
        setError("Failed to fetch unreviewed documents");
      } finally {
        setLoading(false);
      }
    };

    fetchreviewedDocs();
  }, [reviewerEmail]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  // const handleReviewClick = async (
  //   documentId,
  //   documentName,
  //   senderEmail,
  //   companyName,
  //   editedFile
  // ) => {
  //   try {
  //     navigate(
  //       `/dashboard/review-documents/review-file?documentName=${documentName}&documentId=${documentId}&senderEmail=${senderEmail}&companyName=${
  //         companyName || ""
  //       }`,
  //       { state: { editedFile } }
  //     );
  //   } catch (error) {
  //     setError("Failed to fetch document content");
  //   }
  // };
  const handleChatHubClick = (documentId, documentName) => {
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
      <h2>Reviewed Documents</h2>
      <Table striped bordered hover>
        <thead>
          <tr>
            <th>Document Name</th>
            <th>Company Name</th>
            <th>Sender</th>
            <th>Approved at</th>
            {/* <th>Actions</th> */}
            <th>Chat</th>
          </tr>
        </thead>
        <tbody>
          {reviewedDocs.length > 0 ? (
            reviewedDocs.map((doc, index) => (
              <tr key={index}>
                <td>{doc.documentName}</td>
                <td>{doc.companyName || "N/A"}</td>
                <td>{doc.senderEmail}</td>
                <td>{doc.approvedAt}</td>
                <td>
                  <Button
                    variant="secondary"
                    onClick={() =>
                      handleChatHubClick(doc.documentId, doc.documentName)
                    }
                    title="Chat"
                  >
                    <IoChatbubbles />
                  </Button>
                </td>
                {/* <td>
                  <Button
                    variant="primary"
                    onClick={() =>
                      handleReviewClick(
                        doc.documentId,
                        doc.documentName,
                        doc.senderEmail,
                        doc.companyName,
                        doc.editedFile
                      )
                    }
                  >
                    <VscPreview />
                  </Button>
                </td> */}
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

export default ReviewdConsents;
