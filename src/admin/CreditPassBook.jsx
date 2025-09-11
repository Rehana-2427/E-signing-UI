import { useEffect, useState } from "react";
import { Alert, Button, Spinner, Table } from "react-bootstrap";
import { useLocation, useNavigate } from "react-router-dom";
import adminUserCreditApi from "../api/adminUserCreditApi";

const CreditPassBook = () => {
    const navigate = useNavigate();
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const location = useLocation();
    const userEmail = location.state?.userEmail;
    useEffect(() => {
        const fetchTransactions = async () => {
            try {
                const res = await adminUserCreditApi.getCreditTransactionsByUser(userEmail);
                setTransactions(res.data);
            } catch (err) {
                setError("Failed to load credit transactions.");
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        if (userEmail) {
            fetchTransactions();
        }
    }, [userEmail]);

    return (
        <div className="p-4">
            <div className="d-flex justify-content-between align-items-center mb-3">
                <h1><strong>Credit Transaction Report</strong></h1>
                <Button onClick={() => navigate(-1)}>Back</Button>

            </div>
            {loading && <Spinner animation="border" />}
            {error && <Alert variant="danger">{error}</Alert>}

            {!loading && transactions.length === 0 && (
                <p>No credit transactions found.</p>
            )}

            {!loading && transactions.length > 0 && (
                <Table striped bordered hover responsive className="mt-4">
                    <thead>
                        <tr>
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
                                <td>{txn.date}</td>
                                <td>{txn.documentName}</td>
                                <td>{txn.usedCredits}</td>
                                <td>{txn.balanceCredits}</td>
                                <td>{txn.creditsBought}</td>
                            </tr>
                        ))}
                    </tbody>
                </Table>
            )}
        </div>
    );
};


export default CreditPassBook;
