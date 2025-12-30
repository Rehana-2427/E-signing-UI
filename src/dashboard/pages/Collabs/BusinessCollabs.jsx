import { useEffect, useState } from "react";
import { Button, OverlayTrigger, Table, Tooltip } from "react-bootstrap";
import { CgGoogleTasks } from "react-icons/cg";
import { HiDocumentReport } from "react-icons/hi";
import { MdDelete } from "react-icons/md";
import { useNavigate } from "react-router-dom";
import collaborationApi from "../../../api/collaborationApi";
import Pagination from "../../../components/Pagination";

const BusinessCollabs = () => {
  const [collaborations, setCollaborations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCollab, setSelectedCollab] = useState(null);
  const userEmail = JSON.parse(localStorage.getItem("user"))?.userEmail;
  const navigate = useNavigate();
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [sortedColumn, setSortedColumn] = useState(null);
  const [sortOrder, setSortOrder] = useState("asc");

  useEffect(() => {
    if (userEmail) {
      collaborationApi
        .getCollabsByCompanyUserEmail(
          userEmail,
          page,
          pageSize,
          sortedColumn,
          sortOrder
        )
        .then((response) => {
          const pageData = response.data;

          const content = pageData?.content || [];

          const mapped = content.map((collab) => ({
            collabId: collab.id,
            createdBy: collab.createdBy,
            collaborationName: collab.collaborationName,
            collaborationDuration: collab.collaborationDuration,
            cost: collab.cost,
            costChargedTo: collab.costChargedTo,
            forCompany: collab.forCompany,
            companyName: collab.companyName,
            status: collab.status,
          }));

          setCollaborations(mapped);
          setTotalPages(pageData.totalPages || 0);
          setLoading(false);
        })

        .catch((err) => {
          setCollaborations([]);
          setTotalPages(0);
          // setError("Failed to load collaborations.");
          setLoading(false);
        });
    }
  }, [userEmail, page, pageSize, sortedColumn, sortOrder]);

  const handleBackClick = () => {
    setSelectedCollab(null);
  };

  const handleTask = (collabId, collaborationName) => {
    navigate(
      `/dashboard/my-collabs/collab-object?collabId=${collabId}&collaborationName=${collaborationName}&tab=brief`
    );
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }
  const handlePageSizeChange = (e) => {
    const size = parseInt(e.target.value);
    setPageSize(size);
    setPage(0);
  };

  const handlePageClick = (data) => {
    const selectedPage = Math.max(0, Math.min(data.selected, totalPages - 1)); // Ensure selectedPage is within range
    setPage(selectedPage);
    localStorage.setItem("businessCollabs", selectedPage); // Store the page number in localStorage
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
      {selectedCollab ? (
        <>
          <div className="d-flex justify-content-end align-items-end mt-2">
            <Button variant="secondary" onClick={handleBackClick}>
              Back to Collaboration List
            </Button>
          </div>
        </>
      ) : (
        <>
          <br />
          {collaborations.length === 0 ? (
            <div>No collaborations added yet.</div>
          ) : (
            <Table striped bordered hover>
              <thead>
                <tr>
                  <th>#</th>
                  <th
                    onClick={() => handleSort("collaborationName")}
                    style={{ cursor: "pointer" }}
                  >
                    Collaboration Name
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
                    onClick={() => handleSort("createdBy")}
                    style={{ cursor: "pointer" }}
                  >
                    Created By
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
                  <th
                    onClick={() => handleSort("companyName")}
                    style={{ cursor: "pointer" }}
                  >
                    Company{" "}
                    <span>
                      <span
                        style={{
                          color:
                            sortedColumn === "companyName" &&
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
                            sortedColumn === "companyName" &&
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
                    onClick={() => handleSort("personName")}
                    style={{ cursor: "pointer" }}
                  >
                    Person{" "}
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
                            sortedColumn === "personName" &&
                            sortOrder === "desc"
                              ? "black"
                              : "gray",
                        }}
                      >
                        ↓
                      </span>
                    </span>
                  </th>
                  {/* <th>Duration</th> */}
                  {/* <th>Max Charge</th>
                  <th>Charged To</th> */}
                  <th>Status</th>
                  <th>Action</th>
                  <th>Audit</th>
                </tr>
              </thead>
              <tbody>
                {collaborations.map((collab) => (
                  <tr key={collab.collabId}>
                    <td>{collab.collabId}</td>
                    <td>{collab.collaborationName}</td>
                    <td>
                      {userEmail === collab.createdBy
                        ? "You"
                        : collab.createdBy}
                    </td>
                    <td>{collab.forCompany ? collab.companyName : "-"}</td>
                    <td>{collab.forPerson ? collab.personName : "-"}</td>
                    {/* <td>{collab.collaborationDuration}</td> */}
                    {/* <td>{collab.cost} credits</td>
                    <td>{collab.costChargedTo}</td> */}
                    <td>
                      {collab.status ? (
                        <span style={{ color: "green" }}>Active</span>
                      ) : (
                        <span style={{ color: "red" }}>Inactive</span>
                      )}
                    </td>
                    <td>
                      <OverlayTrigger
                        placement="top"
                        overlay={
                          <Tooltip id="tooltip-task">CollabTask</Tooltip>
                        }
                      >
                        <Button
                          variant="info"
                          onClick={() =>
                            handleTask(
                              collab.collabId,
                              collab.collaborationName
                            )
                          }
                        >
                          <CgGoogleTasks />
                        </Button>
                      </OverlayTrigger>
                      <OverlayTrigger
                        placement="top"
                        overlay={
                          <Tooltip id="tooltip-delete">Delete Collab</Tooltip>
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
                            `/dashboard/my-collabs/collab-object?collabId=${
                              collab.collabId
                            }&collaborationName=${encodeURIComponent(
                              collab.collaborationName
                            )}&tab=audit`
                          )
                        }
                      >
                        <HiDocumentReport />
                      </Button>
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
        </>
      )}
    </div>
  );
};

export default BusinessCollabs;
