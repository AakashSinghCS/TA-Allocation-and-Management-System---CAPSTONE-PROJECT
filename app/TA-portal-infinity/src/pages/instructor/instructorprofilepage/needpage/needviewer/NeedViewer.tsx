import AllocationCard from "../../../../../components/features/allocation/AllocationCard";
import NeedCard from "../../../../../components/features/need/needcard/NeedCard";
import SectionCard from "../../../../../components/features/section/sectioncard/SectionCard";
import type Section from "../../../../../interfaces/section/Section";
import { Link } from "react-router-dom";
import type { Need } from "../../../../../interfaces/need/Need";
import { fetchUpdateNeed } from "../../../../../api/need/fetchUpdateNeed";
import { useEffect, useState } from "react";
import { fetchDeleteNeed } from "../../../../../api/need/fetchDeleteNeed";
import { fetchUnassignInstructor } from "../../../../../api/section/instructor/fetchUnassignInstructor";
import { showToastConfirmation } from "../../../../../utility/confirmation/toastConfirmation";
import { useAuth } from "../../../../../context/AuthContext";
import type { Course } from "../../../../../interfaces/course/Course";
import { fetchSectionNeedAndAllocations } from "../../../../../api/instructor/fetchSectionNeedAndAllocations";
import type { NeedViewerResponse } from "../InstructorNeedPage";
import { PiGraduationCapFill } from "react-icons/pi";
import { toast } from 'react-toastify';
import type { Allocation } from "../../../../../interfaces/allocation/Allocation";
import { fetchAllocationById } from "../../../../../api/allocation/fetchAllocationById";
import { BookOpenText } from 'lucide-react';

interface NeedViewerProps {
  instructorId: number;
  className?: string;
  initial: NeedViewerResponse | null;
}

