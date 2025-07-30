import { useState, useEffect, type FormEvent } from 'react';
import { getAllDeptCodes } from '../../../../api/course/getAllDeptCodes';
import { validateCourseProfile } from '../../../../utility/validation/course/validateCourseProfile';
import { sectionTypeOptions, type SectionType } from '../../../../interfaces/section/SectionDetails';
import { useNavigate } from 'react-router-dom';
import UserBrowsingViewer from '../../../../pages/coordinator/userbrowsingpage/userbrowsingviewer/UserBrowsingViewer';
import type { Instructor } from '../../../../interfaces/user/Instructor';
import { timeOptions } from '../../../ui/section/timeselector/TimeSelector';
import { fetchAllExistingCourseNums } from '../../../../api/course/sectionfilter/fetchAllExistingCourseNums';
export interface SectionScheduleInput {
  day: string
  startTime: string
  endTime: string
}

export interface CreateSectionData {
  name?: string | null
  deptCode: string
  courseNum: string
  section?: string | null
  year?: number | null
  semester?: string | null
  type?: SectionType | null
  instructorId?: number | null
  sectionSchedules?: SectionScheduleInput[] | null
  isCourse: boolean
}
interface Props {
  onCreateSection: (data: CreateSectionData, setSectionErrors?: (e: any) => void) => Promise<boolean | void>;
  mode?: 'course' | 'section';
  refreshOptions?: number;
}

