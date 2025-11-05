import { useState } from "react";
import { Button, Card, Form } from "react-bootstrap";

const CompanyCollabs = () => {
    const [showForm, setShowForm] = useState(false);
    const handleCollabDetails = () => {
        setShowForm(true);
    }
  return (
    <div>
      <Card className="p-3 mt-3">
        <h5>📘 How Collaborations Work</h5>
        <ul>
          <li>
            First, you need to select or enter a company to start a collaboration. 
            Then, you can invite users under that company to collaborate with you, 
            or request collaboration from other company admins.
            After admin approval, you can start collaborating with users under that company.
          </li>
          <li>
            Every collaboration comes with some credits, <strong>5 credits</strong> by default. You will receive these credits after initiating a collaboration.
          </li>
          <li>
            Company collaborations are free for the initial setup. However, if you want to perform additional actions (e.g., adding new collaborators, sending messages, etc.), credits will be deducted per action. Each action will cost <strong>2 credits</strong>.
          </li>
          <li>
            You can upgrade to collaborate with more companies or access advanced features. To do so, you will need to purchase additional credits.
          </li>
        </ul>
      </Card>
      <div>
        <Button className="mt-3" variant="primary" onClick={handleCollabDetails}>
            Add Collaboration details
        </Button>
      </div>
      {
        showForm && (
            <Card className="p-3 mt-3">
                <h5>Collaboration Details Form</h5>
                <Form>
                    {/* Form fields go here */}
                    <Form.Group controlId="companyName">
                        <Form.Label>Company Name</Form.Label>
                        <Form.Control type="text" placeholder="Enter company name" />
                    </Form.Group>
                    <Form.Group controlId="collabDescription" className="mt-3">
                        <Form.Label>Collaboration Description</Form.Label>
                        <Form.Control as="textarea" rows={3} placeholder="Enter collaboration description" />
                    </Form.Group>
                    <Button className="mt-3" variant="success" type="submit">
                        Submit
                    </Button>
                </Form>
            </Card>
        )
      }
    </div>
  );
};

export default CompanyCollabs;
