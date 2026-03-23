import { FiChevronLeft, FiChevronRight } from "react-icons/fi";

export default function TablePagination({ page, totalPages, setPage }) {
   if (totalPages <= 1) return null;

   return (
      <div className="uv-home-pagination">
         <button
            type="button"
            className="uv-home-page-btn"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
         >
            <FiChevronLeft />
         </button>
         <div className="uv-home-page-info">
            {page} / {totalPages}
         </div>
         <button
            type="button"
            className="uv-home-page-btn"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
         >
            <FiChevronRight />
         </button>
      </div>
   );
}
