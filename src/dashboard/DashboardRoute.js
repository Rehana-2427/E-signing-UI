import { Route, Routes } from "react-router-dom";
import FIleEditor from "./FIleEditor";
import FilePreviewPage from "./FilePreviewPage";
import NewProject from "./NewProject";
import ReceiveDocument from "./ReceiveDocument";
import SenderDocs from "./SenderDocs";
import SignatureDocuments from "./SignatureDocuments";
import SignedDocument from "./SignedDocument";
import DashboardLayout from "./layout/DashboardLayout";
import Contacts from "./pages/Contacts";
import Dashboard from "./pages/dashboard_stats/Dashboard";

import AuditTrail from "./pages/AuditTrail";
import CreditPassBook from "./pages/CreditPassBook";
import CreditTransactionSummary from "./pages/CreditTransactionSummary";
import NewConsent from "./pages/NewConsent";
import Profile from "./pages/Profile";
import Consents from "./pages/myconsents/Consents";
import MyDocs from "./pages/mydocs/MyDocs";
import RecipentViewDoc from "./pages/recipent_document/RecipentViewDoc";

const DashboardRoute = () => {
  return (
    <Routes>
      <Route path="/" element={<DashboardLayout />}>
        <Route index element={<Dashboard />} />
        <Route path="/new-project" element={<NewProject />} />
        <Route path="/file-editor" element={<FIleEditor />} />
        <Route path="/preview" element={<FilePreviewPage />} />
        <Route path="/receiveDcoment" element={<ReceiveDocument />} />
        <Route path="/signedDocument/:id" element={<SignedDocument />} />
        <Route path="/sender-docs" element={<SenderDocs />} />
        <Route path="/pdf-viewer" element={<SignatureDocuments />} />
        <Route path="/my-consents" element={<Consents />} />
        <Route path="/new-consent" element={<NewConsent />} />
        <Route path="/my-consents/audit-trail" element={<AuditTrail />} />
        <Route path="/my-docs" element={<MyDocs />} />
        <Route path="/my-docs/view" element={<RecipentViewDoc />} />
        <Route path="/contacts" element={<Contacts />} />
         <Route path="/creditPassBook" element={<CreditPassBook />} />
         <Route path="/creditPassBook/transaction-history" element={<CreditTransactionSummary />} />
        <Route path="/profile" element={<Profile />} />
      </Route>
    </Routes>
  );
};

export default DashboardRoute;
