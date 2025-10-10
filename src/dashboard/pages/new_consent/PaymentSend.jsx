import { useEffect, useState } from "react";
import { Button, Card, Form, Spinner } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import adminApi from "../../../api/adminApi";
import adminUserCreditApi from "../../../api/adminUserCreditApi";
import companyApi from "../../../api/company";
import companyUserApi from "../../../api/companyUsers";
import documentApi from "../../../api/documentapi";

const PaymentSend = ({ onPrevious, formData }) => {
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user"));
  const userEmail = user?.userEmail;
  const userName = user?.userName;

  const signatoryCount = formData.signatories?.length || 0;
  const [docCost, setDocCost] = useState(0);
  const [signCost, setSignCost] = useState(0);
  const [totalCredits, setTotalCredits] = useState(0);
  const [confirmSend, setConfirmSend] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [userCredits, setUserCredits] = useState([]);
  const [errorMsg, setErrorMsg] = useState("");
  const [userCompanies, setUserCompanies] = useState([]);
  const [assignedCompanies, setAssignedCompanies] = useState([]);
  const [creditSource, setCreditSource] = useState("user"); // "user" or "company"
  const [selectedCompany, setSelectedCompany] = useState("");

  useEffect(() => {
    const fetchUserCompanies = async () => {
      try {
        const user = JSON.parse(localStorage.getItem("user"));
        if (!user) return;

        // Assuming this endpoint exists and returns a list of companies created by the user
        const response = await companyApi.getCompaniesByEmail(user.userEmail);
        setUserCompanies(response.data || []);

        const assignedResponse = await companyUserApi.getAssignedCompanies(
          user.userEmail
        );
        setAssignedCompanies(assignedResponse.data || []);
      } catch (error) {
        console.error("Error fetching user companies:", error);
      }
    };

    fetchUserCompanies();
  }, []);
  useEffect(() => {
    fetchUserCredits();
  }, []);

  const fetchUserCredits = async () => {
    try {
      const response = await adminUserCreditApi.getUserCreditsByEmail(
        userEmail
      );
      setUserCredits(response.data);
    } catch (error) {
      console.error("Error fetching user credits", error);
    }
  };

  // Fetch cost settings from admin API
  useEffect(() => {
    adminApi
      .getCreditSettings()
      .then((res) => {
        setDocCost(res.data.docCost);
        setSignCost(res.data.signCost);
      })
      .catch((err) => {
        console.error("Failed to load credit settings", err);
        Swal.fire(
          "Error",
          "Unable to load credit settings from server.",
          "error"
        );
      });
  }, []);

  // Fetch user's total available credits
  useEffect(() => {
    if (!userEmail) return;

    documentApi
      .getTotalCredits(userEmail)
      .then((res) => {
        setTotalCredits(res.data);
      })
      .catch((err) => {
        console.error("Failed to load total credits", err);
        Swal.fire(
          "Error",
          "Unable to load credit balance from server.",
          "error"
        );
      });
  }, [userEmail]);

  // Credit cost calculations
  const documentCharge = docCost;
  const signatoryCharge = signCost * signatoryCount;
  const usedCredits = totalCredits || 0;
  const balancedCredits = documentCharge - signatoryCharge - usedCredits;

  const creditDeduction = 20;
  const originalBalance = userCredits?.balanceCredit || 0;
  const originalUsed = userCredits?.usedCredit || 0;
  const creditsBought = userCredits?.creditBought || 0;

  const predictedBalance = originalBalance - creditDeduction;
  const predictedUsed = originalUsed + creditDeduction;

  const handleConfirmSend = async () => {
    setErrorMsg("");

    // Basic validation: check if required document details are present
    if (
      !formData.documentId ||
      !formData.documentName ||
      !formData.signatories ||
      formData.signatories.length === 0 ||
      (!formData.file && !formData.editedPdfBlob)
    ) {
      setErrorMsg("Please fill document details first and then send.");
      return;
    }
    setIsLoading(true);

    const formDataToSend = new FormData();
    const payload = {
      documentId: formData.documentId,
      senderEmail: userEmail,
      senderName: userName,
      documentName: formData.documentName,
      description: formData.description,
      fileName: formData.file?.name,
      signingMode: formData.signingMode,
      additionalInitials: formData.blockAllPages,
      deadline: formData.deadline,
      reminderEveryDay: formData.reminderDays?.everyDay || false,
      reminderDaysBeforeEnabled:
        formData.reminderDays?.daysBeforeEnabled || false,
      reminderDaysBefore: formData.reminderDays?.daysBefore || null,
      reminderLastDay: formData.reminderDays?.lastDay || false,
      sendFinalCopy: formData.sendFinalCopy || false,
      documentCharge,
      signatoryCharge,
      totalCredits,
      draft: false,
      signers: formData.signatories.map((s) => ({
        name: s.name,
        email: s.email,
      })),
    };

    formDataToSend.append(
      "data",
      new Blob([JSON.stringify(payload)], { type: "application/json" })
    );
    formDataToSend.append("file", formData.editedPdfBlob || formData.file);

    try {
      const saveResponse = await documentApi.saveDocument(formDataToSend);

      if (originalBalance < creditDeduction) {
        Swal.fire(
          "Insufficient Credits",
          "You do not have enough credits to send this document.",
          "error"
        );
        setIsLoading(false);
        return;
      }

      // Update credits in backend
      await adminUserCreditApi.updateUserCredits(userEmail, {
        balanceCredit: predictedBalance,
        usedCredit: predictedUsed,
      });

      // Save transaction
      await adminUserCreditApi.saveCreditTransaction({
        userEmail,
        usedCredits: predictedUsed,
        balanceCredits: predictedBalance,
        creditsBought,
        date: new Date().toISOString(),
        documentId: saveResponse.data.documentId,
        documentName: formData.documentName,
      });

      // Update local state to reflect new credit status
      setUserCredits((prev) => ({
        ...prev,
        balanceCredit: predictedBalance,
        usedCredit: predictedUsed,
      }));

      Swal.fire({
        title: "Success!",
        text: "Document sent successfully!",
        icon: "success",
        confirmButtonText: "OK",
      }).then(() => {
        navigate("/dashboard/my-consents");
      });
    } catch (err) {
      console.error("Error sending document:", err);
      Swal.fire({
        title: "Error",
        text: "Something went wrong while sending the document.",
        icon: "error",
        confirmButtonText: "OK",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const mergedCompanies = [
    ...userCompanies.map((c) => ({ ...c, type: "owned" })),
    ...assignedCompanies.map((c) => ({ ...c, type: "assigned" })),
  ];

  return (
    <Card className="p-4">
      <h4>
        <strong>Payments & Confirmations</strong>
      </h4>
      <p>Confirm the charges before sending the document for signing.</p>

      {(userCompanies.length > 0 || assignedCompanies.length > 0) && (
        <div className="mb-3">
          <h5>Choose Credit Source</h5>
          <Form.Check
            type="radio"
            label="Use My Credits"
            name="creditSource"
            value="user"
            checked={creditSource === "user"}
            onChange={(e) => setCreditSource(e.target.value)}
          />
          <Form.Check
            type="radio"
            label="Use Company Credits"
            name="creditSource"
            value="company"
            checked={creditSource === "company"}
            onChange={(e) => setCreditSource(e.target.value)}
          />

          {creditSource === "company" && (
            <Form.Group controlId="selectCompany" className="mt-2">
              <Form.Label>Select Company</Form.Label>
              <Form.Select
                value={selectedCompany}
                onChange={(e) => setSelectedCompany(e.target.value)}
              >
                <option value="">-- Select Company --</option>
                {mergedCompanies.map((company) => (
                  <option key={company.id} value={company.companyName}>
                    {company.companyName}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
          )}
        </div>
      )}

      <div className="mb-4">
        <h4>Charges Summary</h4>
        <p>
          <strong>Document Charges:</strong> {documentCharge} credits
        </p>
        <p>
          <strong>Signatory Charges:</strong> {signatoryCount} × {signCost} ={" "}
          {signatoryCharge} credits
        </p>
        <p>
          <strong>Previously Used Credits:</strong> {usedCredits}
        </p>
        <p>
          <strong>Balanced Credits (remaining):</strong> {balancedCredits}
        </p>
      </div>

      <div className="mb-4">
        <h4>Credits Summary</h4>
        <p>
          <strong>Credit Deduction for the document:</strong> {creditDeduction}
        </p>
        <p>
          <strong>Total credits:</strong> {creditsBought} &nbsp;||&nbsp;
          <strong>Balance credits:</strong> {predictedBalance} &nbsp;||&nbsp;
          <strong>Used Credits:</strong> {predictedUsed}
        </p>
      </div>


      <Form.Check
        type="checkbox"
        label="Confirm and send to the signatories"
        checked={confirmSend}
        onChange={(e) => setConfirmSend(e.target.checked)}
      />

      <div className="text-end mt-3">
        <Button variant="secondary" className="me-2" onClick={onPrevious}>
          Previous
        </Button>
        <Button
          variant="success"
          onClick={handleConfirmSend}
          disabled={!confirmSend || isLoading}
        >
          {isLoading ? (
            <>
              <Spinner animation="border" size="sm" className="me-2" />
              Sending...
            </>
          ) : (
            "Confirm and Send"
          )}
        </Button>
        {errorMsg && (
          <div className="text-danger mt-2" role="alert" aria-live="assertive">
            {errorMsg}
          </div>
        )}
      </div>
    </Card>
  );
};

export default PaymentSend;
