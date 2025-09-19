import { useEffect, useState } from "react";
import { Button, Table } from "react-bootstrap";
import { AiFillEye, AiOutlineDownload } from "react-icons/ai";
import { MdEmail } from "react-icons/md";
import documentApi from "../../../api/documentapi";
import SearchBar from "../SearchBar";

const Drafts = () => {
  const [consents, setConsents] = useState([]);
  const [loading, setLoading] = useState(true);
  const user = JSON.parse(localStorage.getItem('user'));
  const senderEmail = user?.userEmail;
  const [searchQuery, setSearchQuery] = useState("");
  const [searchTerm, setSearchTerm] = useState(""); // track the last submitted search

  useEffect(() => {
    const fetchDrafts = async () => {
      setLoading(true);
      try {
        let response;
        if (searchTerm.trim() !== "") {
          response = await documentApi.getSearchDraftsConsensts(senderEmail, searchTerm);
        } else {
          response = await documentApi.getDrafts(senderEmail);
        }
        setConsents(response.data || []);
      } catch (error) {
        console.error("Failed to fetch consents:", error);
        setConsents([]);
      } finally {
        setLoading(false);
      }
    };

    fetchDrafts();
  }, [senderEmail, searchTerm]); // <-- run only when searchTerm changes (on button click)

  const handleSearch = () => {
    setSearchTerm(searchQuery.trim()); // set searchTerm to trigger search
  };

  if (loading) return <p>Loading consents...</p>;

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
        <div style={{ width: '250px' }}>
          <SearchBar
            placeholder="Search drafts..."
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            onSearch={handleSearch}  // pass handler here
          />
        </div>
      </div>
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
                <td>{consent.totalSigners}</td>
                <td>
                  <Button variant="primary" size="sm" className="me-2" title="View">
                    <AiFillEye />
                  </Button>
                  <Button variant="success" size="sm" className="me-2" title="Download">
                    <AiOutlineDownload />
                  </Button>
                  <Button variant="info" size="sm" title="Email">
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
