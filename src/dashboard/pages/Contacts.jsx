import { useEffect, useState } from "react";
import { Button, Table } from "react-bootstrap";
import { BiMessageRoundedDetail } from "react-icons/bi";
import signerApi from "../../api/signerapi";

const Contacts = () => {
    const [contacts, setContacts] = useState([]);
    const user = JSON.parse(localStorage.getItem("user"));
    const userEmail = user?.userEmail;
    useEffect(() => {
        if (userEmail) {
            signerApi.getSignersContact(userEmail)
                .then((res) => {
                    setContacts(res.data);
                })
                .catch((err) => {
                    console.error("Failed to fetch documents", err);
                });
        }
    }, [userEmail]);
    return (
        <>
            <h1><strong>List of all signatories</strong></h1>
            <Table hover>
                <thead>
                    <tr style={{ background: "#f0f0f0" }}>
                        <th>Signer Name</th>
                        <th >Signer Email</th>
                        <th ># of documents signed</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {contacts.length === 0 ? (
                        <tr>
                            <td colSpan="4" >No signers found.</td>
                        </tr>
                    ) : (
                        contacts.map((signer, idx) => (
                            <tr key={idx}>
                                <td>{signer.name}</td>
                                <td>{signer.email}</td>
                                <td>{signer.signedCount || 0}</td>
                                <td>
                                    <Button variant="success"> <BiMessageRoundedDetail /></Button>
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </Table>
        </>
    )
}

export default Contacts
