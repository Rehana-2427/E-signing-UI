import { useEffect, useState } from "react";
import { Table } from "react-bootstrap";
import collaborationApi from "../api/collaborationApi";
import Pagination from "../components/Pagination";

const ApprovedCollabs = () => {
  const [collaborations, setCollaborations] = useState([]);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [sortedColumn, setSortedColumn] = useState(null);
  const [sortOrder, setSortOrder] = useState("asc");
  // Function to fetch collaborations
  useEffect(() => {
    const fetchCollaborations = async () => {
      try {
        const response = await collaborationApi.getApprovedCollabs(
          page,
          pageSize,
          sortedColumn,
          sortOrder
        );
        const pageData = response.data?.data ?? response.data;

        setCollaborations(pageData?.content ?? []);
        setTotalPages(pageData?.totalPages ?? 0);
      } catch (error) {
        setCollaborations([]); // fallback
        setTotalPages(0);
        console.error("Error fetching collaborations:", error);
      }
    };

    fetchCollaborations();
  }, [page, pageSize, sortedColumn, sortOrder]);
  const handlePageSizeChange = (e) => {
    const size = parseInt(e.target.value);
    setPageSize(size);
    setPage(0);
  };

  const handlePageClick = (data) => {
    const selectedPage = Math.max(0, Math.min(data.selected, totalPages - 1)); // Ensure selectedPage is within range
    setPage(selectedPage);
    localStorage.setItem("approvedCollabs", selectedPage); // Store the page number in localStorage
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
        height: "100%",
        minHeight: "80vh",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <h2 className="mt-3">Approved Collaborations</h2>
      {collaborations.length === 0 ? (
        <p>No collaborations to display.</p>
      ) : (
        <Table striped bordered hover className="mt-3">
          <thead>
            <tr>
              <th>ID</th>
              <th
                onClick={() => handleSort("collaborationName")}
                style={{ cursor: "pointer" }}
              >
                Name{" "}
                <span>
                  <span
                    style={{
                      color:
                        sortedColumn === "collaborationName" &&
                        sortOrder === "asc"
                          ? "black"
                          : "gray",
                    }}
                  >
                    ↑
                  </span>{" "}
                  <span
                    style={{
                      color:
                        sortedColumn === "collaborationName" &&
                        sortOrder === "desc"
                          ? "black"
                          : "gray",
                    }}
                  >
                    ↓
                  </span>
                </span>
              </th>
              <th
                onClick={() => handleSort("companyName")}
                style={{ cursor: "pointer" }}
              >
                Company Name{" "}
                <span>
                  <span
                    style={{
                      color:
                        sortedColumn === "companyName" && sortOrder === "asc"
                          ? "black"
                          : "gray",
                    }}
                  >
                    ↑
                  </span>{" "}
                  <span
                    style={{
                      color:
                        sortedColumn === "companyName" && sortOrder === "desc"
                          ? "black"
                          : "gray",
                    }}
                  >
                    ↓
                  </span>
                </span>
              </th>
              <th
                onClick={() => handleSort("personName")}
                style={{ cursor: "pointer" }}
              >
                Person Name{" "}
                <span>
                  <span
                    style={{
                      color:
                        sortedColumn === "personName" && sortOrder === "asc"
                          ? "black"
                          : "gray",
                    }}
                  >
                    ↑
                  </span>{" "}
                  <span
                    style={{
                      color:
                        sortedColumn === "personName" && sortOrder === "desc"
                          ? "black"
                          : "gray",
                    }}
                  >
                    ↓
                  </span>
                </span>
              </th>
              <th
                onClick={() => handleSort("createdBy")}
                style={{ cursor: "pointer" }}
              >
                Created By{" "}
                <span>
                  <span
                    style={{
                      color:
                        sortedColumn === "createdBy" && sortOrder === "asc"
                          ? "black"
                          : "gray",
                    }}
                  >
                    ↑
                  </span>{" "}
                  <span
                    style={{
                      color:
                        sortedColumn === "createdBy" && sortOrder === "desc"
                          ? "black"
                          : "gray",
                    }}
                  >
                    ↓
                  </span>
                </span>
              </th>
              <th>Created On</th>
              <th>UpdatedAt</th>
              <th>Deadline</th>
              <th>Request Time</th>
              <th>Request Credits</th>
              <th>Total Duration</th>
              <th>Total Credits</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {collaborations.map((collab) => (
              <tr key={collab.id}>
                <td>{collab.id}</td>
                <td>{collab.collaborationName}</td>
                <td>{collab.companyName || "N/A"}</td>
                <td>{collab.personName || "N/A"}</td>
                <td>{collab.createdBy}</td>
                <td>{collab.createdOn}</td>
                <td>{collab.updateAt}</td>
                <td>{collab.deadline}</td>
                <td>{collab.extraTime}</td>
                <td>{collab.extraCharge}</td>
                <td>{collab.collaborationDuration}</td>
                <td>{collab.cost}</td>
                <td style={{ color: collab.status ? "green" : "red" }}>
                  {collab.status ? "Writable" : "Readable"}
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
      {collaborations.length > 0 && totalPages > 0 && (
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

export default ApprovedCollabs;
