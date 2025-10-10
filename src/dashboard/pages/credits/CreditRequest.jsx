import { useEffect, useState } from "react";
import { Tab, Tabs } from "react-bootstrap";
import { useSearchParams } from "react-router-dom";
import CreditRequestCompany from "./CreditRequestCompany";
import CreditRequestUser from "./CreditRequestUser";

const CreditRequest = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const tabFromUrl = searchParams.get("tab");
  const [creditRequestTab, setCreditRequestTab] = useState(tabFromUrl || "user");

  // 🔄 Update URL when tab changes
  const handleTabChange = (key) => {
    setCreditRequestTab(key);
    setSearchParams({ tab: key });
  };

  useEffect(() => {
    if (tabFromUrl && tabFromUrl !== creditRequestTab) {
      setCreditRequestTab(tabFromUrl);
    }
  }, [tabFromUrl]);

  return (
    <div>
      <h1>
        <strong>Credit Request</strong>
      </h1>
      <Tabs
        activeKey={creditRequestTab}
        onSelect={handleTabChange}
        id="credit-request-tabs"
        className="mb-3"
      >
        <Tab eventKey="user" title="User Credit Requests">
          <CreditRequestUser />
        </Tab>
        <Tab eventKey="organization" title="Organization Credit Requests">
          <CreditRequestCompany />
        </Tab>
      </Tabs>
    </div>
  );
};

export default CreditRequest;
