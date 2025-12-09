import { useState } from "react";
import { Button, Table } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { collabTemplateData } from "./collabTemplateData"; // import your data

const CollabTemplates = () => {
  const [templates, setTemplates] = useState(collabTemplateData);
  const navigate = useNavigate();
  const createNewCollab = (template) => {
    console.log("Create new collaboration using template:", template);
    navigate("/dashboard/my-collabs/new-collab", {
      state: { collaborationName: template.name },
    });
  };

  return (
    <div>
      <Table striped bordered hover responsive>
        <thead>
          <tr>
            <th>Name</th>
            <th>Description</th>
            <th>Checklist</th>
            <th>File</th>
            <th>Type</th>
            <th>Created By</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {templates.map((template) => (
            <tr key={template.id}>
              <td>{template.name}</td>
              <td>{template.description}</td>
              <td>{template.checklist.join(", ")}</td>
              <td>
                {template.file ? (
                  <a
                    href={`/templates/${template.file}`} // use the file name directly
                    download
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {template.file}
                  </a>
                ) : (
                  "None"
                )}
              </td>

              <td>{template.type}</td>
              <td>{template.createdBy}</td>
              <td>
                <Button
                  variant="success"
                  size="sm"
                  onClick={() => createNewCollab(template)}
                >
                  Create
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
};

export default CollabTemplates;
