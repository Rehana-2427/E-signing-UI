import { Route, Routes } from "react-router-dom";
import FIleEditor from "./FIleEditor";
import FilePreviewPage from "./FilePreviewPage";
import NewProject from "./NewProject";
import ReceiveDocument from "./ReceiveDocument";
import SenderDocs from "./SenderDocs";
import SignatureDocuments from "./SignatureDocuments";
import SignedDocument from "./SignedDocument";
import DashboardLayout from "./layout/DashboardLayout";
import AuditTrail from "./pages/AuditTrail";
import Chat from "./pages/Chat";
import CollabObject from "./pages/Collabs/CollabObject";
import CollabOverview from "./pages/Collabs/CollabOverView";
import MyCollabs from "./pages/Collabs/MyCollabs";
import RecivedCollabs from "./pages/Collabs/RecivedCollabs";
import MyCompanies from "./pages/Comapnies/MyCompanies";
import Contacts from "./pages/Contacts";
import Invitations from "./pages/Invitation/Invitations";
import NewConsent from "./pages/NewConsent";
import Profile from "./pages/Profile";
import ChatModal from "./pages/chatComponent/ChatModal";
import CompanyCreditReport from "./pages/credits/CompanyCreditReport";
import CompanyCreditTransactionHistory from "./pages/credits/CompanyCreditTransactionHistory";
import CreditRequest from "./pages/credits/CreditRequest";
import UserCreditTransactionReport from "./pages/credits/UserCreditTransactionReport";
import Dashboard from "./pages/dashboard_stats/Dashboard";
import Consents from "./pages/myconsents/Consents";
import MyDocs from "./pages/mydocs/MyDocs";
import RecipentViewDoc from "./pages/recipent_document/RecipentViewDoc";
import FileReviewer from "./pages/reviewedDocuments/FileReviewer";
import ReviewerConsesnts from "./pages/reviewedDocuments/ReviewerConsesnts";
import EditTemplate from "./pages/templates/EditTemplate";
import Templates from "./pages/templates/Templates";

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
        <Route path="/new-consent/step/:step" element={<NewConsent />} />
        <Route path="/my-consents/audit-trail" element={<AuditTrail />} />
        <Route path="/my-docs" element={<MyDocs />} />
        <Route path="/my-docs/view" element={<RecipentViewDoc />} />
        <Route path="/contacts" element={<Contacts />} />
        {/* <Route path="/creditPassBook" element={<CreditPassBook />} />
        <Route path="/creditPassBook/transaction-history" element={<CreditTransactionSummary />} /> */}
        <Route path="/profile" element={<Profile />} />
        <Route path="/templates" element={<Templates />} />
        <Route path="templates/edit-template" element={<EditTemplate />} />
        <Route path="/contacts/chat" element={<Chat />} />
        <Route path="/creditRequest" element={<CreditRequest />} />
        <Route
          path="/creditRequest/user/user-transaction-history"
          element={<UserCreditTransactionReport />}
        />
        <Route
          path="/creditRequest/my-companies/:companyName/company-transaction-history"
          element={<CompanyCreditTransactionHistory />}
        />
        <Route path="/creditRequest/my-companies" element={<MyCompanies />} />
        <Route
          path="/creditRequest/my-companies/:companyKey"
          element={<CompanyCreditReport />}
        />
        <Route path="/invitations" element={<Invitations />} />
        <Route path="/review-documents" element={<ReviewerConsesnts />} />
        <Route path="/chat-app" element={<ChatModal />} />
        <Route
          path="/review-documents/review-file"
          element={<FileReviewer />}
        />
        <Route path="/my-collabs" element={<MyCollabs />} />
        <Route path="/my-collabs/create-collab" element={<CollabOverview />} />
        <Route path="/my-collabs/collab-object" element={<CollabObject />} />

        <Route
          path="/my-collabs/recived-collabs"
          element={<RecivedCollabs />}
        />
      </Route>
    </Routes>
  );
};

export default DashboardRoute;
