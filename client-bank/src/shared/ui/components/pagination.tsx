import { Pagination } from "react-bootstrap";

type PaginationProps = {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  theme: "LIGHT" | "DARK";
};

export const PaginationComponent = ({
  currentPage,
  totalPages,
  onPageChange,
  theme,
}: PaginationProps) => {
  return (
    <div className="d-flex justify-content-center">
      <Pagination>
        <Pagination.Prev
          disabled={currentPage === 0}
          onClick={() => onPageChange(currentPage - 1)}
          className={theme === "DARK" ? "bg-dark text-light" : ""}
        />
        {Array.from({ length: totalPages }, (_, i) => (
          <Pagination.Item
            key={i}
            active={i === currentPage}
            onClick={() => onPageChange(i)}
            className={theme === "DARK" ? "bg-dark text-light border-light" : ""}
          >
            {i + 1}
          </Pagination.Item>
        ))}
        <Pagination.Next
          disabled={currentPage === totalPages - 1}
          onClick={() => onPageChange(currentPage + 1)}
          className={theme === "DARK" ? "bg-dark text-light" : ""}
        />
      </Pagination>
    </div>
  );
};