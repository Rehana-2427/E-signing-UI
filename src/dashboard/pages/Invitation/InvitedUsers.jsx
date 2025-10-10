import RecivedInvitationFromAdmin from "./RecivedInvitationFromAdmin";
import SentInvitationUsers from "./SentInvitationUsers";

const InvitedUsers = ({ type }) => {
  return (
    <>
      {type === 'sent' ? (
        <SentInvitationUsers />
      ) : (
        <RecivedInvitationFromAdmin />
      )}
    </>
  );
};

export default InvitedUsers;
