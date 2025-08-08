import { Route, Routes } from "react-router-dom";
import FIleEditor from "./FIleEditor";
import FilePreviewPage from "./FilePreviewPage";
import NewProject from "./NewProject";
import ReceiveDocument from "./ReceiveDocument";
import SenderDocs from "./SenderDocs";
import SignatureDocuments from "./SignatureDocuments";
import SignedDocument from "./SignedDocument";
import DashboardLayout from "./layout/DashboardLayout";
import Consents from "./pages/Consents";
import Contacts from "./pages/Contacts";
import Dashboard from "./pages/Dashboard";
import MyDocs from "./pages/MyDocs";
import NewConsent from "./pages/NewConsent";
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
        <Route path="/my-docs" element={<MyDocs />} />
        <Route path="/my-docs/view" element={<RecipentViewDoc />} />
        <Route path="/contacts" element={<Contacts />} />
      </Route>
    </Routes>
  );
};

export default DashboardRoute;
