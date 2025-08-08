import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import Home from "./Home";
import AdminDashboardRoute from './admin/AdminDashboardRoute';
import AdminLogin from './admin/AdminLogin';
import Signatory_Login from './components/loginSessions/Signatory_Login';
import Signin from './components/loginSessions/Signin';
import UserSignup from './components/loginSessions/UserSignup';
import DashboardRoute from './dashboard/DashboardRoute';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path='/register' element={<UserSignup />} />
        <Route path='/signin' element={<Signin />} />
        <Route path='/dashboard/*' element={<DashboardRoute />} />
        <Route path='/signatory_verification' element={<Signatory_Login />} />

        <Route path="/admin-login" element={<AdminLogin />} />
        <Route path="/admin-dashboard/*" element={<AdminDashboardRoute />} />

      </Routes>
    </Router>
  );
}

export default App;
