import { useQuery, keepPreviousData } from "@tanstack/react-query";
import type PageableResponse from "../../../interfaces/admin/audit/PageableResponse";
import type { FilterSectionsProps } from "../../../api/course/sectionfilter/fetchFilteredSections";
import { fetchFilteredSections } from "../../../api/course/sectionfilter/fetchFilteredSections";

function hasAnyFilter(f: FilterSectionsProps) {
  return Boolean(
    f.deptCode ||
    f.courseNum ||
    f.name ||
    f.section ||
    f.year ||
    f.semester ||
    f.type ||
    f.day ||
    f.startTime ||
    f.endTime
  );
}

export function useSectionSuggestions(filters: FilterSectionsProps) {
  return useQuery<PageableResponse<FilterSectionsProps>, Error>({
    queryKey: ["sectionSuggestions", filters],
    queryFn: () => fetchFilteredSections(filters, 0, 5),
    enabled: hasAnyFilter(filters),
    placeholderData: keepPreviousData,
    staleTime: 5 * 60_000,
  });
}

export function useSectionSearchPage(
  filters: FilterSectionsProps,
  page: number,
  size: number
) {

  return useQuery<PageableResponse<FilterSectionsProps>, Error>({
    queryKey: ["sectionSearch", filters, page, size],
    queryFn: () => fetchFilteredSections(filters, page, size),
    enabled: hasAnyFilter(filters),
    placeholderData: keepPreviousData,
  });
}
