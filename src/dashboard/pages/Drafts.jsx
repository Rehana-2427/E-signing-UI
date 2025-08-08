import { useEffect, useState } from "react";
import { Button, Table } from "react-bootstrap";
import { AiFillEye, AiOutlineDownload } from "react-icons/ai";
import { MdEmail } from "react-icons/md";
import documentApi from "../../api/documentapi";

const Drafts = () => {
  const [consents, setConsents] = useState([]);
  const [loading, setLoading] = useState(true);
  const user = JSON.parse(localStorage.getItem('user'));
  const senderEmail = user?.userEmail;

  useEffect(() => {
    setLoading(true);
    documentApi.getDrafts(senderEmail)
      .then((response) => {
        setConsents(response.data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Failed to fetch consents:", error);
        setLoading(false);
      });
  }, [senderEmail]);


  if (loading) return <p>Loading consents...</p>;

  return (
    <>

      <Table hover>
        <thead>
          <tr>
            <th>Document Name</th>
            <th>Draft saved On</th>
            <th># of People</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {consents.length === 0 ? (
            <tr>
              <td colSpan="6">No drafts found.</td>
            </tr>
          ) : (
            consents.map((consent) => (
              <tr key={consent.documentId}>
                <td>{consent.documentName}</td>
                <td>{consent.sentOn}</td>

                <td> {consent.totalSigners}</td>
                <td>
                  <Button variant="primary" size="sm" className="me-2" title="View">
                    <AiFillEye />
                  </Button>
                  <Button variant="success" size="sm" className="me-2" title="Download">
                    <AiOutlineDownload />
                  </Button>
                  <Button
                    variant="info"
                    size="sm"
                    title="Email"

                  >
                    <MdEmail />
                  </Button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </Table>


    </>
  );
};

export default Drafts;
