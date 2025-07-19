import type Section from "../../../../interfaces/section/Section";
import type SectionDetails from "../../../../interfaces/section/SectionDetails";
import Pagination from "../../../admin/audit/pagination/Pagination";

interface SectionSelectionListProps {
  sections: Section[];
  selectedId?: number;
  onSelect: (details: SectionDetails) => void;
  page: number;
  pageCount: number;
  onPrev: () => void;
  onNext: () => void;
}

export default function SectionSelectionList({
  sections,
  selectedId,
  onSelect,
  page,
  pageCount,
  onPrev,
  onNext,
}: SectionSelectionListProps) {
  return (
    <div>
      <div className="max-h-48 overflow-auto grid gap-2">
        {sections.map((s) => {
          const isSelected = selectedId === s.id;
          return (
            <button
              key={s.id}
              onClick={() => onSelect(s as SectionDetails)}
              className={`w-full text-left px-3 py-2 rounded transition ${
                isSelected
                  ? 'bg-gray-900 text-white'
                  : 'bg-gray-300 hover:bg-gray-600'
              }`}
            >
              {s.course?.deptCode} {s.course?.courseNum} • {s.section} • {s.semester} {s.year}
            </button>
          );
        })}
        {sections.length === 0 && (
          <p className="text-gray-500">No courses found</p>
        )}
      </div>
      <div className="mt-2">
        <Pagination page={page} pageCount={pageCount} onPrev={onPrev} onNext={onNext} />
      </div>
    </div>
  );
}
