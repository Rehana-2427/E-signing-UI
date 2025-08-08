import { Tab, Tabs } from 'react-bootstrap';
import Drafts from './Drafts';
import MyConsents from './MyConsents';


const Consents = () => {
    return (
        <div>
            <h1><strong>My Consents & Agreements</strong></h1>
            <Tabs defaultActiveKey="sent" id="consents-tabs" className="mb-3">
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
