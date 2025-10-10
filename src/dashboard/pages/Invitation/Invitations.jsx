import { Tab, Tabs } from "react-bootstrap";
import InvitedUsers from "./InvitedUsers";

const Invitations = () => {
  return (
    <>
      <h1>
        <strong>Invitations</strong>
      </h1>
      <Tabs>
        <Tab eventKey="sent-invitations" title="Sent Invitations">
          <InvitedUsers type="sent" />
        </Tab>
        <Tab eventKey="received-invitations" title="Received Invitations">
          <InvitedUsers type="received" />
        </Tab>
      </Tabs>
    </>
  );
};

export default Invitations;
