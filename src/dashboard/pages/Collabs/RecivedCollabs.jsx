import { useEffect, useState } from "react";
import { Tabs } from "react-bootstrap";
import { useLocation, useNavigate } from "react-router-dom";
import RecivedChecklist from "./RecivedChecklist";
import RecivedCollaborations from "./RecivedCollaborations";
import RecivedDocuments from "./RecivedDocuments";

const RecivedCollabs = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const queryParams = new URLSearchParams(location.search);
  const initialTab = queryParams.get("tab") || "recivedCollabs";

  const [activeTab, setActiveTab] = useState(initialTab);

  const handleTabSelect = (key) => {
    setActiveTab(key);
    navigate(`${location.pathname}?tab=${key}`, { replace: true });
  };

  useEffect(() => {
    const tab = new URLSearchParams(location.search).get("tab");
    if (tab && tab !== activeTab) setActiveTab(tab);
  }, [location.search]);

  return (
    <div className="scrollable-container" style={{ height: "100%" }}>
      <h1>
        <strong>Recieved Collabs</strong>
      </h1>
      <Tabs activeKey={activeTab} onSelect={handleTabSelect}>
        <Tabs.Tab eventKey="recivedCollabs" title="Recived-Collaborations">
          <RecivedCollaborations />
        </Tabs.Tab>
        <Tabs.Tab eventKey="documents" title="Documents">
          <RecivedDocuments />
        </Tabs.Tab>
        <Tabs.Tab eventKey="checklist" title="Checklist-Task">
          <RecivedChecklist />
        </Tabs.Tab>
      </Tabs>
    </div>
  );
};

export default RecivedCollabs;
