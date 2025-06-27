import { Route, Routes } from "react-router-dom"
import Dashboard from "./Dashboard"
import NewProject from "./NewProject"

const DashboardRoute = () => {
    return (
        <div>
            <Routes>
                <Route path="/" element={<Dashboard />} />
                 <Route path="/new-project" element={<NewProject />} />
            </Routes>
        </div>
    )
}

export default DashboardRoute
