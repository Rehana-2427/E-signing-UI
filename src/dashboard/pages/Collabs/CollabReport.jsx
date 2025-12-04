import { useEffect, useState } from "react";
import { Table } from "react-bootstrap";
import { useLocation, useNavigate } from "react-router-dom";
import collaborationApi from "../../../api/collaborationApi";

const CollabReport = () => {
  const [report, setReport] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  // Get collabId from query params
  const queryParams = new URLSearchParams(location.search);
  const collabId = queryParams.get("collabId");

  useEffect(() => {
    if (collabId) {
      collaborationApi
        .getCollabReport(collabId)
        .then((res) => {
          const data = Array.isArray(res.data) ? res.data : [];
          setReport(data);
          setLoading(false);
        })
        .catch((err) => {
          console.error("Error fetching report:", err);
          setLoading(false);
        });
    }
  }, [collabId]);

  if (loading) return <div>Loading report...</div>;

  return (
    <>
      {/* <div className="d-flex align-items-center justify-content-between mb-3">
        <h3 className="mb-0">Collaboration Report</h3>
        <Button onClick={handleBack} variant="info" className="tooltip-btn">
          <IoArrowBackCircleSharp />
          <span className="tooltip-text">Go to Back</span>
        </Button>
      </div> */}

      <Table striped bordered hover className="mt-4">
        <thead>
          <tr>
            <th>#</th>
            <th>Action</th>
            <th>Checklist Item</th>
            <th>Status</th>
            <th>Assigned To</th>
            <th>Added By</th>
            <th>Document Name</th>
            <th>Sent To</th>
            <th>Date</th>
          </tr>
        </thead>
        <tbody>
          {report.map((item, index) => (
            <tr key={index}>
              <td>{index + 1}</td>
              <td>{item.action}</td>
              <td>{item.checklistItem || "-"}</td>
              <td>
                {item.checklistStatus !== undefined
                  ? item.checklistStatus
                    ? "Done"
                    : "Pending"
                  : "-"}
              </td>
              <td>
                {" "}
                {item.email}-{item.checklistAssignedTo || "-"}
              </td>
              <td>{item.checklistAddedBy || item.uploadedBy || "-"}</td>
              <td>{item.documentName || "-"}</td>
              <td>
                {item.sentToEmails?.join(", ") || "-"}-{item.sendTo}
              </td>
              <td>{item.uploadAt || item.checklistDeadline || "-"}</td>
            </tr>
          ))}
        </tbody>
      </Table>
    </>
  );
};

export default CollabReport;
