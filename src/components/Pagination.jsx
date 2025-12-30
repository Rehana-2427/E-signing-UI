import { useEffect } from "react";
import { AiOutlineLeft, AiOutlineRight } from "react-icons/ai";
import ReactPaginate from "react-paginate";

const Pagination = ({
  page,
  pageSize,
  totalPages,
  handlePageSizeChange,
  handlePageClick,
}) => {
  const isFirstPage = page === 0;
  const isLastPage = page === totalPages - 1;

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [page]);

  return (
    <div
      className="pagination-container d-flex justify-content-end align-items-center"
      style={{
        position: "sticky",
        bottom: 0,
        backgroundColor: "#fff",
        padding: "10px",
        borderTop: "1px solid #ddd",
        zIndex: 100,
      }}
    >
      {/* Page size selector */}
      <div className="page-size-select me-3">
        <label htmlFor="pageSize">Show Entries:</label>
        <select id="pageSize" value={pageSize} onChange={handlePageSizeChange}>
          <option value={10}>10</option>
          <option value={20}>20</option>
          <option value={30}>30</option>
        </select>
      </div>

      <ReactPaginate
        pageCount={totalPages}
        forcePage={page}
        onPageChange={handlePageClick}
        /* 🔑 Sliding window logic */
        pageRangeDisplayed={2}
        marginPagesDisplayed={0}
        breakLabel="..."
        containerClassName="pagination"
        activeClassName="active"
        /* Icons */
        previousLabel={isFirstPage ? null : <AiOutlineLeft title="Previous" />}
        nextLabel={isLastPage ? null : <AiOutlineRight title="Next" />}
      />
    </div>
  );
};

export default Pagination;
