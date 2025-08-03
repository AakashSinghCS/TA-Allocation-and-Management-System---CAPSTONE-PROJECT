import React, { useEffect, useState } from "react";
import { useAuth } from "../../../context/AuthContext";
import { fetchSectionNeedAndAllocations } from "../../../api/instructor/fetchSectionNeedAndAllocations";
import { fetchDeadlines } from "../../../api/config/fetchDeadlines";
import { fetchAllExistingYears } from "../../../api/course/sectionfilter/fetchAllExistingYears";
import type Section from "../../../interfaces/section/Section";
import type { Deadline } from "../../../interfaces/config/Deadline";

import { DeadlineTracker } from "../../../components/features/instructor_home/DeadlineTracker";
import { CoursesTeachingCard } from "../../../components/features/instructor_home/CoursesTeachingCard";
import { TAAllocationsCard } from "../../../components/features/instructor_home/TAAllocationsCard";
import { CoursesMissingNeedsCard } from "../../../components/features/instructor_home/CoursesMissingNeedsCard";
import { CoursesMissingQualificationsCard } from "../../../components/features/instructor_home/CoursesMissingQualificationsCard";
import { fetchInstructorDetails } from "../../../api/instructor/fetchInstructorDetails";
import { fetchAllInstructorQualifications } from "../../../api/instructor/fetchAllInstructorQualifications";
import type { QualificationResponse } from "../../../api/instructor/fetchAllInstructorQualifications";
import { FaUserGraduate, FaUsers } from "react-icons/fa";
import { GrDocumentMissing } from "react-icons/gr";
import { fetchAllocationById } from "../../../api/allocation/fetchAllocationById";
import type { ApplicationStatus } from "../../../interfaces/enum/ApplicationStatus";
import { getAllSemesters } from "../../../api/semester/getAllSemesters";

