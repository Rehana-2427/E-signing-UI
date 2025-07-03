import { FieldArray, Formik } from "formik";
import { useEffect, useState } from "react";
import { Button, Card } from "react-bootstrap";
import DateTime from "react-datetime";
import { useLocation, useNavigate } from "react-router-dom";
import documentApi from "../api/documentapi";
import Breadcrumb from "../components/sessions/Breadcrumb";
import Navbar from "./layout/Navbar";

const NewProject = () => {
    const user = JSON.parse(localStorage.getItem("user"));
    const userEmail = user?.userEmail;

    const location = useLocation();
    const navigate = useNavigate();

    // Preview result (if coming back from FilePreviewPage)
    const { fileUrl: signedPreviewUrl, signedPdfBlob, title, signRequiredBy } = location.state || {};

    const [uploadedPdf, setUploadedPdf] = useState(null);
    const [pdfUrl, setPdfUrl] = useState(null);
    const [pdfBlob, setPdfBlob] = useState(null); // for upload

    // Update on file upload
    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const url = URL.createObjectURL(file);
        setUploadedPdf(file);
        setPdfUrl(url);
        setPdfBlob(file); // original file
    };

    useEffect(() => {
        return () => {
            if (pdfUrl) URL.revokeObjectURL(pdfUrl);
        };
    }, [pdfUrl]);

