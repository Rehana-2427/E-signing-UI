import { useEffect, useState } from "react";
import { Tab, Tabs } from "react-bootstrap";
import { useSearchParams } from "react-router-dom";
import ReviewdConsents from "./ReviewdConsents";
import UnreviewdConsesnts from "./UnreviewdConsesnts";

const ReviewerConsesnts = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const tabFromUrl = searchParams.get("tab");
  const [reviewerActiveTab, setReviewerActiveTab] = useState(
    tabFromUrl || "unReviewedConsents"
  );

  // 🔄 Update URL when tab changes
  const handleTabChange = (key) => {
    setReviewerActiveTab(key);
    setSearchParams({ tab: key });
  };

  useEffect(() => {
    if (tabFromUrl && tabFromUrl !== reviewerActiveTab) {
      setReviewerActiveTab(tabFromUrl);
    }
  }, [tabFromUrl]);

  return (
    <div
      className="scrollable-container"
      style={{
        height: "100%",
      }}
    >
      <h1>
        <strong>Review Consents</strong>
      </h1>
      <Tabs
        activeKey={reviewerActiveTab}
        onSelect={handleTabChange}
        id="reviewer-tabs"
        className="mb-3"
      >
        <Tab eventKey="unReviewedConsents" title="UnReviewed">
          <UnreviewdConsesnts />
        </Tab>
        <Tab eventKey="reviewedConsents" title="Reviewed">
          <ReviewdConsents />
        </Tab>
      </Tabs>
    </div>
  );
};

export default ReviewerConsesnts;
