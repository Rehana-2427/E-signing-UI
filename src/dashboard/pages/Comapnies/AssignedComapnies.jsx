import { useEffect, useState } from "react";
import {
  Button,
  Card,
  Form,
  Modal,
  OverlayTrigger,
  Spinner,
  Table,
  Tooltip,
} from "react-bootstrap";
import { FaUserPlus } from "react-icons/fa";
import { TbBuildingMinus } from "react-icons/tb";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import adminCompanyCreditApi from "../../../api/adminCompanyCredit";
import adminUserCreditApi from "../../../api/adminUserCreditApi";
import companyApi from "../../../api/company";
import companyUserApi from "../../../api/companyUsers";
import CompanyCreditRequestModal from "../credits/CompanyCreditRequestModal";

const AssignedComapnies = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [companies, setCompanies] = useState([]);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [showCreditRequestModal, setShowCreditRequestModal] = useState(false);
  const [modalType, setModalType] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [requestedCredits, setRequestedCredits] = useState("");
  const [userInvitationToast, setUserInvitationToast] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [selectedRole, setSelectedRole] = useState("SENDER"); // Default value is "Sender"
  const user = JSON.parse(localStorage.getItem("user"));
  const userName = user?.userName;
  const [companyCredits, setCompanyCredits] = useState({});

  // Function to fetch the assigned companies
  // const fetchCompanies = async () => {
  //   try {
  //     if (!user?.userEmail) return;

  //     const response = await companyUserApi.getAssignedCompanies(
  //       user.userEmail
  //     );
  //     setCompanies(response.data || []);
  //   } catch (error) {
  //     console.error("Error fetching companies:", error);
  //   } finally {
  //     setLoading(false);
  //   }
  // };
  const fetchCompanies = async () => {
    try {
      const user = JSON.parse(localStorage.getItem("user"));
      if (!user?.userEmail) return;

      const response = await companyUserApi.getAssignedCompanies(
        user.userEmail
      );
      const companiesData = response.data || [];
      setCompanies(companiesData);

      const creditPromises = companiesData.map(async (company) => {
        try {
          const res = await adminCompanyCreditApi.getCompanyCreditsByCompany(
            company.companyName
          );
          return { name: company.companyName, credits: res.data };
        } catch (error) {
          console.error(
            `Error fetching credits for ${company.companyName}:`,
            error
          );
          return { name: company.companyName, credits: null };
        }
      });

      const creditResults = await Promise.all(creditPromises);

      // Map results into an object for quick lookup
      const creditsMap = {};
      creditResults.forEach((item) => {
        creditsMap[item.name] = item.credits;
      });

      setCompanyCredits(creditsMap);
    } catch (error) {
      console.error("Error fetching companies:", error);
    } finally {
      setLoading(false);
    }
  };
  // Effect to fetch companies when component mounts

  useEffect(() => {
    fetchCompanies();
  }, []);

  // Helper function to get the initials from a name
  const getInitials = (name = "") => {
    return name
      .split(" ")
      .map((word) => word[0] + word[1]) // Take only the first letter of each word
      .join("")
      .toUpperCase();
  };

  // Helper function to truncate text (if needed)
  const truncate = (text = "", length = 10) => {
    return text.length > length ? text.substring(0, length) + "..." : text;
  };

  const handleRequestForCredits = async (company) => {
    setSelectedCompany(company);
    setShowCreditRequestModal(true);
  };

  const handleShowAddUserModal = (company) => {
    setSelectedCompany(company);
    setModalType("addUser");
    setShowModal(true);
  };

  const handleSendRequestForCredits = async (requestData) => {
    try {
      const sendingCompanyCreditsRequest = {
        userEmail: user?.userEmail,
        userName: user?.userName,
        companyName: selectedCompany?.companyName,
        requestedCredits: parseInt(requestedCredits, 10),
        ...requestData,
      };

      const response = await adminUserCreditApi.requestUserCredits(
        sendingCompanyCreditsRequest
      );
      setShowCreditRequestModal(false);

      Swal.fire({
        title: "Request Submitted!",
        text: "Your request for credits has been sent to the admin. Please wait, the admin will assign credits for you.",
        icon: "success",
        confirmButtonText: "OK",
      });

      setRequestedCredits("");
    } catch (error) {
      console.error("Error submitting credit request:", error);

      Swal.fire({
        title: "Error!",
        text: "Failed to submit your credit request. Please try again.",
        icon: "error",
        confirmButtonText: "Close",
      });
    }
  };

  const handleClose = () => {
    setShowModal(false);
    setSelectedCompany(null);
  };

  const handleSendInvite = async () => {
    try {
      await companyApi.inviteUserToCompany({
        companyId: selectedCompany.companyId,
        email: inviteEmail,
        role: selectedRole,
      });

      setShowModal(false);
      setInviteEmail("");
      setSelectedRole("SENDER"); // Reset role to default
      setUserInvitationToast(true); // Trigger invitation toast
      Swal.fire({
        title: "User Invited!",
        text: `An invitation has been sent to ${inviteEmail}`,
        icon: "success",
        confirmButtonText: "OK",
      });
    } catch (error) {
      console.error("Failed to invite user:", error);
      Swal.fire({
        title: "Error!",
        text: "Failed to send the invitation. Please try again.",
        icon: "error",
        confirmButtonText: "Close",
      });
    }
  };

  return (
    <>
      {loading ? (
        <div className="d-flex justify-content-center align-items-center">
          <Spinner animation="border" role="status" />
        </div>
      ) : companies.length === 0 ? (
        <p>No assigned companies for you.</p>
      ) : (
        <>
          <h5 className="mb-3">
            <strong>The companies list which are assigned by someone</strong>
          </h5>

          <Table striped bordered hover responsive>
            <thead>
              <tr>
                <th>Company Name</th>
                <th>Description</th>
                <th>Invited By</th>
                <th>Role</th>
                <th>Balance Credits</th>
                <th>Used Credits</th>
                <th>Credit Request</th>
                <th>Used Credits</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {companies.map((company, index) => {
                const credits = companyCredits[company.companyName];
                return (
                  <tr key={index}>
                    <td>
                      {company.companyName} - {getInitials(userName)}
                    </td>
                    <td>
                      <OverlayTrigger
                        placement="top"
                        overlay={
                          <Tooltip id={`tooltip-desc-${company.id}`}>
                            {company.description}
                          </Tooltip>
                        }
                      >
                        <span style={{ cursor: "pointer" }}>
                          {truncate(company.description)}
                        </span>
                      </OverlayTrigger>
                    </td>
                    <td>{company.invitedByEmail}</td>
                    <td>{company.role}</td>
                    <td>{credits ? credits.balanceCredit : "Loading..."}</td>
                    <td>{credits ? credits.usedCredit : "Loading..."}</td>

                    <td>
                      <Button onClick={() => handleRequestForCredits(company)}>
                        Request for Credits
                      </Button>
                    </td>
                    <td>
                      <Button
                        variant="link"
                        size="sm"
                        onClick={() => {
                          const encodedName = encodeURIComponent(
                            company.companyName
                          );
                          navigate(
                            `/dashboard/creditRequest/my-companies/${encodedName}/company-transaction-history`
                          );
                        }}
                      >
                        Company Credits
                      </Button>
                    </td>
                    <td>
                      {/* <OverlayTrigger
                      placement="top"
                      overlay={
                        <Tooltip id={`tooltip-view-${company.id}`}>
                          View
                        </Tooltip>
                      }
                    >
                      <Button
                        size="sm"
                        variant="info"
                        className="me-1 mb-1"
                        onClick={() => console.log("View", company.id)}
                      >
                        <FaEye />
                      </Button>
                    </OverlayTrigger> */}

                      <OverlayTrigger
                        placement="top"
                        overlay={
                          <Tooltip id={`tooltip-add-${company.id}`}>
                            Add Users
                          </Tooltip>
                        }
                      >
                        <Button
                          size="sm"
                          variant="success"
                          className="me-1 mb-1"
                          onClick={() => handleShowAddUserModal(company)}
                        >
                          <FaUserPlus />
                        </Button>
                      </OverlayTrigger>

                      {/* <OverlayTrigger
                      placement="top"
                      overlay={
                        <Tooltip id={`tooltip-delete-${company.id}`}>
                          Delete Users
                        </Tooltip>
                      }
                    >
                      <Button
                        size="sm"
                        variant="warning"
                        className="me-1 mb-1"
                        onClick={() => console.log("Delete Users", company.id)}
                      >
                        <FaUserMinus />
                      </Button>
                    </OverlayTrigger> */}

                      <OverlayTrigger
                        placement="top"
                        overlay={
                          <Tooltip id={`tooltip-delete-company-${company.id}`}>
                            Delete Company
                          </Tooltip>
                        }
                      >
                        <Button
                          size="sm"
                          variant="danger"
                          className="me-1 mb-1"
                          onClick={() =>
                            console.log("Delete Company", company.id)
                          }
                        >
                          <TbBuildingMinus />
                        </Button>
                      </OverlayTrigger>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </Table>
        </>
      )}

      <Modal show={showModal} onHide={handleClose} centered>
        <Modal.Header closeButton>
          <Modal.Title>➕ Invite a User</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Card className="p-3">
            <Form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendInvite(); // Handle the invite action
              }}
            >
              <Form.Group controlId="userEmail">
                <Form.Label>User Email</Form.Label>
                <Form.Control
                  type="email"
                  placeholder="Enter user email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  required
                />
              </Form.Group>

              <Form.Group controlId="userRole" className="mt-3">
                <Form.Label>User Role</Form.Label>
                <Form.Select
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value)}
                  required
                >
                  <option value="ADMIN">
                    Admin – Full access (can add users)
                  </option>
                  <option value="SENDER">
                    Sender – Can add reviewers, send documents
                  </option>
                  <option value="REVIEWER">
                    Reviewer – Can only review documents
                  </option>
                </Form.Select>
              </Form.Group>

              <Button
                className="mt-3"
                variant="primary"
                type="submit"
                disabled={!inviteEmail}
              >
                Send Invite
              </Button>
            </Form>
          </Card>
        </Modal.Body>
      </Modal>

      <CompanyCreditRequestModal
        show={showCreditRequestModal}
        onClose={() => setShowCreditRequestModal(false)}
        companyName={selectedCompany?.companyName}
        onSend={handleSendRequestForCredits}
        showCreditPriceUnit={false} // 👈 hide field
      />
    </>
  );
};

export default AssignedComapnies;
