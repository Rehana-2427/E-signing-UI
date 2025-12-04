import { useEffect, useState } from "react";
import { Spinner } from "react-bootstrap";
import documentApi from "../../../api/documentapi";

const ConsentBrief = ({ documentId, documentName }) => {
  const [consentDetails, setConsentDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchConsentBrief = async () => {
      try {
        const response = await documentApi.getDocumentDetail(documentId);
        setConsentDetails(response.data); // Set fetched data in state
      } catch (err) {
        setError("Failed to fetch collaboration details.");
        console.error("Error fetching collaboration brief:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchConsentBrief();
  }, [documentId]);

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center">
        <Spinner animation="border" />
      </div>
    );
  }

  if (error) {
    return <div className="text-center text-danger">{error}</div>;
  }

  if (!consentDetails) {
    return <div>No collaboration details found.</div>;
  }

  return (
    <>
      <br />
      <div className="d-flex align-items-center justify-content-between">
        <h4 className="mb-0">
          <strong>Details of {documentName}</strong>
        </h4>
      </div>

      <div className="mt-3">
        {/* Document Basic Info */}
        <div>
          <strong>Description: </strong>
          {consentDetails.description || "N/A"}
        </div>
        <div>
          <strong>Sent On: </strong>
          {consentDetails.sentOn}
        </div>
        <div>
          <strong>Deadline: </strong>
          {consentDetails.deadline}
        </div>
        <div>
          <strong>Signing Mode: </strong>
          {consentDetails.signingMode}
        </div>

        {/* Reminders */}
        <div>
          <strong>Reminder Every Day: </strong>
          {consentDetails.reminderEveryDay ? "Yes" : "No"}
        </div>
        <div>
          <strong>Reminder Days Before Enabled: </strong>
          {consentDetails.reminderDaysBeforeEnabled ? "Yes" : "No"}
        </div>
        <div>
          <strong>Reminder Last Day: </strong>
          {consentDetails.reminderLastDay ? "Yes" : "No"}
        </div>

        {/* Charges */}
        <div>
          <strong>Document Charge: </strong>20
        </div>
        <div>
          <strong>Signatory Charge: </strong>
          {consentDetails.signatoryCharge}
        </div>
        <div>
          <strong>Reviewer Charge: </strong>
          {consentDetails.reviewerCharge || "N/A"}
        </div>

        {/* Signers and Reviewers */}
        <div>
          <strong>Signers Count: </strong>
          {consentDetails.signerCount}
        </div>
        <div>
          <strong>Signers Emails: </strong>
          {consentDetails.signerEmails.join(", ")}
        </div>
        <div>
          <strong>Reviewers Count: </strong>
          {consentDetails.reviewerCount}
        </div>
        <div>
          <strong>Reviewers Emails: </strong>
          {consentDetails.reviewerEmails.join(", ")}
        </div>
      </div>
    </>
  );
};

export default ConsentBrief;
