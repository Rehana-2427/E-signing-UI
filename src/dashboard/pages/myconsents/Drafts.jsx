import { useEffect, useState } from "react";
import { Button, Table } from "react-bootstrap";
import { AiOutlineDownload } from "react-icons/ai";
import { IoChatbubbles } from "react-icons/io5";
import { RiFileEditFill } from "react-icons/ri";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import documentApi from "../../../api/documentapi";
import SearchBar from "../SearchBar";
const Drafts = () => {
  const [consents, setConsents] = useState([]);
  const [loading, setLoading] = useState(true);
  const user = JSON.parse(localStorage.getItem("user"));
  const senderEmail = user?.userEmail;
  const [searchQuery, setSearchQuery] = useState("");
  const [searchTerm, setSearchTerm] = useState(""); // track the last submitted searc
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDrafts = async () => {
      setLoading(true);
      try {
        let response;
        if (searchTerm.trim() !== "") {
          response = await documentApi.getSearchDraftsConsensts(
            senderEmail,
            searchTerm
          );
        } else {
          response = await documentApi.getDrafts(senderEmail);
        }
        setConsents(response.data || []);
      } catch (error) {
        console.error("Failed to fetch consents:", error);
        setConsents([]);
      } finally {
        setLoading(false);
      }
    };

    fetchDrafts();
  }, [senderEmail, searchTerm]);

  const handleSearch = () => {
    setSearchTerm(searchQuery.trim());
  };
  function base64ToBlob(base64, mimeType = "application/pdf") {
    const byteCharacters = atob(base64);
    const byteArrays = [];

    for (let offset = 0; offset < byteCharacters.length; offset += 512) {
      const slice = byteCharacters.slice(offset, offset + 512);
      const byteNumbers = new Array(slice.length);

      for (let i = 0; i < slice.length; i++) {
        byteNumbers[i] = slice.charCodeAt(i);
      }

      const byteArray = new Uint8Array(byteNumbers);
      byteArrays.push(byteArray);
    }

    return new Blob(byteArrays, { type: mimeType });
  }

  const editdraft = async (documentId, documentName, base64FileString) => {
    try {
      if (!documentId || !documentName || !base64FileString) {
        console.error("Missing documentId, documentName, or base64FileString");
        Swal.fire("Error", "Draft data is incomplete.", "error");
        return;
      }
      const blobFile = base64ToBlob(base64FileString, "application/pdf");

      const formData = {
        documentId,
        documentName,
        file: blobFile,
      };

      console.log("Navigating with formData:", formData);

      navigate("/dashboard/new-consent/step/2", {
        state: { formData },
      });
    } catch (err) {
      console.error("Failed to load draft document:", err);
      Swal.fire("Error", "Could not load draft document.", "error");
    }
  };

  const handleDownload = (base64FileString, documentName) => {
    if (!base64FileString) {
      Swal.fire("Error", "No file found to download.", "error");
      return;
    }

    const blob = base64ToBlob(base64FileString, "application/pdf");
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");

    const safeFileName = (documentName || "draft_document")
      .replace(/\s+/g, "_")
      .concat(".pdf");

    a.href = url;
    a.download = safeFileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };
  if (loading) return <p>Loading consents...</p>;

  const handleChat = (documentId,documentName) => {
    if (!documentId) {
      Swal.fire("Error", "Document ID is missing.", "error");
      return;
    }

    navigate("/dashboard/chat-app", {
      state: { documentId,documentName },
    });
  };

  return (
    <>
      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          marginBottom: "1rem",
        }}
      >
        <div style={{ width: "250px" }}>
          <SearchBar
            placeholder="Search drafts..."
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
            <th>Document Name</th>
            <th># of Reviewers count</th>
            <th>Draft saved On</th>
            <th># of signers count</th>
            <th>Reviewer Status</th>
            <th>Chat</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {consents.length === 0 ? (
            <tr>
              <td colSpan="6">No drafts found.</td>
            </tr>
          ) : (
            consents.map((consent, index) => {
              const documentName =
                consent?.documentName || consent?.document?.documentName;

              const createdDate = consent?.sentOn || consent?.document?.sentOn;
              const totalSigners =
                consent?.totalSigners || consent?.signers?.length || 0;
              return (
                <tr key={index}>
                  <td>{consent.documentId}</td>
                  <td>{documentName}</td>
                  <td>
                    {consent.reviwercount} / {consent.totalReviwers}
                  </td>
                  <td>{createdDate}</td>
                  <td>{totalSigners}</td>
                  <td>{consent.reviewerStatus}</td>
                  <td>
                    <Button
                      variant="secondary"
                      onClick={() => handleChat(consent.documentId,consent.documentName)}
                      title="Chat"
                    >
                      <IoChatbubbles />
                    </Button>
                  </td>
                  <td>
                    <Button
                      onClick={() =>
                        editdraft(
                          consent.documentId,
                          consent.documentName,
                          consent.editedFile
                        )
                      }
                      variant="primary"
                      size="sm"
                      className="me-2"
                      title="Edit Draft"
                    >
                      <RiFileEditFill />
                    </Button>

                    <Button
                      onClick={() =>
                        handleDownload(consent.editedFile, documentName)
                      }
                      variant="success"
                      size="sm"
                      className="me-2"
                      title="Download"
                    >
                      <AiOutlineDownload />
                    </Button>
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </Table>
    </>
  );
};

export default Drafts;
