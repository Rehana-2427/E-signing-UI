import { useEffect, useState } from "react";
import { Button, Table } from "react-bootstrap";
import { BsChatRightDotsFill } from "react-icons/bs";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import collaborationApi from "../../../api/collaborationApi";

const CollabContacts = () => {
  const [contacts, setContacts] = useState([]);
  const user = JSON.parse(localStorage.getItem("user"));
  const userEmail = user?.userEmail;
  const navigate = useNavigate();
  useEffect(() => {
    if (userEmail) {
      collaborationApi
        .getContributorsContact(userEmail)
        .then((res) => {
          setContacts(res.data);
        })
        .catch((err) => {
          console.error("Failed to fetch documents", err);
        });
    }
  }, [userEmail]);

  const handleComingSoon = () => {
    Swal.fire({
      icon: "info",
      title: "Coming Soon!",
      text: "This feature is under development.",
      confirmButtonText: "OK",
    });
  };

  const handleContactClick = (signer) => {
    navigate("/dashboard/contacts/chat", {
      state: { selectedContact: signer },
    });
  };
  return (
    <div
      className="scrollable-container"
      style={{
        height: "100%",
      }}
    >
      <h4>List of all Contributors</h4>
      <Table hover>
        <thead>
          <tr style={{ background: "#f0f0f0" }}>
            <th>Contributor Name</th>
            <th>Contributor Email</th>
            <th># of Collaborations</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {contacts.length === 0 ? (
            <tr>
              <td colSpan="4">No Contributors found.</td>
            </tr>
          ) : (
            contacts.map((contributor, idx) => (
              <tr key={idx}>
                <td>{contributor.name}</td>
                <td>{contributor.email}</td>
                <td>{contributor.collaborationCount || 0}</td>

                <td>
                  <Button
                    variant="success"
                    onClick={() => handleContactClick(contributor)}
                  >
                    <BsChatRightDotsFill />
                  </Button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </Table>
    </div>
  );
};

export default CollabContacts;
