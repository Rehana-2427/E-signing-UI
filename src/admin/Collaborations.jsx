import { Tab, Tabs } from "react-bootstrap"
import ApprovedCollabs from "./ApprovedCollabs"
import NotApprovedCollabs from "./NotApprovedCollabs"

const Collaborations = () => {
  return (
  <div className="scrollable-container" style={{ height: "100%" }}>
      <h1>
        <strong>Collaborations</strong>
      </h1>
      <Tabs>
        <Tab eventKey="notApproved-Collabs" title="Not Approved Collabs">
          <NotApprovedCollabs />
        </Tab>
        <Tab eventKey="approved-Collabs" title="Approved Collabs">
          <ApprovedCollabs />
        </Tab>
      </Tabs>
    </div>
  )
}

export default Collaborations
