import { FieldArray, Formik } from "formik";
import { useEffect, useState } from "react";
import { Button, Card } from "react-bootstrap";
import DateTime from "react-datetime";
import documentApi from "../api/documentapi";
import Breadcrumb from "../components/sessions/Breadcrumb";
import FilePreviewModal from "./FilePreviewModal";
import Navbar from "./layout/Navbar";

const NewProject = () => {
    const user = JSON.parse(localStorage.getItem('user'));
    const userEmail = user?.userEmail;
    const [pdfFile, setPdfFile] = useState(null);
    const [pdfUrl, setPdfUrl] = useState(null);
    const [showPdfEditor, setShowPdfEditor] = useState(false);
    const [uploadedPdf, setUploadedPdf] = useState(null);
    const [showPreview, setShowPreview] = useState(false);

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
        return () => {
            if (pdfUrl) {
                URL.revokeObjectURL(pdfUrl);
            }
        };
    }, [pdfUrl]);

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
                            signers: [{ name: "", email: "" }]
                        }}
                        onSubmit={handleSubmit}
                    >
                        {({
                            values,
                            handleChange,
                            handleBlur,
                            handleSubmit,
                            setFieldValue
                        }) => (
                            <form onSubmit={handleSubmit} className="p-3">
                                {/* Title */}
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

                                    {/* Date */}
                                    <div className="col-md-6 form-group mb-3">
                                        <label htmlFor="signRequiredBy">Sign required by date</label>
                                        <DateTime
                                            name="signRequiredBy"
                                            timeFormat={false}
                                            dateFormat="YYYY-MM-DD"
                                            onChange={(date) => {
                                                setFieldValue("signRequiredBy", date.toDate());
                                            }}
                                            inputProps={{ placeholder: "Select date" }}
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
                                    <div className="form-group mb-3">
                                        <label>Upload Terms Document (PDF)</label>
                                        <input
                                            type="file"
                                            accept="application/pdf,image/*"
                                            className="form-control"
                                            onChange={handleFileUpload}
                                        />
                                    </div>
                                )}
                                {uploadedPdf && (
                                    <>

                                        <Button
                                            variant="primary"
                                            className="mt-2 ms-2"
                                            onClick={() => setShowPreview(true)}
                                        >
                                            Preview
                                        </Button>
                                    </>
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

                                {/* Add Signers */}
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

                                {/* Buttons */}
                                <div className="d-flex justify-content-end gap-2">
                                    <Button variant="success" type="submit">
                                        Send
                                    </Button>
                                </div>
                            </form>
                        )}
                    </Formik>
                </Card>
            </section>
            {/* Preview Modal */}
            <FilePreviewModal
                show={showPreview}
                onHide={() => setShowPreview(false)}
                uploadedFile={uploadedPdf}
                fileUrl={pdfUrl}
            />
        </div>
    );
};

export default NewProject;
