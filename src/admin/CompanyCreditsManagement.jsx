import { useEffect, useState } from "react";
import { Button, Table, Toast } from "react-bootstrap"; // import Toast here
import { ToastContainer } from "react-toastify";
import adminCompanyCreditApi from "../api/adminCompanyCredit";
import AddCompanyCreditsModal from "./AddCompanyCreditsModal";

const CompanyCreditsManagement = () => {
  const [companyCredits, setCompanyCredits] = useState([]);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  useEffect(() => {
    fetchCompanyCreditsList();
  }, []);

  const fetchCompanyCreditsList = async () => {
    try {
      const response = await adminCompanyCreditApi.getCompanyCreditList();
      setCompanyCredits(response.data);
    } catch (error) {
      console.error("Error fetching company credits", error);
    }
  };

  const handleOpenModal = (company) => {
    setSelectedCompany(company);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setSelectedCompany(null);
    setShowModal(false);
  };

  const handleSaveCredits = (companyName) => {
    // Refetch or update locally (you can optimize later)
    fetchCompanyCreditsList();
    setToastMessage(`Successfully assigned credits to ${companyName}`);
    setShowToast(true);
    setShowModal(false);
  };

  return (
    <>
      <h1>
        <strong>Company Credits Management</strong>
      </h1>
      <p>
        <strong>
          Note: By default, all companies receive 10 free credits.
        </strong>
      </p>

      <Table striped bordered hover>
        <thead>
          <tr>
            <th>Company Name</th>
            <th>Admin User Name</th>
            <th>Admin Email</th>
            <th>Paid Credits</th>
            <th>Balance Credit</th>
            <th>Used Credit</th>
            <th>Add Credit</th>
          </tr>
        </thead>
        <tbody>
          {companyCredits.map((company, index) => (
            <tr key={index}>
              <td>{company.companyName}</td>
              <td>{company.adminUserName}</td>
              <td>{company.adminEmail}</td>
              <td>{company.paidcredits ?? company.paidCredits}</td>
              <td>{company.balanceCredit ?? company.balancedCredits}</td>
              <td>{company.usedCredit ?? company.usedCredit}</td>
              <td>
                <Button onClick={() => handleOpenModal(company)}>
                  Add credit
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      {selectedCompany && (
        <AddCompanyCreditsModal
          show={showModal}
          onHide={handleCloseModal}
          company={selectedCompany}
          onSave={handleSaveCredits}
        />
      )}

      <ToastContainer position="top-end" className="p-3">
        <Toast
          onClose={() => setShowToast(false)}
          show={showToast}
          delay={3000}
          autohide
          bg="success"
        >
          <Toast.Header>
            <strong className="me-auto">Credit Assigned</strong>
          </Toast.Header>
          <Toast.Body className="text-white">{toastMessage}</Toast.Body>
        </Toast>
      </ToastContainer>
    </>
  );
};

export default CompanyCreditsManagement;
