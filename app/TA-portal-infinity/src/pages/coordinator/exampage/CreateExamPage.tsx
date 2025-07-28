import React, { useEffect, useState, useRef } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { useNavigate } from 'react-router-dom';
import { getAllDeptCodes } from '../../../api/course/getAllDeptCodes';
import { useAuth } from '../../../context/AuthContext';
import { fetchAllExistingCourseNums } from "../../../api/course/sectionfilter/fetchAllExistingCourseNums";
import type { StudentOrInstructorOrCoordinator } from '../../../interfaces/user/User';
import type { ExamAvailabilityDto } from '../../../interfaces/exam/ExamAvailability';
import { toast } from "react-toastify";
import { ToastContainer } from 'react-toastify';
import ExamsDashboard from "./ExamsDashboard"; 



const CreateExamPage = () => {
  const dashboardRef = useRef<() => void>(() => {});
  const assignmentRefMap = useRef<Record<number, () => void>>({});

  const [deptCodes, setDeptCodes] = useState<string[]>([]);
  const [courseNums, setCourseNums] = useState<string[]>([]);
  const [sections, setSections] = useState<string[]>([]);

  const [selectedDeptCode, setSelectedDeptCode] = useState('');
  const [selectedCourseNum, setSelectedCourseNum] = useState('');
  const [selectedSection, setSelectedSection] = useState('');
  const [courseId, setCourseId] = useState<number | null>(null);
  const [sectionId, setSectionId] = useState<number | null>(null);

  const [date, setDate] = useState<Date | null>(null);
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');

  const { token, userId, userRoles } = useAuth();

  const navigate = useNavigate();

  const [studentName, setStudentName] = useState('');
  const [studentNum, setStudentNum] = useState('');
  const [matchingStudents, setMatchingStudents] = useState<StudentOrInstructorOrCoordinator[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState<number | null>(null);

  const [exams, setExams] = useState<any[]>([]);
  const [examDisplayOptions, setExamDisplayOptions] = useState<{ id: number, label: string }[]>([]);
  const [selectedExamId, setSelectedExamId] = useState<number | null>(null);

  const [task, setTask] = useState('');
  const [assignStartTime, setAssignStartTime] = useState('');
  const [assignEndTime, setAssignEndTime] = useState('');

  const [availabilities, setAvailabilities] = useState<ExamAvailabilityDto[]>([]);

  const currentYear = new Date().getFullYear();


  useEffect(() => {
    const token = localStorage.getItem('token');
    getAllDeptCodes(token ?? undefined, userId, userRoles)
        .then(data => {
        setDeptCodes(data);
        })
        .catch(err => {
            console.error('Failed to fetch deptCodes:', err);
        });
  }, []);


  useEffect(() => {
    if (selectedDeptCode) {
        fetchAllExistingCourseNums(selectedDeptCode)
            .then(data => {
                if (data) {
                    setCourseNums(data);
                } else {
                    setCourseNums([]);
                }
            })
            .catch(err => console.error('Failed to fetch courseNums:', err));
    }
  }, [selectedDeptCode]);


  useEffect(() => {
    const token = localStorage.getItem('token');
  
    if (selectedDeptCode && selectedCourseNum && token) {
        const courseUrl = `http://localhost:8080/courses/getByDeptCodeAndCourseNum/${selectedDeptCode}/${selectedCourseNum}`;
        const sectionUrl = `http://localhost:8080/courses/allSections?deptCode=${selectedDeptCode}&courseNum=${selectedCourseNum}`;
    
        fetch(courseUrl, {
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`
            }
        })
        .then(res => {
            if (!res.ok) throw new Error(`Course fetch failed with status ${res.status}`);
            return res.json();
        })
        .then(courseDto => {
            setCourseId(courseDto.id);

            return fetch(sectionUrl, {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                }
            });
        })
        .then(secRes => {
            if (!secRes.ok) throw new Error(`Section fetch failed with status ${secRes.status}`);
            return secRes.json();
        })
        .then(sectionData => {
            setSections(sectionData);
        })
        .catch(err => console.error('Failed to fetch courseDto or sections:', err));
    }
  }, [selectedCourseNum]);


  useEffect(() => {
    const token = localStorage.getItem("token");

    if (courseId && selectedSection && token) {
        const url = `http://localhost:8080/courses/sections/getByCourseAndName?courseId=${courseId}&section=${selectedSection}`;

        fetch(url, {
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
        })
            .then((res) => {
                if (!res.ok) throw new Error(`Fetch failed: ${res.status}`);
                return res.json();
            })
            .then((data) => {
                console.log(data.id);
                setSectionId(data.id);
            })
            .catch((err) => console.error("Failed to fetch sectionId:", err));
    }
  }, [courseId, selectedSection]);

  const fetchExamsAndUpdateDropdown = async () => {
    const token = localStorage.getItem("token");
    
    try {
        const res = await fetch("http://localhost:8080/exams", {
            headers: { Authorization: `Bearer ${token}` }
        });
        const examList = await res.json();

        const formattedExams = await Promise.all(
            examList.map(async (exam: any) => {
                const [courseRes, sectionRes] = await Promise.all([
                    fetch(`http://localhost:8080/courses/${exam.courseId}`, {
                        headers: { Authorization: `Bearer ${token}` },
                    }),
                    fetch(`http://localhost:8080/sections/get/${exam.sectionId}`, {
                        headers: { Authorization: `Bearer ${token}` },
                    }),
                ]);

                const course = await courseRes.json();
                const section = await sectionRes.json();

                return {
                    id: exam.id,
                    label: `${course.deptCode} ${course.courseNum} Section ${section.section} (${section.semester})`,
                };
            })
        );

        setExams(examList);
        setExamDisplayOptions(formattedExams);
    } catch (err) {
        console.error("Failed to fetch exams:", err);
    }
  };


  useEffect(() => {
    fetchExamsAndUpdateDropdown();
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!studentName && !studentNum) return;

    const url = new URL("http://localhost:8080/users/search");
    url.searchParams.append("role", "STUDENT");
    url.searchParams.append("name", studentName);
    if (studentNum) url.searchParams.append("universityNumber", studentNum);

    fetch(url.toString(), {
        headers: { Authorization: `Bearer ${token}` }
    })
        .then(res => res.json())
        .then(data => setMatchingStudents(data))
        .catch(err => console.error("Failed to search students:", err));
  }, [studentName, studentNum]);



  const handleSubmit = async () => {
    if (!courseId || !sectionId || !date || !startTime || !endTime) {
      toast.error('Please fill in all fields.');
      return;
    }

    const [starthour, startminute] = startTime.split(":").map(Number);
    const [endhour, endminute] = endTime.split(":").map(Number);

    const starttotalmin = starthour * 60 + startminute;
    const endtotalmin = endhour * 60 + endminute;

    const minallowed = 8 * 60;
    const maxallowed = 20 * 60;

    if (starttotalmin < minallowed || starttotalmin > maxallowed) {
        toast.warn("Start time must be between 08:00 and 20:00.");
        return;
    }

    if (endtotalmin < minallowed || endtotalmin > maxallowed) {
        toast.warn("End time must be between 08:00 and 20:00.");
        return;
    }

    if (endtotalmin <= starttotalmin) {
        toast.error("End time must be after start time.");
        return;
    }



    const token = localStorage.getItem('token');

    try {
        const response = await fetch('http://localhost:8080/exams', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...(token && { Authorization: `Bearer ${token}` }),
            },
            body: JSON.stringify({
                courseId,
                sectionId,
                date: date.toISOString().split('T')[0],
                startTime,
                endTime,
            }),
        });

        if (!response.ok) {
            const errTxt = await response.text();
            throw new Error(`Failed to create exam: ${response.status} ${errTxt}`);
        }

        toast.success('Exam created successfully!');
        await fetchExamsAndUpdateDropdown();
        dashboardRef.current?.();
        setSelectedDeptCode('');
        setSelectedCourseNum('');
        setCourseId(null);
        setSelectedSection('');
        setSectionId(null);
        setDate(null);
        setStartTime('');
        setEndTime('');

    } catch (err) {
        console.error('Error creating exam:', err);
        toast.error('Failed to create exam.');
    }
  };

  const handleAssign = async () => {
    const token = localStorage.getItem("token");
    if (!selectedStudentId || !selectedExamId || !task || !assignStartTime || !assignEndTime) {
        toast.error("Please fill in all fields.");
        return;
    }

    const [startHour, startMinute] = assignStartTime.split(":").map(Number);
    const [endHour, endMinute] = assignEndTime.split(":").map(Number);

    const startTotalMin = startHour * 60 + startMinute;
    const endTotalMin = endHour * 60 + endMinute;

    const minAllowed = 8 * 60;
    const maxAllowed = 20 * 60;

    if (startTotalMin < minAllowed || startTotalMin > maxAllowed) {
        toast.warn("Start time must be between 08:00 and 20:00.");
        return;
    }

    if (endTotalMin < minAllowed || endTotalMin > maxAllowed) {
        toast.warn("End time must be between 08:00 and 20:00.");
        return;
    }

    if (endTotalMin <= startTotalMin) {
        toast.error("End time must be after start time.");
        return;
    }

    const selectedExam = exams.find(e => e.id === selectedExamId);
    if (!selectedExam) {
        toast.error("Selected exam not found.");
        return;
    }

    const formatTime = (timeStr: string) => timeStr?.slice(0, 5);

    const formatTo12Hour = (timeStr: string) => {
        const [hour, minute] = timeStr.split(":");
        const date = new Date();
        date.setHours(Number(hour));
        date.setMinutes(Number(minute));
        return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: true });
    };

    if (task === "COORDINATION" && (formatTime(assignStartTime) !== formatTime(selectedExam.startTime) || formatTime(assignEndTime) !== formatTime(selectedExam.endTime))) {
        toast.warn(`For Coordination task, the assigned time must match the exam time.\n\nExam Start Time: ${formatTo12Hour(selectedExam.startTime)}\nExam End Time: ${formatTo12Hour(selectedExam.endTime)}`);
        return;
    }

    try {

        const appRes = await fetch(`http://localhost:8080/applications/get/${selectedStudentId}/${currentYear}`, {
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });

        if (!appRes.ok) {
            toast.error('Student does not have a graduate application submitted.');
            return;
        }

        const appData = await appRes.json();

        if (appData.applicationType !== "GRADUATE") {
            toast.warn("Only graduate students can be assigned to exams.");
            return;
        }

        const res = await fetch(`http://localhost:8080/exams/${selectedExamId}/assignments`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({
                examId: selectedExamId,
                studentId: selectedStudentId,
                task,
                date: selectedExam.date, // uses the same date as the exam
                startTime: assignStartTime,
                endTime: assignEndTime,
            })
        });

        if (!res.ok) {
            const txt = await res.text();
            throw new Error(`Error assigning: ${res.status} - ${txt}`);
        }

        toast.success("Student assigned to exam successfully!");

        assignmentRefMap.current[selectedExamId!]?.();

        setStudentName('');
        setStudentNum('');
        setSelectedStudentId(null);
        setTask('');
        setAssignStartTime('');
        setAssignEndTime('');
        setSelectedExamId(null);
        setAvailabilities([]);

    } catch (err) {
        console.error("Assignment error:", err);
        toast.error("Failed to assign student.");
    }
  };

  return (
    <div className="max-w-8xl mx-auto px-4">
        <div className="flex flex-col lg:flex-row gap-8 justify-center items-start mt-10">
            <div className="w-full lg:w-[45%] p-6 bg-white rounded shadow min-h-[813px] flex flex-col justify-between">
                <h2 className="text-2xl font-bold mb-4">Create Exam</h2>

                <label className="block mb-2">Department Code</label>
                <select
                    value={selectedDeptCode}
                    onChange={e => setSelectedDeptCode(e.target.value)}
                    className="w-full mb-4 p-2 border rounded"
                >
                    <option value="">Select Department</option>
                    {deptCodes.map(code => (
                        <option key={code} value={code}>{code}</option>
                    ))}
                </select>

                <label className="block mb-2">Course Number</label>
                <select
                    value={selectedCourseNum}
                    onChange={e => setSelectedCourseNum(e.target.value)}
                    className="w-full mb-4 p-2 border rounded"
                    disabled={!selectedDeptCode}
                >
                    <option value="">Select Course</option>
                    {courseNums.map(num => (
                        <option key={num} value={num}>{num}</option>
                    ))}
                </select>

                <label className="block mb-2">Section</label>
                <select
                    value={selectedSection}
                    onChange={e => setSelectedSection(e.target.value)}
                    className="w-full mb-4 p-2 border rounded"
                    disabled={!courseId}
                >
                    <option value="">Select Section</option>
                    {sections.map(sec => (
                        <option key={sec} value={sec}>{sec}</option>
                    ))}
                </select>

                <label className="block mb-2">Exam Date</label>
                <DatePicker
                    selected={date}
                    onChange={(d: Date | null) => {
                        if (d) setDate(d);
                    }}
                    className="w-full mb-4 p-2 border rounded"
                    dateFormat="yyyy-MM-dd"
                    placeholderText="Select a date"
                />

                <label className="block mb-2">Start Time (HH:MM)</label>
                <input
                    type="time"
                    value={startTime}
                    onChange={e => setStartTime(e.target.value)}
                    className="w-full mb-4 p-2 border rounded"
                    step="60"
                />

                <label className="block mb-2">End Time (HH:MM)</label>
                <input
                    type="time"
                    value={endTime}
                    onChange={e => setEndTime(e.target.value)}
                    className="w-full mb-6 p-2 border rounded"
                    step="60"
                />

                <button
                    onClick={handleSubmit}
                    className="bg-[#040941] text-white px-4 py-2 rounded hover:bg-blue-700 w-full"
                >
                    Create Exam
                </button>
            </div>

            <div className="w-full lg:w-[45%] p-6 bg-white rounded shadow min-h-[813px] flex flex-col justify-between">
                <h2 className="text-2xl font-bold mb-4">Assign Student to Exam</h2>

                <label className="block mb-2">Student Name</label>
                <input
                    type="text"
                    value={studentName}
                    onChange={e => setStudentName(e.target.value)}
                    className="w-full mb-4 p-2 border rounded"
                    placeholder="e.g. John"
                />

                <label className="block mb-2">Student Number</label>
                <input
                    type="text"
                    value={studentNum}
                    onChange={e => setStudentNum(e.target.value)}
                    className="w-full mb-4 p-2 border rounded"
                    placeholder="e.g. 12345678"
                />

                <label className="block mb-2">Select Matching Student</label>
                <select
                    value={selectedStudentId || ''}
                    onChange={async (e) => {
                        const studentId = Number(e.target.value);
                        setSelectedStudentId(studentId);

                        if (studentId) {
                            const token = localStorage.getItem("token");
                            try {
                                const res = await fetch(`http://localhost:8080/exams/${studentId}/availability`, {
                                    headers: { Authorization: `Bearer ${token}` }
                                });
                                if (!res.ok) throw new Error("Failed to fetch availability");
                                const data = await res.json();
                                setAvailabilities(data);
                            } catch (err) {
                                console.error("Error fetching availabilities:", err);
                                setAvailabilities([]);
                            }
                        } else {
                            setAvailabilities([]);
                        }
                    }}
                    className="w-full mb-4 p-2 border rounded"
                >
                    <option value="">Select a student</option>
                    {matchingStudents.map((s) => (
                        <option key={s.id} value={s.id}>
                            {s.firstName} {s.lastName} ({s.studentNum})
                        </option>
                    ))}
                </select>

                {availabilities.length > 0 && (
                    <div className="mb-4">
                        <h3 className="font-semibold mb-2">Student Availability:</h3>
                        <ul className="list-disc ml-6">
                            {availabilities.map((a) => (
                                <li key={a.id}>
                                    {a.date} | {a.startTime} – {a.endTime}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                <label className="block mb-2">Select Exam</label>
                <select
                    value={selectedExamId || ''}
                    onChange={e => setSelectedExamId(Number(e.target.value))}
                    className="w-full mb-4 p-2 border rounded"
                >
                    <option value="">Select exam</option>
                    {examDisplayOptions.map((exam) => (
                        <option key={exam.id} value={exam.id}>{exam.label}</option>
                    ))}
                </select>

                <label className="block mb-2">Task</label>
                <select
                    value={task}
                    onChange={e => setTask(e.target.value)}
                    className="w-full mb-4 p-2 border rounded"
                >
                    <option value="">Select task</option>
                    <option value="MARKING">Marking</option>
                    <option value="PREPARATION">Preparation</option>
                    <option value="COORDINATION">Coordination</option>
                </select>

                <label className="block mb-2">Start Time</label>
                <input
                    type="time"
                    value={assignStartTime}
                    onChange={e => setAssignStartTime(e.target.value)}
                    className="w-full mb-4 p-2 border rounded"
                />

                <label className="block mb-2">End Time</label>
                <input
                    type="time"
                    value={assignEndTime}
                    onChange={e => setAssignEndTime(e.target.value)}
                    className="w-full mb-6 p-2 border rounded"
                />

                <button
                    onClick={handleAssign}
                    className="bg-[#040941] text-white px-4 py-2 rounded hover:bg-blue-700 w-full"
                >
                    Assign
                </button>
            </div>

            <ToastContainer
                position="top-right"
                autoClose={3000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme="light"
            />
        </div>
        <div className="mt-10 w-full">
            <div className="max-w-7xl mx-auto px-4">
                <hr className="my-7" />
                <h2 className="text-2xl font-bold mb-4 text-center">Exams & Assignments</h2>
                <ExamsDashboard 
                    onRef={(fn) => (dashboardRef.current = fn)}
                    assignmentRefMap={assignmentRefMap}
                />
            </div>
        </div>
    </div>
  );

};

export default CreateExamPage;