export default function CreateSectionForm({ onCreateSection, mode, refreshOptions }: Props) {
  const initialForm: CreateSectionData = {
    name: null,
    deptCode: '',
    courseNum: '',
    section: null,
    year: null,
    semester: null,
    type: null,
    instructorId: null,
    sectionSchedules: null,
    isCourse: mode === 'course' ? true : false
  };
  // form state
  const [form, setForm] = useState<CreateSectionData>(initialForm);
  // Course Num options for section creation
  const [courseNumOptions, setCourseNumOptions] = useState<string[]>([]);
  useEffect(() => {
    if (mode === 'section' && form.deptCode) {
      fetchAllExistingCourseNums(form.deptCode)
        .then((nums: string[] | null) => {
          if (Array.isArray(nums)) setCourseNumOptions(nums);
          else setCourseNumOptions([]);
        })
        .catch(() => setCourseNumOptions([]));
    } else {
      setCourseNumOptions([]);
    }
  }, [mode, form.deptCode]);
  const navigate = useNavigate();
  const [selectedInstructor, setSelectedInstructor] = useState<Instructor | null>(null);

  // error state for course and section creation
  const [courseErrors, setCourseErrors] = useState<{[k: string]: string | undefined}>({});
  const [sectionErrors, setSectionErrors] = useState<{[k: string]: string | undefined}>({});


  // Dept Code options for section creation
  const [deptCodeOptions, setDeptCodeOptions] = useState<string[]>([]);
  useEffect(() => {
    if (mode === 'section') {
      const token = localStorage.getItem('token') || undefined;
      getAllDeptCodes(token)
        .then((codes) => {
          if (Array.isArray(codes)) {
            setDeptCodeOptions(codes);
          } else if (codes && Array.isArray(codes.data)) {
            setDeptCodeOptions(codes.data);
          } else {
            setDeptCodeOptions([]);
          }
        })
        .catch(() => setDeptCodeOptions([]));
    }
  }, [mode, refreshOptions]);


  const handleChange = <K extends keyof CreateSectionData>(
    key: K,
    val: CreateSectionData[K]
  ) => {
    setForm(f => ({ ...f, [key]: val }))
  }

  // update one schedule row
  const updateSchedule = (
    idx: number,
    partial: Partial<SectionScheduleInput>
  ) => {
    setForm(f => {
      const schedules = f.sectionSchedules ? f.sectionSchedules.map((s, i) =>
        i === idx ? { ...s, ...partial } : s
      ) : [];
      return { ...f, sectionSchedules: schedules }
    })
  }

  const addSchedule = () => {
    setForm(f => ({
      ...f,
      sectionSchedules: [
        ...(f.sectionSchedules ?? []),
        { day: '', startTime: '', endTime: '' }
      ]
    }))
  }

  const removeSchedule = (idx: number) => {
    setForm(f => ({
      ...f,
      sectionSchedules: f.sectionSchedules?.filter((_, i) => i !== idx)
    }))
  }

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (mode === 'course' || (mode === undefined && form.isCourse)) {
      const { errors } = validateCourseProfile({
        name: form.name ?? '',
        deptCode: form.deptCode,
        courseNum: form.courseNum,
      });
      // Map errors to fields
      const errMap: {[k: string]: string} = {};
      errors.forEach(msg => {
        if (msg.toLowerCase().includes('course name')) errMap.name = msg;
        if (msg.toLowerCase().includes('department code')) errMap.deptCode = msg;
        if (msg.toLowerCase().includes('course number')) errMap.courseNum = msg;
      });
      setCourseErrors(errMap);
      setSectionErrors({});
      if (errors.length > 0) return;
    } else if (mode === 'section' || (mode === undefined && !form.isCourse)) {
      // Section Creation: validate deptCode, courseNum, section, type, semester, and year
      const { errors } = validateCourseProfile({
        deptCode: form.deptCode,
        courseNum: form.courseNum,
      }, { skipName: true });
      const errMap: {[k: string]: string} = {};
      errors.forEach(msg => {
        if (msg.toLowerCase().includes('department code')) errMap.deptCode = msg;
        if (msg.toLowerCase().includes('course number')) errMap.courseNum = msg;
      });
      // Custom validation for section, type, semester, and year
      if (!form.section || form.section.trim() === '') {
        errMap.section = 'Section code is required.';
      }
      if (!form.type || String(form.type).trim() === '') {
        errMap.type = 'Section type is required.';
      }
      if (!form.semester || form.semester.trim() === '') {
        errMap.semester = 'Semester is required.';
      }
      if (form.year === null || form.year === undefined || String(form.year).trim() === '') {
        errMap.year = 'Year is required.';
      }
      setSectionErrors(errMap);
      setCourseErrors({});
      if (Object.keys(errMap).length > 0) return;
    }
    setCourseErrors({});
    setSectionErrors({});
    // Convert empty string or missing values to undefined before sending
    const cleanedForm = {
      ...form,
      section: form.section && form.section.trim() !== '' ? form.section : undefined,
      year: form.year !== null && form.year !== undefined && String(form.year).trim() !== '' ? form.year : undefined,
      semester: form.semester && form.semester.trim() !== '' ? form.semester : undefined,
      type: form.type && String(form.type).trim() !== '' ? form.type : undefined,
      instructorId: selectedInstructor?.id ?? undefined,
      sectionSchedules: (form.sectionSchedules && form.sectionSchedules.length > 0)
        ? form.sectionSchedules
        : undefined,
    };
    // onCreateSection returns a Promise<boolean> for section mode
    if (mode === 'section') {
      const result = await onCreateSection(cleanedForm, setSectionErrors);
      if (result === true) {
        setForm(initialForm); // reset only on success
        setSectionErrors({});
      }
    } else {
      onCreateSection(cleanedForm);
    }
  }

  // disable flag
  const disabled = form.isCourse

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {mode === undefined && (
        <label className="inline-flex items-center gap-2">
          <input
            type="checkbox"
            checked={form.isCourse}
            onChange={e => {
              const isCourse = e.target.checked
              setForm(f => ({
                ...f,
                isCourse,
                ...(isCourse
                  ? {
                    section: null,
                    year: null,
                    semester: null,
                    type: null,
                    instructorId: null,
                    sectionSchedules: null
                  }
                  : {})
              }))
            }}
          />
          <span>Create a course</span>
        </label>
      )}

      {/* Show required info for Section Creation (no Course Name field) */}
      {mode === 'section' && (
        <div className="mb-2 text-sm text-gray-500">
          Dept Code, Course Num, Section Code, Year, Semester, and Section Type are required fields for section creation.<br />
          <span className="text-gray-400">
            You can create the section without entering Instructor ID or Section Schedules. These fields are optional and can be edited later.<br />
          </span>
        </div>
      )}

      {/* Show Course Name field for Course Creation (required) */}
      {mode === 'course' && (
        <div>
          <label htmlFor='name' className="text-sm block mb-1">Course Name{' '}<span className="text-red-500">*</span></label>
          <input
            id="name"
            value={form.name ?? ""}
            onChange={e => {
              handleChange('name', e.target.value);
              if (courseErrors.name) setCourseErrors(errors => ({ ...errors, name: undefined }));
            }}
            className={`w-full border rounded px-2 py-1${courseErrors.name ? ' border-red-500' : ''}`}
            placeholder='e.g. Introduction to Computer Science'
          />
          {courseErrors.name && (
            <div className="text-red-600 text-xs mt-1">{courseErrors.name}</div>
          )}
        </div>
      )}

      {/* (Removed duplicate Section Creation info message) */}
      <div>
        <label htmlFor="deptCode" className="text-sm block mb-1">
          Dept Code{' '}<span className="text-red-500">*</span>
        </label>
        {mode === 'section' ? (
          <select
            id="deptCode"
            value={form.deptCode}
            onChange={e => {
              handleChange('deptCode', e.target.value);
              if (sectionErrors.deptCode) setSectionErrors(errors => ({ ...errors, deptCode: undefined }));
            }}
            className={`w-full border rounded px-2 py-1${sectionErrors.deptCode ? ' border-red-500' : ''}`}
          >
            <option value="">-- Select Dept Code --</option>
            {deptCodeOptions.map(code => (
              <option key={code} value={code}>{code}</option>
            ))}
          </select>
        ) : (
          <input
            id="deptCode"
            value={form.deptCode}
            onChange={e =>  {
              handleChange('deptCode', e.target.value);
              if (courseErrors.deptCode) setCourseErrors(errors => ({ ...errors, deptCode: undefined }));
            }}
            className={`w-full border rounded px-2 py-1${courseErrors.deptCode ? ' border-red-500' : ''}`}
            placeholder=" e.g. COSC"
          />
        )}
        {mode === 'course' && courseErrors.deptCode && (
          <div className="text-red-600 text-xs mt-1">{courseErrors.deptCode}</div>
        )}
        {mode === 'section' && sectionErrors.deptCode && (
          <div className="text-red-600 text-xs mt-1">{sectionErrors.deptCode}</div>
        )}
      </div>
      <div>
        <label htmlFor='courseNum' className="text-sm block mb-1">
          Course Num{' '}<span className="text-red-500">*</span>
        </label>
        {mode === 'section' ? (
          <select
            id="courseNum"
            value={form.courseNum}
            onChange={e => {
              handleChange('courseNum', e.target.value);
              if (sectionErrors.courseNum) setSectionErrors(errors => ({ ...errors, courseNum: undefined }));
            }}
            className={`w-full border rounded px-2 py-1${sectionErrors.courseNum ? ' border-red-500' : ''}`}
            disabled={!form.deptCode}
          >
            {!form.deptCode ? (
              <option value="" disabled>
                Please select Dept Code first
                {/* Select Dept Code first */}
              </option>
            ) : (
              <option value="">-- Select Course Num --</option>
            )}
            {form.deptCode && courseNumOptions.map(num => (
              <option key={num} value={num}>{num}</option>
            ))}
          </select>
        ) : (
          <input
            id="courseNum"
            value={form.courseNum}
            onChange={e =>  {
              handleChange('courseNum', e.target.value);
              if (courseErrors.courseNum) setCourseErrors(errors => ({ ...errors, courseNum: undefined }));
            }}
            className={`w-full border rounded px-2 py-1${courseErrors.courseNum ? ' border-red-500' : ''}`}
            placeholder='e.g. 499'
          />
        )}
        {mode === 'course' && courseErrors.courseNum && (
          <div className="text-red-600 text-xs mt-1">{courseErrors.courseNum}</div>
        )}
        {mode === 'section' && sectionErrors.courseNum && (
          <div className="text-red-600 text-xs mt-1">{sectionErrors.courseNum}</div>
        )}
      </div>

      {/* Only show section-related fields in section mode or when mode is undefined (legacy) */}
      {(mode === 'section' || mode === undefined) && (
        <fieldset disabled={disabled} className="space-y-4">
          <div>
            <label htmlFor='sectionCode' className="text-sm block mb-1">Section Code <span className="text-red-500">*</span></label>
            <input
              id="sectionCode"
              value={form.section ?? ""}
              onChange={e => 
                handleChange('section', e.target.value)
              }
              className={`w-full border rounded px-2 py-1${sectionErrors.section ? ' border-red-500' : ''} disabled:bg-gray-100 disabled:cursor-not-allowed`}
              placeholder="e.g. L01 or 001"
            />
            {sectionErrors.section && (
              <div className="text-red-600 text-xs mt-1">{sectionErrors.section}</div>
            )}
          </div>
          <div>
            <label htmlFor='year' className="text-sm block mb-1">Year <span className="text-red-500">*</span></label>
            <input
              id='year'
              type="number"
              value={form.year ?? ''}
              onChange={e => 
                handleChange(
                  'year',
                  e.target.value
                    ? Number(e.target.value)
                    : null
                )
              }
              className={`w-full border rounded px-2 py-1${sectionErrors.year ? ' border-red-500' : ''} disabled:bg-gray-100 disabled:cursor-not-allowed`}
              placeholder="e.g. 2025"
            />
            {sectionErrors.year && (
              <div className="text-red-600 text-xs mt-1">Year is required.</div>
            )}
          </div>
          <div>
            <label htmlFor="semester" className="text-sm block mb-1">Semester <span className="text-red-500">*</span></label>
            <select
              id="semester"
              value={form.semester ?? ""}
              onChange={e =>  
                handleChange('semester', e.target.value)
              }
              className={`w-full border rounded px-2 py-1${sectionErrors.semester ? ' border-red-500' : ''} disabled:bg-gray-100 disabled:cursor-not-allowed`}
            >
              <option value="">Select…</option>
              <option value="W1">W1</option>
              <option value="W2">W2</option>
              <option value="S1">S1</option>
              <option value="S2">S2</option>
            </select>
            {sectionErrors.semester && (
              <div className="text-red-600 text-xs mt-1">Semester is required.</div>
            )}
          </div>
          <div>
            <label htmlFor='type' className="text-sm block mb-1">Section Type <span className="text-red-500">*</span></label>
            <select
              id="type"
              value={form.type ?? ""}
              onChange={(e) => {
                const val = e.target.value;
                handleChange("type", val === "" ? null : val as SectionType);
              }
              }
              className={`w-full border rounded px-2 py-1${sectionErrors.type ? ' border-red-500' : ''} disabled:bg-gray-100 disabled:cursor-not-allowed`}
            >
              <option value="">Select…</option>
              {sectionTypeOptions.map(t => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
            {sectionErrors.type && (
              <div className="text-red-600 text-xs mt-1">Section type is required.</div>
            )}
          </div>
          <div>
            <label htmlFor='instructorId' className="text-sm block mb-1">Instructor ID</label>
            {selectedInstructor ? (
              <div className="flex items-center justify-between bg-slate-50 px-3 py-2 rounded">
                <span>
                  {selectedInstructor.firstName} {selectedInstructor.lastName}
                </span>
                <button
                  type="button"
                  onClick={() => setSelectedInstructor(null)}
                  className="text-red-600 hover:underline text-sm"
                >
                  Clear
                </button>
              </div>
            ) : (
              <div className="w-full max-w-full min-w-0">
                <p className="text-sm text-gray-400">Search for an Instructor and click on SELECT in the far right column. Don't select any Instructor, if you wish not to change instructors.</p>
                <UserBrowsingViewer
                  mode="select"
                  onSelect={u => setSelectedInstructor(u)}
                  allowedRoles={["Instructor"]}
                  askForConfirmation={true}
                />
                <div className="h-4" />
              </div>
            )}
          </div>

          {/* schedules */}
          <div className="space-y-2">
            <h3 className="font-medium">Section Schedules</h3>
            {form.sectionSchedules && form.sectionSchedules.map((sched, i) => (
              <div
                key={i}
                className="grid grid-cols-4 gap-2 items-end "
              >
                <div>
                  <label className="text-sm block mb-1">Day</label>
                  <select
                    value={sched.day}
                    onChange={e =>  
                      updateSchedule(i, { day: e.target.value })
                    }
                    className="w-full border rounded px-2 py-1 disabled:bg-gray-100 disabled:cursor-not-allowed"
                  >
                    <option value="">—</option>
                    {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(
                      d => (
                        <option key={d} value={d}>
                          {d}
                        </option>
                      )
                    )}
                  </select>
                </div>
                <div>
                  <label className="text-sm block mb-1">Start</label>
                  <select
                    value={sched.startTime}
                    onChange={e =>  
                      updateSchedule(i, {
                        startTime: e.target.value
                      })
                    }
                    className="w-full border rounded px-2 py-1 disabled:bg-gray-100 disabled:cursor-not-allowed"
                  >
                    <option value="">—</option>
                    {timeOptions.map(t => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-sm block mb-1">End</label>
                  <select
                    value={sched.endTime}
                    onChange={e =>   
                      updateSchedule(i, { endTime: e.target.value })
                    }
                    className="w-full border rounded px-2 py-1 disabled:bg-gray-100 disabled:cursor-not-allowed"
                  >
                    <option value="">—</option>
                    {timeOptions.map(t => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>
                <button
                  type="button"
                  onClick={() => removeSchedule(i)}
                  className="text-red-600 hover:text-red-100"
                >
                  Remove
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={addSchedule}
              className="text-[#040941] hover:text-[#040491]"
            >
              + Add a Schedule
            </button>
          </div>
        </fieldset>
      )}

      <div className="flex gap-3">
        <button
          type="submit"
          className="bg-[#040941] text-white px-4 py-1 rounded hover:bg-[#232a5c] transition-colors flex-1"
        >
          {mode === 'course' ? 'Create Course' : mode === 'section' ? 'Create Section' : 'Create Section'}
        </button>
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="bg-transparent hover:bg-red-100 transition-colors px-4 py-1 rounded flex-1"
        >
          Cancel
        </button>
      </div>
    </form>
  )
}