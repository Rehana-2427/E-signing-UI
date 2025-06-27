import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import Home from "./Home";
import DashboardRoute from './dashboard/DashboardRoute';
import Signin from './sessions/Signin';
import UserSignup from './sessions/UserSignup';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path='/register' element={<UserSignup />} />
        <Route path='/signin' element={<Signin />} />
        <Route path='/dashboard/*' element={<DashboardRoute />} />
      </Routes>
    </Router>
  );
}

export default App;
