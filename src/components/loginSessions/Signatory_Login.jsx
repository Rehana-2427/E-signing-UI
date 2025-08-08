import { jwtDecode } from 'jwt-decode';
import { useEffect, useState } from 'react';
import { Button, Card, Col, Form, Row, Spinner } from 'react-bootstrap';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import otpapi from '../../api/otpapi';

const Signatory_Login = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [senderName, setSenderName] = useState('');
  const [documentName, setDocumentName] = useState('');
  const [recipientEmail, setRecipientEmail] = useState('');
  const [documentId, setDocumentId] = useState(0)
  const [deadline, setDeadline] = useState();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [sentOtp, setSentOtp] = useState('');
  const [enteredOtp, setEnteredOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [countdown, setCountdown] = useState(60); // 60 seconds
  const [timerActive, setTimerActive] = useState(false);
  const [checkboxChecked, setCheckboxChecked] = useState(false);
  const query = new URLSearchParams(location.search);
  const token = query.get('token');

  useEffect(() => {
    try {
      const decoded = jwtDecode(token);
      const currentTime = Date.now() / 1000; // seconds

      if (decoded.exp < currentTime) {
        setError('Sorry, the link has expired. Please request a new one.');
      } else {
        setSenderName(decoded.senderName);
        setDocumentName(decoded.documentName);
        setRecipientEmail(decoded.recipientEmail);
        setDeadline(new Date(decoded.exp * 1000).toLocaleString());
        setDocumentId(decoded.documentId)
      }
    } catch (err) {
      setError('Invalid or expired token.');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    let interval;

    if (timerActive && countdown > 0) {
      interval = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    } else if (countdown === 0) {
      setTimerActive(false);
    }

    return () => clearInterval(interval);
  }, [timerActive, countdown]);

  const handleSendOtp = async (userEmail) => {
    setIsSendingOtp(true)
    try {
      const response = await otpapi.validateUserEmail(userEmail);
      setSentOtp(response.data);
      setOtpSent(true);
      toast.success('OTP sent to your email!');
      setCountdown(60);
      setTimerActive(true)
      // toast.success('OTP sent to your email!');
    } catch (err) {
      toast.error('Failed to send OTP');
    }
    finally {
      setIsSendingOtp(false)
    }
  };

  const handleVerifyOtp = () => {
    if (!otpSent || countdown === 0) {
      toast.error('OTP expired. Please resend OTP.');
      return;
    }

    if (enteredOtp == sentOtp) {
      console.log("entered OTP: ", enteredOtp);
      console.log("sent OTP: ", sentOtp);
      setOtpVerified(true);
      toast.success("OTP Verified");
    } else {
      toast.error("Invalid OTP");
    }
  };

  const handleConfirmAndNavigate = () => {
    const user = localStorage.getItem('user');
    if (checkboxChecked) {
      if (user) {
        navigate('/dashboard/my-docs', {
          state: {
            documentId,
            senderName,
            recipientEmail,
            documentName
          }
        });

      } else {
        navigate('/signin', { state: { userEmail: recipientEmail, documentId:documentId, senderName:senderName, documentName:documentName } });
      }
    } else {
      toast.warning('Please check the box to confirm before proceeding.');
    }
  };


  if (loading) return <div>Loading...</div>;
  if (error)
    return (
      <div className="auth-layout-wrap">
        <div className="auth-content text-center">
          <Card className="p-4">
            <h4 style={{ color: 'red' }}>{error}</h4>
            <p>Please check with the sender for a new link.</p>
          </Card>
        </div>
      </div>
    );

  return (
    <div className="auth-layout-wrap">
      <div className="auth-content">
        <Card className="o-hidden">
          <Row>
            <Col md={6} className="text-center auth-cover">
              <div className="ps-3 auth-right">
                <div className="auth-logo text-center mt-4">
                  <img src="/assets/images/logo.png" alt="E-signature" />
                  <h3 style={{ color: 'black' }}>E-Signature</h3>
                </div>
              </div>
            </Col>

            <Col md={6}>
              <div className="p-4">
                <h5 className="mb-3">
                  <strong>{senderName}</strong> has requested you to sign a document{' '}
                  <strong>{documentName}</strong>
  
                </h5>
                <p className="text-muted">Note: To sign, first validate your email.</p>
                <Form>
                  <Form.Group className="mb-3">
                    <Form.Control
                      type="tel"
                      maxLength={6}
                      placeholder="Enter 6-digit OTP"
                      value={enteredOtp}
                      onChange={(e) => {
                        const digitsOnly = e.target.value.replace(/\D/g, ''); // Remove non-digits
                        setEnteredOtp(digitsOnly);
                      }}
                    />
                  </Form.Group>


                  <Row className="mb-3">
                    <Col xs={9}>
                      <Button
                        variant="primary"
                        onClick={() => handleSendOtp(recipientEmail)}
                        disabled={isSendingOtp || timerActive}
                      >
                        {isSendingOtp ? (
                          <>
                            <Spinner animation="border" size="sm" className="me-2" />
                            Sending...
                          </>
                        ) : timerActive ? (
                          `Resend OTP in ${countdown}s`
                        ) : otpSent ? (
                          'Resend OTP'
                        ) : (
                          'Send OTP'
                        )}
                      </Button>
                    </Col>
                    <Col xs={3}>
                      <Button
                        variant="success"
                        onClick={handleVerifyOtp}
                        disabled={enteredOtp.trim() === '' || otpVerified}
                      >
                        Verify OTP
                      </Button>
                    </Col>
                  </Row>
                  <Row className="mb-3">
                    <Form.Group controlId="formBasicCheckbox" className="mb-3">
                      <Form.Check
                        type="checkbox"
                        label="Confirm and View Document to Sign"
                        checked={checkboxChecked}
                        onChange={(e) => setCheckboxChecked(e.target.checked)}
                        disabled={!otpVerified} // ✅ disabled until OTP is verified
                      />
                    </Form.Group>

                    <Col xs={6}>
                      <Button
                        variant="primary"
                        onClick={handleConfirmAndNavigate}
                        disabled={!checkboxChecked} // ✅ only enabled when checkbox is checked
                      >
                        Proceed to Document
                      </Button>
                    </Col>


                  </Row>
                </Form>
              </div>
            </Col>
          </Row>
        </Card>

        <ToastContainer position="top-right" autoClose={5000} hideProgressBar={false} />
      </div>
    </div>
  );
};

export default Signatory_Login;
