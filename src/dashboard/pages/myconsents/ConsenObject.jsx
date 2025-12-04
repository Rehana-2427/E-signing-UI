import { useEffect, useState } from "react";
import { Button, Tabs } from "react-bootstrap";
import { IoArrowBackCircleSharp } from "react-icons/io5";
import { useLocation, useNavigate } from "react-router-dom";
import Audit from "./Audit";
import ConsentBrief from "./ConsentBrief";
import Reviwers from "./Reviwers";
import Signers from "./Signers";

const ConsenObject = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const initialTab = queryParams.get("tab") || "brief"; // Default tab to "contributors"
  const documentId = queryParams.get("documentId");
  const documentName = queryParams.get("documentName");
  const handleBack = () => {
    navigate(-1);
  };
  const [activeTab, setActiveTab] = useState(initialTab);
  useEffect(() => {
    // If URL changes manually, update activeTab
    const tab = new URLSearchParams(location.search).get("tab");
    if (tab && tab !== activeTab) setActiveTab(tab);
  }, [location.search]);

  const handleTabSelect = (selectedTab) => {
    // Update the active tab
    setActiveTab(selectedTab);

    // Update the URL with the new tab as a query parameter
    const searchParams = new URLSearchParams(location.search);
    searchParams.set("tab", selectedTab);
    navigate({
      pathname: location.pathname,
      search: searchParams.toString(),
    });
  };
  return (
    <div className="scrollable-container" style={{ height: "100%" }}>
      <div class="header-container">
        <h1>
          <strong>
            Consent Object - {documentName} ({documentId})
          </strong>
        </h1>
        <Button onClick={handleBack} variant="info" className="tooltip-btn">
          <IoArrowBackCircleSharp />
          <span className="tooltip-text">Go to Back</span>
        </Button>
      </div>

      <Tabs activeKey={activeTab} onSelect={handleTabSelect}>
        <Tabs.Tab eventKey="brief" title="Brief">
          <ConsentBrief documentId={documentId} documentName={documentName} />
        </Tabs.Tab>
        <Tabs.Tab eventKey="reviewers" title="Reviewers">
          <Reviwers documentId={documentId} documentName={documentName} />
        </Tabs.Tab>
        <Tabs.Tab eventKey="signers" title="Signers">
          <Signers documentId={documentId} documentName={documentName} />
        </Tabs.Tab>
        <Tabs.Tab eventKey="audit" title="Audit">
          <Audit documentId={documentId} documentName={documentName} />
        </Tabs.Tab>
      </Tabs>
    </div>
  );
};

export default ConsenObject;
