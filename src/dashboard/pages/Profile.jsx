import { Button, Card, Col, Row } from 'react-bootstrap';
import Swal from 'sweetalert2';

const Profile = () => {
  const user = JSON.parse(localStorage.getItem("user")); // or fetch from API
  const handleComingSoon = () => {
    Swal.fire({
      icon: 'info',
      title: 'Coming Soon!',
      text: 'This feature is under development.',
      confirmButtonText: 'OK'
    });
  };
  return (
    <div>
      <h1><strong>My Profile</strong></h1>

      <Card className="p-4 mt-3">
        <Row>
          <Col md={6}>
            <h5><strong>Personal Information</strong></h5>
            <p><strong>Name:</strong> {user?.userName}</p>
            <p><strong>Email:</strong> {user?.userEmail}</p>
            <p><strong>Phone:</strong> {user?.phone || 'N/A'}</p>
            <p><strong>Role:</strong> {user?.role || 'User'}</p>
          </Col>


        </Row>

        <div className="text-end mt-4">
          <Button variant="primary" className="me-2" onClick={handleComingSoon}>
            Edit Profile
          </Button>
          <Button variant="secondary" onClick={handleComingSoon}>
            Change Password
          </Button>
        </div>

      </Card>
    </div>
  );
};

export default Profile;
