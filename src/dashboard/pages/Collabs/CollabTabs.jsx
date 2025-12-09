import { useEffect, useState } from "react";
import { Button, Tab, Tabs } from "react-bootstrap";
import { FaPlusCircle } from "react-icons/fa";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import BusinessCollabs from "./BusinessCollabs";
import PersonalCollabs from "./PersonalCollabs";
import UserCollabs from "./UserCollabs";

const CollabTabs = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // Always read from URL; default to "consent"
  const tabFromUrl = searchParams.get("tab") || "all-collabs";
  const [activeTab, setActiveTab] = useState(tabFromUrl);

  const handleTabChange = (key) => {
    setActiveTab(key);
    setSearchParams({ tab: key });
  };

  useEffect(() => {
    const tab = searchParams.get("tab") || "all-collabs";
    if (tab !== activeTab) setActiveTab(tab);
  }, [location.search]);

  return (
    <div className="scrollable-container" style={{ height: "100%" }}>
      <div className="d-flex align-items-center justify-content-between mb-3">
        <h1>
          <strong>My-Collabs</strong>
        </h1>
        <Button
          onClick={() => navigate(`/dashboard/my-collabs/new-collab`)}
          variant="info"
          className="tooltip-btn"
        >
          Add New Collaboration <FaPlusCircle />
        </Button>
      </div>
      <Tabs activeKey={activeTab} onSelect={handleTabChange} className="mb-3">
        <Tab eventKey="all-collabs" title="All Collaborations">
          <UserCollabs />
        </Tab>
        <Tab eventKey="business" title="Business Collaborations">
          <BusinessCollabs />
        </Tab>
        <Tab eventKey="personal" title="Personal Collaborations">
          <PersonalCollabs />
        </Tab>
      </Tabs>
    </div>
  );
};

export default CollabTabs;
