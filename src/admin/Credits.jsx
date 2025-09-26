import { useEffect, useState } from "react";
import { Button, Table, Toast, ToastContainer } from "react-bootstrap";

import adminApi from "../api/adminApi";

const Credits = () => {
  const [docCost, setDocCost] = useState(0);
  const [signCost, setSignCost] = useState(0);
  const [historyVisible, setHistoryVisible] = useState(false);
  const [creditHistory, setCreditHistory] = useState([]);
  const [showToast, setShowToast] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchCreditHistory();
  }, []);


  const saveSettings = async () => {
    try {
      setIsSaving(true);
      await adminApi.saveCreditSettings(docCost, signCost);
      setShowToast(true);
      fetchCreditHistory();
      setDocCost(0);       
      setSignCost(0);
    } catch (error) {
      console.error("Error saving settings");
    }
    finally {
      setIsSaving(false);
    }
  };

  const fetchCreditHistory = () => {
    adminApi.getCreditHistory().then((res) => {
      setCreditHistory(res.data);
      setHistoryVisible(true);
    });
  };
  return (
    <>
      <ToastContainer position="top-end" className="p-3">
        <Toast
          onClose={() => setShowToast(false)}
          show={showToast}
          delay={3000}
          autohide
          bg="success"
        >
          <Toast.Header closeButton={false}>
            <strong className="me-auto">Success</strong>
          </Toast.Header>
          <Toast.Body>Settings updated!</Toast.Body>
        </Toast>
      </ToastContainer>
      <h1><strong>Credit Settings</strong></h1>
      <div style={{ marginBottom: 10 }}>
        <label>Document Credit: </label>
        <input
          type="number"
          value={docCost}
          onChange={(e) => setDocCost(parseInt(e.target.value))}
        />
      </div>
      <div style={{ marginBottom: 10 }}>
        <label>Signature Credit: </label>
        <input
          type="number"
          value={signCost}
          onChange={(e) => setSignCost(parseInt(e.target.value))}
        />
      </div>
      <Button onClick={saveSettings} disabled={isSaving}>
        {isSaving ? "Saving..." : "Save Settings"}
      </Button>


      <div style={{ marginTop: 30 }}>
        <h4>Credit History</h4>
        <Table striped bordered hover>
          <thead>
            <tr>
              <th>Document Credit</th>
              <th>Signature Credit</th>
              <th>Updated At</th>
            </tr>
          </thead>
          <tbody>
            {creditHistory.map((entry, index) => (
              <tr key={index}>
                <td>{entry.docCost}</td>
                <td>{entry.signCost}</td>
                <td>{entry.updatedAt}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      </div>
    </>

  );
};

export default Credits;
