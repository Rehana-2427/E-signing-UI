import { Card, Col, Row } from 'react-bootstrap';
import Swal from 'sweetalert2';

const Settings = () => {
  const handleComingSoon = () => {
    Swal.fire({
      icon: 'info',
      title: 'Coming Soon!',
      text: 'This feature is under development.',
      confirmButtonText: 'OK'
    });
  };

  return (
    <>
      <h1><strong>Settings</strong></h1>
      <p className="text-muted">Admin-level configurations and preferences</p>

      <Row className="mt-4">
        <Col md={6}>
          <Card className="mb-3 cursor-pointer" onClick={handleComingSoon}>
            <Card.Body>
              <Card.Title>Credit Settings</Card.Title>
              <Card.Text>Configure document and signer credit cost per user.</Card.Text>
            </Card.Body>
          </Card>
        </Col>

        <Col md={6}>

          <Card className="mb-3 cursor-pointer" onClick={handleComingSoon}>
            <Card.Body>
              <Card.Title>Company Approvals</Card.Title>
              <Card.Text>Manage and verify registered organizations.</Card.Text>
            </Card.Body>
          </Card>

        </Col>

        <Col md={6}>

          <Card className="mb-3 cursor-pointer" onClick={handleComingSoon}>
            <Card.Body>
              <Card.Title>Notification Settings</Card.Title>
              <Card.Text>Enable or disable system notifications and alerts.</Card.Text>
            </Card.Body>
          </Card>
        </Col>

        <Col md={6}>

          <Card className="mb-3 cursor-pointer" onClick={handleComingSoon}>
            <Card.Body>
              <Card.Title>Role Management</Card.Title>
              <Card.Text>Assign roles and permissions to admin team members.</Card.Text>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </>
  );
};

export default Settings;
