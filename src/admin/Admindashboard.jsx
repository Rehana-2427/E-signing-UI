import { Card, Col, Row } from 'react-bootstrap';
import Swal from 'sweetalert2';

const AdminDashboard = () => {
 
  const handleComingSoon = () => {
    Swal.fire({
      icon: 'info',
      title: 'Coming Soon!',
      text: 'This feature is under development.',
      confirmButtonText: 'OK'
    });
  };
  return (
    < >
      <h1><strong>Admin Dashboard</strong></h1>
      <Row className="mt-4">
        <Col md={4}>
          <Card className="text-center">
            <Card.Body>
              <Card.Title>Total Users</Card.Title>
              <Card.Text style={{ fontSize: '2rem' }}>245</Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="text-center">
            <Card.Body>
              <Card.Title>Total Companies</Card.Title>
              <Card.Text style={{ fontSize: '2rem' }}>18</Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="text-center" onClick={handleComingSoon}>
            <Card.Body>
              <Card.Title>Pending Company Requests</Card.Title>
              <Card.Text style={{ fontSize: '2rem' }}>3</Card.Text>
              {/* <OverlayTrigger
                placement="top"
                overlay={renderTooltip("Functionality coming soon")}
              >
                <span>
                  <Button variant="primary" disabled>Accept Companies</Button>
                </span>
              </OverlayTrigger> */}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row className="mt-5">
        <Col md={6}>
          <Card>
            <Card.Body>
              <Card.Title>Recent User Registrations</Card.Title>
              <ul>
                <li>Rehana - rehana@gmail.com</li>
                <li>Shubhadip Raj - shubhadip@gamil.com</li>
                <li>Jay kuamr - jai@gamil.com</li>
                <li>Ambika - ambika@gamil.com</li>
                <li>Sintu kumar - sintu@gamil.com</li>
              </ul>
            </Card.Body>
          </Card>
        </Col>
        <Col md={6}>
          <Card>
            <Card.Body>
              <Card.Title>Admin Actions</Card.Title>
              <ul>
                <li>Manage Users <span className="text-muted">(Coming Soon)</span></li>
                <li>Manage Documents <span className="text-muted">(Coming Soon)</span></li>
                <li>Credit Settings <span className="text-muted">(Coming Soon)</span></li>
                <li>Company Verification <span className="text-muted">(Coming Soon)</span></li>
              </ul>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </>
  );
};

export default AdminDashboard;