export default function InstructorHomePage() {
  const { userId, token } = useAuth();
  const [qualifications, setQualifications] = useState<QualificationResponse[]>([]);
  const [expandedAlloc, setExpandedAlloc] = useState<{ sectionId: number, allocIdx: number } | null>(null);
  const [sections, setSections] = useState<Section[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deadlines, setDeadlines] = useState<Deadline[]>([]);
  const [instructorName, setInstructorName] = useState<string>("");
  // State View More buttons
  const [visibleTeaching, setVisibleTeaching] = useState(5);
  const [visibleAlloc, setVisibleAlloc] = useState(3);
  const [visibleMissing, setVisibleMissing] = useState(3);
  // Track loading for all async data
  const [qualificationsLoaded, setQualificationsLoaded] = useState(false);
  const [sectionsLoaded, setSectionsLoaded] = useState(false);
  const [deadlinesLoaded, setDeadlinesLoaded] = useState(false);
  const [instructorNameLoaded, setInstructorNameLoaded] = useState(false);

  useEffect(() => {
    if (!userId) return;
    setQualificationsLoaded(false);
    fetchAllInstructorQualifications(userId).then(res => {
      setQualifications(res || []);
      setQualificationsLoaded(true);
    });
  }, [userId]);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      setError("");
      setSectionsLoaded(false);
      try {
        const token = localStorage.getItem("token"); 
        const semesters = await getAllSemesters(token ?? "");

        const active = semesters.filter((s) => s.isActive);
        const today = new Date();

        // 1. See if today is within any active semester’s window
        const currentSemester = active.find((s) => {
          const start = new Date(s.startDate);
          const end   = new Date(s.endDate);
          return start <= today && today <= end;
        });
        // 2. Otherwise pick the one that ends the latest
        const fallbackSemester =
          active.length > 0
            ? active.reduce((prev, curr) => {
                return new Date(curr.endDate) > new Date(prev.endDate)
                  ? curr
                  : prev;
              })
            : undefined;

        const chosen = currentSemester ?? fallbackSemester;
        const semester = chosen?.semester ?? "W1";
        const mostRecentYear = chosen?.year ?? new Date().getFullYear();

        // Fetch sections with their needs and allocations for current term
        const sectionsWithNeeds = await fetchSectionNeedAndAllocations(
          userId,
          null, // all courses
          mostRecentYear,
          semester
        ) ?? [];

        // Filter allocations to show only CONFIRMED status
        const sectionsWithConfirmedAllocations = await Promise.all(
          sectionsWithNeeds.map(async section => {
            // 1️⃣ grab just the unique allocationIds for this section
            const uniqueAllocIds = Array.from(
              new Set((section.allocatedSections ?? []).map(as => as.allocationId))
            );

            // 2️⃣ fetch each allocation exactly once
            const allocObjs = await Promise.all(
              uniqueAllocIds.map(id => fetchAllocationById(id))
            );

            // 3️⃣ filter for CONFIRMED
            const confirmed = allocObjs.filter(a => a.status === "CONFIRMED");

            return {
              ...section,
              // overwrite the old field
              allocations: confirmed
            };
          })
        );

        setSections(sectionsWithConfirmedAllocations);
      } catch (err) {
        console.error("Failed to load data:", err);
        setError("Failed to load data");
      } finally {
        setSectionsLoaded(true);
        setLoading(false);
      }
    }
    if (userId) loadData();
  }, [userId]);

  useEffect(() => {
    async function loadInstructorName() {
      if (!userId) return;
      setInstructorNameLoaded(false);
      try {
        const details = await fetchInstructorDetails(userId);
        if (details) {
          const firstName = (details as any)?.firstName;
          const lastName = (details as any)?.lastName;
          const name = (details as any)?.name;
          setInstructorName(
            firstName && lastName
              ? `${firstName} ${lastName}`
              : name
                ? name
                : ""
          );
        }
      } catch {
        setInstructorName("");
      } finally {
        setInstructorNameLoaded(true);
      }
    }
    loadInstructorName();
  }, [userId]);

  useEffect(() => {
    async function loadDeadlines() {
      if (!token) return;
      setDeadlinesLoaded(false);
      try {
        const res = await fetchDeadlines(token);
        if (res) {
          const mapped = res.map((d: any) => ({
            name: d.name,
            startTime: d.startTime,
            endTime: d.endTime,
          }));
          setDeadlines(mapped);
        } else {
          setDeadlines([]);
        }
      } catch {
        setDeadlines([]);
      } finally {
        setDeadlinesLoaded(true);
      }
    }
    loadDeadlines();
  }, [token]);

  // Metrics
  const totalSections = sections.length;
  const totalAllocations = sections.reduce(
    (sum, s) => sum + (s.allocations?.length || 0),
    0
  );
  const missingNeeds = sections.filter(s => !s.need || !s.need.description);

  // Only render dashboard after all data is loaded
  const allLoaded = qualificationsLoaded && sectionsLoaded && deadlinesLoaded && instructorNameLoaded;

  return (
    <section className="px-2 sm:px-4 py-4 sm:py-6 bg-white min-h-full">
      <div className="max-w-6xl mx-auto w-full flex flex-col">
        {!allLoaded ? (
          <div className="flex flex-1 items-center justify-center min-h-[300px]">
            <span className="text-gray-500 text-lg">Loading...</span>
          </div>
        ) : (
          <>
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-[#040941] mb-2">My Dashboard</h1>
              <p className="text-lg text-gray-700 font-medium mb-1">
                Welcome
                {instructorName && userId ? (
                  <>
                    {" "}
                    <a
                      href={`http://localhost:5173/user/profile/${userId}`}
                      className="text-gray-700 hover:underline font-semibold"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {instructorName}
                    </a>
                  </>
                ) : ", Instructor"}
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-[3fr_0.85fr] gap-8 mb-8 w-full items-start justify-center">
              <div className="w-full">
                {/* Metrics Row */}
                <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                  {/* Courses Teaching */}
                  <div className="flex items-center bg-white rounded-2xl shadow-md px-3 py-2 border-t-4" style={{ borderTopColor: '#040941', minHeight: '60px', paddingTop: '0.5rem', paddingBottom: '0.5rem' }}>
                    <FaUserGraduate size={20} style={{ color: '#040941' }} className="mr-3" />
                    <div>
                      <div className="text-xs text-gray-500 font-semibold uppercase tracking-wide mb-0.5">Sections Teaching</div>
                      <div className="text-lg font-bold text-[#040941]">{totalSections}</div>
                    </div>
                  </div>
                  {/* Confirmed TA Allocations */}
                  <div className="flex items-center bg-white rounded-2xl shadow-md px-3 py-2 border-t-4" style={{ borderTopColor: '#040941', minHeight: '60px', paddingTop: '0.5rem', paddingBottom: '0.5rem' }}>
                    <FaUsers size={20} style={{ color: '#040941' }} className="mr-3" />
                    <div>
                      <div className="text-xs text-gray-500 font-semibold uppercase tracking-wide mb-0.5">Confirmed Allocations</div>
                      <div className="text-lg font-bold text-[#040941]">{totalAllocations}</div>
                    </div>
                  </div>
                  {/* Courses Missing Needs */}
                  <div className="flex items-center bg-white rounded-2xl shadow-md px-3 py-2 border-t-4" style={{ borderTopColor: '#040941', minHeight: '60px', paddingTop: '0.5rem', paddingBottom: '0.5rem' }}>
                    <GrDocumentMissing size={20} style={{ color: '#040941' }} className="mr-3" />
                    <div>
                      <div className="text-xs text-gray-500 font-semibold uppercase tracking-wide mb-0.5">Missing Needs</div>
                      <div className="text-lg font-bold text-[#040941]">{missingNeeds.length}</div>
                    </div>
                  </div>
                </div>
                {/* Main Content Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Courses Teaching */}
                  <CoursesTeachingCard
                    sections={sections}
                    visibleTeaching={visibleTeaching}
                    setVisibleTeaching={setVisibleTeaching}
                  />
                  {/* TA Allocations */}
                  <TAAllocationsCard
                    sections={sections}
                    visibleAlloc={visibleAlloc}
                    setVisibleAlloc={setVisibleAlloc}
                    expandedAlloc={expandedAlloc}
                    setExpandedAlloc={setExpandedAlloc}
                  />
                  {/* Courses Missing Needs */}
                  <CoursesMissingNeedsCard
                    missingNeeds={missingNeeds}
                    visibleMissing={visibleMissing}
                    setVisibleMissing={setVisibleMissing}
                  />
                </div>
              </div>
              {/* Deadline Tracker and Skills/TA Qualifications in sidebar */}
              <div className="w-full flex flex-col items-center justify-center gap-8">
                <div className="w-full flex flex-col items-center">
                  <div className="w-full max-w-xs">
                    <DeadlineTracker
                      deadlines={deadlines.filter(d => d.name === 'instructor_need_update_deadline')}
                      totalDeadlines={1}
                    />
                  </div>
                  <div className="w-full max-w-xs">
                    <CoursesMissingQualificationsCard
                      sections={sections}
                      qualifications={qualifications}
                      userId={userId ? String(userId) : undefined}
                    />
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
