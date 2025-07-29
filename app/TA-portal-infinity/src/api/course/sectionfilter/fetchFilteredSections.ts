import type PageableResponse from "../../../interfaces/admin/audit/PageableResponse";
import type { SectionType } from "../../../interfaces/section/SectionDetails";

export interface FilterSectionsProps {
    sectionId?: number | null;
    courseId?: number | null;
    deptCode?: string | null;
    name?: string | null;
    courseNum?: string | null;
    section?: string | null;
    year?: number | null;
    semester?: string | null;
    type?: SectionType | null;
    day?: string | null;
    startTime?: string | null; //14:00. LocalTime type in backend.
    endTime?: string | null;
    searchText?: string | null;
    isCourse?: boolean | null;
}

export async function fetchFilteredSections(
  filters: FilterSectionsProps,
  page = 0,
  size = 10
): Promise<PageableResponse<FilterSectionsProps>> {
  const q = `?page=${page}&size=${size}`;
  const res = await fetch(
    `http://localhost:8080/courses/filterCourses/page${q}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(localStorage.getItem("token") && { Authorization: `Bearer ${localStorage.getItem("token")}` }),
      },
      body: JSON.stringify(filters),
    }
  );
  if (!res.ok) throw new Error(`Request failed: ${res.statusText}`);
  return res.json();
}




// export async function fetchFilteredSections(filters: FilterSectionsProps): Promise<FilterSectionsProps[] | null> {
//     const BASE = "http://localhost:8080/courses/filterCourses";
//     const token = localStorage.getItem("token");

//     // console.log(filters);
//     try {
//         const res = await fetch(BASE, {
//             method: "POST",
//             headers: {
//                 "Content-Type": "application/json",
//                 ...(token ? { Authorization: `Bearer ${token}` } : {}),
//             },
//             body: JSON.stringify(filters),
//         });
//         if (!res.ok) {
//             console.error("Request failed with status:", res.status);
//             return null;
//             // return [mockSectionCOSC111]
//         }

//         return res.json();
//     } catch {
//         console.log("something went wrong");
//         //TODO: remove the mock after development is finished.
//         // return [mockSectionCOSC111]
//         return null;
//     }
// }