// import React, { useState, useEffect, useCallback } from "react";

// type Mode = "update" | "add";

// export default function AddAllocationHistory({ mode = 'add' }: { mode?: Mode }) {
//   const { userId: instructorId } = useAuth();
//   const navigate = useNavigate();

//   // extract params
//   const { courseId: courseIdParam, year: yearParam, semester } = useParams<{
//     courseId: string;
//     year: string;
//     semester: string;
//   }>();
//   const courseId = Number(courseIdParam);
//   const year = Number(yearParam);

//   const [filteredSections, setFilteredSections] = useState<Section[] | null>([]);
//   const [loading, setLoading] = useState(false);

//   // track selected prerequisite sections
//   const [selectedPrereqs, setSelectedPrereqs] = useState<Section[]>([]);

//   // load existing prerequisites in update mode
//   useEffect(() => {
//     if (mode === 'update' && courseId && year && semester) {
//     //   fetchGetPrereqCourses(courseId, year, semester)
//     //     .then((sections) => setSelectedPrereqs(sections || []))
//     //     .catch((err) => navigate('/error', { replace: true, state: { message: err.message } }));
//     }
//   }, [mode, courseId, year, semester, navigate]);

//   const handleFilterChange = async (filters: FilterSectionsProps) => {
//     setLoading(true);
//     try {
//       const raw = await fetchFilteredSections(filters);
//       setFilteredSections(convertFilterSectionsToSections(raw || []));
//     } catch (e) {
//       navigate('/error', { replace: true, state: { message: (e as Error).message } });
//     } finally {
//       setLoading(false);
//     }
//   };

//   // per‐section add (in “add” mode)
//   const onSelect = async (section: Section) => {
//     const ok = await fetchAssignInstructor(instructorId, section.sectionDetails?.sectionId ?? -1);
//     alert(ok ? 'Section added!' : 'Failed to add section.');
//     navigate(`/user/instructorprofile/${instructorId}/need`);
//   };

//   // course‐level toggle (in “update” mode)
//   const onSelectCourseForPrereq = useCallback(( cid: number, _dept: string, _num: string, _name: string) => {
//     const group = filteredSections?.filter(sec => sec.sectionDetails?.id === cid) || [];
//     const existingIds = new Set(selectedPrereqs.map(s => s.sectionDetails?.sectionId));
//     const allSelected = group.every(s => existingIds.has(s.sectionDetails?.sectionId));

//     if (allSelected) {
//       setSelectedPrereqs(prev =>
//         prev.filter(s => s.sectionDetails?.id !== cid)
//       );
//     } else {
//       const toAdd = group.filter(s =>
//         !existingIds.has(s.sectionDetails?.sectionId)
//       );
//       setSelectedPrereqs(prev => [...prev, ...toAdd]);
//     }
//   }, [filteredSections, selectedPrereqs]);

//   const onRemovePrereq = (sectionIdToRemove: number) => {
//     setSelectedPrereqs(prev =>
//       prev.filter(s => s.sectionDetails?.sectionId !== sectionIdToRemove)
//     );
//   };

//   const handleSavePrereqs = async () => {
//     const ids = selectedPrereqs.map(s => s.sectionDetails?.sectionId ?? -1);
//     const ok = await fetchUpdatePrereqCourses(courseId, year, semester ?? '', ids);
//     alert(ok ? 'Prerequisites updated!' : 'Failed to update prerequisites.');
//     navigate(`/user/instructorprofile/${instructorId}/need`);
//   };

//   return (
//     <div className="container mx-auto p-4 w-full max-w-3xl">
//       <div className="flex justify-between items-center mb-4">
//         <h1 className="text-xl font-semibold">
//           {mode === 'add' ? 'Search for a Section' : 'Update Course Prerequisites'}
//         </h1>
//         <p className="text-sm text-gray-400">
//           {mode === 'add'
//             ? 'Search for a section and click Select in the far right column.'
//             : 'Click “Select” on any course header below to toggle its sections as prerequisites, then click Save.'}
//         </p>
//       </div>

//       {mode === 'update' && selectedPrereqs.length > 0 && (
//         <div className="mb-6">
//           <h3 className="text-lg font-semibold mb-2">Selected Prerequisite Sections</h3>
//           <div className="space-y-2">
//             {selectedPrereqs.map(sec => (
//               <div
//                 key={sec.sectionDetails?.sectionId}
//                 className="flex items-center justify-between bg-slate-50 px-3 py-2 rounded"
//               >
//                 <span>
//                   {sec.sectionDetails?.deptCode} {sec.sectionDetails?.courseNum} – {sec.sectionDetails?.name}
//                 </span>
//                 <button
//                   type="button"
//                   onClick={() => onRemovePrereq(sec.sectionDetails?.sectionId ?? -1)}
//                   className="text-red-600 hover:underline text-sm"
//                 >
//                   Remove
//                 </button>
//               </div>
//             ))}
//           </div>
//         </div>
//       )}

//       <div className="border p-4 rounded-md shadow-sm mb-4">
//         <SectionFilter onFilterChange={handleFilterChange} mode="large" />
//       </div>

//       {loading ? (
//         <p>Loading sections…</p>
//       ) : (
//         <SectionList
//           sections={filteredSections}
//           mode={mode === 'add' ? 'instructorAddSection' : 'instructorPrereqCourse'}
//           onSelect={mode === 'add' ? onSelect : undefined}
//           onSelectCourse={mode === 'update' ? onSelectCourseForPrereq : undefined}
//         />
//       )}

//       {mode === 'update' && (
//         <div className="mt-4 flex justify-end">
//           <button
//             onClick={handleSavePrereqs}
//             className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
//           >
//             Save Prerequisites
//           </button>
//         </div>
//       )}
//     </div>
//   );
// }
