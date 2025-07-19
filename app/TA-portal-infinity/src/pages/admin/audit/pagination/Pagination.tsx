import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

type Props = {
  page: number;
  pageCount: number;
  onPrev: () => void;
  onNext: () => void;
};

export default function Pagination({ page, pageCount, onPrev, onNext }: Props) {
  return (
    <div className="flex items-center bg-white rounded-md shadow overflow-hidden mt-3">
      {/* Prev button spans all leftover space on the left */}
      <button
        onClick={onPrev}
        disabled={page === 0}
        title="Previous"
        className={`
          flex-1 flex justify-center items-center py-2 transition
          ${page === 0
            ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
            : 'bg-gray-100 hover:bg-gray-200 text-gray-700'}
        `}
      >
        <ChevronLeft size={20} />
      </button>

      {/* Page indicator */}
      <div className="px-4 text-sm font-medium text-gray-700 whitespace-nowrap">
        Page <span className="font-semibold">{page + 1}</span> of <span className="font-semibold">{pageCount}</span>
      </div>

      {/* Next button spans all leftover space on the right */}
      <button
        onClick={onNext}
        disabled={page + 1 >= pageCount}
        title="Next"
        className={`
          flex-1 flex justify-center items-center py-2 transition
          ${page + 1 >= pageCount
            ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
            : 'bg-gray-100 hover:bg-gray-200 text-gray-700'}
        `}
      >
        <ChevronRight size={20} />
      </button>
    </div>
  );
}
