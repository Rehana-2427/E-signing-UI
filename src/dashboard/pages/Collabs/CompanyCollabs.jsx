import { Button, Card } from "react-bootstrap";
import { useNavigate } from "react-router-dom";

const CompanyCollabs = () => {
  const navigate = useNavigate();

  const handleCollabDetails = () => {
    navigate("/dashboard/my-collabs/create-collab"); // Redirects to the CollabObject page
  };

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
            Company collaborations are free for the initial setup. However, if you want to perform additional actions (e.g., adding new collaborators, sending messages, etc.), credits will be deducted per action. Each action will cost <strong>0.2 credits</strong>.
          </li>
          <li>
            You can upgrade to collaborate with more companies or access advanced features. To do so, you will need to purchase additional credits.
          </li>
        </ul>
      </Card>

      <div>
        <Button className="mt-3" variant="primary" onClick={handleCollabDetails}>
          Add Collaboration Details
        </Button>
      </div>
    </div>
  );
};

export default CompanyCollabs;
