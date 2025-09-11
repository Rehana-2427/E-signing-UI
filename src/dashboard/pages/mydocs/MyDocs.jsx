import { useEffect, useState } from "react";
import { Tab, Tabs } from "react-bootstrap";
import CompletedDocs from "./CompletedDocs";
import PendingDocs from "./PendingDocs";

const MyDocs = () => {
    const [docsActiveTab, setDocsActiveTab] = useState("pending");
    useEffect(() => {
        const storedTab = localStorage.getItem("docsActiveTab");
        if (storedTab) {
            setDocsActiveTab(storedTab);
            localStorage.removeItem("docsActiveTab"); // Clear after use
        }
    }, []);
    return (
        <div>
            <h1><strong>My Docs</strong></h1>
            <Tabs
                activeKey={docsActiveTab}
                onSelect={(key) => setDocsActiveTab(key)}
                id="docs-tabs"
                className="mb-3"
            >
                <Tab eventKey="pending" title="pending">
                    <PendingDocs />
                </Tab>
                <Tab eventKey="completed" title="completed">
                    <CompletedDocs />
                </Tab>
            </Tabs>
        </div>
    )
}

export default MyDocs
