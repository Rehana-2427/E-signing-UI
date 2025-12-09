// Consents.js
import { useEffect, useState } from "react";
import { Button, Tab, Tabs } from "react-bootstrap";
import { FaPlusCircle } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import CompanyConsents from "./CompanyConsents";
import Drafts from "./Drafts";
import MyConsents from "./MyConsents";
import PersonalConsents from "./PersonalConsents";

const Consents = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("all");
  useEffect(() => {
    const storedTab = localStorage.getItem("consentsActiveTab");
    if (storedTab) {
      setActiveTab(storedTab);
      localStorage.removeItem("consentsActiveTab"); // Clear after use
    }
  }, []);
  return (
    <div
      className="scrollable-container"
      style={{
        height: "100%",
      }}
    >
      <div className="d-flex align-items-center justify-content-between mb-3">
        <h1>
          <strong>My Consents & Agreements</strong>
        </h1>
        <Button variant="info" className="tooltip-btn" onClick={() => navigate(`/dashboard/my-consents/new-consent/step/1`)}>
          Add New Consent <FaPlusCircle />
        </Button>
      </div>

      <Tabs
        activeKey={activeTab}
        onSelect={(key) => setActiveTab(key)}
        id="consents-tabs"
        className="mb-3"
      >
        <Tab eventKey="all" title="All Consents">
          <MyConsents />
        </Tab>
        <Tab eventKey="company" title="Company Consents">
          <CompanyConsents />
        </Tab>
        <Tab eventKey="personal" title="Personal Consents">
          <PersonalConsents />
        </Tab>
       
        <Tab eventKey="drafts" title="Drafts">
          <Drafts />
        </Tab>
        {/* <Tab eventKey="pending" title="pending">
          <PendingConsents />
        </Tab> */}
      </Tabs>
    </div>
  );
};

export default Consents;
