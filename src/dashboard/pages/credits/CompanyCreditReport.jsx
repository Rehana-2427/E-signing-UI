import { useEffect, useState } from "react";
import { Button, Card, Spinner, Table } from "react-bootstrap";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import companyApi from "../../../api/company";

const CompanyCreditReport = () => {
  const { companyKey } = useParams();  // e.g. "Shiksha Infotech-RK"
  const location = useLocation();
  const navigate = useNavigate();

  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReport = async () => {
      try {
        // Optionally, you might have passed company ID in `location.state`
        const state = location.state || {};
        const companyId = state.companyId;

        // If you have an API to get the usage report by company ID
        const resp = await companyApi.getCreditUsageReport(companyId);
        setReportData(resp.data);
      } catch (error) {
        console.error("Error fetching credit report:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchReport();
  }, [companyKey, location]);

  return (
    <>
      <h1><strong>Credit Usage Report: {companyKey}</strong></h1>
      {loading ? (
        <Spinner animation="border" />
      ) : !reportData ? (
        <p>No report available.</p>
      ) : (
        <Card className="mt-3 p-3">
          <Table striped bordered hover responsive>
            <thead>
              <tr>
                <th>#</th>
                <th>User Email / Name</th>
                <th>Credits Used</th>
                <th>When</th>
                <th>Balance After Use</th>
              </tr>
            </thead>
            <tbody>
              {reportData.entries.map((entry, idx) => (
                <tr key={entry.id || idx}>
                  <td>{idx + 1}</td>
                  <td>{entry.userEmail || entry.userName}</td>
                  <td>{entry.creditsUsed}</td>
                  <td>{entry.timestamp}</td>
                  <td>{entry.balanceAfter}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card>
      )}
      <Button variant="secondary" onClick={() => navigate(-1)} className="mt-3">
        Back
      </Button>
    </>
  );
};

export default CompanyCreditReport;
