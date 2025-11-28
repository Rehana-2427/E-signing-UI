import { Button } from "react-bootstrap";

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  const handlePageChange = (newPage) => {
    if (newPage >= 0 && newPage < totalPages) {
      onPageChange(newPage);
    }
  };

  return (
    <div className="d-flex justify-content-center mt-3">
      <Button
        variant="secondary"
        disabled={currentPage === 0}
        onClick={() => handlePageChange(currentPage - 1)}
      >
        Previous
      </Button>
      <span className="mx-3">
        Page {currentPage + 1} of {totalPages}
      </span>
      <Button
        variant="secondary"
        disabled={currentPage === totalPages - 1}
        onClick={() => handlePageChange(currentPage + 1)}
      >
        Next
      </Button>
    </div>
  );
};

export default Pagination;
