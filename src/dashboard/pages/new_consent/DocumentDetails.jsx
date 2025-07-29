import { Formik } from "formik";
import { Button, Card, Form } from "react-bootstrap";
import * as Yup from "yup";
import documentApi from "../../../api/documentapi";
import './newContent.css';

const DocumentDetails = ({ onNext, formData, setFormData }) => {
  const basicFormSchema = Yup.object().shape({
    documentName: Yup.string().required("Document Name is required"),
    description: Yup.string(),
    file: Yup.mixed().required("A file is required"),
  });

  const handleSaveDraft = async (values) => {
    const user = JSON.parse(localStorage.getItem('user'));
    const userEmail = user?.userEmail;

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
      documentCharge: 0,
      signatoryCharge: 0,
      totalCredits: 0,
      draft: true,
      signers: []
    };

    const formDataToSend = new FormData();
    formDataToSend.append(
      "data",
      new Blob([JSON.stringify(payload)], { type: "application/json" })
    );
    formDataToSend.append("file", values.file);

    try {
      const response = await documentApi.saveDocument(formDataToSend);

      if (response.status === 200) {
        alert("Draft saved successfully!");
      } else {
        alert("Failed to save draft.");
      }
    } catch (error) {
      console.error("Error saving draft:", error);
    }
  };


  return (
    <>
      <h3><strong>Document Details</strong></h3>
      <p>Provide basic information about your consent document</p>

      <Card className="p-4">
        <Formik
          initialValues={{
            documentName: formData.documentName || "",
            description: formData.description || "",
            file: formData.file || null,
          }}
          validationSchema={basicFormSchema}
          onSubmit={(values) => {
            setFormData(prev => ({ ...prev, ...values }));
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
                  onChange={(event) => {
                    setFieldValue("file", event.currentTarget.files[0]);
                  }}
                  isInvalid={touched.file && errors.file}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.file}
                </Form.Control.Feedback>
              </Form.Group>

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
