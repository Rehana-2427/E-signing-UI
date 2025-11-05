import { jwtDecode } from "jwt-decode";
import { useEffect, useRef, useState } from "react";
import { Button } from "react-bootstrap";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import otpapi from "../../api/otpapi";

const ReviewerInvitation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const query = new URLSearchParams(location.search);
  const token = query.get("token");

  const [reviewerEmail, setReviewerEmail] = useState("");
  const [senderEmail, setSenderEmail] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [documentId, setDocumentId] = useState("");
  const [documentName, setDocumentName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [enteredOtp, setEnteredOtp] = useState("");
  const [sentOtp, setSentOtp] = useState("");
  const [invitationAccepted, setInvitationAccepted] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const timerRef = useRef(null);

  // Decode token on load
  useEffect(() => {
    if (!token) {
      setError("No token provided.");
      setLoading(false);
      return;
    }

    try {
      const decoded = jwtDecode(token);
      const currentTime = Date.now() / 1000;
      if (decoded.exp < currentTime) {
        setError("Link expired.");
      } else {
        setReviewerEmail(decoded.reviewerEmail);
        setSenderEmail(decoded.senderEmail);
        setCompanyName(decoded.companyName);
        setDocumentId(decoded.documentId);
        setDocumentName(decoded.documentName);
      }
    } catch (err) {
      setError("Invalid token.");
    } finally {
      setLoading(false);
    }
  }, [token]);

  // Countdown logic
  useEffect(() => {
    if (countdown > 0) {
      timerRef.current = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
    } else if (countdown === 0 && otpSent && !otpVerified) {
      setSentOtp("");
      setOtpSent(false);
      toast.info("OTP expired, please resend.");
    }

    return () => clearTimeout(timerRef.current);
  }, [countdown, otpSent, otpVerified]);

  // Send OTP handler
  const handleSendOtp = async () => {
    setIsSendingOtp(true);
    try {
      const response = await otpapi.validateUserEmail(reviewerEmail); // API call
      const otpValue = response?.data?.otp || response.data;

      setSentOtp(otpValue);
      setOtpSent(true);
      setCountdown(60);
      setEnteredOtp("");
      setOtpVerified(false);

      toast.success("OTP sent to your email!");
    } catch (err) {
      toast.error("Failed to send OTP.");
    } finally {
      setIsSendingOtp(false);
    }
  };

  // Verify OTP
  const handleVerifyOtp = () => {
    if (!otpSent) {
      toast.error("Please send OTP first.");
      return;
    }

    if (countdown === 0) {
      toast.error("OTP expired. Please resend OTP.");
      return;
    }

    if (enteredOtp == sentOtp) {
      setOtpVerified(true);
      toast.success("OTP Verified!");
    } else {
      toast.error("Invalid OTP.");
    }
  };

  // Accept Invitation
  const handleAcceptInvitation = () => {
    if (!otpVerified) {
      toast.error("Please verify OTP first.");
      return;
    }

    setInvitationAccepted(true);
    toast.success("Invitation accepted!");

    setTimeout(() => {
      navigate("/signin", {
        state: {
          reviewerEmail,
          senderEmail,
          companyName,
          documentId,
          documentName,
        },
      });
    }, 2000);
  };

  return (
    <>
      <div className="navbar navbar-expand-lg navbar-light shadow-sm px-3">
        <Link to="/" className="navbar-brand d-flex align-items-center">
          <img src="/assets/images/logo.png" alt="Logo" height="50" />
        </Link>
      </div>

      <div style={{ maxWidth: 500, margin: "50px auto", padding: 20 }}>
        {loading ? (
          <h2>Loading...</h2>
        ) : error ? (
          <p style={{ color: "red" }}>{error}</p>
        ) : invitationAccepted ? (
          <div>
            <h3>🎉 Invitation Accepted</h3>
            <p>
              Hello <a href={`mailto:${reviewerEmail}`}>{reviewerEmail}</a>,
              you’ve been invited by{" "}
              <a href={`mailto:${senderEmail}`}>{senderEmail}</a>{" "}
              {companyName && `to review documents for ${companyName}`}.
            </p>
            <p>
              Please <Link to="/signin">sign in</Link> to access your review
              dashboard.
            </p>
          </div>
        ) : (
          <>
            <h3>You're Invited as a Reviewer</h3>
            <p>
              Invited by: <strong>{senderEmail}</strong>
            </p>

            {companyName && (
              <p>
                Company: <strong>{companyName}</strong>
              </p>
            )}

            <p>
              You have been invited to review the document:{" "}
              <strong>{documentName}</strong>
            </p>
            <p>
              Please verify your email first, and then sign in to{" "}
              <strong>SignBook.co</strong> to access and review the document.
            </p>

            {/* Send OTP button - hide if already verified */}
            {!otpSent && !otpVerified && (
              <Button onClick={handleSendOtp} disabled={isSendingOtp}>
                {isSendingOtp ? "Sending..." : "Send OTP"}
              </Button>
            )}

            {/* OTP Input & Verify */}
            {otpSent && !otpVerified && (
              <>
                <div
                  style={{
                    display: "flex",
                    gap: "10px",
                    alignItems: "center",
                    marginTop: "10px",
                  }}
                >
                  <input
                    type="text"
                    placeholder="Enter OTP"
                    value={enteredOtp}
                    onChange={(e) => setEnteredOtp(e.target.value)}
                    style={{ flex: 1, padding: "8px" }}
                  />
                  <Button variant="info" onClick={handleVerifyOtp}>
                    Verify OTP
                  </Button>
                </div>

                <div style={{ marginTop: 10 }}>
                  {countdown > 0
                    ? `OTP expires in: ${countdown} seconds`
                    : "OTP expired."}
                </div>

                {countdown === 0 && (
                  <Button
                    variant="danger"
                    onClick={handleSendOtp}
                    disabled={isSendingOtp}
                    style={{ marginTop: 10 }}
                  >
                    {isSendingOtp ? "Sending..." : "Resend OTP"}
                  </Button>
                )}
              </>
            )}

            {/* Accept Invitation button */}
            {otpVerified && !invitationAccepted && (
              <Button
                style={{ marginTop: 20 }}
                onClick={handleAcceptInvitation}
              >
                Accept Invitation
              </Button>
            )}

            {/* Post-accept message */}
            {invitationAccepted && (
              <p style={{ marginTop: 20, fontWeight: 500 }}>
                ✅ Invitation accepted. Redirecting to{" "}
                <strong>SignBook.co</strong>...
              </p>
            )}
          </>
        )}

        <ToastContainer />
      </div>
    </>
  );
};

export default ReviewerInvitation;
