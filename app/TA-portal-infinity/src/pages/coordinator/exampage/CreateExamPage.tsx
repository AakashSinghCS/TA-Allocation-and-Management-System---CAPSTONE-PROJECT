import React, { useEffect, useState } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { useNavigate } from 'react-router-dom';
import { getAllDeptCodes } from '../../../api/course/getAllDeptCodes';
import { useAuth } from '../../../context/AuthContext';
import { fetchAllExistingCourseNums } from "../../../api/course/sectionfilter/fetchAllExistingCourseNums";
import type { StudentOrInstructorOrCoordinator } from '../../../interfaces/user/User';


const CreateExamPage = () => {
  const [deptCodes, setDeptCodes] = useState<string[]>([]);
  const [courseNums, setCourseNums] = useState<string[]>([]);
  const [sections, setSections] = useState<string[]>([]);

  const [selectedDeptCode, setSelectedDeptCode] = useState('');
  const [selectedCourseNum, setSelectedCourseNum] = useState('');
  const [selectedSection, setSelectedSection] = useState('');
  const [courseId, setCourseId] = useState<number | null>(null);
  const [sectionId, setSectionId] = useState<number | null>(null);

  const [term, setTerm] = useState('');
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

  useEffect(() => {
    const token = localStorage.getItem("token");

    fetch("http://localhost:8080/exams", {
        headers: {
            Authorization: `Bearer ${token}`
        }
    })
        .then(res => res.json())
        .then(async (examList) => {
            const formattedExams = await Promise.all(examList.map(async (exam: any) => {
                const courseRes = await fetch(`http://localhost:8080/courses/${exam.courseId}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                const sectionRes = await fetch(`http://localhost:8080/sections/get/${exam.sectionId}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                const course = await courseRes.json();
                const section = await sectionRes.json();

                return {
                    id: exam.id,
                    label: `${course.deptCode} ${course.courseNum} Section ${section.section} (${section.semester})`
                };
            }));

            setExams(examList);
            setExamDisplayOptions(formattedExams);
        })
        .catch(err => console.error("Failed to fetch exams:", err));
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
    if (!courseId || !sectionId || !term || !date || !startTime || !endTime) {
      alert('Please fill in all fields.');
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
                term,
                date: date.toISOString().split('T')[0],
                startTime,
                endTime,
            }),
        });

        if (!response.ok) {
            const errTxt = await response.text();
            throw new Error(`Failed to create exam: ${response.status} ${errTxt}`);
        }

        alert('Exam created successfully!');
        setSelectedDeptCode('');
        setSelectedCourseNum('');
        setCourseId(null);
        setSelectedSection('');
        setSectionId(null);
        setTerm('');
        setDate(null);
        setStartTime('');
        setEndTime('');

    } catch (err) {
        console.error('Error creating exam:', err);
        alert('Failed to create exam.');
    }
  };

  const handleAssign = async () => {
    const token = localStorage.getItem("token");
    if (!selectedStudentId || !selectedExamId || !task || !assignStartTime || !assignEndTime) {
        alert("Please fill in all fields.");
        return;
    }

    const selectedExam = exams.find(e => e.id === selectedExamId);
    if (!selectedExam) {
        alert("Selected exam not found.");
        return;
    }

    try {
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

        alert("Student assigned to exam successfully!");

        setStudentName('');
        setStudentNum('');
        setSelectedStudentId(null);
        setTask('');
        setAssignStartTime('');
        setAssignEndTime('');
        setSelectedExamId(null);

    } catch (err) {
        console.error("Assignment error:", err);
        alert("Failed to assign student.");
    }
  };

  return (
    <div>
        <div className="max-w-2xl mx-auto p-6 bg-white rounded shadow mt-10">
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

            <label className="block mb-2">Semester</label>
            <select
                value={term}
                onChange={e => setTerm(e.target.value)}
                className="w-full mb-4 p-2 border rounded"
            >
                <option value="">Select Semester</option>
                <option value="W1">W1</option>
                <option value="W2">W2</option>
                <option value="S1">S1</option>
                <option value="S2">S2</option>
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
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 w-full"
            >
                Create Exam
            </button>
        </div>

        <div className="max-w-2xl mx-auto p-6 bg-white rounded shadow mt-10">
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
                onChange={e => setSelectedStudentId(Number(e.target.value))}
                className="w-full mb-4 p-2 border rounded"
            >
                <option value="">Select a student</option>
                {matchingStudents.map((s) => (
                    <option key={s.id} value={s.id}>
                        {s.firstName} {s.lastName} ({s.studentNum})
                    </option>
                ))}
            </select>

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
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 w-full"
            >
                Assign
            </button>
        </div>
    </div>
  );

};

export default CreateExamPage;