import { Fragment, useEffect, useState } from "react";
import { Card, Col, Row } from "react-bootstrap";
import { Link } from "react-router-dom";
import consentAPi from "../../../api/consentAPi";

const MyConsentsStats = () => {
    const user = JSON.parse(localStorage.getItem("user"));
    const userEmail = user?.userEmail;

    const [activeConsents, setActiveConsents] = useState(0);
    const [draftConsents, setDraftConsents] = useState(0);
    const [pendingConsents, setPendingConsents] = useState(0);
    const [completedConsents, setCompletedConsents] = useState(0);

    useEffect(() => {
        if (userEmail) {
            consentAPi.getConsentStats(userEmail)
                .then(response => {
                    const data = response.data;
                    setActiveConsents(data.activeConsents || 0);
                    setDraftConsents(data.draftConsents || 0);
                    setPendingConsents(data.pendingConsents || 0);
                    setCompletedConsents(data.completedConsents || 0);
                })
                .catch(error => {
                    console.error("Failed to fetch consent stats:", error);
                });
        }
    }, [userEmail]);

    const DATA = [
        {
            title: activeConsents,
            subtitle: "Active Consents",
            link: "/dashboard/my-consents",
            state: { activeTab: "sent" }
        },
        {
            title: draftConsents,
            subtitle: "Draft Consents",
            link: "/dashboard/my-consents",
            state: { activeTab: "drafts" }
        },
        {
            title: pendingConsents,
            subtitle: "Pending Docs",
            link: "/dashboard/my-docs",
            state: { docsActiveTab: "pending" }
        },
        {
            title: completedConsents,
            subtitle: "Completed Docs ",
            link: "/dashboard/my-docs",
            state: { docsActiveTab: "completed" }
        }
    ];

    return (
        <Fragment>
            <Row>
                {DATA.map((card, index) => (
                    <Col lg={3} sm={6} key={index}>
                        <Link
                            to={card.link}
                            onClick={() => {
                                if (card.state.activeTab) {
                                    localStorage.setItem("consentsActiveTab", card.state.activeTab);
                                }
                                if (card.state.docsActiveTab) {
                                    localStorage.setItem("docsActiveTab", card.state.docsActiveTab);
                                }
                            }}
                            style={{ textDecoration: "none" }}
                        >

                            <Card className="card card-icon-bg card-icon-bg-primary o-hidden mb-4">
                                <Card.Body>
                                    <i className={card.icon} />
                                    <div className="content">
                                        <p className="text-muted mb-0 text-capitalize">{card.subtitle}</p>
                                        <p className="lead text-primary text-24 mb-2 text-capitalize">{card.title}</p>
                                    </div>
                                </Card.Body>
                            </Card>
                        </Link>
                    </Col>
                ))}
            </Row>
        </Fragment>
    );
};

export default MyConsentsStats;
