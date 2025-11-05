import { Tab, Tabs } from "react-bootstrap";
import CompanyCollabs from "./CompanyCollabs";
import UserCollabs from "./UserCollabs";

const MyCollabs = () => {
  return (
    <div   className="scrollable-container"
      style={{
        height: "100%",
      }}>
      <h1>
        <strong>My Collabs</strong>
      </h1>
      <Tabs>
        <Tab eventKey="company-Collabs" title="Company-Collabs">
            <CompanyCollabs />
        </Tab>
        <Tab eventKey="user-Collabs" title="User-Collabs">
            <UserCollabs />
        </Tab>
      </Tabs>
    </div>
  );
};

export default MyCollabs;
