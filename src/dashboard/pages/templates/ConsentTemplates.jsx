import { useState } from "react";
import {
  Button,
  Container,
  OverlayTrigger,
  Spinner,
  Table,
  Tooltip,
} from "react-bootstrap";
import { FaDownload, FaEye, FaFileWord } from "react-icons/fa";
import { MdOutlineCreateNewFolder } from "react-icons/md";
import { useNavigate } from "react-router-dom";
import convertDocxToPdf from "../../../api/convertDocxToPdf";

const templates = [
  { name: "Rent_Deed", file: "Rent_Deed.docx" },
  { name: "Lease_Agreement", file: "Lease_Agreement.docx" },
  { name: "Employment_Contract", file: "Employment_Contract.docx" },
  { name: "Service_Agreement", file: "Service_Agreement.docx" },
  { name: "Consulting_Contract", file: "Consulting_Contract.docx" },
  { name: "Loan_Agreement", file: "Loan_Agreement.docx" },
  { name: "Non_Disclosure", file: "Non_Disclosure.docx" },
  { name: "Business_Proposal", file: "Business_Proposal.docx" },
];

const getInitials = (name) => {
  return name
    .split("_")
    .map((word) => word[0].toUpperCase())
    .join("");
};
// Your MSDocRenderer component with styled-components
const MSDocRenderer = ({ fileUrl }) => {
  if (!fileUrl) return null;

  return (
    <Container id="msdoc-renderer">
      <iframe
        id="msdoc-iframe"
        title="msdoc-iframe"
        src={`https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(
          fileUrl
        )}`}
        frameBorder="0"
      />
    </Container>
  );
};

const ConsentTemplates = () => {
  const [loadingTemplate, setLoadingTemplate] = useState(null);
  const [previewLoadingTemplate, setPreviewLoadingTemplate] = useState(null);
  const navigate = useNavigate();

  // const createNewConsent = async (template) => {
  //   console.log("Creating new consent from template:", template);
  //   setLoadingTemplate(template.name); // 👈 mark THIS template as loading

  //   try {
  //     const fileUrl = `${window.location.origin}/templates/${template.file}`;
  //     const response = await fetch(fileUrl);
  //     const blob = await response.blob();

  //     const docxFile = new File([blob], template.file, {
  //       type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  //     });

  //     const pdfResponse = await convertDocxToPdf.convert(docxFile);

  //     const contentType = pdfResponse.headers["content-type"];
  //     if (!contentType || !contentType.includes("application/pdf")) {
  //       throw new Error("Invalid PDF response");
  //     }

  //     const pdfBlob = new Blob([pdfResponse.data], {
  //       type: "application/pdf",
  //     });

  //     const pdfUrl = window.URL.createObjectURL(pdfBlob);
  //     window.open(pdfUrl, "_blank");
  //   } catch (error) {
  //     console.error("PDF conversion failed:", error);
  //     alert("Failed to convert document to PDF");
  //   } finally {
  //     setLoadingTemplate(null);
  //   }
  // };
  const createNewConsent = async (template) => {
    setLoadingTemplate(template.name);

    try {
      // 1. Fetch DOCX
      const fileUrl = `${window.location.origin}/templates/${template.file}`;
      const response = await fetch(fileUrl);
      const blob = await response.blob();

      const docxFile = new File([blob], template.file, {
        type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      });

      // 2. Convert to PDF
      const pdfResponse = await convertDocxToPdf.convert(docxFile);

      const pdfBlob = new Blob([pdfResponse.data], {
        type: "application/pdf",
      });

      // ✅ Create PDF File (IMPORTANT)
      const pdfFile = new File([pdfBlob], template.name + ".pdf", {
        type: "application/pdf",
      });

      // 3. Navigate to DocumentDetails with state
      navigate("/dashboard/my-consents/new-consent/step/1", {
        state: {
          documentName: template.name.replaceAll("_", " "),
          file: pdfFile,
          fromTemplate: true,
        },
      });
    } catch (error) {
      console.error("PDF conversion failed:", error);
      alert("Failed to convert document to PDF");
    } finally {
      setLoadingTemplate(null);
    }
  };
  const previewTemplate = async (template) => {
    setPreviewLoadingTemplate(template.name);

    try {
      // 1. Fetch DOCX
      const fileUrl = `${window.location.origin}/templates/${template.file}`;
      const response = await fetch(fileUrl);
      const blob = await response.blob();

      const docxFile = new File([blob], template.file, {
        type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      });

      // 2. Convert to PDF
      const pdfResponse = await convertDocxToPdf.convert(docxFile);

      const pdfBlob = new Blob([pdfResponse.data], {
        type: "application/pdf",
      });

      // 3. Open PDF in new tab
      const pdfUrl = URL.createObjectURL(pdfBlob);
      window.open(pdfUrl, "_blank");
    } catch (error) {
      console.error("Preview failed:", error);
      alert("Failed to preview document");
    } finally {
      setPreviewLoadingTemplate(null);
    }
  };

  return (
    <div
      className="scrollable-container"
      style={{
        height: "100%",
      }}
    >
      <Table striped bordered hover responsive>
        <thead>
          <tr>
            <th>#</th>
            <th>Initials & Icon</th>
            <th>File Name</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {templates.map((template, index) => {
            const initials = getInitials(template.name);
            const fileUrl = `${window.location.origin}/templates/${template.file}`;

            return (
              <tr key={index}>
                <td>{index + 1}</td>
                <td
                  style={{
                    fontWeight: "bold",
                    color: "#6c757d",
                    fontSize: "1.2rem",
                  }}
                >
                  {initials} <FaFileWord />
                </td>
                <td>{template.name}</td>
                <td>
                  <div className="d-flex gap-2">
                    <OverlayTrigger
                      placement="top"
                      overlay={<Tooltip>Download Word Document</Tooltip>}
                    >
                      <Button variant="primary" href={fileUrl} download>
                        <FaDownload />
                      </Button>
                    </OverlayTrigger>

                    <OverlayTrigger
                      placement="top"
                      overlay={<Tooltip>Preview PDF</Tooltip>}
                    >
                      <Button
                        variant="outline-secondary"
                        onClick={() => previewTemplate(template)}
                        disabled={previewLoadingTemplate === template.name}
                      >
                        {previewLoadingTemplate === template.name ? (
                          <>
                            <Spinner
                              as="span"
                              animation="border"
                              size="sm"
                              className="me-2"
                            />
                            loading...
                          </>
                        ) : (
                          <FaEye />
                        )}
                      </Button>
                    </OverlayTrigger>

                    <OverlayTrigger
                      placement="top"
                      overlay={<Tooltip>Create Consent</Tooltip>}
                    >
                      <span className="d-inline-block">
                        <Button
                          variant="info"
                          onClick={() => createNewConsent(template)}
                          disabled={loadingTemplate === template.name}
                        >
                          {loadingTemplate === template.name ? (
                            <>
                              <Spinner
                                as="span"
                                animation="border"
                                size="sm"
                                className="me-2"
                              />
                              Creating...
                            </>
                          ) : (
                            <MdOutlineCreateNewFolder />
                          )}
                        </Button>
                      </span>
                    </OverlayTrigger>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </Table>
    </div>
  );
};

export default ConsentTemplates;
