// Consents.js
import { useEffect, useState } from "react";
import { Button, Tab, Tabs } from "react-bootstrap";
import { FaPlusCircle } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import Drafts from "./Drafts";
import MyConsents from "./MyConsents";

const Consents = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("sent");
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
        <Tab eventKey="sent" title="Sent">
          <MyConsents />
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
