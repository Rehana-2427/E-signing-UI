import { Card } from "react-bootstrap";

const UserCollabs = () => {
  return (
    <div>
      <Card className="p-3 mt-3">
        <h5>📘 How User Collaborations Work</h5>
        <ul>
          <li>
            First, you need to register or log in to start a collaboration.
            You can choose to collaborate with users from a company or invite others to collaborate with you.
            If you are collaborating with a company, admin approval may be required.
          </li>
          <li>
            Every collaboration comes with a default of <strong>5 credits</strong>, which will be given to you after the collaboration is created.
          </li>
          <li>
            The initial collaboration setup is free. However, if you want to perform additional actions, such as inviting more users, sending messages, or adding documents, credits will be deducted. Each action will cost <strong>2 credits</strong>.
          </li>
          <li>
            You can upgrade your account to collaborate with multiple companies or unlock premium features. For this, you'll need to purchase additional credits.
          </li>
        </ul>
      </Card>
    </div>
  );
};

export default UserCollabs;
