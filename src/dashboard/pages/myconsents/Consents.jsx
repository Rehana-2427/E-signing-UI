// Consents.js
import { useEffect, useState } from 'react';
import { Tab, Tabs } from 'react-bootstrap';
import Drafts from './Drafts';
import MyConsents from './MyConsents';

const Consents = () => {
    const [activeTab, setActiveTab] = useState("sent");
    useEffect(() => {
        const storedTab = localStorage.getItem("consentsActiveTab");
        if (storedTab) {
            setActiveTab(storedTab);
            localStorage.removeItem("consentsActiveTab"); // Clear after use
        }
    }, []);
    return (
        <div>
            <h1><strong>My Consents & Agreements</strong></h1>
            <Tabs
                activeKey={activeTab}
                onSelect={(key) => setActiveTab(key)}
                id="consents-tabs"
                className="mb-3"
            >
                <Tab eventKey="sent" title="Sent">
                    <MyConsents />
                </Tab>
                <Tab eventKey="drafts" title="Drafts">
                    <Drafts />
                </Tab>
            </Tabs>
        </div>
    );
};

export default Consents;
