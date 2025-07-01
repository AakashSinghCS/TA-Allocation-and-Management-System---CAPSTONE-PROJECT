import { useState, type FormEvent } from 'react';
import { sectionTypeOptions, type SectionType } from '../../../../interfaces/section/SectionDetails';
import { timeOptions } from '../../../ui/timeselector/TimeSelector';
import { useNavigate } from 'react-router-dom';
import UserBrowsingViewer from '../../../../pages/userbrowsingpage/userbrowsingviewer/UserBrowsingViewer';
import type { Instructor } from '../../../../interfaces/user/Instructor';
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
  onCreateSection: (data: CreateSectionData) => void;
}

export default function CreateSectionForm({ onCreateSection }: { onCreateSection: (data: CreateSectionData) => void }) {
  const navigate = useNavigate()
  const [selectedInstructor, setSelectedInstructor] = useState<Instructor | null>(null);
  // form state
  const [form, setForm] = useState<CreateSectionData>({
    name: null,
    deptCode: '',
    courseNum: '',
    section: null,
    year: null,
    semester: null,
    type: null,
    instructorId: null,
    sectionSchedules: null,
    isCourse: false
  })

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

  const onSubmit = (e: FormEvent) => {
    e.preventDefault()
    onCreateSection({ ...form, instructorId: selectedInstructor?.id })
  }

  // disable flag
  const disabled = form.isCourse

  return (
    <form onSubmit={onSubmit} className="space-y-4">
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

      {/* always enabled */}
      <div>
        <label htmlFor='name'>Name</label>
        <input
          id="name"
          value={form.name ?? ""}
          onChange={e => handleChange('name', e.target.value)}
          className="w-full border rounded px-2 py-1"
          placeholder='e.g. Introduction to Computer ...'
        />
      </div>
      <div>
        <label htmlFor="deptCode">Dept Code</label>
        <input
          id="deptCode"
          value={form.deptCode}
          onChange={e =>
            handleChange('deptCode', e.target.value)
          }
          className="w-full border rounded px-2 py-1"
          placeholder=" e.g. COSC"
        />
      </div>
      <div>
        <label htmlFor='courseNum'>Course Num</label>
        <input
          id="courseNum"
          value={form.courseNum}
          onChange={e =>
            handleChange('courseNum', e.target.value)
          }
          className="w-full border rounded px-2 py-1"
          placeholder='e.g. 499'
        />
      </div>

      {/* everything below is disabled when isCourse===true */}
      <fieldset disabled={disabled} className="space-y-4">
        <div>
          <label htmlFor='sectionCode'>Section Code</label>
          <input
            id="sectionCode"
            value={form.section ?? ""}
            onChange={e =>
              handleChange('section', e.target.value)
            }
            className="w-full border rounded px-2 py-1 disabled:bg-gray-100 disabled:cursor-not-allowed"
            placeholder="e.g. L01 or 001"
          />
        </div>
        <div>
          <label htmlFor='year'>Year</label>
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
            className="w-full border rounded px-2 py-1 disabled:bg-gray-100 disabled:cursor-not-allowed"
            placeholder="e.g. 2024"
          />
        </div>
        <div>
          <label htmlFor="semester">Semester</label>
          <select
            id="semester"
            value={form.semester ?? ""}
            onChange={e =>
              handleChange('semester', e.target.value)
            }
            className="w-full border rounded px-2 py-1 disabled:bg-gray-100 disabled:cursor-not-allowed"
          >
            <option value="">Select…</option>
            <option value="W1">W1</option>
            <option value="W2">W2</option>
            <option value="S1">S1</option>
            <option value="S2">S2</option>
          </select>
        </div>
        <div>
          <label htmlFor='type'>Section Type</label>
          <select
            id="type"
            value={form.type ?? ""}
            onChange={(e) => {
              const val = e.target.value;
              handleChange("type", val === "" ? null : val as SectionType);
            }
            }
            className="w-full border rounded px-2 py-1 disabled:bg-gray-100 disabled:cursor-not-allowed"
          >
            <option value="">Select…</option>
            {sectionTypeOptions.map(t => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor='instructorId'>Instructor ID</label>
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
            <div>
              <p className="text-sm text-gray-400">Search for an Instructor and click on SELECT in the far right column. Don't select any Instructor, if you wish not to change instructors.</p>
              <UserBrowsingViewer
                mode="select"
                onSelect={u => setSelectedInstructor(u)}
                allowedRoles={["Instructor"]}
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
                <label>Day</label>
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
                <label>Start</label>
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
                <label>End</label>
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
                className="text-red-600 mt-6"
              >
                Remove
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={addSchedule}
            className="text-blue-600"
          >
            + Add a Schedule
          </button>
        </div>
      </fieldset>

      <div className="flex gap-3">
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded flex-1"
        >
          Create Section
        </button>
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="bg-red-600 text-white px-4 py-2 rounded flex-1"
        >
          Cancel
        </button>
      </div>
    </form>
  )
}