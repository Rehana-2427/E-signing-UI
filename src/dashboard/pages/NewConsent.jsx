import { useState } from "react";
import DocumentDetails from "./new_consent/DocumentDetails";
import PaymentSend from "./new_consent/PaymentSend"; // <-- Make sure to import it
import SignatoriesSettings from "./new_consent/SignatoriesSettings";

const NewConsent = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({});
  const [signatureFields, setSignatureFields] = useState(formData.signatureFields || []);

  const handleNext = () => setStep(prev => prev + 1);
  const handlePrevious = () => setStep(prev => prev - 1);

  return (
    <>
      <h1><strong>New Consent</strong></h1>
      <p>Step {step} of 3</p>

      {step === 1 && (
        <DocumentDetails
          onNext={handleNext}
          formData={formData}
          setFormData={setFormData}
        />
      )}

      {step === 2 && (
        <SignatoriesSettings
          onNext={handleNext}
          onPrevious={handlePrevious}
          formData={formData}
          setFormData={setFormData}
          signatureFields={signatureFields} // Pass signatureFields
          setSignatureFields={setSignatureFields} // Pass setSignatureFields
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
