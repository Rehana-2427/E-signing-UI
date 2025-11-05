import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import adminUserCreditApi from "../../api/adminUserCreditApi";
import DocumentDetails from "./new_consent/DocumentDetails";
import PaymentSend from "./new_consent/PaymentSend";
import SignatoriesSettings from "./new_consent/SignatoriesSettings";
import "./styles.css";
const NewConsent = () => {
  const navigate = useNavigate();
  const { step } = useParams(); // ← Get current step from the URL
  const location = useLocation();

  const currentStep = parseInt(step || 1); // fallback to 1

  const [formData, setFormData] = useState(location.state?.formData || {});
  const [signatureFields, setSignatureFields] = useState(
    formData.signatureFields || []
  );
  const [userCredit, setUserCredit] = useState(null);

  const user = JSON.parse(localStorage.getItem("user"));
  const userEmail = user?.userEmail;

  useEffect(() => {
    if (userEmail) {
      adminUserCreditApi
        .getUserCreditsByEmail(userEmail)
        .then((res) => setUserCredit(res.data))
        .catch((err) => console.error("Error fetching credit info", err));
    }
  }, [userEmail]);

  const goToStep = (nextStep) => {
    navigate(`/dashboard/new-consent/step/${nextStep}`, {
      state: { formData },
    });
  };

  const handleNext = () => goToStep(currentStep + 1);
  const handlePrevious = () => goToStep(currentStep - 1);

  return (
    <div
      className="scrollable-container" 
      style={{
        height: "100%", 
      }}
    >
      <h1>
        <strong>New Consent</strong>
      </h1>
      <p>Step {currentStep} of 3</p>

      {currentStep === 1 && (
        <DocumentDetails
          onNext={handleNext}
          formData={formData}
          setFormData={setFormData}
          userCredit={userCredit}
        />
      )}

      {currentStep === 2 && (
        <SignatoriesSettings
          onNext={handleNext}
          onPrevious={handlePrevious}
          formData={formData}
          setFormData={setFormData}
          signatureFields={signatureFields}
          setSignatureFields={setSignatureFields}
        />
      )}

      {currentStep === 3 && (
        <PaymentSend
          onPrevious={handlePrevious}
          formData={formData}
          signatureFields={signatureFields}
        />
      )}
    </div>
  );
};

export default NewConsent;
