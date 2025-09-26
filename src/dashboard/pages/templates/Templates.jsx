import { useState } from "react";
import { Button, Container, Table } from "react-bootstrap";
import { FaEye, FaFileWord } from "react-icons/fa";

const templates = [
  { name: "Rent_Deed", file: "Rent_Deed.docx" },
  { name: "LEASE_AGREEMENT", file: "LEASE_AGREEMENT.docx" },
  { name: "Employment_Contract", file: "Employment_Contract.docx" },
  { name: "Service_Agreement", file: "Service_Agreement.docx" },
  { name: "Consulting_Contract", file: "Consulting_Contract.docx" },
  { name: "Loan_Agreement", file: "Loan_Agreement.docx" },
  { name: "Non_Disclosure", file: "NDA.docx" },
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

const Templates = () => {
  const [previewComingSoon, setPreviewComingSoon] = useState(false);
  const [previewFileUrl, setPreviewFileUrl] = useState(null);
  // const handleComingSoon = () => {
  //   Swal.fire({
  //     icon: 'info',
  //     title: 'Coming Soon!',
  //     text: 'This feature is under development.',
  //     confirmButtonText: 'OK'
  //   });
  // };
  const handlePreview = (template) => {
    const fileUrl = "https://my-public-bucket.s3.amazonaws.com/templates/Rent_Deed.docx";


    setPreviewFileUrl(fileUrl);
  };

  return (
    <div>
      <h1>
        <strong>Templates</strong>
      </h1>
      <p style={{ color: "#555", fontStyle: "italic", marginBottom: "1rem" }}>
        If you want to use templates, please download and edit them yourself for
        now. Preview and edit functionality in SignBook is coming soon.
      </p>

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
                    <Button variant="primary" href={fileUrl} download>
                      Download
                    </Button>

                    {/* <Button
                      variant="secondary"
                      onClick={handleComingSoon}
                    >
                      Preview <FaEye />
                    </Button> */}
                    <Button
                      variant="secondary"
                      onClick={() => handlePreview(template)}
                    >
                      Preview <FaEye />
                    </Button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </Table>
      {previewFileUrl && (
        <div style={{ marginTop: "2rem", height: "600px" }}>
          <MSDocRenderer fileUrl={previewFileUrl} />
        </div>
      )}

      {previewComingSoon && (
        <div style={{ marginTop: "1rem", color: "orange", fontWeight: "bold" }}>
          Preview functionality coming soon!
        </div>
      )}
    </div>
  );
};

export default Templates;
