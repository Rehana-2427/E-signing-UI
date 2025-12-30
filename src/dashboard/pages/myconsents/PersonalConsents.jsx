import { debounce } from "lodash";
import { useEffect, useState } from "react";
import { Button, OverlayTrigger, Table, Tooltip } from "react-bootstrap";
import { AiOutlineClockCircle, AiOutlineSend } from "react-icons/ai";
import { CgDetailsMore } from "react-icons/cg";
import { FaRegPaperPlane } from "react-icons/fa";
import { HiDocumentReport } from "react-icons/hi";
import { MdDelete } from "react-icons/md";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import documentApi from "../../../api/documentapi";
import Pagination from "../../../components/Pagination";
import ReminderModal from "../ReminderModal";
import SearchBar from "../SearchBar";

const PersonalConsents = () => {
  const navigate = useNavigate();
  const [consents, setConsents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchTerm, setSearchTerm] = useState(""); // track the last submitted search
  const user = JSON.parse(localStorage.getItem("user"));
  const senderEmail = user?.userEmail;
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [sortedColumn, setSortedColumn] = useState(null);
  const [sortOrder, setSortOrder] = useState("asc");
  useEffect(() => {
    const fetchConsents = async (query) => {
      setLoading(true);
      try {
        let response;
        if (searchTerm.trim() !== "") {
          response = await documentApi.getSearchSentConsensts(
            senderEmail,
            searchTerm,
            page,
            pageSize,
            sortedColumn,
            sortOrder
          );
        } else {
          response = await documentApi.getPersonalConsents(
            senderEmail,
            page,
            pageSize,
            sortedColumn,
            sortOrder
          );
        }
        const content = response?.data?.content;

        setConsents(Array.isArray(content) ? content : []);
        setTotalPages(response.data.totalPages || 0);
      } catch (error) {
        console.error("Failed to fetch consents:", error);
        setConsents([]);
        setTotalPages(0);
      } finally {
        setLoading(false);
      }
    };

    const debouncedFetch = debounce(fetchConsents, 300);

    debouncedFetch(searchQuery);

    return () => {
      debouncedFetch.cancel();
    };
  }, [senderEmail, searchTerm, page, pageSize, sortedColumn, sortOrder]);

  const handleEmailClick = (doc) => {
    setSelectedDoc(doc);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedDoc(null);
  };

  const handleSendReminder = (docId) => {
    console.log("Sending email reminder for document:", docId);
    setShowModal(false);
  };
  const handleSearch = () => {
    setSearchTerm(searchQuery.trim()); // set searchTerm to trigger search
  };
  const handleChat = (documentId, documentName) => {
    // if (!documentId) {
    //   Swal.fire("Error", "Document ID is missing.", "error");
    //   return;
    // }

    //   navigate("/dashboard/chat-app", {
    //     state: { documentId, documentName,chatType: "document" },
    //   });
    // };

    alert("Under development");
  };
  const handleSendToSigners = async (documentId) => {
    try {
      const response = await documentApi.sendToSigners(documentId);
      Swal.fire("Success", response.data, "success");

      // Update the document status in local state without refetching all
      setConsents((prev) =>
        prev.map((doc) =>
          doc.documentId === documentId
            ? { ...doc, documentStatus: "SENT_TO_SIGNERS" }
            : doc
        )
      );
    } catch (error) {
      Swal.fire(
        "Error",
        error.response?.data || "Failed to send document to signers.",
        "error"
      );
    }
  };

  const handleTask = (documentId, documentName) => {
    navigate(
      `/dashboard/my-consents/consent-object?documentId=${documentId}&documentName=${documentName}&tab=brief`
    );
  };
  const handlePageSizeChange = (e) => {
    const size = parseInt(e.target.value);
    setPageSize(size);
    setPage(0);
  };
  const handlePageClick = (data) => {
    const selectedPage = Math.max(0, Math.min(data.selected, totalPages - 1));
    setPage(selectedPage);
    localStorage.setItem("personal-consents", selectedPage);
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
      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          marginBottom: "1rem",
        }}
      >
        <div style={{ width: "250px" }}>
          <SearchBar
            placeholder="Search consents..."
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            onSearch={handleSearch} // pass handler here
          />
        </div>
      </div>

      <Table hover>
        <thead>
          <tr>
            <th>#id</th>
            <th
              onClick={() => handleSort("documentName")}
              style={{ cursor: "pointer" }}
            >
              Document Name
              <span>
                <span
                  style={{
                    color:
                      sortedColumn === "documentName" && sortOrder === "asc"
                        ? "black"
                        : "gray",
                  }}
                >
                  ↑
                </span>{" "}
                <span
                  style={{
                    color:
                      sortedColumn === "documentName" && sortOrder === "desc"
                        ? "black"
                        : "gray",
                  }}
                >
                  ↓
                </span>
              </span>
            </th>
            <th>Sent On</th>
            <th># of Reviewers count</th>
            <th># of signers count</th>
            {/* <th>Actions</th> */}
            {/* <th>Reviewer Status</th> */}
            <th>Document Status</th>
            {/* <th>Chat</th> */}
            <th>Actions</th>
            <th>Audit Trail</th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td colSpan="6">Loading consents...</td>
            </tr>
          ) : consents.length === 0 ? (
            <tr>
              <td colSpan="6">
                {searchQuery && searchQuery.trim() !== ""
                  ? "No results found."
                  : "No consents found."}
              </td>
            </tr>
          ) : (
            consents.map((consent) => (
              <tr key={consent.documentId}>
                <td>{consent.documentId}</td>
                <td>{consent.documentName}</td>
                <td>{consent.sentOn}</td>
                <td>
                  {consent.reviwercount} / {consent.totalReviwers}
                </td>

                <td>
                  {consent.signedCount} / {consent.totalSigners}
                </td>
                {/* <td>
                 
                   <Button
                     variant="success"
                     size="sm"
                     className="me-2"
                     title="Download"
                   >
                     <AiOutlineDownload />
                   </Button>
                   <Button
                     variant="info"
                     size="sm"
                     title="Email"
                     onClick={() => handleEmailClick(consent)}
                   >
                     <MdEmail />
                   </Button>
                 </td> */}
                {/* <td>{consent.reviewerStatus}</td> */}

                <td>
                  {/* IN_REVIEW */}
                  {consent.documentStatus === "IN_REVIEW" && (
                    <OverlayTrigger
                      placement="top"
                      overlay={
                        <Tooltip id={`tooltip-review-${consent.documentId}`}>
                          In Review
                        </Tooltip>
                      }
                    >
                      <span
                        style={{
                          color: "orange",
                          fontSize: "1.4rem",
                          cursor: "pointer",
                        }}
                      >
                        <AiOutlineClockCircle />
                      </span>
                    </OverlayTrigger>
                  )}

                  {/* READY TO SEND (REVIEW_COMPLETED) */}
                  {consent.documentStatus === "REVIEW_COMPLETED" && (
                    <OverlayTrigger
                      placement="top"
                      overlay={
                        <Tooltip id={`tooltip-send-${consent.documentId}`}>
                          Ready to Send
                        </Tooltip>
                      }
                    >
                      <Button
                        variant="outline-success"
                        size="sm"
                        onClick={() => handleSendToSigners(consent.documentId)}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "4px",
                        }}
                      >
                        <FaRegPaperPlane />
                        {/* <span style={{ fontSize: "0.85rem" }}>Send</span> */}
                      </Button>
                    </OverlayTrigger>
                  )}

                  {/* ALREADY SENT (SENT_TO_SIGNERS or NO REVIEWERS) */}
                  {consent.documentStatus === "SENT_TO_SIGNERS" && (
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                        color: "blue",
                      }}
                    >
                      <OverlayTrigger
                        placement="top"
                        overlay={
                          <Tooltip id={`tooltip-sent-${consent.documentId}`}>
                            Already Sent to Signers
                          </Tooltip>
                        }
                      >
                        <span
                          style={{
                            fontSize: "1.4rem",
                            cursor: "pointer",
                          }}
                        >
                          <AiOutlineSend />
                        </span>
                      </OverlayTrigger>
                      {/* <span style={{ fontSize: "0.9rem" }}>Already Sent</span> */}
                    </div>
                  )}
                </td>

                {/* <td>
                   <Button
                     variant="secondary"
                     onClick={() =>
                       handleChat(consent.documentId, consent.documentName)
                     }
                     title="Chat"
                   >
                     <IoChatbubbles />
                   </Button>
                 </td> */}

                <td>
                  <OverlayTrigger
                    placement="top"
                    overlay={<Tooltip id="tooltip-task">My Consent</Tooltip>}
                  >
                    <Button
                      variant="info"
                      onClick={() =>
                        handleTask(consent.documentId, consent.documentName)
                      }
                    >
                      <CgDetailsMore />
                    </Button>
                  </OverlayTrigger>
                  <OverlayTrigger
                    placement="top"
                    overlay={
                      <Tooltip id="tooltip-delete">Delete Consent</Tooltip>
                    }
                  >
                    <Button variant="danger" className="ms-2">
                      <MdDelete />
                    </Button>
                  </OverlayTrigger>
                </td>
                <td>
                  <Button
                    variant="dark"
                    onClick={() =>
                      navigate(
                        `/dashboard/my-consents/audit-trail?documentId=${consent.documentId}`
                      )
                    }
                  >
                    <HiDocumentReport />
                  </Button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </Table>

      {consents.length > 0 && totalPages > 0 && (
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

      <ReminderModal
        show={showModal}
        onClose={handleCloseModal}
        documentId={selectedDoc?.documentId}
        documentName={selectedDoc?.documentName}
        onSend={handleSendReminder}
      />
    </div>
  );
};

export default PersonalConsents;
