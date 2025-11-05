import { useEffect, useState } from "react";
import { Alert, Button, Spinner, Table } from "react-bootstrap";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import adminCompanyCreditApi from "../../../api/adminCompanyCredit";

const CompanyCreditReport = () => {
  const { companyKey } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const companyName =
    location.state?.companyName || decodeURIComponent(companyKey);
  const [reportData, setReportData] = useState(null);

  const user = JSON.parse(localStorage.getItem("user"));
  const userEmail = user?.userEmail;

  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const res = await adminCompanyCreditApi.getCredtTransactionsByCompany(
          companyName
        );
        setTransactions(res.data);
      } catch (err) {
        setError("Failed to load credit transactions.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (companyName) {
      fetchTransactions();
    }
  }, [companyName]);

  return (
    <>
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h1>
            <strong>Credit Transaction Report</strong>
          </h1>
          <Button onClick={() => navigate(-1)}>Back</Button>
        </div>
        {loading && <Spinner animation="border" />}
        {error && <Alert variant="danger">{error}</Alert>}

        {!loading && transactions.length === 0 && (
          <p style={{ color: "red" }}>No credit transactions found.</p>
        )}

        {!loading && transactions.length > 0 && (
          <Table striped bordered hover responsive className="mt-4">
            <thead>
              <tr>
                <th>UserEmail</th>
                <th>Date</th>
                <th>Document Name</th>
                <th>Used Credits</th>
                <th>Balance Credits</th>
                <th>Credits Bought</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((txn) => (
                <tr key={txn.id}>
                  <td>{userEmail}</td>
                  <td>{txn.date}</td>
                  <td>{txn.documentName}</td>
                  <td>{txn.usedCredits}</td>
                  <td>{txn.balanceCredits}</td>
                  <td>{txn.paidCredits}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
    </>
  );
};

export default CompanyCreditReport;
