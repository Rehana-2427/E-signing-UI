import { Route, Routes } from "react-router-dom"
import Dashboard from "./Dashboard"
import FIleEditor from "./FIleEditor"
import NewProject from "./NewProject"

const DashboardRoute = () => {
    return (
        <div>
            <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/new-project" element={<NewProject />} />
                <Route path="/file-editor" element={<FIleEditor />} />

            </Routes>
        </div>
    )
}

export default DashboardRoute
