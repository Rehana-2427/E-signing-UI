import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import adminUserCreditApi from "../../api/adminUserCreditApi";
import DocumentDetails from "./new_consent/DocumentDetails";
import PaymentSend from "./new_consent/PaymentSend";
import SignatoriesSettings from "./new_consent/SignatoriesSettings";

const NewConsent = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({});
  const [signatureFields, setSignatureFields] = useState(formData.signatureFields || []);
  const [userCredit, setUserCredit] = useState(null);

  const user = JSON.parse(localStorage.getItem("user"));
  const userEmail = user?.userEmail;

  useEffect(() => {
    if (userEmail) {
      adminUserCreditApi
        .getUserCreditsByEmail(userEmail)
        .then((res) => {
          setUserCredit(res.data);
        })
        .catch((err) => {
          console.error("Error fetching credit info", err);
        });
    }
  }, [userEmail]);

  const handleNext = () => setStep((prev) => prev + 1);
  const handlePrevious = () => setStep((prev) => prev - 1);

  return (
    <>
      <h1><strong>New Consent</strong></h1>
      <p>Step {step} of 3</p>

      {step === 1 && (
        <DocumentDetails
          onNext={handleNext}
          formData={formData}
          setFormData={setFormData}
          userCredit={userCredit}
        />
      )}

      {step === 2 && (
        <SignatoriesSettings
          onNext={handleNext}
          onPrevious={handlePrevious}
          formData={formData}
          setFormData={setFormData}
          signatureFields={signatureFields}
          setSignatureFields={setSignatureFields}
        />
      )}

      {step === 3 && (
        <PaymentSend
          onPrevious={handlePrevious}
          formData={formData}
          signatureFields={signatureFields}
        />
      )}
    </>
  );
};

export default NewConsent;
