import { useEffect, useState } from "react";
import { Tab, Tabs } from "react-bootstrap";
import { useLocation, useSearchParams } from "react-router-dom";
import CollabContacts from "./CollabContacts";
import SignatoryContacts from "./SignatoryContacts";

const ContactTabs = () => {
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();

  // Always read from URL; default to "consent"
  const tabFromUrl = searchParams.get("tab") || "signatories";
  const [activeTab, setActiveTab] = useState(tabFromUrl);

  const handleTabChange = (key) => {
    setActiveTab(key);
    setSearchParams({ tab: key });
  };

  useEffect(() => {
    const tab = searchParams.get("tab") || "signatories";
    if (tab !== activeTab) setActiveTab(tab);
  }, [location.search]);

  return (
    <div className="scrollable-container" style={{ height: "100%" }}>
      <h1>
        <strong>Contacts</strong>
      </h1>
      <Tabs activeKey={activeTab} onSelect={handleTabChange} className="mb-3">
        <Tab eventKey="signatories" title="Signatories">
          <SignatoryContacts />
        </Tab>
        <Tab eventKey="contributors" title="Contributors">
          <CollabContacts />
        </Tab>
      </Tabs>
    </div>
  );
};

export default ContactTabs;
