import { useEffect, useState } from "react";
import { Dropdown } from "react-bootstrap";

const InvitationStatus = ({ initialStatus, onChangeStatus }) => {
  const [selectedValue, setSelectedValue] = useState("PENDING");
  useEffect(() => {
    if (initialStatus) {
      setSelectedValue(initialStatus);
    }
  }, [initialStatus]);

  const handleSelect = (newValue) => {
    setSelectedValue(newValue);
    onChangeStatus(newValue);
  };
  const getButtonClass = () => {
    switch (selectedValue) {
      case "PENDING":
        return "btn-light"; // Gray
      case "ACCEPTED":
        return "btn-success";
      case "REJECTED":
        return "btn-danger"; // Red
      default:
        return "btn-secondary";
    }
  };
  return (
    <div className="btn-group dropup">
      <Dropdown>
        {" "}
        {/* <-- This is key */}
        <Dropdown.Toggle as="div" className="toggle-hidden">
          <button
            className={`btn ${getButtonClass()} text-white custom-btn btn-sm dropdown-toggle`}
            type="button"
          >
            {selectedValue}
          </button>
        </Dropdown.Toggle>
        <Dropdown.Menu className="dropdown-button-drop-up">
          {selectedValue === "PENDING" && (
            <>
              <Dropdown.Item onClick={() => handleSelect("ACCEPTED")}>
                <span className="ul-task-manager__dot bg-success me-2"></span>
                ACCEPTED
              </Dropdown.Item>
              <Dropdown.Item onClick={() => handleSelect("REJECTED")}>
                <span className="ul-task-manager__dot bg-danger me-2"></span>
                REJECTED
              </Dropdown.Item>
            </>
          )}
          {selectedValue !== "PENDING" && (
            <Dropdown.Item disabled>
              <span
                className={`ul-task-manager__dot ${
                  selectedValue === "ACCEPTED" ? "bg-success" : "bg-danger"
                } me-2`}
              ></span>
              {selectedValue}
            </Dropdown.Item>
          )}
        </Dropdown.Menu>
      </Dropdown>
    </div>
  );
};

export default InvitationStatus;
