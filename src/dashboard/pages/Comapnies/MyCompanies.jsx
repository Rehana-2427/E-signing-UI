import { useEffect } from "react";
import { Tab, Tabs } from "react-bootstrap";
import { useSearchParams } from "react-router-dom";
import AssignedComapnies from "./AssignedComapnies";
import CreatedCompanies from "./CreatedCompanies";

const MyCompanies = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const tab = searchParams.get("tab");

  // Set default tab to "created" if not present
  useEffect(() => {
    if (!tab) {
      setSearchParams({ tab: "created" });
    }
  }, [tab, setSearchParams]);

  const handleSelect = (key) => {
    setSearchParams({ tab: key });
  };

  return (
    <>
      <h1>
        <strong>My Companies</strong>
      </h1>
      <Tabs
        activeKey={tab || "created"} // fallback to "created" for initial render
        onSelect={handleSelect}
        id="my-companies-tabs"
        className="mb-3"
      >
        <Tab eventKey="created" title="Created Companies">
          <CreatedCompanies />
        </Tab>
        <Tab eventKey="assigned" title="Assigned Companies">
          <AssignedComapnies />
        </Tab>
      </Tabs>
    </>
  );
};

export default MyCompanies;
