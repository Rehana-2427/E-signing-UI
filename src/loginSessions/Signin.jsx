import { Form, Formik } from "formik";
import { useState } from "react";
import { Card, Col, Row } from "react-bootstrap";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import * as yup from 'yup';
import api from "../../api/authapi";
import SocialButtons from "../sessions/SocialButtons";
import TextField from "../sessions/TextField";

const Signin = () => {

    const navigate = useNavigate();

    const validationSchema = yup.object().shape({
        userEmail: yup.string().email("Invalid email").required("Email is required"),
        password: yup.string().min(8, "Password must be 8 characters long").required("Password is required")
    });

    const initialValues = { userEmail: "", password: "" };

    const [showPassword, setShowPassword] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    const handleLogin = async (values, setSubmitting) => {
        Swal.fire({
            title: 'Signing in...',
            allowOutsideClick: false,
            didOpen: () => {
                Swal.showLoading();
            }
        });

        try {
            const response = await api.userLogin({ userEmail: values.userEmail, password: values.password });
            const user = response.data.user;
            const token = response.data.token;

            const errorMessage = response.data.errorMessage;

            console.log(user)
            if (errorMessage) {
                setErrorMessage(errorMessage);
                return;
            }
            // Save to localStorage
            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(user));
            setSuccessMessage(response.data.successMessage || "Login successful!");

            console.log(user.userName)
            navigate("/dashboard", {
                state: { userName: user.userName }
            });
        } catch (error) {
            const errorMsg = error?.response?.data?.errorMessage || "Login failed. Please try again.";
            setErrorMessage(errorMsg);
        } finally {
            setSubmitting(false);
            Swal.close();
        }
    };

    return (
        <div className="auth-layout-wrap">
            <div className="auth-content">
                <Card className="o-hidden card">
                    <Row>
                        <Col md={6}>
                            <div className="p-4">
                                <div className="auth-logo text-center mb-4">
                                    <img src="/assets/images/logo.png" alt="e-signature" />
                                </div>
                                <h1 className="mb-3 text-18">Login</h1>

                                <Formik initialValues={initialValues} validationSchema={validationSchema}
                                    onSubmit={(values, { setSubmitting }) => handleLogin(values, setSubmitting)}
                                >
                                    {({ values, errors, touched, handleChange, handleBlur, handleSubmit, isSubmitting }) => (
                                        <Form onSubmit={handleSubmit}>
                                            <TextField
                                                type="email"
                                                name="userEmail"
                                                label="Email address"
                                                onBlur={handleBlur}
                                                value={values.userEmail}
                                                onChange={handleChange}
                                                helperText={errors.userEmail}
                                                error={errors.userEmail && touched.userEmail}
                                            />
                                            <div className="position-relative">
                                                <TextField
                                                    type={showPassword ? "text" : "password"}
                                                    name="password"
                                                    label="Password"
                                                    onBlur={handleBlur}
                                                    value={values.password}
                                                    onChange={handleChange}
                                                    helperText={errors.password}
                                                    error={errors.password && touched.password}
                                                    style={{ paddingRight: '40px' }}
                                                />
                                                <button
                                                    type="button"
                                                    className="btn btn-link position-absolute"
                                                    style={{
                                                        right: '60px',
                                                        top: '70%',
                                                        transform: 'translateY(-50%)',
                                                        padding: '0',
                                                        color: '#6c757d',
                                                        zIndex: '1',
                                                        background: 'transparent',
                                                        border: 'none',
                                                        cursor: 'pointer'
                                                    }}
                                                    onClick={() => setShowPassword(!showPassword)}
                                                >
                                                    {showPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
                                                </button>
                                            </div>
                                            <button
                                                type="submit"
                                                className="btn btn-rounded btn-primary w-100 my-1 mt-2"
                                                disabled={isSubmitting}
                                            >
                                                {isSubmitting ? 'Signing In...' : 'Login'}
                                            </button>
                                        </Form>
                                    )}
                                </Formik>

                                {errorMessage && <div className="text-danger mt-2">{errorMessage}</div>}
                                {successMessage && <div className="text-success mt-2">{successMessage}</div>}

                                <div className="mt-3 text-center">
                                    <Link to="/forget-password" className="text-muted">Forgot Password?</Link>
                                </div>
                            </div>
                        </Col>
                        <Col md={6} className="text-center auth-cover">
                            <div className="pe-3 auth-right">
                                <SocialButtons isLogin={true} routeUrl="/register" googleHandler={() => { }} />
                            </div>
                        </Col>
                    </Row>
                </Card>
            </div>
        </div>
    );
};

export default Signin;