export default function NeedViewer({ instructorId, className = "", initial }: NeedViewerProps) {
  const [sections, setSections] = useState<Section[]>(initial?.sections ?? []);
  const isInstructor = useAuth().userRoles.includes('INSTRUCTOR')
  const [courseList] = useState<Course[]>(initial?.allAssignedCourses ?? []);
  const [selectedCourse, setSelectedCourse] = useState<number | null>(null);
  const [selectedYear, setSelectedYear] = useState<number>(
    initial ? Math.max(...initial.existingYears.map(Number)) : -1
  );
  const [selectedSemester, setSelectedSemester] = useState<string>("W1");
  const [confirmedCounts, setConfirmedCounts] = useState<Record<number, number>>({});

  const onDeleteNeed = async (need: Need) => {
    try {
      const confirmed = await showToastConfirmation({
        title: "Delete TA Requirement",
        message: `Are you sure you want to delete the TA requirement "${need.description}"? This will erase all the TA requirements for other sections of the associated course.`,
        confirmText: "Delete",
        cancelText: "Cancel",
        type: "danger"
      });

      if (confirmed) {
        const success = await fetchDeleteNeed(need);
        if (success) {
          setSections((prev) =>
            prev.map((sec) =>
              sec.need && sec.need.id === need.id ? { ...sec, need: undefined } : sec
            )
          );
          toast.success("TA requirement deleted successfully");
        } else {
          toast.error("Failed to delete TA requirement");
        }
      }
    } catch (error) {
      console.error("Error deleting need:", error);
      toast.error("An error occurred while deleting the TA requirement");
    }
  };

  const onUpdateNeed = async (updatedNeed: Need) => {
    try {
      const success = await fetchUpdateNeed(updatedNeed);
      if (success) {
        setSections((prev) =>
          prev.map((sec) =>
            sec.need && sec.need.id === updatedNeed.id
              ? { ...sec, need: updatedNeed }
              : sec
          )
        );
        toast.success("TA requirement updated successfully");
      } else {
        toast.error("Failed to update TA requirement");
      }
    } catch (error) {
      console.error("Error updating need:", error);
      toast.error("An error occurred while updating the TA requirement");
    }
  };

  const onDeleteSection = async (s: Section) => {
    try {
      const confirmed = await showToastConfirmation({
        title: "Unassign from Section",
        message: `Are you sure you want to unassign yourself from section ${s.course?.deptCode} ${s.course?.courseNum} ${s.section}? This action cannot be undone.`,
        confirmText: "Unassign",
        cancelText: "Cancel",
        type: "danger"
      });

      if (confirmed) {
        const success = await fetchUnassignInstructor(s?.id ?? -1, instructorId);
        if (success) {
          setSections((prev) =>
            prev.filter((sec) => sec?.id !== s?.id)
          );
          toast.success("Successfully unassigned from section");
        } else {
          toast.error("Failed to unassign from section");
        }
      }
    } catch (error) {
      console.error("Error unassigning from section:", error);
      toast.error("An error occurred while unassigning from the section");
    }
  };

  const onSearch = async () => {
    try {
      const sectionsWithNeeds = await fetchSectionNeedAndAllocations(
        instructorId,
        selectedCourse,
        selectedYear,
        selectedSemester
      ) ?? [];

      setSections(sectionsWithNeeds);
    } catch (error) {
      console.error("Failed to search sections:", error);
      toast.error("Failed to search sections");
    }
  };

  const isMainSection = (section:Section) =>{
    if(section.type === "LECTURE"){
      return true;
    }else{
      return false;
    }
  }

  useEffect(() => {
    // collect every allocationId across all sections
    const allIds = sections.flatMap(sec =>
      sec.allocatedSections?.map(as => as.allocationId) ?? []
    );
    const uniqueIds = Array.from(new Set(allIds));
    if (!uniqueIds.length) return setConfirmedCounts({});

    (async () => {
      const allocs: Allocation[] = await Promise.all(
        uniqueIds.map(id => fetchAllocationById(id))
      );

      const confirmed = allocs.filter(a => a.status === 'CONFIRMED');

      const counts: Record<number, number> = {};
      confirmed.forEach(a => {

      const sectionIds = Array.from(
        new Set(
          a.allocatedSections?.map(stub => stub.sectionId) ?? []
        )
      );

      sectionIds.forEach(sectionId => {
        counts[sectionId] = (counts[sectionId] || 0) + 1;
      });
    });
      setConfirmedCounts(counts);
    })();
  }, [sections]);
  
  return (
    <div className={"space-y-8 " + className}>
      {/* Filter Section */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
        {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Filter Sections</h3>
      </div>
        
        {/* Filter Controls */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Course */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Course</label>
            <select
              value={selectedCourse ?? ""}
              onChange={(e) =>
                setSelectedCourse(
                  e.target.value ? Number(e.target.value) : null
                )
              }
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-[#0089b2] 
                focus:border-[#0089b2] bg-white text-gray-900 transition-colors hover:border-gray-400"
            >
              <option value="">All courses</option>
              {courseList.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.deptCode} {c.courseNum}
                </option>
              ))}
            </select>
          </div>

          {/* Year */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-[#0089b2] 
                focus:border-[#0089b2] bg-white text-gray-900 transition-colors hover:border-gray-400"
            >
              {initial?.existingYears && initial?.existingYears.map((yr) => (
                <option key={yr} value={yr}>
                  {yr}
                </option>
              ))}
            </select>
          </div>

          {/* Semester */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Semester</label>
            <select
              value={selectedSemester}
              onChange={(e) => setSelectedSemester(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-[#0089b2] 
                focus:border-[#0089b2] bg-white text-gray-900 transition-colors hover:border-gray-400"
            >
              {["W1", "W2", "S1", "S2"].map((sem) => (
                <option key={sem} value={sem}>
                  {sem}
                </option>
              ))}
            </select>
          </div>

          {/* Search Button */}
          <div>
            <label className="block text-sm font-medium text-transparent mb-1">Search</label>
            <button
              type="button"
              onClick={onSearch}
              className="w-full px-4 py-2 text-sm bg-[#040941] text-white rounded-md hover:bg-[#030735] 
                transition-colors font-medium"
            >
              Search
            </button>
          </div>
        </div>

        {/* Results Summary */}
        <div className="mt-4 pt-3 border-t border-gray-100">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>{sections.length} sections found</span>
            {/* {sections.length > 0 && (
              <span>{sections.filter(s => s.allocations && s.allocations.some(a => a.status === "CONFIRMED")).length} with confirmed TAs</span>
            )} */}
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="space-y-4">
        {sections.length === 0 && (
          <div className="text-center py-16 rounded-lg">
            <div className="w-12 h-12 mx-auto mb-4 bg-gray-100 rounded-lg flex items-center justify-center">
              <BookOpenText className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No sections found</h3>
            <p className="text-gray-500">Try adjusting your filter criteria or add a new section.</p>
          </div>
        )}

        {sections.map((sec, index) => {
           const confirmed = confirmedCounts[sec.id ?? -1] ?? 0;
          return(
          <div key={sec?.id} className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow">
            {/*Horizontal Section Header */}
            <div className="bg-gray-50 border-b border-gray-200 px-4 py-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-6 h-6 bg-[#040941] text-white rounded-md flex items-center justify-center text-xs font-semibold">
                    {index + 1}
                  </div>
                  <h3 className="text-base font-semibold text-gray-900">
                    {sec.course?.deptCode} {sec.course?.courseNum} - {sec.type} {sec.section}
                  </h3>
                  <span className="text-gray-500 text-sm">•</span>
                  <span className="text-gray-600 text-sm">
                    {sec.year} {sec.semester}
                  </span>
                  <span className="text-gray-500 text-sm">•</span>
                  <span className="text-gray-600 text-sm">
                    {confirmed} confirmed allocations
                  </span>
                </div>
              </div>
            </div>

            {/* Content Section */}
            <div className="p-4">
              <div className="grid lg:grid-cols-3 gap-4">
                {/* Section Information Panel */}
                <div>
                  <h4 className="font-medium text-gray-900 text-sm mb-3 flex items-center">
                    <svg className="w-4 h-4 text-gray-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
                    </svg>
                    Section Details
                  </h4>
                  <SectionCard section={sec} authenticated={isInstructor} onDelete={onDeleteSection} />
                </div>

                {/* TA Requirements Panel */}
                <div>
                  <h4 className="font-medium text-gray-900 text-sm mb-3 flex items-center">
                    <svg className="w-4 h-4 text-gray-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
                    </svg>
                    TA Requirements
                  </h4>
                  <NeedCard
                    need={sec.need}
                    onDelete={onDeleteNeed}
                    onUpdate={onUpdateNeed}
                    authenticated={isInstructor}
                    sectionId={sec.id}
                    isMainSection={isMainSection(sec)}
                  />
                </div>

                {/* Students Allocated Panel */}
                <div>
                  <h4 className="font-medium text-gray-900 text-sm mb-3 flex items-center">
                    <PiGraduationCapFill className="w-4 h-4 text-gray-600 mr-2" />
                    Allocated Students
                  </h4>
                  <AllocationCard allocatedSections={sec.allocatedSections} sectionId={sec.id ?? -1}/>
                </div>
              </div>
            </div>
          </div>
          );
})}
      </div>
    </div>
  );
}
