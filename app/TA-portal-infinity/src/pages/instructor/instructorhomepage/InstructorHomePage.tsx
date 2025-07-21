import React, { useEffect, useState } from "react";
import { useAuth } from "../../../context/AuthContext";
import { fetchAllSectionsAndNeedAndAllocations } from "../../../api/instructor/fetchAllSectionsAndNeedAndAllocations";
import { fetchDeadlines } from "../../../api/config/fetchDeadlines";
import type Section from "../../../interfaces/section/Section";
import type { Deadline } from "../../../interfaces/config/Deadline";
import { DeadlineTracker } from "../../../components/features/instructor_home/DeadlineTracker";
import { fetchInstructorDetails } from "../../../api/instructor/fetchInstructorDetails";
import { fetchAllInstructorQualifications } from "../../../api/instructor/fetchAllInstructorQualifications";
import type { QualificationResponse } from "../../../api/instructor/fetchAllInstructorQualifications";
import { FaUserGraduate , FaUsers } from "react-icons/fa";
import { GrDocumentMissing } from "react-icons/gr";

export default function InstructorHomePage() {
  const { userId, token } = useAuth();
  const [qualifications, setQualifications] = useState<QualificationResponse[]>([]);
  const [expandedAlloc, setExpandedAlloc] = useState<{sectionId: number, allocIdx: number} | null>(null);
  const [sections, setSections] = useState<Section[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deadlines, setDeadlines] = useState<Deadline[]>([]);
  const [instructorName, setInstructorName] = useState<string>("");
  // State View More buttons
  const [visibleTeaching, setVisibleTeaching] = useState(5);
  const [visibleAlloc, setVisibleAlloc] = useState(3);
  const [visibleMissing, setVisibleMissing] = useState(3);

  useEffect(() => {
    if (!userId) return;
    fetchAllInstructorQualifications(userId).then(res => {
      setQualifications(res || []);
    });
  }, [userId]);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      setError("");
      try {
        const data = await fetchAllSectionsAndNeedAndAllocations(userId);
        setSections(data || []);
      } catch (err) {
        setError("Failed to load data");
      } finally {
        setLoading(false);
      }
    }
    if (userId) loadData();
  }, [userId]);

  useEffect(() => {
    async function loadInstructorName() {
      if (!userId) return;
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
      }
    }
    loadInstructorName();
  }, [userId]);

  useEffect(() => {
    async function loadDeadlines() {
      if (!token) return;
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
      }
    }
    loadDeadlines();
  }, [token]);

  // Metrics
  const totalSections = sections.length;
  const totalAllocations = sections.reduce((sum, s) => sum + (s.allocations?.length || 0), 0);
  const missingNeeds = sections.filter(s => !s.need || !s.need.description);

  return (
    <section className="px-2 sm:px-4 py-4 sm:py-6 bg-white min-h-full">
      <div className="max-w-7xl mx-auto w-full flex flex-col">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-[#040941] mb-2">My Dashboard</h1>
          <p className="text-lg text-gray-700 font-medium mb-1">
            Welcome{instructorName ? `, ${instructorName}` : ", Instructor"}
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-[2.5fr_1fr] gap-8 mb-8 w-full items-start justify-center">
          <div className="w-full">
          {loading ? (
            <div className="text-gray-500">Loading...</div>
          ) : error ? (
            <div className="text-red-500">{error}</div>
          ) : (
            <>
              {/* Metrics Row */}
              <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-6 mb-8">
                {/* Courses Teaching */}
                <div className="flex items-center bg-white rounded-2xl shadow-md px-5 py-4 border-t-4" style={{ borderTopColor: '#040941', minHeight: '80px' }}>
                  <FaUserGraduate size={32} style={{ color: '#040941' }} className="mr-4" />
                  <div>
                    <div className="text-sm text-gray-500 font-semibold uppercase tracking-wide mb-1">Courses Teaching</div>
                    <div className="text-2xl font-bold text-[#040941]">{totalSections}</div>
                  </div>
                </div>
                {/* TA Allocations */}
                <div className="flex items-center bg-white rounded-2xl shadow-md px-5 py-4 border-t-4" style={{ borderTopColor: '#040941', minHeight: '80px' }}>
                  <FaUsers size={32} style={{ color: '#040941' }} className="mr-4" />
                  <div>
                    <div className="text-sm text-gray-500 font-semibold uppercase tracking-wide mb-1">TA Allocations</div>
                    <div className="text-2xl font-bold text-[#040941]">{totalAllocations}</div>
                  </div>
                </div>
                {/* Courses Missing Needs */}
                <div className="flex items-center bg-white rounded-2xl shadow-md px-5 py-4 border-t-4" style={{ borderTopColor: '#040941', minHeight: '80px' }}>
                  <GrDocumentMissing size={32} style={{ color: '#040941' }} className="mr-4" />
                  <div>
                    <div className="text-sm text-gray-500 font-semibold uppercase tracking-wide mb-1">Missing Needs</div>
                    <div className="text-2xl font-bold text-[#040941]">{missingNeeds.length}</div>
                  </div>
                </div>
              </div>
              {/* Main Content Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Courses Teaching */}
                <div className="bg-white rounded-lg shadow p-0 flex flex-col justify-between">
                  <div className="rounded-t-lg bg-gray-100 w-full px-4 pt-3 pb-2">
                    <h2 className="font-semibold text-gray-700">Courses Teaching</h2>
                  </div>
                  <div className="p-4 flex-1 pt-2">
                <ul className="divide-y divide-gray-300">
                  {sections.slice(0, visibleTeaching).map(section => (
                        <li key={section.id} className="py-2">
                          <div className="flex flex-col">
                            <span className="font-medium text-gray-800">
                              {section.course?.deptCode} {section.course?.courseNum} — {section.course?.name}
                            </span>
                            <span className="text-xs text-gray-500 mt-0.5">
                              {section.year} {section.semester} | Section {section.section} | {section.type}
                            </span>
                          </div>
                        </li>
                      ))}
                    </ul>
                {(sections.length > visibleTeaching || visibleTeaching > 5) && (
                  <div className="mt-2 flex justify-end gap-2">
                    {sections.length > visibleTeaching && (
                      <button
                        className="text-sm font-medium hover:underline"
                        style={{ color: '#1D3557' }}
                        onClick={() => setVisibleTeaching(prev => Math.min(prev + 5, sections.length))}
                      >
                        View More
                      </button>
                    )}
                    {visibleTeaching > 5 && (
                      <button
                        className="text-sm font-medium hover:underline"
                        style={{ color: '#4F8EDB' }}
                        onClick={() => setVisibleTeaching(5)}
                      >
                        Show Less
                      </button>
                    )}
                  </div>
                )}
                  </div>
                </div>
                {/* TA Allocations */}
                <div className="bg-white rounded-lg shadow p-0 flex flex-col justify-between">
                  <div className="rounded-t-lg bg-gray-100 w-full px-4 pt-3 pb-2">
                    <h2 className="font-semibold text-gray-700">TA Allocations</h2>
                  </div>
                  <div className="p-4 flex-1 pt-2">
                <ul className="divide-y divide-gray-300">
                  {sections.slice(0, visibleAlloc).map(section => (
                        <li key={section.id} className="py-2">
                          <div className="flex flex-col">
                            <span className="font-medium text-gray-800">
                              {section.course?.deptCode} {section.course?.courseNum} — {section.course?.name}
                            </span>
                            <span className="text-xs text-gray-500 mt-0.5">
                              {section.year} {section.semester} | Section {section.section} | {section.type}
                            </span>
                            {section.allocations && section.allocations.length > 0 ? (
                              <ul className="ml-4 mt-1">
                                {section.allocations.map((alloc, idx) => (
                                  <li key={alloc.id || idx} className="text-sm text-gray-700 mb-2">
                                    <div className="flex flex-col gap-0.5">
                                      <div className="flex items-center gap-2">
                                        {alloc.student?.id ? (
                                          <>
                                            <a
                                              href={`http://localhost:5173/user/profile/${alloc.student.id}`}
                                              className="text-[#1D3557] hover:underline"
                                              target="_blank"
                                              rel="noopener noreferrer"
                                            >
                                              {alloc.student.firstName || ''} {alloc.student.lastName || ''}
                                            </a>
                                            {alloc.student.email && (
                                              <span className="block text-xs text-gray-500">{alloc.student.email}</span>
                                            )}
                                          </>
                                        ) : (
                                          <span>{alloc.student?.firstName || ''} {alloc.student?.lastName || ''}</span>
                                        )}
                                        <button
                                          className="ml-2 text-xs font-medium hover:underline"
                                          style={{ color: '#1D3557' }}
                                          onClick={() => setExpandedAlloc(
                                            expandedAlloc && expandedAlloc.sectionId === (section.id as number) && expandedAlloc.allocIdx === idx
                                              ? null
                                              : { sectionId: section.id as number, allocIdx: idx }
                                          )}
                                        >
                                          {expandedAlloc && expandedAlloc.sectionId === (section.id as number) && expandedAlloc.allocIdx === idx ? 'Hide Details' : 'View Details'}
                                        </button>
                                      </div>
                                      {expandedAlloc && expandedAlloc.sectionId === (section.id as number) && expandedAlloc.allocIdx === idx && (
                                        <div className="bg-gray-50 rounded p-2 mt-1 text-xs text-gray-700 border border-gray-200 space-y-1">
                                          <div><span className="font-semibold">Student Num:</span> {alloc.student?.studentNum ?? 'N/A'}</div>
                                          <div><span className="font-semibold">Program:</span> {alloc.student?.program ?? 'N/A'}</div>
                                          <div><span className="font-semibold">Enrollment Year:</span> {alloc.student?.enrollmentYear ?? 'N/A'}</div>
                                          <div><span className="font-semibold">School Year:</span> {alloc.student?.schoolYear ?? 'N/A'}</div>
                                          <div><span className="font-semibold">Email:</span> {alloc.student?.email ?? 'N/A'}</div>
                                          <div><span className="font-semibold">Roles:</span> {alloc.student?.roles?.join(', ') ?? 'N/A'}</div>
                                          <div><span className="font-semibold">Hours Allocated:</span> {typeof alloc.numberOfHours === 'number' ? alloc.numberOfHours : 'N/A'}</div>
                                        </div>
                                      )}
                                    </div>
                                  </li>
                                ))}
                              </ul>
                            ) : (
                              <span className="text-sm text-gray-500 ml-4 mt-1">No TA allocated yet</span>
                            )}
                          </div>
                        </li>
                      ))}
                    </ul>
                {(sections.length > visibleAlloc || visibleAlloc > 3) && (
                  <div className="mt-2 flex justify-end gap-2">
                    {sections.length > visibleAlloc && (
                      <button
                        className="text-sm font-medium hover:underline"
                        style={{ color: '#1D3557' }}
                        onClick={() => setVisibleAlloc(prev => Math.min(prev + 5, sections.length))}
                      >
                        View More
                      </button>
                    )}
                    {visibleAlloc > 3 && (
                      <button
                        className="text-sm font-medium hover:underline"
                        style={{ color: '#1D3557' }}
                        onClick={() => setVisibleAlloc(3)}
                      >
                        Show Less
                      </button>
                    )}
                  </div>
                )}
                  </div>
                 
                </div>
                {/* Courses Missing Needs */}
                <div className="bg-white rounded-lg shadow p-0 md:col-span-2 flex flex-col justify-between">
                  <div className="rounded-t-lg bg-gray-100 w-full px-4 pt-3 pb-2">
                    <h2 className="font-semibold text-gray-700">Courses Missing Needs</h2>
                  </div>
                  <div className="p-4 flex-1 pt-2">
                    {missingNeeds.length === 0 ? (
                      <p className="text-gray-500">All courses have needs specified.</p>
                    ) : (
                      <>
                        <ul className="divide-y divide-gray-300">
                          {missingNeeds.slice(0, visibleMissing).map(section => (
                            <li key={section.id} className="py-2">
                              <div className="flex flex-col">
                                <span className="font-medium text-red-700">
                                  {section.course?.deptCode} {section.course?.courseNum} — {section.course?.name}
                                </span>
                                <span className="text-xs text-gray-500 mt-0.5">
                                  {section.year} {section.semester} | Section {section.section} | {section.type}
                                </span>
                              </div>
                            </li>
                          ))}
                        </ul>
                        {(missingNeeds.length > visibleMissing || visibleMissing > 3) && (
                          <div className="mt-2 flex justify-end gap-2">
                            {missingNeeds.length > visibleMissing && (
                              <button
                        className="text-sm font-medium hover:underline"
                        style={{ color: '#1D3557' }}
                                onClick={() => setVisibleMissing(prev => Math.min(prev + 5, missingNeeds.length))}
                              >
                                View More
                              </button>
                            )}
                            {visibleMissing > 3 && (
                              <button
                        className="text-sm font-medium hover:underline"
                        style={{ color: '#1D3557' }}
                                onClick={() => setVisibleMissing(3)}
                              >
                                Show Less
                              </button>
                            )}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
        {/* Deadline Tracker */}
        <div className="w-full flex flex-col items-center justify-center gap-8">
          <DeadlineTracker
            deadlines={deadlines.filter(d => d.name === 'instructor_need_update_deadline')}
            totalDeadlines={1}
          />
          {/* Skills/TA Qualifications */}
          <div className="bg-white rounded-lg shadow p-4 sm:p-6 md:p-8 flex flex-col items-center w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg xl:max-w-xl mx-auto">
            <h2 className="font-semibold text-gray-700 mt-1 mb-4 text-center text-base sm:text-lg md:text-xl">Courses Missing Skills/TA Qualifications</h2>
            <hr className="w-full border-gray-300 mb-4" />
            <div className="flex flex-col items-center w-full">
              <div className="relative w-24 h-24 sm:w-32 sm:h-32 md:w-36 md:h-36 lg:w-40 lg:h-40 xl:w-44 xl:h-44">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                  <circle className="text-gray-200" strokeWidth="6" stroke="currentColor" fill="none" cx="18" cy="18" r="15" />
                  {(() => {
                    // For each course in 'sections', check if it has any section missing qualifications
                    const courseKeys = new Set();
                    sections.forEach(section => {
                      if (section.course) {
                        courseKeys.add(`${section.course.deptCode || ''}-${section.course.courseNum || ''}`);
                      }
                    });
                    let missingCourses = 0;
                    courseKeys.forEach(courseKey => {
                      // Find all sections for this course
                      const courseSections = sections.filter(s => s.course && `${s.course.deptCode || ''}-${s.course.courseNum || ''}` === courseKey);
                      if (courseSections.length === 0) return; 
                      // For each section, check if it has a qualification entry with non-empty qualifications
                      const hasMissing = courseSections.some(section => {
                        const qual = qualifications.find(q => q.section.id === section.id);
                        return !qual || !qual.qualifications || qual.qualifications.length === 0;
                      });
                      if (hasMissing) missingCourses++;
                    });
                    const totalCourses = courseKeys.size;
                    const percent = totalCourses > 0 ? Math.floor((missingCourses / totalCourses) * 100) : 0;
                    let color = '#15803D'; // green
                    if (missingCourses > 0 && missingCourses <= 2) color = '#F59E42'; // yellow
                    if (missingCourses > 2) color = '#B91C1C'; // red
                    return (
                      <circle
                        strokeWidth="6"
                        strokeDasharray={`${percent > 0 ? percent : 100},${percent > 0 ? 100 - percent : 0}`}
                        stroke={color}
                        fill="none"
                        cx="18"
                        cy="18"
                        r="15"
                      />
                    );
                  })()}
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center px-1 sm:px-2" style={{textAlign: 'center', width: '100%'}}>
                  <div className="flex flex-col items-center justify-center gap-0.5 w-full">
                    <span className="font-bold text-xl sm:text-2xl md:text-3xl lg:text-4xl" style={{color: '#1D3557'}}>
                      {/* count of courses with at least one section missing Skills/TA Qualifications */}
                      {(() => {
                        const courseKeys = new Set();
                        sections.forEach(section => {
                          if (section.course) {
                            courseKeys.add(`${section.course.deptCode || ''}-${section.course.courseNum || ''}`);
                          }
                        });
                        let missingCourses = 0;
                        courseKeys.forEach(courseKey => {
                          const courseSections = sections.filter(s => s.course && `${s.course.deptCode || ''}-${s.course.courseNum || ''}` === courseKey);
                          if (courseSections.length === 0) return;
                          const hasMissing = courseSections.some(section => {
                            const qual = qualifications.find(q => q.section.id === section.id);
                            return !qual || !qual.qualifications || qual.qualifications.length === 0;
                          });
                          if (hasMissing) missingCourses++;
                        });
                        return missingCourses;
                      })()}
                    </span>
                    <span className="font-semibold text-xs sm:text-sm md:text-base mt-0.5" style={{color: '#1D3557', maxWidth: '90px', display: 'block', whiteSpace: 'normal'}}>
                      missing
                    </span>
                  </div>
                </div>
              </div>
            </div>
            {/* More details */}
            <div className="w-full flex justify-center mt-3 mb-2 sm:mt-4 sm:mb-4">
              <a
                href={`http://localhost:5173/user/instructorprofile/${userId}/qualifications`}
                className="text-xs sm:text-sm md:text-base text-blue-900 hover:underline font-medium"
                target="_blank"
                rel="noopener noreferrer"
                style={{ cursor: 'pointer' }}
              >
                View details
              </a>
            </div>
          </div>
        </div>
      </div>
      </div>
    </section>
  );
}
