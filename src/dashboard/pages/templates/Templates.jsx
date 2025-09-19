import { useState } from 'react';
import { Button, OverlayTrigger, Table, Tooltip } from 'react-bootstrap';
import { FaEye, FaFileWord } from 'react-icons/fa';

const templates = [
  { name: 'Rent_Deed', file: 'Rent_Deed.docx' },
  { name: 'LEASE_AGREEMENT', file: 'LEASE_AGREEMENT.docx' },
  { name: 'Employment_Contract', file: 'Employment_Contract.docx' },
  { name: 'Service_Agreement', file: 'Service_Agreement.docx' },
  { name: 'Consulting_Contract', file: 'Consulting_Contract.docx' },
  { name: 'Loan_Agreement', file: 'Loan_Agreement.docx' },
  { name: 'Non_Disclosure', file: 'NDA.docx' },
  { name: 'Business_Proposal', file: 'Business_Proposal.docx' },
];

const getInitials = (name) => {
  return name
    .split('_')
    .map(word => word[0].toUpperCase())
    .join('');
};

const Templates = () => {
  const [previewComingSoon, setPreviewComingSoon] = useState(false);

  return (
    <div>
      <h1><strong>Templates</strong></h1>
      <p style={{ color: '#555', fontStyle: 'italic', marginBottom: '1rem' }}>
        If you want to use templates, please download and edit them yourself for now. Preview and edit functionality in SignBook is coming soon.
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
                <td style={{ fontWeight: 'bold', color: '#6c757d', fontSize: '1.2rem' }}>
                  {initials} <FaFileWord />
                </td>
                <td>{template.name}</td>
                <td>
                  <div className="d-flex gap-2">
                    <Button
                      variant="primary"
                      href={fileUrl}
                      download
                    >
                      Download
                    </Button>

                    <OverlayTrigger
                      placement="top"
                      overlay={<Tooltip id={`tooltip-preview-${index}`}>Preview functionality coming soon!</Tooltip>}
                    >
                      <Button
                        variant="secondary"
                        onClick={() => setPreviewComingSoon(true)}
                      >
                        Preview <FaEye />
                      </Button>
                    </OverlayTrigger>

                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </Table>

      {previewComingSoon && (
        <div style={{ marginTop: '1rem', color: 'orange', fontWeight: 'bold' }}>
          Preview functionality coming soon!
        </div>
      )}
    </div >
  );
};

export default Templates;
