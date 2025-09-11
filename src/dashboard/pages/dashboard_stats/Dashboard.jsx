import MyConsentsStats from "./MyConsentsStats";
import StatsGraph from "./StatsGraph";
import './style.css';

const Dashboard = () => {


  return (
      <div className="dashboard">
      <h1><strong>Dashboard</strong></h1>
      <MyConsentsStats />
      <StatsGraph />
    </div>
  )
}

export default Dashboard
