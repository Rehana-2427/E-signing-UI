import { Formik } from "formik";
import { PDFDocument } from "pdf-lib"; // ✅ Import PDF library
import { useEffect, useState } from "react";
import { Button, Card, Col, Form, Row } from "react-bootstrap";
import { FaTrash } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import * as Yup from "yup";
import adminApi from "../../../api/adminApi";
import adminUserCreditApi from "../../../api/adminUserCreditApi";
import documentApi from "../../../api/documentapi";
import "./newContent.css";

const DocumentDetails = ({ onNext, formData, setFormData, userCredit }) => {
  const navigate = useNavigate();
  const [userCredits, setUserCredits] = useState([]);
  const [additionalFiles, setAdditionalFiles] = useState([]); // ✅ Optional files list
  const [addingFile, setAddingFile] = useState(false); // ✅ Control visibility of file input
  const [tempFile, setTempFile] = useState(null); // ✅ Store temporary selected optional file
  const [docCost, setDocCost] = useState(0);
  const [signCost, setSignCost] = useState(0);
  const user = JSON.parse(localStorage.getItem("user"));
  const userEmail = user?.userEmail;
  const [showReviewerEmail, setShowReviewerEmail] = useState(false);
  const [creditSource, setCreditSource] = useState("user"); // "user" or "company"
  const [reviewerEmail, setReviewerEmail] = useState("");
  const [reviewers, setReviewers] = useState([]);

  const basicFormSchema = Yup.object().shape({
    documentName: Yup.string().required("Document Name is required"),
    description: Yup.string(),
    file: Yup.mixed().required("A file is required"),
  });
  useEffect(() => {
    adminApi
      .getCreditSettings()
      .then((res) => {
        setDocCost(res.data.docCost);
        setSignCost(res.data.signCost);
      })
      .catch((err) => {
        console.error("Failed to load credit settings", err);
        Swal.fire(
          "Error",
          "Unable to load credit settings from server.",
          "error"
        );
      });
  }, []);

  useEffect(() => {
    fetchUserCredits();
  }, []);

  const fetchUserCredits = async () => {
    try {
      const response = await adminUserCreditApi.getUserCreditsByEmail(
        userEmail
      );
      setUserCredits(response.data);
    } catch (error) {
      console.error("Error fetching user credits", error);
    }
  };

  const mergeFiles = async (primaryFile, optionalFiles) => {
    const mergedPdf = await PDFDocument.create();

    const allFiles = [primaryFile, ...optionalFiles];

    for (const file of allFiles) {
      if (!file) continue;
      const pdfBytes = await file.arrayBuffer();
      const pdf = await PDFDocument.load(pdfBytes);
      const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
      copiedPages.forEach((page) => mergedPdf.addPage(page));
    }

    const mergedBytes = await mergedPdf.save();
    return new Blob([mergedBytes], { type: "application/pdf" });
  };
  const documentCharge = docCost;
  const signatoryCharge = signCost;
  const handleSaveDraft = async (values) => {
    try {
      const mergedFile = await mergeFiles(values.file, additionalFiles);

      const payload = {
        senderEmail: userEmail,
        documentName: values.documentName,
        description: values.description || "",
        fileName: values.file?.name || "",
        signingMode: null,
        additionalInitials: false,
        deadline: null,
        reminderEveryDay: false,
        reminderDaysBeforeEnabled: false,
        reminderDaysBefore: null,
        reminderLastDay: false,
        sendFinalCopy: false,
        documentCharge,
        signatoryCharge,
        totalCredits: 0,
        draft: true,
        signers: [],
        reviewers: reviewers
          .filter((r) => r.email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(r.email))
          .map((r) => ({ reviewerEmail: r.email })),
      };

      const formDataToSend = new FormData();
      formDataToSend.append(
        "data",
        new Blob([JSON.stringify(payload)], { type: "application/json" })
      );
      formDataToSend.append("file", mergedFile);

      const response = await documentApi.saveDocument(formDataToSend);

      if (response.status === 200) {
        await Swal.fire({
          icon: "success",
          title: "Draft Saved!",
          text: "Your document draft has been saved successfully.",
          confirmButtonText: "OK",
        });
        localStorage.setItem("consentsActiveTab", "drafts");
        navigate("/dashboard/my-consents");
      } else {
        await Swal.fire({
          icon: "error",
          title: "Save Failed",
          text: "Something went wrong while saving the draft.",
          confirmButtonText: "OK",
        });
      }
    } catch (error) {
      console.error("Error saving draft:", error);
      await Swal.fire({
        icon: "error",
        title: "Error",
        text: "An unexpected error occurred. Please try again later.",
        confirmButtonText: "OK",
      });
    }
  };

  const addReviewer = () => {
    if (isValidEmail(reviewerEmail)) {
      setReviewers([...reviewers, { email: reviewerEmail }]);
      setReviewerEmail("");
    } else {
      Swal.fire("Invalid Email", "Please enter a valid email.", "error");
    }
  };

  const isValidEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };
  const handleDeleteReviewer = (index) => {
    const updated = [...reviewers];
    updated.splice(index, 1);
    setReviewers(updated);
  };

  return (
    <>
      <div>
        <Row>
          <Col md={6}>
            <h3>
              <strong>Document Details</strong>
            </h3>
            <p>Provide basic information about your consent document</p>
          </Col>
          <Col md={6} className="text-md-end text-start">
            <p>
              <strong>Total credits:</strong> {userCredits?.creditBought || 0}{" "}
              &nbsp;||&nbsp;
              <strong>Balance credits:</strong>{" "}
              {userCredits?.balanceCredit || 0} &nbsp;||&nbsp;
              <strong>Used Credits:</strong> {userCredits?.usedCredit || 0}
            </p>
          </Col>
        </Row>
      </div>

      <Card className="p-4">
        <Formik
          initialValues={{
            documentName: formData.documentName || "",
            description: formData.description || "",
            file: formData.file || null,
          }}
          validationSchema={basicFormSchema}
          onSubmit={async (values) => {
            if (creditSource === "user" && userCredit?.balanceCredit < 20) {
              Swal.fire({
                icon: "warning",
                title: "Oops!",
                html: `
      You need at least 20 credits to proceed.<br/>
      Please add credits to your account and try again.
    `,
                showCancelButton: true,
                confirmButtonText: "Upgrade Credits",
                cancelButtonText: "Cancel",
              }).then((result) => {
                if (result.isConfirmed) {
                  navigate("/dashboard/creditRequest?tab=user");
                }
              });
              return;
            }

            const mergedFile = await mergeFiles(values.file, additionalFiles);

            const finalValues = { ...values, file: mergedFile, creditSource,reviewers };
            setFormData((prev) => ({ ...prev, ...finalValues }));
            onNext();
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
          }) => (
            <Form onSubmit={handleSubmit}>
              <h5>Choose Credit Source</h5>
              <Form.Check
                type="radio"
                label="Use My Credits"
                name="creditSource"
                value="user"
                checked={creditSource === "user"}
                onChange={(e) => setCreditSource(e.target.value)}
              />
              <Form.Check
                type="radio"
                label="Use Company Credits"
                name="creditSource"
                value="company"
                checked={creditSource === "company"}
                onChange={(e) => setCreditSource(e.target.value)}
              />
              <Form.Group controlId="documentName" className="mb-3">
                <Form.Label className="required-label">
                  Document Name
                </Form.Label>
                <Form.Control
                  type="text"
                  name="documentName"
                  onChange={handleChange}
                  onBlur={handleBlur}
                  value={values.documentName}
                  isInvalid={touched.documentName && errors.documentName}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.documentName}
                </Form.Control.Feedback>
              </Form.Group>
              <Form.Group controlId="description" className="mb-3">
                <Form.Label>Description</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  name="description"
                  onChange={handleChange}
                  onBlur={handleBlur}
                  value={values.description}
                  isInvalid={touched.description && errors.description}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.description}
                </Form.Control.Feedback>
              </Form.Group>
              <Form.Group controlId="file" className="mb-3">
                <Form.Label className="required-label">
                  Upload Document
                </Form.Label>
                <Form.Control
                  type="file"
                  name="file"
                  accept="application/pdf"
                  onChange={(event) => {
                    setFieldValue("file", event.currentTarget.files[0]);
                  }}
                  isInvalid={touched.file && errors.file}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.file}
                </Form.Control.Feedback>
              </Form.Group>
              <Form.Group controlId="addReviewerCheckbox" className="mb-3">
                <Form.Check
                  type="checkbox"
                  label="Add Reviewer Email"
                  checked={showReviewerEmail}
                  onChange={() => setShowReviewerEmail((prev) => !prev)}
                />
              </Form.Group>
              {showReviewerEmail && (
                <Form.Group controlId="reviewerEmail" className="mb-3">
                  <Form.Label>Reviewer Email</Form.Label>
                  <div className="d-flex gap-2">
                    <Form.Control
                      type="email"
                      placeholder="Enter reviewer email"
                      value={reviewerEmail}
                      onChange={(e) => setReviewerEmail(e.target.value)}
                      // required={showReviewerEmail}
                      isInvalid={
                        reviewerEmail !== "" && !isValidEmail(reviewerEmail)
                      }
                    />
                    <Button variant="info" onClick={addReviewer}>
                      Add
                    </Button>
                  </div>
                </Form.Group>
              )}
              {reviewers.length > 0 && (
                <div className="mt-3">
                  <h6>Reviewers:</h6>
                  <ul>
                    {reviewers.map((reviewer, index) => (
                      <li key={index}>
                        <span>{reviewer.email}</span>
                        <FaTrash
                          style={{ cursor: "pointer", color: "red" }}
                          onClick={() => handleDeleteReviewer(index)}
                        />
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* ✅ Additional Files UI */}
              <div className="mb-3">
                <Button
                  variant="info"
                  onClick={() => setAddingFile(true)}
                  disabled={addingFile}
                >
                  Add New
                </Button>
              </div>
              {addingFile && (
                <div className="mb-3 border p-3  rounded">
                  <Form.Group>
                    <Form.Label>Upload Additional Document</Form.Label>
                    <Form.Control
                      type="file"
                      accept="application/pdf"
                      onChange={(e) => setTempFile(e.currentTarget.files[0])}
                    />
                  </Form.Group>
                  <div className="mt-2">
                    <Button
                      variant="success"
                      className="me-2"
                      onClick={() => {
                        if (tempFile) {
                          setAdditionalFiles((prev) => [...prev, tempFile]);
                          setTempFile(null);
                          setAddingFile(false);
                        }
                      }}
                    >
                      Save
                    </Button>
                    <Button
                      variant="danger"
                      onClick={() => {
                        setTempFile(null);
                        setAddingFile(false);
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
              {/* ✅ Show optional files list */}
              {additionalFiles.length > 0 && (
                <div className="mb-3">
                  <strong>Additional Documents:</strong>
                  <ul>
                    {additionalFiles.map((file, index) => (
                      <li key={index}>{file.name}</li>
                    ))}
                  </ul>
                </div>
              )}
              <div className="text-end">
                <Button
                  variant="secondary"
                  className="me-2"
                  type="button"
                  onClick={() => {
                    setFormData((prev) => ({ ...prev, ...values }));
                    handleSaveDraft(values);
                  }}
                >
                  Save as Draft
                </Button>
                <Button type="submit" variant="primary">
                  Next
                </Button>
              </div>
            </Form>
          )}
        </Formik>
      </Card>
    </>
  );
};

export default DocumentDetails;
