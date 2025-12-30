import { debounce } from "lodash";
import { useEffect, useState } from "react";
import { Button, Table } from "react-bootstrap";
import { FaEnvelope, FaEye } from "react-icons/fa";
import { IoChatbubbles } from "react-icons/io5";
import { useNavigate } from "react-router-dom";
import signerApi from "../../../api/signerapi";
import Pagination from "../../../components/Pagination";
import SearchBar from "../SearchBar";

const PendingDocs = () => {
  const [docs, setDocs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchTerm, setSearchTerm] = useState(""); // Track the last submitted search term
  const [signers, setSigners] = useState([]);
  const [senderEmailFromSender, setSenderEmailFromSender] = useState(null);
  const [documentId, setDocumentId] = useState(null); // Selected document ID

  const user = JSON.parse(localStorage.getItem("user"));
  const userEmail = user?.userEmail;
  const navigate = useNavigate();
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [sortedColumn, setSortedColumn] = useState(null);
  const [sortOrder, setSortOrder] = useState("asc");

  useEffect(() => {
    const fetchPendingDocs = async (query) => {
      setLoading(true);
      try {
        let response;
        if (query && query.trim() !== "") {
          response = await signerApi.getSearchPendingDocumentsByEmail(
            userEmail,
            query,
            page,
            pageSize,
            sortedColumn,
            sortOrder
          );
        } else {
          response = await signerApi.getDocumentsByEmail(
            userEmail,
            page,
            pageSize,
            sortedColumn,
            sortOrder
          );
        }
        const docs = response?.data?.content;
        setDocs(Array.isArray(docs) ? docs : []);
        setTotalPages(response.data.totalPages || 0);
      } catch (error) {
        console.error("Failed to fetch documents:", error);
        setDocs([]);
        setTotalPages(0);
      } finally {
        setLoading(false);
      }
    };

    const debouncedFetch = debounce(fetchPendingDocs, 300);
    debouncedFetch(searchQuery);

    return () => {
      debouncedFetch.cancel();
    };
  }, [
    userEmail,
    searchTerm,
    searchQuery,
    page,
    pageSize,
    sortedColumn,
    sortOrder,
  ]);

  // Fetch signers details when documentId is selected
  useEffect(() => {
    if (documentId) {
      signerApi
        .getDetailsOfSignersById(documentId)
        .then((response) => {
          console.log("Signers data:", response.data);
          setSigners(response.data);

          // Extract senderEmail from the first signer
          if (
            response.data &&
            response.data.length > 0 &&
            response.data[0].senderEmail
          ) {
            setSenderEmailFromSender(response.data[0].senderEmail);
          } else {
            console.error("senderEmail not found in signers");
          }

          setLoading(false);
        })
        .catch((err) => {
          console.error("Error fetching reviewers:", err);
          setLoading(false);
        });
    }
  }, [documentId]); // Trigger whenever documentId changes

  const handleSearch = () => {
    setSearchTerm(searchQuery.trim()); // Set searchTerm to trigger search
  };

  const handleChatHubClick = (documentId, documentName) => {
    navigate("/dashboard/chat-app-signers", {
      state: {
        documentId,
        documentName,
        chatType: "document",
      },
    });
  };

  const handleView = (documentId, documentName, signedFile, fromTab) => {
    if (!documentId || !documentName || !userEmail) return;
    localStorage.setItem("docsActiveTab", fromTab);
    navigate("/dashboard/my-docs/view", {
      state: {
        documentId,
        documentName,
        userEmail,
        signedFile,
        fromTab,
      },
    });
  };

  const handleEmail = (signer) => {
    console.log("Emailing for", signer.email);
  };

  const handleDownload = (doc) => {
    const documentName = doc?.documentName || doc?.document?.documentName;
    const signedFile = doc?.signedFile;
    const originalFile = doc?.file || doc?.document?.file;
    const signStatus = doc?.signStatus;

    let base64File;
    if (signStatus === "completed" && signedFile) {
      base64File = signedFile;
    } else if (originalFile) {
      base64File = originalFile;
    } else {
      alert("No file available to download.");
      return;
    }

    let downloadBlob;
    if (base64File instanceof Blob) {
      downloadBlob = base64File;
    } else if (typeof base64File === "string") {
      if (base64File.startsWith("data:application/pdf;base64,")) {
        base64File = base64File.split(",")[1];
      }
      try {
        const byteCharacters = atob(base64File);
        const byteArrays = [];
        const sliceSize = 512;

        for (
          let offset = 0;
          offset < byteCharacters.length;
          offset += sliceSize
        ) {
          const slice = byteCharacters.slice(offset, offset + sliceSize);
          const byteNumbers = new Array(slice.length);
          for (let i = 0; i < slice.length; i++) {
            byteNumbers[i] = slice.charCodeAt(i);
          }
          byteArrays.push(new Uint8Array(byteNumbers));
        }

        downloadBlob = new Blob(byteArrays, { type: "application/pdf" });
      } catch (error) {
        console.error("Error decoding file:", error);
        alert("Invalid file format. Cannot download.");
        return;
      }
    } else {
      alert("Unsupported file format.");
      return;
    }

    const suffix =
      signStatus === "completed" && signedFile ? "_signed" : "_original";
    const fileName =
      (documentName || "document").replace(/\s+/g, "_") + suffix + ".pdf";

    const url = URL.createObjectURL(downloadBlob);
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName;

    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    URL.revokeObjectURL(url);
  };

  if (loading) return <p>Loading pending Docs...</p>;
  const handlePageSizeChange = (e) => {
    const size = parseInt(e.target.value);
    setPageSize(size);
    setPage(0);
  };

  const handlePageClick = (data) => {
    const selectedPage = Math.max(0, Math.min(data.selected, totalPages - 1)); // Ensure selectedPage is within range
    setPage(selectedPage);
    localStorage.setItem("pendingDocs", selectedPage); // Store the page number in localStorage
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
            placeholder="Search pending Docs..."
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            onSearch={handleSearch}
          />
        </div>
      </div>
      <Table hover>
        <thead>
          <tr>
            <th>#Id</th>
            <th>Document Name</th>
            <th>Date Created</th>
            <th>Signed On</th>
            <th>Sign Status</th>
            <th>Chat</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {docs.length === 0 ? (
            <tr>
              <td colSpan="5">No documents found.</td>
            </tr>
          ) : (
            docs.map((doc, index) => {
              const documentName =
                doc?.documentName || doc?.document?.documentName;
              const createdDate =
                doc?.createdDate || doc?.document?.createdDate;
              const signedAt =
                doc?.signedAt ?? doc?.signedAt ?? "Not signed yet";
              const signStatus = doc?.signStatus;

              return (
                <tr key={index}>
                  <td>{doc.documentId}</td>
                  <td>{documentName || "N/A"}</td>
                  <td>{createdDate || "N/A"}</td>
                  <td>{signedAt || "Not signed yet"}</td>
                  <td>{signStatus || "pending"}</td>
                  <td>
                    <Button
                      variant="secondary"
                      onClick={() =>
                        handleChatHubClick(doc.documentId, documentName)
                      }
                      title="Chat"
                    >
                      <IoChatbubbles />
                    </Button>
                  </td>
                  <td>
                    <div style={{ display: "flex", gap: "8px" }}>
                      <Button
                        variant="primary"
                        size="sm"
                        className="me-2"
                        onClick={() =>
                          handleView(
                            doc.documentId,
                            doc.documentName,
                            doc.signedFile,
                            "pending"
                          )
                        }
                        title="View"
                      >
                        <FaEye />
                      </Button>
                      <Button
                        variant="warning"
                        size="sm"
                        className="me-2"
                        onClick={() => handleEmail(doc)}
                        title="Email"
                      >
                        <FaEnvelope />
                      </Button>
                    </div>
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </Table>
      <div style={{ marginTop: "auto" }}>
        {docs.length > 0 && totalPages > 0 && (
          <Pagination
            page={page}
            pageSize={pageSize}
            totalPages={totalPages}
            handlePageSizeChange={handlePageSizeChange}
            handlePageClick={handlePageClick}
          />
        )}
      </div>
    </div>
  );
};

export default PendingDocs;
