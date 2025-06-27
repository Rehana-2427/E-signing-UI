import { Formik } from "formik";
import { useEffect, useState } from "react";
import { Button, Card, Col, Modal, Row } from "react-bootstrap";
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { toast, ToastContainer } from "react-toastify";
import Swal from 'sweetalert2';
import * as yup from "yup";
import api from "../api/authapi";
import SocialButtons from "../components/sessions/SocialButtons";
import TextField from "../components/sessions/TextField";

const UserSignup = () => {
    const validationSchema = yup.object().shape({
        username: yup.string().required("Name is required"),
        email: yup.string().email("Invalid email").required("Email is required"),
        password: yup
            .string()
            .min(8, "Password must be 8 characters long")
            .required("Password is required"),
        rePassword: yup
            .string()
            .required("Repeat Password is required")
            .oneOf([yup.ref("password")], "Passwords must match")
    });

    const initialValues = {
        email: "",
        username: "",
        password: "",
        rePassword: ""
    };

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [sentOtp, setSentOtp] = useState("");
    const [enteredOtp, setEnteredOtp] = useState("");
    const [otpSent, setOtpSent] = useState(false);
    const [otpVerified, setOtpVerified] = useState(false);
    const [passwordCriteriaError, setPasswordCriteriaError] = useState(false);
    const [passwordMatchError, setPasswordMatchError] = useState(false);
    const [showOtpModal, setShowOtpModal] = useState(false);

    const validatePassword = (values) => {
        const { password, rePassword } = values;
        const isValidPassword = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+])[A-Za-z\d!@#$%^&*()_+]{8,20}$/.test(password);
        const passwordsMatch = password === rePassword;

        if (!isValidPassword) {
            setPasswordCriteriaError(true);
            return false;
        }

        if (!passwordsMatch) {
            setPasswordMatchError(true);
            return false;
        }

        return true;
    };

    const handleSendOtp = async (userEmail) => {
        try {
            const response = await api.validateUserEmail(userEmail);
            setSentOtp(response.data);
            setOtpSent(true);
            setShowOtpModal(true);
            toast.success("OTP sent to your email!");
        } catch (err) {
            toast.error("Failed to send OTP");
        }
    };

    const handleVerifyOtp = () => {
        if (enteredOtp == sentOtp) {
            console.log("entered OTP: ", enteredOtp)
            console.log("sent otp: ", sentOtp)
            setOtpVerified(true);
            setShowOtpModal(false);
            toast.success("OTP Verified");
        } else {
            toast.error("Invalid OTP");
        }
    };

    const handleSubmit = async (values, { resetForm, setSubmitting, setErrors }) => {
        setSubmitting(true);

        if (!otpVerified) {
            toast.error("Please verify your email before registering.");
            setSubmitting(false);
            return;
        }

        if (!validatePassword(values)) {
            setSubmitting(false);
            return;
        }

        try {
            const response = await api.saveUser({
                userName: values.username,
                userEmail: values.email,
                password: values.password,
            });
            Swal.fire({
                title: 'Registration Successful!',
                text: 'You have registered successfully. Please login.',
                icon: 'success',
                confirmButtonText: 'OK'
            }).then(() => {
                window.location.href = '/signin';
            });
            resetForm();
            setOtpSent(false);
            setOtpVerified(false);
        } catch (error) {
            const backendMessage = error.response?.data;
            if (backendMessage === "Email already exists") {
                setErrors({ email: backendMessage });
            } else {
                toast.error("Registration failed");
            }
        } finally {
            setSubmitting(false);
        }
    };

    const showErrorToast = () => {
        toast.error(
            <div className="alert alert-info" style={{ maxWidth: '400px', margin: '20px auto' }}>
                <h5>Password Guidelines</h5>
                <ul className="list-unstyled">
                    <li>• At least one number</li>
                    <li>• One special character</li>
                    <li>• One uppercase letter</li>
                    <li>• One lowercase letter</li>
                    <li>• Between 8 to 20 characters</li>
                </ul>
            </div>
        );
    };

    useEffect(() => {
        if (passwordCriteriaError) {
            showErrorToast();
        }
    }, [passwordCriteriaError]);

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
                                <div className="w-100 h-100 justify-content-center d-flex flex-column">
                                    <SocialButtons
                                        isLogin
                                        routeUrl="/signin"
                                        googleHandler={() => alert("Google login")}
                                        facebookHandler={() => alert("Facebook login")}
                                    />
                                </div>
                            </div>
                        </Col>
                        <Col md={6}>
                            <div className="p-4">
                                <h1 className="mb-3 text-18">Sign Up</h1>
                                <Formik
                                    onSubmit={handleSubmit}
                                    initialValues={initialValues}
                                    validationSchema={validationSchema}
                                >
                                    {({ values, errors, touched, handleChange, handleBlur, handleSubmit }) => (
                                        <form onSubmit={handleSubmit}>
                                            <TextField
                                                type="text"
                                                name="username"
                                                label="Your name"
                                                onBlur={handleBlur}
                                                value={values.username}
                                                onChange={handleChange}
                                                helperText={errors.username}
                                                error={errors.username && touched.username}

                                            />
                                            <TextField
                                                type="email"
                                                name="email"
                                                label="Email address"
                                                onBlur={handleBlur}
                                                value={values.email}
                                                onChange={handleChange}
                                                helperText={errors.email}
                                                error={errors.email && touched.email}
                                                disabled={otpSent || otpVerified}
                                            />
                                            {!otpVerified && (
                                                <div className="text-center mb-3">
                                                    <Button
                                                        className="mt-2"
                                                        onClick={() => {
                                                            if (values.email) {
                                                                handleSendOtp(values.email);
                                                            } else {
                                                                toast.error("Enter email first");
                                                            }
                                                        }}
                                                    >
                                                        Send OTP
                                                    </Button>
                                                </div>
                                            )}
                                            {otpSent && !otpVerified && (
                                                <div className="mb-3">
                                                    <TextField
                                                        type="text"
                                                        name="otp"
                                                        label="Enter OTP"
                                                        value={enteredOtp}
                                                        onChange={(e) => setEnteredOtp(e.target.value)}
                                                    />
                                                    <Button className="mt-2" onClick={handleVerifyOtp}>
                                                        Verify OTP
                                                    </Button>
                                                </div>
                                            )}

                                            <>
                                                <div className="position-relative">
                                                    <TextField
                                                        type={showPassword ? "text" : "password"}
                                                        name="password"
                                                        label="Password"
                                                        onBlur={handleBlur}
                                                        value={values.password}
                                                        onChange={handleChange}
                                                        helperText={errors.password}
                                                        error={touched.password && Boolean(errors.password)}
                                                        disabled={!otpVerified}

                                                    />
                                                    <button
                                                        type="button"
                                                        className="btn btn-link position-absolute"
                                                        style={{
                                                            right: '60px',
                                                            top: '70%',
                                                            transform: 'translateY(-50%)',
                                                            padding: 0,
                                                            color: '#6c757d',
                                                            background: 'transparent',
                                                            border: 'none',
                                                            cursor: 'pointer'
                                                        }}
                                                        onClick={() => setShowPassword(!showPassword)}
                                                    >
                                                        {showPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
                                                    </button>
                                                </div>
                                                <div className="position-relative">
                                                    <TextField
                                                        type={showConfirmPassword ? "text" : "password"}
                                                        name="rePassword"
                                                        label="Retype password"
                                                        onBlur={handleBlur}
                                                        value={values.rePassword}
                                                        onChange={handleChange}
                                                        helperText={errors.rePassword}
                                                        error={touched.rePassword && Boolean(errors.rePassword)}
                                                        disabled={!otpVerified}
                                                    />
                                                    <button
                                                        type="button"
                                                        className="btn btn-link position-absolute"
                                                        style={{
                                                            right: '60px',
                                                            top: '70%',
                                                            transform: 'translateY(-50%)',
                                                            padding: 0,
                                                            color: '#6c757d',
                                                            background: 'transparent',
                                                            border: 'none',
                                                            cursor: 'pointer'
                                                        }}
                                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                    >
                                                        {showConfirmPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
                                                    </button>
                                                </div>
                                                <Button type="submit" className="mt-3">
                                                    Sign Up
                                                </Button>
                                                {passwordMatchError && (
                                                    <p style={{ color: 'red', fontSize: '0.875rem' }}>
                                                        Password did not match, please try again...
                                                    </p>
                                                )}
                                            </>
                                        </form>
                                    )}
                                </Formik>
                            </div>
                        </Col>
                    </Row>
                </Card>
            </div>
            <ToastContainer position="top-right" autoClose={5000} hideProgressBar={false} />
            <Modal show={showOtpModal} onHide={() => setShowOtpModal(false)} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Enter OTP</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <TextField
                        type="text"
                        name="otp"
                        label="Enter OTP"
                        value={enteredOtp}
                        onChange={(e) => setEnteredOtp(e.target.value)}
                    />
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowOtpModal(false)}>
                        Close
                    </Button>
                    <Button variant="primary" onClick={handleVerifyOtp}>
                        Verify OTP
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default UserSignup;
