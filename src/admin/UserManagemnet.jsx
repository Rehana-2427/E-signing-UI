import { useEffect, useState } from 'react';
import { Button, Table, Toast, ToastContainer } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import adminUserCreditApi from '../api/adminUserCreditApi';
import AddCreditsModal from './AddCreditsModal';

const UserManagemnet = () => {
  const [userCredits, setUserCredits] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  useEffect(() => {
    fetchUserCredits();
  }, []);

  const fetchUserCredits = async () => {
    try {
      const response = await adminUserCreditApi.getUserCreditList();
      setUserCredits(response.data);
    } catch (error) {
      console.error("Error fetching user credits", error);
    }
  };

  const handleOpenModal = (user) => {
    setSelectedUser(user);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setSelectedUser(null);
    setShowModal(false);
  };
  const handleSaveCredits = (updatedData, email) => {
    fetchUserCredits();
    setUserCredits(updatedData);
    setToastMessage(`Successfully assigned credits to ${email}`);
    setShowToast(true);
  };

  return (
    <>
      <h1><strong>User Credit Management</strong></h1>
      <Table striped bordered hover>
        <thead>
          <tr>
            <th>User Name</th>
            <th>User Email</th>
            <th>Credit Bought</th>
            <th>Used Credit</th>
            <th>Balance Credit</th>
            {/* <th>Updated At</th> */}
            <th>Add Credit</th>
            <th>Report</th>
          </tr>
        </thead>
        <tbody>
          {userCredits.map((user, index) => (
            <tr key={index}>
              <td>{user.userName}</td>
              <td>{user.userEmail}</td>
              <td>{user.creditBought}</td>
              <td>{user.usedCredit}</td>
              <td>{user.balanceCredit}</td>
              {/* <td>{user.updatedAt}</td> */}
              <td>
                <Button variant="success" onClick={() => handleOpenModal(user)}>
                  Add Credit
                </Button>
              </td>
              <td>
                <Button
                  onClick={() => navigate('/admin-dashboard/user-management/credit-passbook', { state: { userEmail: user.userEmail } })}
                >
                  Report
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      {selectedUser && (
        <AddCreditsModal
          show={showModal}
          onHide={handleCloseModal}
          user={selectedUser}
          onSave={handleSaveCredits}
        />
      )}
      <ToastContainer position="top-end" className="p-3">
        <Toast onClose={() => setShowToast(false)} show={showToast} delay={3000} autohide bg="success">
          <Toast.Header>
            <strong className="me-auto">Credit Assigned</strong>
          </Toast.Header>
          <Toast.Body className="text-white">
            {toastMessage}
          </Toast.Body>
        </Toast>
      </ToastContainer>

    </>
  );
};

export default UserManagemnet;
