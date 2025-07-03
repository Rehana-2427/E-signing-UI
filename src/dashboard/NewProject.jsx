import { FieldArray, Formik } from "formik";
import { useEffect, useState } from "react";
import { Button, Card } from "react-bootstrap";
import DateTime from "react-datetime";
import { useNavigate } from "react-router-dom";
import * as Yup from "yup";
import documentApi from "../api/documentapi";
import Breadcrumb from "../components/sessions/Breadcrumb";
import Navbar from "./layout/Navbar";

const NewProject = () => {
    const user = JSON.parse(localStorage.getItem('user'));
    const userEmail = user?.userEmail;
    const [pdfFile, setPdfFile] = useState(null);
    const [pdfUrl, setPdfUrl] = useState(null);
    const [showPdfEditor, setShowPdfEditor] = useState(false);
    const [uploadedPdf, setUploadedPdf] = useState(null);
    const navigate = useNavigate();
    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            setPdfFile(file);
            setUploadedPdf(file);

            // Revoke previous URL if exists
            if (pdfUrl) {
                URL.revokeObjectURL(pdfUrl);
            }
            const url = URL.createObjectURL(file);
            setPdfUrl(url);
            setPdfFile(file)
        } else {
            alert("Only PDF files are allowed.");
        }
    };

    const handlePdfEditorClose = () => {
        setShowPdfEditor(false);
    };

    const handleSubmit = async (values, { setSubmitting }) => {
        const formData = new FormData();
        formData.append("title", values.title);
        const formattedDate = values.signRequiredBy.toISOString().split("T")[0]; // "YYYY-MM-DD"
        formData.append("signRequiredBy", formattedDate);
        formData.append("termsType", values.termsOption);
        formData.append("senderEmail", userEmail);

        if (values.termsOption === "link") {
            formData.append("termsLink", values.termsOfSigning);
        } else {
            formData.append("termsPdf", values.termsOfSigning);
        }

        if (pdfFile) {
            formData.append("pdf", pdfFile);
        }

        formData.append("signers", JSON.stringify(values.signers));

        try {
            const response = await documentApi.saveDocument(formData);
            console.log(response);
            alert("saved successfully");
        } catch (error) {
            console.error("Upload failed", error);
        } finally {
            setSubmitting(false);
        }
    };

    useEffect(() => {
        const handleMessage = (e) => {
            if (e.origin === window.location.origin && e.data.pdfUrl) {
                setPdfUrl(e.data.pdfUrl);
            }
        };
        window.addEventListener("message", handleMessage);
        return () => window.removeEventListener("message", handleMessage);
    }, []);

    console.log("Preview button clicked");
    console.log("PDF URL:", pdfUrl);


    const validationSchema = Yup.object().shape({
        title: Yup.string().required("Title is required"),
        signRequiredBy: Yup.date().typeError("Date is required").required("Date is required"),
        termsOption: Yup.string().required("Terms option is required"),
        termsOfSigning: Yup.mixed().when("termsOption", {
            is: "link",
            then: (schema) =>
                Yup.mixed()
                    .test("is-url", "Must be a valid URL", (value) =>
                        typeof value === "string" && /^(ftp|http|https):\/\/[^ "]+$/.test(value)
                    )
                    .required("Terms link is required"),
            otherwise: (schema) =>
                Yup.mixed()
                    .test("fileExists", "PDF file is required", function (value) {
                        return value instanceof File || value === ""; // allow empty string during init
                    }),
        }),


        signers: Yup.array()
            .of(
                Yup.object().shape({
                    name: Yup.string().required("Name is required"),
                    email: Yup.string().email("Invalid email").required("Email is required"),
                })
            )
            .min(1, "At least one signer is required"),
    });

    return (
        <div>
            <Navbar />
            <section>
                <Breadcrumb routeSegments={[{ path: "/forms" }]} />
                <h2>Create a Signing Project</h2>
                <Card style={{ margin: "20px" }}>
                    <Formik
                        initialValues={{
                            title: "",
                            signRequiredBy: "",
                            termsOption: "document",
                            termsOfSigning: "",
                            signers: [{ name: "", email: "" }],
                        }}
                        validationSchema={validationSchema}
                        onSubmit={(values, actions) => {
                            if (values.termsOption === "document" && !pdfFile) {
                                actions.setFieldError("termsOfSigning", "PDF file is required");
                                actions.setSubmitting(false);
                                return;
                            }
                            handleSubmit(values, actions);
                        }}
                    >
                        {({
                            values,
                            errors,
                            touched,
                            handleChange,
                            handleBlur,
                            handleSubmit,
                            setFieldValue,
                            isSubmitting
                        }) => (
                            <form onSubmit={handleSubmit} className="p-3">
                                {/* Title */}
                                <div className="row">
                                    <div className="col-md-5 form-group mb-3">
                                        <label htmlFor="title">Title <span style={{ color: "red" }}>*</span></label>
                                        <input
                                            id="title"
                                            name="title"
                                            className="form-control"
                                            placeholder="Enter your Title"
                                            type="text"
                                            onChange={handleChange}
                                            onBlur={handleBlur}
                                            value={values.title}
                                            required
                                        />
                                        {errors.title && touched.title && (
                                            <div className="text-danger">{errors.title}</div>
                                        )}
                                    </div>
                                    {/* Date */}
                                    <div className="col-md-5 form-group mb-3">
                                        <label htmlFor="signRequiredBy">Sign required by date <span style={{ color: "red" }}>*</span></label>
                                        <DateTime
                                            name="signRequiredBy"
                                            timeFormat={false}
                                            dateFormat="YYYY-MM-DD"
                                            onChange={(date) => {
                                                setFieldValue("signRequiredBy", date && date.toDate ? date.toDate() : date);
                                            }}
                                            inputProps={{ placeholder: "Select date" }}
                                            required
                                        />
                                        {errors.signRequiredBy && touched.signRequiredBy && (
                                            <div className="text-danger">{errors.signRequiredBy}</div>
                                        )}
                                    </div>
                                </div>
                                {/* Add Signers */}
                                <FieldArray name="signers">
                                    {({ remove, push }) => (
                                        <div className="mb-3">
                                            <h4>People to Sign <span style={{ color: "red" }}>*</span></h4>
                                            {values.signers.map((signer, index) => (
                                                <div className="row mb-2" key={index}>
                                                    <div className="col-md-5">
                                                        <label>Name of User <span style={{ color: "red" }}>*</span></label>
                                                        <input
                                                            name={`signers[${index}].name`}
                                                            placeholder="Name"
                                                            className="form-control"
                                                            value={signer.name}
                                                            onChange={handleChange}
                                                            onBlur={handleBlur}
                                                            required
                                                        />
                                                        {errors.signers && errors.signers[index] && errors.signers[index].name && touched.signers && touched.signers[index] && touched.signers[index].name && (
                                                            <div className="text-danger">{errors.signers[index].name}</div>
                                                        )}
                                                    </div>
                                                    <div className="col-md-5">
                                                        <label>Email Id <span style={{ color: "red" }}>*</span></label>
                                                        <input
                                                            name={`signers[${index}].email`}
                                                            placeholder="Email"
                                                            className="form-control"
                                                            value={signer.email}
                                                            onChange={handleChange}
                                                            onBlur={handleBlur}
                                                            required
                                                        />
                                                        {errors.signers && errors.signers[index] && errors.signers[index].email && touched.signers && touched.signers[index] && touched.signers[index].email && (
                                                            <div className="text-danger">{errors.signers[index].email}</div>
                                                        )}
                                                    </div>
                                                    <div className="col-md-2">
                                                        {index > 0 && (
                                                            <Button
                                                                variant="danger"
                                                                onClick={() => remove(index)}
                                                            >
                                                                Remove
                                                            </Button>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                            <Button
                                                type="button"
                                                variant="secondary"
                                                onClick={() => push({ name: "", email: "" })}
                                            >
                                                + Add Signer
                                            </Button>
                                            {typeof errors.signers === "string" && touched.signers && (
                                                <div className="text-danger">{errors.signers}</div>
                                            )}
                                        </div>
                                    )}
                                </FieldArray>
                                {/* Terms of Signing */}
                                <div className="form-group mb-3">
                                    <label className="d-block">Terms of Signing <span style={{ color: "red" }}>*</span></label>
                                    <div className="form-check form-check-inline">
                                        <input
                                            type="radio"
                                            name="termsOption"
                                            id="termsDoc"
                                            value="document"
                                            className="form-check-input"
                                            onChange={(e) => {
                                                handleChange(e);
                                                setFieldValue("termsOfSigning", "");
                                            }}
                                            checked={values.termsOption === "document"}
                                            required
                                        />
                                        <label className="form-check-label" htmlFor="termsDoc">Document</label>
                                    </div>
                                    <div className="form-check form-check-inline">
                                        <input
                                            type="radio"
                                            name="termsOption"
                                            id="termsLink"
                                            value="link"
                                            className="form-check-input"
                                            onChange={(e) => {
                                                handleChange(e);
                                                setFieldValue("termsOfSigning", "");
                                            }}
                                            checked={values.termsOption === "link"}
                                        />
                                        <label className="form-check-label" htmlFor="termsLink">Link</label>
                                    </div>
                                </div>
                                {/* Conditional Fields */}
                                {values.termsOption === "document" && (
                                    <div className="form-group mb-3 col-md-10">
                                        <label>Upload Terms Document (PDF) <span style={{ color: "red" }}>*</span></label>
                                        <input
                                            type="file"
                                            accept="application/pdf,image/*"
                                            className="form-control"
                                            onChange={handleFileUpload}
                                        />
                                        {errors.termsOfSigning && touched.termsOfSigning && (
                                            <div className="text-danger">{errors.termsOfSigning}</div>
                                        )}

                                    </div>
                                )}
                                <Button
                                    variant="primary"
                                    className="mt-2 ms-2"
                                    disabled={
                                        !values.title ||
                                        !values.signRequiredBy ||
                                        !values.signers.length ||
                                        values.signers.some(s => !s.name || !s.email) ||
                                        (values.termsOption === "document" && !pdfFile) ||
                                        (values.termsOption === "link" && !values.termsOfSigning)
                                    }
                                    onClick={() => {
                                        const preview = window.open("/dashboard/file-editor", "_blank");
                                        const payload = {
                                            pdfUrl: pdfUrl,
                                            title: values.title,
                                            signRequiredBy: values.signRequiredBy,
                                            signers: values.signers,
                                            termsOption: values.termsOption,
                                            termsOfSigning: values.termsOfSigning,
                                        };
                                        if (preview) {
                                            preview.addEventListener("load", () => {
                                                preview.postMessage({
                                                    pdfUrl,
                                                    title: values.title,
                                                    signRequiredBy: values.signRequiredBy,
                                                    signers: values.signers,
                                                    termsOption: values.termsOption,
                                                    termsOfSigning: values.termsOfSigning,
                                                }, window.location.origin);

                                            });
                                        }
                                    }}
                                >
                                    Preview
                                </Button>

                                {values.termsOption === "link" && (
                                    <div className="form-group mb-3 col-md-10">
                                        <label htmlFor="termsOfSigning">Enter Terms Link <span style={{ color: "red" }}>*</span></label>
                                        <input
                                            type="url"
                                            id="termsOfSigning"
                                            name="termsOfSigning"
                                            className="form-control"
                                            placeholder="Enter terms document URL"
                                            value={values.termsOfSigning}
                                            onChange={handleChange}
                                            onBlur={handleBlur}
                                        />
                                        {errors.termsOfSigning && touched.termsOfSigning && (
                                            <div className="text-danger">{errors.termsOfSigning}</div>
                                        )}
                                    </div>
                                )}
                            </form>
                        )}
                    </Formik>
                </Card>
            </section>
            {/* Preview Modal */}

        </div>
    );
};

export default NewProject;
