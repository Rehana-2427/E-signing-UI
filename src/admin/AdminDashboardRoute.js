import { Route, Routes } from "react-router-dom"
import Admindashboard from "./Admindashboard"
import Credits from "./Credits"
import AdminLayout from "./layout/AdminLayout"
import Logout from "./Logout"
import Settings from "./Settings"
import UserManagemnet from "./UserManagemnet"

const AdminDashboardRoute = () => {
    return (
        <Routes>
            <Route path="/" element={<AdminLayout />}>
                <Route index element={<Admindashboard />} />
                <Route path="/credit" element={<Credits />} />
                <Route path="/user-management" element={<UserManagemnet />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/logout" element={<Logout />} />
            </Route>
        </Routes>
    )
}

export default AdminDashboardRoute
