// src/pages/AdminLogin.jsx
import { Form, Formik } from "formik";
import { Button, Card, Col, Row } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import * as Yup from "yup";
import TextField from "../components/sessions/TextField";

const AdminLogin = () => {
    const navigate = useNavigate();

    const initialValues = {
        email: "",
        password: "",
    };

    const validationSchema = Yup.object({
        email: Yup.string().email("Invalid email").required("Email is required"),
        password: Yup.string().required("Password is required"),
    });

    const handleSubmit = (values, { setSubmitting, setFieldError }) => {
        const adminEmail = "esigningadmin123@gmail.com";
        const adminPassword = "@Admin123";

        if (
            values.email === adminEmail &&
            values.password === adminPassword
        ) {
            navigate("/admin-dashboard");
        } else {
            setFieldError("password", "❌ You are not authorized as admin");
        }

        setSubmitting(false);
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


                            </div>
                        </Col>

                        <Col md={6} className="auth-cover">
                            <div className="p-4">
                                <h3 className="text-center mb-4">Admin Login</h3>
                                <Formik
                                    initialValues={initialValues}
                                    validationSchema={validationSchema}
                                    onSubmit={handleSubmit}
                                >
                                    {({ values, errors, touched, handleChange, handleBlur, isSubmitting }) => (
                                        <Form>
                                            <div style={{ marginBottom: 16 }}>
                                                <TextField
                                                    name="email"
                                                    label="Email"
                                                    type="email"
                                                    variant="outlined"
                                                    fullWidth
                                                    value={values.email}
                                                    onChange={handleChange}
                                                    onBlur={handleBlur}
                                                    error={touched.email && Boolean(errors.email)}
                                                    helperText={touched.email && errors.email}
                                                />
                                            </div>

                                            <div style={{ marginBottom: 16 }}>
                                                <TextField
                                                    name="password"
                                                    label="Password"
                                                    type="password"
                                                    variant="outlined"
                                                    fullWidth
                                                    value={values.password}
                                                    onChange={handleChange}
                                                    onBlur={handleBlur}
                                                    error={touched.password && Boolean(errors.password)}
                                                    helperText={touched.password && errors.password}
                                                />
                                            </div>

                                            <Button
                                                type="submit"
                                                color="primary"
                                                fullWidth
                                                disabled={isSubmitting}
                                            >
                                                {isSubmitting ? "Logging in..." : "Login"}
                                            </Button>
                                        </Form>
                                    )}
                                </Formik>
                            </div>
                        </Col>
                    </Row>
                </Card>
            </div>
        </div>
    );
};

export default AdminLogin;
