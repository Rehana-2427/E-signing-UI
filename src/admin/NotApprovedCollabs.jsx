import { useEffect, useState } from "react";
import { Button, OverlayTrigger, Table, Tooltip } from "react-bootstrap";
import { FcApprove } from "react-icons/fc";
import Swal from "sweetalert2"; // Import Swal for SweetAlert
import collaborationApi from "../api/collaborationApi";
import Pagination from "../components/Pagination";

const NotApprovedCollabs = () => {
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
        const response = await collaborationApi.getCollabNotApproved(
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
        setCollaborations([]); // fallback
      }
    };

    fetchCollaborations();
  }, [page, pageSize, sortedColumn, sortOrder]);

  const handleApprove = async (
    collabId,
    collaborationName,
    extraCharge,
    extraTime,
    deadline
  ) => {
    try {
      const response = await collaborationApi.updateApproval(collabId);
      if (response.data) {
        setCollaborations((prevCollaborations) =>
          prevCollaborations.map((collab) =>
            collab.id === collabId ? { ...collab, isApproved: true } : collab
          )
        );
        console.log("Collaboration approved successfully!");

        Swal.fire({
          icon: "success",
          title: "Approval Successful",
          text: `Approval successful for Collaboration: ${collaborationName} -  ${collabId})\nCredits: ${extraCharge} for ${extraTime} days\nNew Deadline: ${deadline}`,
          confirmButtonText: "OK",
        });
      }
    } catch (error) {
      console.error("Error approving collaboration:", error);
    }
  };
  const handlePageSizeChange = (e) => {
    const size = parseInt(e.target.value);
    setPageSize(size);
    setPage(0);
  };

  const handlePageClick = (data) => {
    const selectedPage = Math.max(0, Math.min(data.selected, totalPages - 1)); // Ensure selectedPage is within range
    setPage(selectedPage);
    localStorage.setItem("notApprovedCollabsPage", selectedPage); // Store the page number in localStorage
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
      <h2 className="mt-3">Not Approved Collaborations</h2>
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
              <th>Status</th>
              <th>Actions</th>
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
                <td style={{ color: collab.status ? "green" : "red" }}>
                  {collab.status ? "Writable" : "Readable"}
                </td>

                <td>
                  {/* Approve Button with Tooltip */}
                  <OverlayTrigger
                    placement="top"
                    overlay={
                      <Tooltip id={`approve-tooltip-${collab.id}`}>
                        Approve Collaboration
                      </Tooltip>
                    }
                  >
                    <Button
                      variant="secondary"
                      onClick={() =>
                        handleApprove(
                          collab.id,
                          collab.collaborationName,
                          collab.extraCharge,
                          collab.extraTime,
                          collab.deadline
                        )
                      }
                    >
                      <FcApprove />
                    </Button>
                  </OverlayTrigger>
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

export default NotApprovedCollabs;
