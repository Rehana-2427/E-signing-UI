import { useEffect, useState } from "react";
import { Button, Spinner, Table } from "react-bootstrap";
import { useLocation, useNavigate } from "react-router-dom";
import adminCompanyCreditApi from "../api/adminCompanyCredit";

const CompanyCreditPassBook = () => {
  const navigate = useNavigate();
  const [companyCredits, setCompanyCredits] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const location = useLocation();
  const companyName = location.state?.companyName;
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
        const response =
          await adminCompanyCreditApi.getCredtTransactionsByCompany(
            companyName
          );
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
    <>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h1>
          <strong>
            Credit Transaction Report{" "}
            <strong>{decodeURIComponent(companyName)}</strong>
          </strong>
        </h1>
        <Button onClick={() => navigate(-1)}>Back</Button>
      </div>
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
        
          <Table striped bordered hover responsive>
            <thead>
              <tr>
                <th>#</th>
                <th>UserEmail</th>
                <th>Date</th>
                <th>Document Name</th>
                <th>Used Credits</th>
                <th>Balance Credits</th>
                <th>Credits Bought</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((txn, index) => (
                <tr key={txn.id || index}>
                  <td>{index + 1}</td>
                  <td>{txn.userEmail || "N/A"}</td>
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

export default CompanyCreditPassBook;
