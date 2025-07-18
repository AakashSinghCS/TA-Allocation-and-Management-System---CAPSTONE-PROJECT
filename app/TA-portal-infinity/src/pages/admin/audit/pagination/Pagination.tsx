type Props = {
  page: number;
  pageCount: number;
  onPrev: () => void;
  onNext: () => void;
};

export default function Pagination({ page, pageCount, onPrev, onNext }: Props) {
  return (
    <div className="flex justify-between items-center">
      <button onClick={onPrev} disabled={page === 0} className="btn btn-sm">
        Prev
      </button>
      <span>
        Page {page + 1} of {pageCount}
      </span>
      <button
        onClick={onNext}
        disabled={page + 1 >= pageCount}
        className="btn btn-sm"
      >
        Next
      </button>
    </div>
  );
}
