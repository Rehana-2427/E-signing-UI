import { Formik } from "formik";
import { PDFDocument } from 'pdf-lib'; // ✅ Import PDF library
import { useEffect, useState } from "react";
import { Button, Card, Col, Form, Row } from "react-bootstrap";
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import * as Yup from "yup";
import adminApi from "../../../api/adminApi";
import adminUserCreditApi from "../../../api/adminUserCreditApi";
import documentApi from "../../../api/documentapi";
import './newContent.css';

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

  const basicFormSchema = Yup.object().shape({
    documentName: Yup.string().required("Document Name is required"),
    description: Yup.string(),
    file: Yup.mixed().required("A file is required"),
  });
  useEffect(() => {
    adminApi.getCreditSettings()
      .then(res => {
        setDocCost(res.data.docCost);
        setSignCost(res.data.signCost);
      })
      .catch(err => {
        console.error("Failed to load credit settings", err);
        Swal.fire("Error", "Unable to load credit settings from server.", "error");
      });
  }, []);

  useEffect(() => {
    fetchUserCredits();
  }, []);

  const fetchUserCredits = async () => {
    try {
      const response = await adminUserCreditApi.getUserCreditsByEmail(userEmail);
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
    return new Blob([mergedBytes], { type: 'application/pdf' });
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
        signers: []
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
          icon: 'success',
          title: 'Draft Saved!',
          text: 'Your document draft has been saved successfully.',
          confirmButtonText: 'OK'
        });
        localStorage.setItem("consentsActiveTab", "drafts");
        navigate('/dashboard/my-consents');

      } else {
        await Swal.fire({
          icon: 'error',
          title: 'Save Failed',
          text: 'Something went wrong while saving the draft.',
          confirmButtonText: 'OK'
        });
      }

    } catch (error) {
      console.error("Error saving draft:", error);
      await Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'An unexpected error occurred. Please try again later.',
        confirmButtonText: 'OK'
      });
    }
  };


  return (
    <>
      <div className="mb-4">
        <Row>
          <Col md={6}>
            <h3><strong>Document Details</strong></h3>
            <p>Provide basic information about your consent document</p>
          </Col>
          <Col md={6} className="text-md-end text-start">
            <p>
              <strong>Total credits:</strong> {userCredits?.creditBought || 0} &nbsp;||&nbsp;
              <strong>Balance credits:</strong> {userCredits?.balanceCredit || 0} &nbsp;||&nbsp;
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
            if (userCredit?.balanceCredit === 0) {
              Swal.fire({
                icon: 'warning',
                title: 'Oops!',
                html: `
                  You seem to be out of credits.<br/>
                  Please add credits to your account and try again.
                `,
                showCancelButton: true,
                confirmButtonText: 'Upgrade Credits',
                cancelButtonText: 'Cancel'
              }).then((result) => {
                if (result.isConfirmed) {
                  navigate("/dashboard/creditPassBook");
                }
              });
              return;
            }

            const mergedFile = await mergeFiles(values.file, additionalFiles);

            const finalValues = { ...values, file: mergedFile }; // ✅ Replace with merged file
            setFormData(prev => ({ ...prev, ...finalValues }));
            onNext();
          }}
        >
          {({ values, errors, touched, handleChange, handleBlur, handleSubmit, setFieldValue }) => (
            <Form onSubmit={handleSubmit}>
              <Form.Group controlId="documentName" className="mb-3">
                <Form.Label className="required-label">Document Name</Form.Label>
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
                <Form.Label className="required-label">Upload Document</Form.Label>
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
                          setAdditionalFiles(prev => [...prev, tempFile]);
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
                    setFormData(prev => ({ ...prev, ...values }));
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
