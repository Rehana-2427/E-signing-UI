import { Card } from "react-bootstrap";
import { FaPlus } from "react-icons/fa";
import { Link } from "react-router-dom";
import Navbar from "./layout/Navbar";
import './style.css';
const Dashboard = () => {

  return (
    <div>
      <Navbar />
      <br />
      <div className="card-center-container">

        <Card className="signing-card">
          <h1>
            <Link to="/dashboard/new-project">
              create a signing project <FaPlus />
            </Link>

          </h1>
        </Card>
    
      </div>
    </div>
  )
}

export default Dashboard