const handleSubmit = async (values, { setSubmitting, resetForm }) => {
    const formData = new FormData();

    formData.append("title", values.title);
    const formattedDate = values.signRequiredBy.toISOString().split("T")[0];
    formData.append("signRequiredBy", formattedDate);
    formData.append("termsType", values.termsOption);
    formData.append("senderEmail", userEmail);

    if (values.termsOption === "link") {
        formData.append("termsLink", values.termsOfSigning);
    } else {
        formData.append("termsPdf", values.termsOfSigning);
    }

    formData.append("signers", JSON.stringify(values.signers));

    if (signedPdfBlob) {
        formData.append("pdf", signedPdfBlob, "signed-document.pdf");
    } else if (pdfBlob) {
        formData.append("pdf", pdfBlob);
    }

    try {
        await documentApi.saveDocument(formData);
        alert("Saved successfully");

        // Reset Formik form
        resetForm();

        // Reset component state
        setUploadedPdf(null);
        setPdfUrl(null);
        setPdfBlob(null);

        // ⚠️ Clear location.state by navigating without it
        navigate("/dashboard/new-project", { replace: true });

    } catch (err) {
        console.error("Upload failed:", err);
    } finally {
        setSubmitting(false);
    }
};



    return (
        <div>
            <Navbar />
            <section>
                <Breadcrumb routeSegments={[{ path: "/forms" }]} />
                <h2>Create a Signing Project</h2>
                <Card style={{ margin: "20px" }}>
                    <Formik
                        enableReinitialize
                        initialValues={{
                            title: title || "",
                            signRequiredBy: signRequiredBy ? new Date(signRequiredBy) : "",
                            termsOption: "document",
                            termsOfSigning: "",
                            signers: [{ name: "", email: "" }],
                        }}
                        onSubmit={handleSubmit}
                    >
                        {({
                            values,
                            handleChange,
                            handleBlur,
                            handleSubmit,
                            setFieldValue,
                        }) => (
                            <form onSubmit={handleSubmit} className="p-3">
                                {/* Title and Date */}
                                <div className="row">
                                    <div className="col-md-6 form-group mb-3">
                                        <label htmlFor="title">Title</label>
                                        <input
                                            id="title"
                                            name="title"
                                            className="form-control"
                                            placeholder="Enter your Title"
                                            type="text"
                                            onChange={handleChange}
                                            onBlur={handleBlur}
                                            value={values.title}
                                        />
                                    </div>

                                    <div className="col-md-6 form-group mb-3">
                                        <label htmlFor="signRequiredBy">Sign required by date</label>
                                        <DateTime
                                            name="signRequiredBy"
                                            timeFormat={false}
                                            dateFormat="YYYY-MM-DD"
                                            onChange={(date) =>
                                                setFieldValue("signRequiredBy", date.toDate())
                                            }
                                            inputProps={{ placeholder: "Select date" }}
                                            value={values.signRequiredBy}
                                        />
                                    </div>
                                </div>

                                {/* Terms of Signing */}
                                <div className="form-group mb-3">
                                    <label className="d-block">Terms of Signing</label>
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
                                        />
                                        <label className="form-check-label" htmlFor="termsDoc">
                                            Document
                                        </label>
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
                                        <label className="form-check-label" htmlFor="termsLink">
                                            Link
                                        </label>
                                    </div>
                                </div>

                                {/* Conditional Fields */}
                                {values.termsOption === "document" && (
                                    <div className="form-group mb-3">
                                        <label>Terms Document</label>

                                        {signedPreviewUrl ? (
                                            <div className="d-flex align-items-center justify-content-between">
                                                <p className="mb-0">Signed File: <strong>{title}.pdf</strong></p>
                                                <a href={signedPreviewUrl} target="_blank" rel="noopener noreferrer" className="btn btn-sm btn-outline-primary">
                                                    View
                                                </a>
                                            </div>
                                        ) : (
                                            <input
                                                type="file"
                                                accept="application/pdf,image/*"
                                                className="form-control"
                                                onChange={handleFileUpload}
                                            />
                                        )}
                                    </div>
                                )}


                                {values.termsOption === "link" && (
                                    <div className="form-group mb-3">
                                        <label htmlFor="termsOfSigning">Enter Terms Link</label>
                                        <input
                                            type="url"
                                            id="termsOfSigning"
                                            name="termsOfSigning"
                                            className="form-control"
                                            placeholder="Enter terms document URL"
                                            value={values.termsOfSigning}
                                            onChange={handleChange}
                                        />
                                    </div>
                                )}

                                {/* Preview Button (only show if preview not yet done) */}
                                {!signedPreviewUrl && uploadedPdf && (
                                    <Button
                                        variant="primary"
                                        className="mt-2 ms-2"
                                        onClick={() =>
                                            navigate("/dashboard/preview", {
                                                state: {
                                                    uploadedFile: uploadedPdf,
                                                    fileUrl: pdfUrl,
                                                    title: values.title,
                                                    signRequiredBy: values.signRequiredBy,
                                                },
                                            })
                                        }
                                    >
                                        Preview
                                    </Button>
                                )}

                                {/* Signers (only show if preview has been completed) */}
                                {signedPreviewUrl && (
                                    <>
                                        <FieldArray name="signers">
                                            {({ remove, push }) => (
                                                <div className="mb-3">
                                                    <label>People to Sign</label>
                                                    {values.signers.map((signer, index) => (
                                                        <div className="row mb-2" key={index}>
                                                            <div className="col-md-5">
                                                                <input
                                                                    name={`signers[${index}].name`}
                                                                    placeholder="Name"
                                                                    className="form-control"
                                                                    value={signer.name}
                                                                    onChange={handleChange}
                                                                />
                                                            </div>
                                                            <div className="col-md-5">
                                                                <input
                                                                    name={`signers[${index}].email`}
                                                                    placeholder="Email"
                                                                    className="form-control"
                                                                    value={signer.email}
                                                                    onChange={handleChange}
                                                                />
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
                                                </div>
                                            )}
                                        </FieldArray>

                                        {/* Submit */}
                                        <div className="d-flex justify-content-end gap-2">
                                            <Button variant="success" type="submit">
                                                Send
                                            </Button>
                                        </div>
                                    </>
                                )}
                            </form>
                        )}
                    </Formik>
                </Card>
            </section>
        </div>
    );
};

export default NewProject;
