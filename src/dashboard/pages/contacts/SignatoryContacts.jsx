import { useEffect, useState } from "react";
import { Button, Table } from "react-bootstrap";
import { BsChatRightDotsFill } from "react-icons/bs";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import signerApi from "../../../api/signerapi";

const SignatoryContacts = () => {
  const [contacts, setContacts] = useState([]);
  const user = JSON.parse(localStorage.getItem("user"));
  const userEmail = user?.userEmail;
  const navigate = useNavigate();
  useEffect(() => {
    if (userEmail) {
      signerApi
        .getSignersContact(userEmail)
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
      <h4>List of all signatories</h4>
      <Table hover>
        <thead>
          <tr style={{ background: "#f0f0f0" }}>
            <th>Signer Name</th>
            <th>Signer Email</th>
            <th># of documents signed</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {contacts.length === 0 ? (
            <tr>
              <td colSpan="4">No signers found.</td>
            </tr>
          ) : (
            contacts.map((signer, idx) => (
              <tr key={idx}>
                <td>{signer.name}</td>
                <td>{signer.email}</td>
                <td>{signer.signedCount || 0}</td>
                {/* <td>
                                    <Button variant="success" onClick={handleComingSoon}> <BiMessageRoundedDetail /></Button>
                                </td> */}
                <td>
                  <Button
                    variant="success"
                    onClick={() => handleContactClick(signer)}
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

export default SignatoryContacts;
