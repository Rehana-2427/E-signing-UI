import { useEffect, useState } from "react";
import { Button, Table } from "react-bootstrap";
import { BsChatRightDotsFill } from "react-icons/bs";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import signerApi from "../../../api/signerapi";
import Pagination from "../../../components/Pagination";

const SignatoryContacts = () => {
  const [contacts, setContacts] = useState([]);
  const user = JSON.parse(localStorage.getItem("user"));
  const userEmail = user?.userEmail;
  const navigate = useNavigate();
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [sortedColumn, setSortedColumn] = useState(null);
  const [sortOrder, setSortOrder] = useState("asc");
  useEffect(() => {
    if (userEmail) {
      signerApi
        .getSignersContact(userEmail, page, pageSize, sortedColumn, sortOrder)
        .then((res) => {
          const pageData = res.data;
          setContacts(pageData?.content || []);
          setTotalPages(pageData?.totalPages || 0);
        })
        .catch((err) => {
          console.error("Failed to fetch documents", err);
          setContacts([]);
          setTotalPages(0);
        });
    }
  }, [userEmail, page, pageSize, sortedColumn, sortOrder]);

  const handleComingSoon = () => {
    Swal.fire({
      icon: "info",
      title: "Coming Soon!",
      text: "This feature is under development.",
      confirmButtonText: "OK",
    });
  };

  const handleContactClick = (signer) => {
    navigate("/dashboard/contacts/chat", {
      state: { selectedContact: signer },
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
    localStorage.setItem("signatoryContacts", selectedPage); // Store the page number in localStorage
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
      className="scrollable-container"
      style={{
        height: "100%",
        minHeight: "80vh",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <h4>List of all signatories</h4>
      <Table hover>
        <thead>
          <tr style={{ background: "#f0f0f0" }}>
            <th
              onClick={() => handleSort("name")}
              style={{ cursor: "pointer" }}
            >
              Signer Name{" "}
              <span>
                <span
                  style={{
                    color:
                      sortedColumn === "name" && sortOrder === "asc"
                        ? "black"
                        : "gray",
                  }}
                >
                  ↑
                </span>{" "}
                <span
                  style={{
                    color:
                      sortedColumn === "name" && sortOrder === "desc"
                        ? "black"
                        : "gray",
                  }}
                >
                  ↓
                </span>
              </span>
            </th>
            <th
              onClick={() => handleSort("email")}
              style={{ cursor: "pointer" }}
            >
              Signer Email
              <span>
                <span
                  style={{
                    color:
                      sortedColumn === "email" && sortOrder === "asc"
                        ? "black"
                        : "gray",
                  }}
                >
                  ↑
                </span>{" "}
                <span
                  style={{
                    color:
                      sortedColumn === "email" && sortOrder === "desc"
                        ? "black"
                        : "gray",
                  }}
                >
                  ↓
                </span>
              </span>
            </th>
            <th># of documents signed</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {contacts.length === 0 ? (
            <tr>
              <td colSpan="4">No signers found.</td>
            </tr>
          ) : (
            contacts.map((signer, idx) => (
              <tr key={idx}>
                <td>{signer.name}</td>
                <td>{signer.email}</td>
                <td>{signer.signedCount || 0}</td>
                {/* <td>
                                    <Button variant="success" onClick={handleComingSoon}> <BiMessageRoundedDetail /></Button>
                                </td> */}
                <td>
                  <Button
                    variant="success"
                    onClick={() => handleContactClick(signer)}
                  >
                    <BsChatRightDotsFill />
                  </Button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </Table>
      {contacts.length > 0 && totalPages > 0 && (
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

export default SignatoryContacts;
