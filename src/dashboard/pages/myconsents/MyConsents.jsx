import { debounce } from "lodash";
import { useEffect, useState } from "react";
import { Button, Table } from "react-bootstrap";
import { AiFillEye, AiOutlineDownload } from "react-icons/ai";
import { MdEmail } from "react-icons/md";
import { useNavigate } from "react-router-dom";
import documentApi from "../../../api/documentapi";
import ReminderModal from "../ReminderModal";
import SearchBar from "../SearchBar";


const MyConsents = () => {
    const navigate = useNavigate();
    const [consents, setConsents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [selectedDoc, setSelectedDoc] = useState(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [searchTerm, setSearchTerm] = useState(""); // track the last submitted search
    const user = JSON.parse(localStorage.getItem('user'));
    const senderEmail = user?.userEmail;

    useEffect(() => {
        const fetchConsents = async (query) => {
            setLoading(true);
            try {
                let response;
                if (searchTerm.trim() !== "") {
                    response = await documentApi.getSearchSentConsensts(senderEmail, searchTerm);
                } else {
                    response = await documentApi.getMyConsents(senderEmail);
                }
                setConsents(response.data || []);
            } catch (error) {
                console.error("Failed to fetch consents:", error);
                setConsents([]);
            } finally {
                setLoading(false);
            }
        };

        const debouncedFetch = debounce(fetchConsents, 300);

        debouncedFetch(searchQuery);

        return () => {
            debouncedFetch.cancel();
        };
    }, [senderEmail, searchTerm]);


    const handleEmailClick = (doc) => {
        setSelectedDoc(doc);
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setSelectedDoc(null);
    };

    const handleSendReminder = (docId) => {
        console.log("Sending email reminder for document:", docId);
        setShowModal(false);
    };
    const handleSearch = () => {
        setSearchTerm(searchQuery.trim()); // set searchTerm to trigger search
    };

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
                        <th>Sent On</th>
                        <th># of People</th>
                        <th>Actions</th>
                        <th>Audit Trail</th>
                    </tr>
                </thead>
                <tbody>
                    {loading ? (
                        <tr>
                            <td colSpan="6">Loading consents...</td>
                        </tr>
                    ) : consents.length === 0 ? (
                        <tr>
                            <td colSpan="6">
                                {searchQuery && searchQuery.trim() !== "" ? "No results found." : "No consents found."}
                            </td>
                        </tr>
                    ) : (
                        consents.map((consent) => (
                            <tr key={consent.documentId}>
                                <td>{consent.documentName}</td>
                                <td>{consent.sentOn}</td>
                                <td>{consent.signedCount} / {consent.totalSigners}</td>
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
                                        onClick={() => handleEmailClick(consent)}
                                    >
                                        <MdEmail />
                                    </Button>
                                </td>
                                <td>
                                    <Button onClick={() => navigate(`/dashboard/my-consents/audit-trail?documentId=${consent.documentId}`)}>
                                        Audit Trail
                                    </Button>
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </Table>

            <ReminderModal
                show={showModal}
                onClose={handleCloseModal}
                documentId={selectedDoc?.documentId}
                documentName={selectedDoc?.documentName}
                onSend={handleSendReminder}
            />
        </>
    );
};

export default MyConsents;
