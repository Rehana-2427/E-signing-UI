import { Route, Routes } from "react-router-dom"
import Dashboard from "./Dashboard"
import FIleEditor from "./FIleEditor"
import NewProject from "./NewProject"
import FilePreviewPage from "./FilePreviewPage"
import ReceiveDocument from "./ReceiveDocument"
import SignedDocument from "./SignedDocument"

const DashboardRoute = () => {
    return (
        <div>
            <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/new-project" element={<NewProject />} />
                 <Route path="/file-editor" element={<FIleEditor />} />
                <Route path="/preview" element={<FilePreviewPage />} />
                <Route path="/receiveDcoment" element={<ReceiveDocument />} />
                <Route path="/signedDcoment" element={<SignedDocument />} />
            </Routes>
        </div>
    )
}

export default DashboardRoute
