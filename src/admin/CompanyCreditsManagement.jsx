import { useEffect, useState } from "react";
import { Button, OverlayTrigger, Popover, Table, Toast } from "react-bootstrap"; // import Toast here
import { FaUsers } from "react-icons/fa"; // Ensure FaUsers is imported
import { TbReportAnalytics } from "react-icons/tb";
import { useNavigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import adminCompanyCreditApi from "../api/adminCompanyCredit";
import Pagination from "../components/Pagination";
import AddCompanyCreditsModal from "./AddCompanyCreditsModal";

const CompanyCreditsManagement = () => {
  const [companyCredits, setCompanyCredits] = useState([]);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const navigate = useNavigate();
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [sortedColumn, setSortedColumn] = useState(null);
  const [sortOrder, setSortOrder] = useState("asc");
  useEffect(() => {
    fetchCompanyCreditsList();
  }, [page, pageSize, sortedColumn, sortOrder]);

  const fetchCompanyCreditsList = async () => {
    try {
      const response = await adminCompanyCreditApi.getCompanyCreditList(
        page,
        pageSize,
        sortedColumn,
        sortOrder
      );
      setCompanyCredits(response.data.content || []);
      setTotalPages(response.data.totalPages || 0);
    } catch (error) {
      setCompanyCredits([]);
      setTotalPages(0);
      console.error("Error fetching company credits", error);
    }
  };

  const handleOpenModal = (company) => {
    setSelectedCompany(company);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setSelectedCompany(null);
    setShowModal(false);
  };

  const handleSaveCredits = (companyName) => {
    // Refetch or update locally (you can optimize later)
    fetchCompanyCreditsList();
    setToastMessage(`Successfully assigned credits to ${companyName}`);
    setShowToast(true);
    setShowModal(false);
  };
  const handlePageSizeChange = (e) => {
    const size = parseInt(e.target.value);
    setPageSize(size);
    setPage(0);
  };

  const handlePageClick = (data) => {
    const selectedPage = Math.max(0, Math.min(data.selected, totalPages - 1)); // Ensure selectedPage is within range
    setPage(selectedPage);
    localStorage.setItem("companyCreditsPageAdmin", selectedPage); // Store the page number in localStorage
  };

  const handleSort = (column) => {
    if (sortedColumn === column) {
      // Toggle sort order if the same column is clicked
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      // Sort by the new column (default to ascending)
      setSortedColumn(column);
      setSortOrder("asc");
    }
  };
  return (
    <div
      className="scrollable-container"
      style={{
        height: "100%",
        minHeight: "80vh",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <h1>
        <strong>Company Credits Management</strong>
      </h1>
      <p>
        <strong>
          Note: By default, all companies receive 10 free credits per month and
          5 credit price Unit(CPU)
        </strong>
      </p>

      <Table striped bordered hover>
        <thead>
          <tr>
            <th
              onClick={() => handleSort("companyName")}
              style={{ cursor: "pointer" }}
            >
              Company Name{" "}
              <span>
                <span
                  style={{
                    color:
                      sortedColumn === "companyName" && sortOrder === "asc"
                        ? "black"
                        : "gray",
                  }}
                >
                  ↑
                </span>{" "}
                <span
                  style={{
                    color:
                      sortedColumn === "companyName" && sortOrder === "desc"
                        ? "black"
                        : "gray",
                  }}
                >
                  ↓
                </span>
              </span>
            </th>
            <th
              onClick={() => handleSort("adminUserName")}
              style={{ cursor: "pointer" }}
            >
              Admin User Name
              <span>
                <span
                  style={{
                    color:
                      sortedColumn === "adminUserName" && sortOrder === "asc"
                        ? "black"
                        : "gray",
                  }}
                >
                  ↑
                </span>{" "}
                <span
                  style={{
                    color:
                      sortedColumn === "adminUserName" && sortOrder === "desc"
                        ? "black"
                        : "gray",
                  }}
                >
                  ↓
                </span>
              </span>
            </th>
            <th
              onClick={() => handleSort("adminEmail")}
              style={{ cursor: "pointer" }}
            >
              Admin Email{" "}
              <span>
                <span
                  style={{
                    color:
                      sortedColumn === "adminEmail" && sortOrder === "asc"
                        ? "black"
                        : "gray",
                  }}
                >
                  ↑
                </span>{" "}
                <span
                  style={{
                    color:
                      sortedColumn === "adminEmail" && sortOrder === "desc"
                        ? "black"
                        : "gray",
                  }}
                >
                  ↓
                </span>
              </span>
            </th>
            {/* <th>Paid Credits</th> */}
            <th>Balance Credit</th>
            <th>Used Credit</th>
            <th>CPU</th>
            <th>Add Credit</th>

            <th>Users</th>
            <th>Report</th>
          </tr>
        </thead>
        <tbody>
          {companyCredits.map((company, index) => (
            <tr key={index}>
              <td>{company.companyName}</td>
              <td>{company.adminUserName}</td>
              <td>{company.adminEmail}</td>
              {/* <td>{company.paidcredits ?? company.paidCredits}</td> */}
              <td>{company.balanceCredit ?? company.balanceCredit}</td>
              <td>{company.usedCredit ?? company.usedCredit}</td>
              <td>{company.creditPriceUnit}</td>
              <td>
                <Button onClick={() => handleOpenModal(company)}>
                  Add credit
                </Button>
              </td>

              <td>
                <OverlayTrigger
                  placement="top"
                  overlay={
                    <Popover id="popover-users">
                      <Popover.Header as="h3">Manage Users</Popover.Header>
                      <Popover.Body>
                        View and manage the users for this company.
                      </Popover.Body>
                    </Popover>
                  }
                >
                  <Button
                    onClick={() =>
                      navigate(
                        "/admin-dashboard/company-management/users-list",
                        {
                          state: { companyName: company.companyName },
                        }
                      )
                    }
                    variant="secondary"
                  >
                    <FaUsers />
                  </Button>
                </OverlayTrigger>
              </td>

              <td>
                <OverlayTrigger
                  placement="top"
                  overlay={
                    <Popover id="popover-report">
                      <Popover.Header as="h3">
                        View Credit Passbook
                      </Popover.Header>
                      <Popover.Body>
                        View detailed credit transactions for this company.
                      </Popover.Body>
                    </Popover>
                  }
                >
                  <Button
                    onClick={() =>
                      navigate(
                        "/admin-dashboard/company-management/credit-passbook",
                        {
                          state: { companyName: company.companyName },
                        }
                      )
                    }
                    variant="info"
                  >
                    <TbReportAnalytics />
                  </Button>
                </OverlayTrigger>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
      {companyCredits.length > 0 && totalPages > 0 && (
        <div style={{ marginTop: "auto" }}>
          <Pagination
            page={page}
            pageSize={pageSize}
            totalPages={totalPages}
            handlePageSizeChange={handlePageSizeChange}
            handlePageClick={handlePageClick}
          />
        </div>
      )}
      {selectedCompany && (
        <AddCompanyCreditsModal
          show={showModal}
          onHide={handleCloseModal}
          company={selectedCompany}
          onSave={handleSaveCredits}
        />
      )}

      <ToastContainer position="top-end" className="p-3">
        <Toast
          onClose={() => setShowToast(false)}
          show={showToast}
          delay={3000}
          autohide
          bg="success"
        >
          <Toast.Header>
            <strong className="me-auto">Credit Assigned</strong>
          </Toast.Header>
          <Toast.Body className="text-white">{toastMessage}</Toast.Body>
        </Toast>
      </ToastContainer>
    </div>
  );
};

export default CompanyCreditsManagement;
