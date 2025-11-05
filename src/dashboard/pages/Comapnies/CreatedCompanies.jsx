import { useEffect, useState } from "react";
import {
  Button,
  Card,
  Form,
  Modal,
  OverlayTrigger,
  Spinner,
  Table,
  Toast,
  ToastContainer,
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

const CreatedCompanies = () => {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const [companyName, setCompanyName] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [modalType, setModalType] = useState(""); // "addCompany" or "addUser"
  const [selectedCompany, setSelectedCompany] = useState(null); // for addUser
  const [description, setDescription] = useState("");
  const [showCompanyToast, setCompanyShowToast] = useState(false);
  const [userInivitationToast, setUserInivitatonToast] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [selectedRole, setSelectedRole] = useState("Sender");
  const [showCreditRequestModal, setShowCreditRequestModal] = useState(false);
  const [requestedCredits, setRequestedCredits] = useState("");
  const [requestCPUnit, setRequestCPUnit] = useState("");
  const user = JSON.parse(localStorage.getItem("user"));
  const [companyCredits, setCompanyCredits] = useState({});
  const fetchCompanies = async () => {
    try {
      const user = JSON.parse(localStorage.getItem("user"));
      if (!user?.userEmail) return;

      const response = await companyApi.getCompaniesByEmail(user.userEmail);
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

  useEffect(() => {
    fetchCompanies();
  }, []);

  const getInitials = (name = "") => {
    return name
      .split(" ")
      .map((word) => word[0] + word[1])
      .join("")
      .toUpperCase();
  };

  const truncate = (text = "", length = 20) =>
    text.length > length ? text.substring(0, length) + "..." : text;

  const handleSubmitRequest = async () => {
    const companyData = {
      companyName,
      description,
      mobileNumber,
      adminUserName: user?.userName,
      adminEmail: user?.userEmail,
    };

    try {
      await companyApi.createCompany(companyData);
      await fetchCompanies(); // ✅ fetch complete company data with id, credits, etc.
      setCompanyShowToast(true);
      setCompanyName("");
      setMobileNumber("");
      setDescription("");
      setRequestCPUnit("");
      handleClose();
    } catch (error) {
      console.error("Error creating company:", error);
    }
  };

  const handleShowAddCompanyModal = () => {
    setModalType("addCompany");
    setShowModal(true);
  };

  const handleShowAddUserModal = (company) => {
    setSelectedCompany(company);
    setModalType("addUser");

    setShowModal(true);
  };
  const handleClose = () => {
    setShowModal(false);
    setModalType("");
    setSelectedCompany(null);
    setCompanyName("");
    setMobileNumber("");
    setDescription("");
    setInviteEmail("");
    setRequestCPUnit(requestCPUnit)
    setSelectedRole(selectedRole);
  };

  const handleSendInvite = async () => {
    const inviteUserData = {
      companyId: selectedCompany.id,
      userEmail: inviteEmail,
      invitedByEmail: user?.userEmail,
      mobileNumber: mobileNumber,
      role: selectedRole,
    };
    try {
      await companyUserApi.inviteCompanyUser(inviteUserData);
      setUserInivitatonToast(true);
      setInviteEmail("");
      setSelectedRole(selectedRole);
      handleClose();
    } catch (error) {
      console.error("Error creating company:", error);
    }
  };
  const handleRequestForCredits = async (company) => {
    setSelectedCompany(company);
    setShowCreditRequestModal(true);
  };

  const handleSendRequestForCredits = async (requestData) => {
    try {
      const sendingCompanycreditsRequest = {
        userEmail: user?.userEmail,
        userName: user?.userName,
        companyName: selectedCompany?.companyName,
        requestedCredits: parseInt(requestedCredits, 10),
        requestCPUnit: parseInt(requestCPUnit, 5),
        mobileNumber: requestData.mobileNumber,
        ...requestData,
      };
      const response = await adminUserCreditApi.requestUserCredits(
        sendingCompanycreditsRequest
      );
      setShowCreditRequestModal(false);
      Swal.fire({
        title: "Request Submitted!",
        text: "Your request for credits has been sent to the admin. Please wait, the admin will assign credits for you.",
        icon: "success",
        confirmButtonText: "OK",
      });
      console.log("Credit request submitted:", requestData);

      setRequestedCredits("");
      setRequestCPUnit("");
      setMobileNumber("");

      console.log("Credit request submitted:", response.data);
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

  return (
    <>
      {loading ? (
        <Spinner animation="border" />
      ) : companies.length > 0 ? (
        <>
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h5 className="mb-0">
              <strong>The companies which are created by yourself</strong>
            </h5>
            <Button onClick={handleShowAddCompanyModal}>Add Company</Button>
          </div>

          <Table striped bordered hover responsive>
            <thead>
              <tr>
                <th>#</th>
                <th>Company Name</th>
                <th>Description</th>
                <th>Balance Credits</th>
                <th>Used Credits</th>
                <th>CPU</th>
                <th>Credit Request</th>
                <th>Credit Details</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {companies.map((company, index) => {
                const credits = companyCredits[company.companyName]; // ✅ get correct credits
                return (
                  <tr key={company.id}>
                    <td>{index + 1}</td>
                    <td>
                      {company.companyName} -{" "}
                      {getInitials(company.adminUserName)}
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

                    <td>{credits ? credits.balanceCredit : "Loading..."}</td>
                    <td>{credits ? credits.usedCredit : "Loading..."}</td>
                    <td>{credits ? credits.creditPriceUnit : "Loading..."}</td>

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
      ) : (
        <p>No companies found.</p>
      )}

      <Modal show={showModal} onHide={handleClose} centered>
        <Modal.Header closeButton>
          <Modal.Title>
            {modalType === "addCompany"
              ? "Add Company details"
              : `Add User to ${selectedCompany?.companyName}`}
          </Modal.Title>
        </Modal.Header>

        <Modal.Body>
          {modalType === "addCompany" ? (
            <Card className="p-3">
              {/* <h5>Add company details</h5> */}
              <Form>
                <Form.Group controlId="companyName">
                  <Form.Label>
                    Company Name<span style={{ color: "red" }}>*</span>
                  </Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Enter company name"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                  />
                </Form.Group>

                <Form.Group controlId="mobileNumber">
                  <Form.Label>
                    Mobile Number <span style={{ color: "red" }}>*</span>
                  </Form.Label>
                  <Form.Control
                    type="tel"
                    value={mobileNumber}
                    onChange={(e) => setMobileNumber(e.target.value)}
                    placeholder="Enter your mobile number"
                    required
                  />
                </Form.Group>

                <Form.Group controlId="description" className="mt-3">
                  <Form.Label>Company Description</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Enter short description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </Form.Group>

                <Button
                  className="mt-3"
                  variant="success"
                  onClick={handleSubmitRequest}
                  disabled={!companyName || !description}
                >
                  {loading ? (
                    <>
                      <Spinner
                        as="span"
                        animation="border"
                        size="sm"
                        role="status"
                        aria-hidden="true"
                      />{" "}
                      Submitting...
                    </>
                  ) : (
                    "Submit"
                  )}
                </Button>
              </Form>
            </Card>
          ) : (
            <Card className="p-3">
              <h5>➕ Invite a User</h5>
              <Form
                onSubmit={async (e) => {
                  e.preventDefault();
                  try {
                    await companyApi.inviteUserToCompany({
                      companyId: selectedCompany.companyId,
                      email: inviteEmail,
                      role: selectedRole, // 👈 pass selected role
                    });
                    setShowModal(false);
                    setInviteEmail("");
                    setSelectedRole("Sender"); // reset to default
                    setUserInivitatonToast(true);
                  } catch (error) {
                    console.error("Failed to invite user:", error);
                  }
                }}
              >
                <Form.Group controlId="userEmail">
                  <Form.Label>
                    User Email <span style={{ color: "red" }}>*</span>
                  </Form.Label>
                  <Form.Control
                    type="email"
                    placeholder="Enter user email"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    required
                  />
                </Form.Group>
                <Form.Group controlId="mobileNumber">
                  <Form.Label>
                    Mobile Number <span style={{ color: "red" }}>*</span>
                  </Form.Label>
                  <Form.Control
                    type="tel"
                    value={mobileNumber}
                    onChange={(e) => setMobileNumber(e.target.value)}
                    placeholder="Enter your mobile number"
                    required
                  />
                </Form.Group>

                <Form.Group controlId="userRole" className="mt-3">
                  <Form.Label>
                    User Role<span style={{ color: "red" }}>*</span>
                  </Form.Label>
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
                  disabled={!inviteEmail && !mobileNumber && !selectedRole}
                  onClick={handleSendInvite}
                >
                  {loading ? (
                    <>
                      <Spinner
                        as="span"
                        animation="border"
                        size="sm"
                        role="status"
                        aria-hidden="true"
                      />{" "}
                      Sending...
                    </>
                  ) : (
                    "Send Invite"
                  )}
                </Button>
              </Form>
            </Card>
          )}
        </Modal.Body>
      </Modal>

      <CompanyCreditRequestModal
        show={showCreditRequestModal}
        onClose={() => setShowCreditRequestModal(false)}
        companyName={selectedCompany?.companyName}
        onSend={handleSendRequestForCredits}
        showCreditPriceUnit={true} // 👈 show field + default 5
      />

      <ToastContainer position="top-end" className="p-3">
        {showCompanyToast && (
          <Toast
            onClose={() => setCompanyShowToast(false)}
            show
            delay={3000}
            autohide
            bg="success"
          >
            <Toast.Header>
              <strong className="me-auto">Company Added</strong>
            </Toast.Header>
            <Toast.Body className="text-white">
              Company added successfully.
            </Toast.Body>
          </Toast>
        )}

        {userInivitationToast && (
          <Toast
            onClose={() => setUserInivitatonToast(false)}
            show
            delay={3000}
            autohide
            bg="success"
          >
            <Toast.Header>
              <strong className="me-auto">User Invited</strong>
            </Toast.Header>
            <Toast.Body className="text-white">
              User invitation sent successfully.
            </Toast.Body>
          </Toast>
        )}
      </ToastContainer>
    </>
  );
};

export default CreatedCompanies;
