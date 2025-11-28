import { Tab, Tabs } from "react-bootstrap";
import { useLocation, useNavigate } from "react-router-dom"; // Import hooks for routing
import CompanyCollabs from "./CompanyCollabs";
import UserCollabs from "./UserCollabs";

const MyCollabs = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Get the current tab from the URL (default to "create-Collabs" if not found)
  const currentTab = new URLSearchParams(location.search).get("tab") || "create-Collabs";

  // Handle tab change to update the URL
  const handleTabSelect = (tabKey) => {
    navigate(`?tab=${tabKey}`); // Update the URL with the selected tab
  };

  return (
    <div className="scrollable-container" style={{ height: "100%" }}>
      <h1>
        <strong>My Collabs</strong>
      </h1>
      <Tabs activeKey={currentTab} onSelect={handleTabSelect}>
        <Tab eventKey="create-Collabs" title="Create Collaborations">
          <CompanyCollabs />
        </Tab>
        <Tab eventKey="user-Collabs" title="My Collaborations">
          <UserCollabs />
        </Tab>
      </Tabs>
    </div>
  );
};

export default MyCollabs;
