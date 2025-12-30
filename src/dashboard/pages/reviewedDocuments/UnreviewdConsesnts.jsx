import { useEffect, useState } from "react";
import { Button, Table } from "react-bootstrap";
import { IoChatbubbles } from "react-icons/io5";
import { VscPreview } from "react-icons/vsc";
import { useNavigate } from "react-router-dom";
import reviewerApi from "../../../api/reviewerApi";
import Pagination from "../../../components/Pagination";

const UnreviewdConsesnts = () => {
  const navigate = useNavigate();
  const [unreviewedDocs, setUnreviewedDocs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const user = JSON.parse(localStorage.getItem("user"));
  const reviewerEmail = user?.userEmail;
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [sortedColumn, setSortedColumn] = useState(null);
  const [sortOrder, setSortOrder] = useState("asc");

  useEffect(() => {
    const fetchUnreviewedDocs = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await reviewerApi.getUnRevieweDocsByEmail(
          reviewerEmail,
          page,
          pageSize,
          sortedColumn,
          sortOrder
        );
        const content = response?.data?.content;
        setUnreviewedDocs(Array.isArray(content) ? content : []);
        setTotalPages(response.data.totalPages || 0);
      } catch (err) {
        setError("Failed to fetch unreviewed documents");
        setTotalPages(0);
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
  const handleChatHubClick = (documentId, documentName) => {
    navigate("/dashboard/chat-app-reviewers", {
      state: {
        documentId,
        documentName,
        chatType: "document",
      },
    });
  };
  const handlePageSizeChange = (e) => {
    const size = parseInt(e.target.value);
    setPageSize(size);
    setPage(0);
  };

  const handlePageClick = (data) => {
    const selectedPage = Math.max(0, Math.min(data.selected, totalPages - 1)); // Ensure selectedPage is within range
    setPage(selectedPage);
    localStorage.setItem("unreviewedDocs", selectedPage); // Store the page number in localStorage
  };

  const handleSort = (column) => {
    if (sortedColumn === column) {
      // Toggle sort order if the same column is clicked
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      // Sort by the new column (default to ascending)
      setSortedColumn(column);
      setSortOrder("asc");
    }
  };
  return (
    <div
      style={{
        minHeight: "80vh",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <h2>Unreviewed Documents</h2>
      <Table striped bordered hover>
        <thead>
          <tr>
            <th>Document Name</th>
            <th>Company Name</th>
            <th>Sender</th>
            <th>Actions</th>
            <th>chat</th>
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
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="5">No unreviewed documents available</td>
            </tr>
          )}
        </tbody>
      </Table>
      {unreviewedDocs.length > 0 && totalPages > 0 && (
        <div style={{ marginTop: "auto" }}>
          <Pagination
            page={page}
            pageSize={pageSize}
            totalPages={totalPages}
            handlePageSizeChange={handlePageSizeChange}
            handlePageClick={handlePageClick}
          />
        </div>
      )}
    </div>
  );
};

export default UnreviewdConsesnts;
