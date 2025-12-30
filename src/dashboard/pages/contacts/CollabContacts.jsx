import { useEffect, useState } from "react";
import { Button, Table } from "react-bootstrap";
import { BsChatRightDotsFill } from "react-icons/bs";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import collaborationApi from "../../../api/collaborationApi";
import Pagination from "../../../components/Pagination";

const CollabContacts = () => {
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
      collaborationApi
        .getContributorsContact(
          userEmail,
          page,
          pageSize,
          sortedColumn,
          sortOrder
        )
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
    localStorage.setItem("collabContacts", selectedPage); // Store the page number in localStorage
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
      <h4>List of all Contributors</h4>
      <Table hover>
        <thead>
          <tr style={{ background: "#f0f0f0" }}>
            <th
              onClick={() => handleSort("name")}
              style={{ cursor: "pointer" }}
            >
              Contributor Name
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
              Contributor Email
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
            <th># of Collaborations</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {contacts.length === 0 ? (
            <tr>
              <td colSpan="4">No Contributors found.</td>
            </tr>
          ) : (
            contacts.map((contributor, idx) => (
              <tr key={idx}>
                <td>{contributor.name}</td>
                <td>{contributor.email}</td>
                <td>{contributor.collaborationCount || 0}</td>

                <td>
                  <Button
                    variant="success"
                    onClick={() => handleContactClick(contributor)}
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

export default CollabContacts;
