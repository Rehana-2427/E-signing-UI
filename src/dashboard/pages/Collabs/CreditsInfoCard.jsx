import { Badge, ListGroup } from "react-bootstrap";

const CreditsInfoCard = () => {
  const creditsInfo = {
    baseCredit: 5,
    actionsCost: 0.2,
    totalCreditsUsed: 12,
    timeCredits: [
      { days: 5, credits: 10 },
      { days: 10, credits: 20 },
      { days: 15, credits: 30 },
    ],
    status: "Active",
    metaRetentionDays: 30,
    cloudRetentionDays: 7,
  };

  return (
    <> 
      <p className="text-muted mb-4">
        Track all credits used for this collaboration and understand how long
        data and metadata are retained.
      </p>

      <ListGroup variant="flush">
        <ListGroup.Item>
          <strong>Base Credit:</strong> {creditsInfo.baseCredit} / collaboration
        </ListGroup.Item>
        <ListGroup.Item>
          <strong>Credits per Additional Action:</strong> {creditsInfo.actionsCost} per action
        </ListGroup.Item>
        <ListGroup.Item>
          <strong>Total Credits Used:</strong> {creditsInfo.totalCreditsUsed}
        </ListGroup.Item>
        <ListGroup.Item>
          <strong>Time-based Credits:</strong>
          <div>
            {creditsInfo.timeCredits.map((t, index) => (
              <Badge bg="info" key={index} className="me-2">
                {t.credits} credits / {t.days} days
              </Badge>
            ))}
          </div>
        </ListGroup.Item>
        <ListGroup.Item>
          <strong>Collaboration Status:</strong>
          <Badge bg={creditsInfo.status === "Active" ? "success" : "secondary"}>
            {creditsInfo.status}
          </Badge>
        </ListGroup.Item>
        <ListGroup.Item>
          <strong>Metadata Retention:</strong> {creditsInfo.metaRetentionDays} days
        </ListGroup.Item>
        <ListGroup.Item>
          <strong>Cloud / Document Retention:</strong> {creditsInfo.cloudRetentionDays} days + buffer
        </ListGroup.Item>
      </ListGroup>
    </>
  );
};

export default CreditsInfoCard;
