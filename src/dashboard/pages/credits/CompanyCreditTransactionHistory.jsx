// src/pages/credits/CompanyCreditTransactionHistory.jsx
import { useEffect, useState } from "react";
import { Card, Spinner, Table } from "react-bootstrap";
import { useParams } from "react-router-dom";
import adminCompanyCreditApi from "../../../api/adminCompanyCredit";
import companyApi from "../../../api/company"; // adjust path if needed

const CompanyCreditTransactionHistory = () => {
  const { companyName } = useParams();
  const [companyCredits, setCompanyCredits] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCompanyCreditsByCompany = async () => {
      try {
        const response = await adminCompanyCreditApi.getCompanyCreditsByCompany(
          companyName
        );
        setCompanyCredits(response.data);
        console.log("Company Credits Data:", response.data); // Debug log
      } catch (error) {
        console.error("Error fetching company credits by company:", error);
      }
    };
    fetchCompanyCreditsByCompany();
  }, [companyName]);

  useEffect(() => {
    const fetchCompanyCredits = async () => {
      try {
        const response = await companyApi.getCreditTransactions(companyName);
        setTransactions(response.data || []);
      } catch (error) {
        console.error("Error fetching credit transactions:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCompanyCredits();
  }, [companyName]);

  return (
    <div className="mt-4">
      <h3>
        Credit Usage Report for{" "}
        <strong>{decodeURIComponent(companyName)}</strong>
      </h3>
      <p>
        {companyCredits ? (
          <>
            <strong>Free Credits:</strong> {companyCredits.freeCreidts}{" "}
            &nbsp;||&nbsp;
            <strong>Paid Credits:</strong> {companyCredits.paidcredits}{" "}
            &nbsp;||&nbsp;
            <strong>Used Credits:</strong> {companyCredits.usedCredit}{" "}
            &nbsp;||&nbsp;
            <strong>Balance Credits:</strong> {companyCredits.balanceCredit}
          </>
        ) : (
          "Loading company credit details..."
        )}
      </p>
      <hr />
      {loading ? (
        <Spinner animation="border" />
      ) : transactions.length === 0 ? (
        <p>No credit usage found.</p>
      ) : (
        <Card className="p-3 mt-3">
          <Table striped bordered hover responsive>
            <thead>
              <tr>
                <th>#</th>
                <th>User</th>
                <th>Email</th>
                <th>Credits Used</th>
                <th>Remaining Balance</th>
                <th>Type</th>
                <th>Used On</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((txn, index) => (
                <tr key={txn.id || index}>
                  <td>{index + 1}</td>
                  <td>{txn.userName || "N/A"}</td>
                  <td>{txn.userEmail || "N/A"}</td>
                  <td>{txn.creditsUsed}</td>
                  <td>{txn.creditBalance}</td>
                  <td>{txn.type || "Usage"}</td>
                  <td>{new Date(txn.usedAt).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card>
      )}
    </div>
  );
};

export default CompanyCreditTransactionHistory;
