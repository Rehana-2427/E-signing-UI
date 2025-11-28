import { useEffect, useState } from "react";
import { Button, Tabs } from "react-bootstrap";
import { IoArrowBackCircleSharp } from "react-icons/io5";
import { useLocation, useNavigate } from "react-router-dom";
import CollabBrief from "./CollabBrief";
import CollabCredits from "./CollabCredits";
import CollabDocuments from "./CollabDocuments";
import CollaborationChecklist from "./CollaborationChecklist";
import Contributors from "./Contributors";

const CollabObject = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Get tab from query string ?tab=overview
  const queryParams = new URLSearchParams(location.search);
  const initialTab = queryParams.get("tab") || "contributors"; // Default tab to "contributors"
  const collabId = queryParams.get("collabId");
  const collaborationName = queryParams.get("collaborationName");

  const [activeTab, setActiveTab] = useState(initialTab);

  const handleTabSelect = (key) => {
    setActiveTab(key);
    // Update URL query parameter to reflect selected tab
    navigate(
      `${location.pathname}?collabId=${collabId}&collaborationName=${collaborationName}&tab=${key}`,
      { replace: true }
    );
  };

  useEffect(() => {
    // If URL changes manually, update activeTab
    const tab = new URLSearchParams(location.search).get("tab");
    if (tab && tab !== activeTab) setActiveTab(tab);
  }, [location.search]);
  
  const handleBack = () => {
    navigate(-1);
  };
  return (
    <div className="scrollable-container" style={{ height: "100%" }}>
      <div class="header-container">
        <h1>
          <strong>
            Collab Object - {collaborationName} ({collabId})
          </strong>
        </h1>
        <Button onClick={handleBack} variant="info" className="tooltip-btn">
          <IoArrowBackCircleSharp />
          <span className="tooltip-text">Go to Back</span>
        </Button>
      </div>

      <Tabs activeKey={activeTab} onSelect={handleTabSelect}>
        <Tabs.Tab eventKey="brief" title="Brief">
          <CollabBrief
            collabId={collabId}
            collaborationName={collaborationName}
          />
        </Tabs.Tab>
        <Tabs.Tab eventKey="contributors" title="Contributors">
          <Contributors
            collabId={collabId}
            collaborationName={collaborationName}
          />
        </Tabs.Tab>
        <Tabs.Tab eventKey="documents" title="Documents">
          <CollabDocuments
            collabId={collabId}
            collaborationName={collaborationName}
          />
        </Tabs.Tab>
        <Tabs.Tab eventKey="checklist" title="Checklist">
          <CollaborationChecklist
            collabId={collabId}
            collaborationName={collaborationName}
          />
        </Tabs.Tab>
        <Tabs.Tab eventKey="credits" title="Credits & Data">
          <CollabCredits
            collabId={collabId}
            collaborationName={collaborationName}
          />
        </Tabs.Tab>
      </Tabs>
    </div>
  );
};

export default CollabObject;
