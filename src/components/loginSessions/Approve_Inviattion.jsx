import { jwtDecode } from "jwt-decode";
import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import companyUserApi from "../../api/companyUsers";
import otpapi from "../../api/otpapi";

const Approve_Invitation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const query = new URLSearchParams(location.search);
  const token = query.get("token");

  const [error, setError] = useState("");
  const [deadline, setDeadline] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [invitedBy, setInvitedBy] = useState("");
  const [loading, setLoading] = useState(true);

  const [sentOtp, setSentOtp] = useState("");
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [timerActive, setTimerActive] = useState(false);
  const [enteredOtp, setEnteredOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [invitationAccepted, setInvitationAccepted] = useState(false);

  const timerRef = useRef(null);

  useEffect(() => {
    if (!token) {
      setError("No token provided.");
      setLoading(false);
      return;
    }

    try {
      const decoded = jwtDecode(token);
      const currentTime = Date.now() / 1000; // in seconds

      if (decoded.exp < currentTime) {
        setError("Sorry, the link has expired. Please request a new one.");
      } else {
        setUserEmail(decoded.userEmail);
        setDeadline(new Date(decoded.exp * 1000).toLocaleString());
        setCompanyName(decoded.companyName);
        setInvitedBy(decoded.invitedBy);
      }
    } catch (err) {
      setError("Invalid or expired token.");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (timerActive && countdown > 0) {
      timerRef.current = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
    } else if (countdown === 0) {
      setTimerActive(false);
      setOtpSent(false);
      setSentOtp("");
      toast.info("OTP expired, please resend OTP.");
    }

    return () => clearTimeout(timerRef.current);
  }, [countdown, timerActive]);

  const handleSendOtp = async () => {
    setIsSendingOtp(true);
    try {
      const response = await otpapi.validateUserEmail(userEmail); // assuming this sends OTP
      setSentOtp(response.data.otp || response.data); // adjust according to your API response
      setOtpSent(true);
      toast.success("OTP sent to your email!");
      setCountdown(60);
      setTimerActive(true);
      setEnteredOtp("");
      setOtpVerified(false);
    } catch (err) {
      toast.error("Failed to send OTP");
    } finally {
      setIsSendingOtp(false);
    }
  };

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
      toast.error("Invalid OTP");
    }
  };
  // const handleAcceptInvitation = async () => {
  //   if (!otpVerified) {
  //     toast.error("Please verify OTP before accepting the invitation.");
  //     return;
  //   }

  //   try {
  //     const acceptInvitationData = {
  //       userEmail:userEmail,
  //       invitedByEmail:invitedBy,
  //       companyName:companyName
  //     };

  //     await companyUserApi.acceptInvitation(acceptInvitationData);

  //     setInvitationAccepted(true);
  //     toast.success("Invitation accepted! You can now access your dashboard.");
  //   } catch (error) {
  //     toast.error("Failed to accept invitation.");
  //     console.error(error);
  //   }
  // };

  const handleAcceptInvitation = async () => {
    if (!otpVerified) {
      toast.error("Please verify OTP before accepting the invitation.");
      return;
    }

    try {
      const acceptInvitationData = {
        userEmail: userEmail,
        invitedByEmail: invitedBy,
        companyName: companyName,
      };

      await companyUserApi.acceptInvitation(acceptInvitationData);

      setInvitationAccepted(true);
      toast.success("Invitation accepted! Redirecting...");

      // 🔍 Check if user is logged in
      const user = localStorage.getItem("user");

      // ⏳ Wait a moment for user to see the toast (optional)
      setTimeout(() => {
        if (user) {
          navigate("/dashboard/invitations", {
            state: {
              userEmail,
              companyName,
              invitedBy,
            },
          });
        } else {
          navigate("/signin", {
            state: {
              userEmail,
              companyName,
              invitedBy,
            },
          });
        }
      }, 2000); // Optional 2-second delay for UX
    } catch (error) {
      toast.error("Failed to accept invitation.");
      console.error(error);
    }
  };

  return (
    <>
      <div className="navbar navbar-expand-lg navbar-light shadow-sm px-3 ">
        <Link to="/" className="navbar-brand d-flex align-items-center">
          <img src="/assets/images/logo.png" alt="Logo" height="50" />
        </Link>
      </div>
      <div
        style={{
          maxWidth: 500,
          margin: "50px auto",
          padding: 20,
          border: "1px solid #ccc",
          borderRadius: 8,
        }}
      >
        {loading ? (
          <h2>Loading invitation details...</h2>
        ) : error ? (
          <div style={{ color: "red", fontWeight: "bold" }}>{error}</div>
        ) : (
          <>
            <h2>You're Invited to signbook.co</h2>
            <p>
              You have been invited to join <strong>{companyName}</strong>.
            </p>
            <p>
              Invited by : <strong>{invitedBy}</strong>
            </p>
            <p>
              Invitation expires on: <strong>{deadline}</strong>
            </p>

            {/* OTP Section */}
            {!otpVerified && (
              <>
                {!otpSent ? (
                  <button
                    onClick={handleSendOtp}
                    disabled={isSendingOtp}
                    style={{
                      padding: "10px 20px",
                      backgroundColor: "#4CAF50",
                      color: "#fff",
                      border: "none",
                      borderRadius: 5,
                      cursor: isSendingOtp ? "not-allowed" : "pointer",
                      marginTop: 20,
                    }}
                  >
                    {isSendingOtp ? "Sending OTP..." : "Send OTP"}
                  </button>
                ) : (
                  <div style={{ marginTop: 20 }}>
                    <input
                      type="text"
                      placeholder="Enter OTP"
                      value={enteredOtp}
                      onChange={(e) => setEnteredOtp(e.target.value)}
                      maxLength={6}
                      style={{ padding: "8px", width: "60%", marginRight: 10 }}
                    />
                    <button
                      onClick={handleVerifyOtp}
                      style={{
                        padding: "8px 16px",
                        backgroundColor: "#2196F3",
                        color: "#fff",
                        border: "none",
                        borderRadius: 5,
                        cursor: "pointer",
                      }}
                    >
                      Verify OTP
                    </button>
                    <div style={{ marginTop: 10 }}>
                      {countdown > 0
                        ? `OTP expires in: ${countdown} seconds`
                        : "OTP expired."}
                    </div>
                    <button
                      onClick={handleSendOtp}
                      disabled={isSendingOtp}
                      style={{
                        marginTop: 10,
                        backgroundColor: "#f44336",
                        color: "#fff",
                        padding: "8px 16px",
                        border: "none",
                        borderRadius: 5,
                        cursor: isSendingOtp ? "not-allowed" : "pointer",
                      }}
                    >
                      Resend OTP
                    </button>
                  </div>
                )}
              </>
            )}

            {otpVerified && !invitationAccepted && (
              <button
                onClick={handleAcceptInvitation}
                style={{
                  padding: "10px 20px",
                  backgroundColor: "#4CAF50",
                  color: "#fff",
                  border: "none",
                  borderRadius: 5,
                  marginTop: 20,
                  cursor: "pointer",
                }}
              >
                Accept Invitation
              </button>
            )}
          </>
        )}

        {invitationAccepted && (
          <div style={{ marginTop: 30, textAlign: "center" }}>
            <p style={{ fontWeight: "bold", color: "#4CAF50" }}>
              🎉 Invitation accepted successfully!
            </p>
            <p>
              Please{" "}
              <button
                onClick={() =>
                  navigate("/signin", {
                    state: {
                      userEmail: userEmail,
                      companyName: companyName,
                      invitedBy: invitedBy,
                    },
                  })
                }
                style={{
                  background: "none",
                  border: "none",
                  color: "#2196F3",
                  textDecoration: "underline",
                  fontWeight: "bold",
                  cursor: "pointer",
                  padding: 0,
                }}
              >
                click here
              </button>{" "}
              to login to your account.
            </p>
          </div>
        )}

        <ToastContainer
          position="top-right"
          autoClose={5000}
          hideProgressBar={false}
        />
      </div>
    </>
  );
};

export default Approve_Invitation;
