import { useQuery, keepPreviousData } from "@tanstack/react-query";
import type PageableResponse from "../../../interfaces/admin/audit/PageableResponse";
import type { FilterSectionsProps } from "../../../api/course/sectionfilter/fetchFilteredSections";
import { fetchFilteredSections } from "../../../api/course/sectionfilter/fetchFilteredSections";

function hasAnyFilter(f: FilterSectionsProps) {
  return Object.keys(f).length > 0;
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
    staleTime: 0,
  });
}
