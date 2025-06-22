import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import FullCalendar from '@fullcalendar/react';
import type { DateSelectArg, EventClickArg } from '@fullcalendar/core';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import mockCourseList from '../../mocked-objects/mockCourses';

type Day =
  | 'MONDAY'
  | 'TUESDAY'
  | 'WEDNESDAY'
  | 'THURSDAY'
  | 'FRIDAY'
  | 'SATURDAY'
  | 'SUNDAY';

interface Availability {
  id: string;
  day: Day;
  startTime: string; // "HH:mm"
  endTime: string;   // "HH:mm"
}

const dayMap: { [k: number]: Day } = {
  0: 'SUNDAY',
  1: 'MONDAY',
  2: 'TUESDAY',
  3: 'WEDNESDAY',
  4: 'THURSDAY',
  5: 'FRIDAY',
  6: 'SATURDAY',
};

const getDateForDay = (day: Day, time: string): string => {
  const [hours, minutes] = time.split(':').map(Number);
  const now = new Date();
  const targetDay = (Object.values(dayMap) as Day[]).indexOf(day);
  const diff = targetDay - now.getDay();
  const dt = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate() + diff,
    hours,
    minutes
  );
  return dt.toISOString();
};
// 1) At the top of your file (or in a utils file)
const colorByDay: Record<Day, string> = {
  SUNDAY:    '#FCD34D', // amber-400
  MONDAY:    '#F87171', // red-400
  TUESDAY:   '#FB923C', // orange-400
  WEDNESDAY: '#34D399', // emerald-400
  THURSDAY:  '#A78BFA', // violet-400
  FRIDAY:    '#F472B6', // pink-400
  SATURDAY:  '#4ADE80', // green-400
 
};

const ApplicationPage: React.FC = () => {
  const [formData, setFormData] = useState({
    firstPreference: '',
    secondPreference: '',
    thirdPreference: '',
    wantWorkingHours: '',
    wantRemote: '',
    transcriptFile: null as File | null,
    confirmProfileUpdated: false,
  });

  const [availability, setAvailability] = useState<Availability[]>([]);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [submitted, setSubmitted] = useState(false);
  const [visibleEndHour, setVisibleEndHour] = useState(24); 
  const navigate = useNavigate();
  const calendarRef = useRef<FullCalendar>(null);

  // Handle text/select/file/checkbox changes
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type, checked, files } = e.target as HTMLInputElement;
    if (type === 'checkbox' && name === 'confirmProfileUpdated') {
      setFormData(prev => ({ ...prev, confirmProfileUpdated: checked }));
    } else if (type === 'file') {
      setFormData(prev => ({
        ...prev,
        transcriptFile: files && files.length > 0 ? files[0] : null,
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
    setErrors(prev => ({ ...prev, [name]: '' }));
  };

  // When user drags to select a slot
  const handleDateSelect = (selectInfo: DateSelectArg) => {
    const start = selectInfo.start;
    const end = selectInfo.end;
    const day = dayMap[start.getDay()];
    const startTime = start.toLocaleTimeString('en-GB', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
    });
    const endTime = end.toLocaleTimeString('en-GB', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
    });
    const id = `${day}-${startTime}-${endTime}`;
    setAvailability(prev => [...prev, { id, day, startTime, endTime }]);
    selectInfo.view.calendar.unselect(); // clear the drag highlight
  };

  // Clicking an existing event removes it
  const handleEventClick = (clickInfo: EventClickArg) => {
    const id = clickInfo.event.id;
    clickInfo.event.remove();
    setAvailability(prev => prev.filter(av => av.id !== id));
  };

  // Final form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: { [key: string]: string } = {};
    if (!formData.firstPreference)
      newErrors.firstPreference = '1st preference is required.';
    if (!availability.length)
      newErrors.availability = 'Please pick at least one availability slot.';
    if (!formData.wantWorkingHours)
      newErrors.wantWorkingHours = 'Hours requested is required.';
    if (!formData.wantRemote)
      newErrors.wantRemote = 'Select a remote work preference.';
    if (!formData.transcriptFile)
      newErrors.transcriptFile = 'Upload your transcript.';
    if (!formData.confirmProfileUpdated)
      newErrors.confirmProfileUpdated =
        'Please confirm profile update.';

    if (Object.keys(newErrors).length) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setSubmitted(true);
    // TODO: send formData + availability to your backend here
  };

  return (
    <div className="min-h-screen px-2 sm:px-6 py-12 bg-[#f4f6fc]">
      <div className="max-w-[1100px] mx-auto">
        <h1 className="text-4xl font-bold text-[#040941] mb-10">
          TA Application Submission
        </h1>

        <div className="grid grid-cols-1 sm:grid-cols-[1fr_320px] gap-14">
          <form onSubmit={handleSubmit} className="space-y-12">
            {/* Course Preferences */}
            <section>
              <h2 className="text-xl font-semibold mb-4">
                Course Preferences
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {(
                  ['firstPreference', 'secondPreference', 'thirdPreference'] as const
                ).map(pref => (
                  <div key={pref}>
                    <label className="block mb-1 font-medium">
                      {pref === 'firstPreference'
                        ? '1st Preference*'
                        : pref === 'secondPreference'
                        ? '2nd Preference*'
                        : '3rd Preference*'}
                    </label>
                    <select
                      name={pref}
                      value={(formData as any)[pref]}
                      onChange={handleChange}
                      className="w-full border rounded px-3 py-2"
                    >
                      <option value="">Select</option>
                      {mockCourseList.map(course => (
                        <option key={course} value={course}>
                          {course}
                        </option>
                      ))}
                    </select>
                    {errors[pref] && (
                      <p className="text-sm text-red-600 mt-1">
                        {errors[pref]}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </section>

            {/* Hours Requested */}
            <section>
              <label className="block mb-2 font-medium">
                Hours Requested*
              </label>
              <input
                type="number"
                name="wantWorkingHours"
                value={formData.wantWorkingHours}
                onChange={handleChange}
                className="w-full border rounded px-3 py-2"
                placeholder="Enter hours"
              />
              {errors.wantWorkingHours && (
                <p className="text-sm text-red-600 mt-1">
                  {errors.wantWorkingHours}
                </p>
              )}
            </section>

            {/* Transcript Upload */}
            <section>
              <label className="block mb-2 font-medium">
                Upload Transcript*
              </label>
              <div className="flex items-center gap-3">
                <label className="bg-[#040941] text-white px-6 py-2 rounded cursor-pointer hover:bg-[#030735]">
                  Choose File
                  <input
                    type="file"
                    name="transcriptFile"
                    accept=".pdf,.doc,.docx"
                    onChange={handleChange}
                    className="hidden"
                  />
                </label>
                <input
                  type="text"
                  readOnly
                  value={formData.transcriptFile?.name || ''}
                  placeholder="No file chosen"
                  className="flex-1 px-3 py-2 text-green-600 bg-white"
                />
              </div>
              {errors.transcriptFile && (
                <p className="text-sm text-red-600 mt-1">
                  {errors.transcriptFile}
                </p>
              )}
            </section>

            {/* Remote Preference */}
            <section>
              <label className="block mb-2 font-medium">
                Remote Work Preference*
              </label>
              <div className="flex gap-6">
                {(['yes', 'no', 'no-preference'] as const).map(option => (
                  <label key={option} className="inline-flex items-center">
                    <input
                      type="radio"
                      name="wantRemote"
                      value={option}
                      checked={formData.wantRemote === option}
                      onChange={handleChange}
                      className="mr-2"
                    />
                    {option === 'no-preference'
                      ? 'No Preference'
                      : option.charAt(0).toUpperCase() +
                        option.slice(1)}
                  </label>
                ))}
              </div>
              {errors.wantRemote && (
                <p className="text-sm text-red-600 mt-1">
                  {errors.wantRemote}
                </p>
              )}
            </section>
           {/* --- Availability  --- */}
            <section>
              <h2 className="text-xl font-semibold mb-2">Availability*</h2>
              <div className="bg-white rounded shadow p-2 h-[400px] overflow-y-auto">
                <FullCalendar
                  ref={calendarRef as any}
                  plugins={[timeGridPlugin, interactionPlugin]}
                  initialView="timeGridWeek"
                  allDaySlot={false}
                  headerToolbar={false}
                  slotMinTime="06:00:00"
                  slotMaxTime={`${visibleEndHour}:00:00`}
                  height="100%"
                  selectable
                  selectMirror
                  select={handleDateSelect}
                  eventClick={handleEventClick}
                  events={availability.map(av => ({
                    id: av.id,
                    start: getDateForDay(av.day, av.startTime),
                    end: getDateForDay(av.day, av.endTime),
                    backgroundColor: colorByDay[av.day],
                    borderColor:     colorByDay[av.day],
                  }))}
                  dayHeaderFormat={{ weekday: 'long' }}
                />
              </div>
              {errors.availability && (
                <p className="text-sm text-red-600 mt-1">
                  {errors.availability}
                </p>
              )}
            </section>


            {/* Profile Confirmation */}
            <section className="flex items-start">
              <input
                type="checkbox"
                name="confirmProfileUpdated"
                checked={formData.confirmProfileUpdated}
                onChange={handleChange}
                className="mt-1 mr-2"
              />
              <span className="text-sm text-gray-700">
                I confirm that I have updated my profile, as it will be
                used in the TA allocation decision process.*
              </span>
            </section>
            {errors.confirmProfileUpdated && (
              <p className="text-sm text-red-600 mt-1">
                {errors.confirmProfileUpdated}
              </p>
            )}

            {/* Buttons */}
            <div className="flex justify-end gap-4 pt-4">
              <button
                type="button"
                className="px-5 py-2 border border-gray-400 text-gray-700 rounded hover:bg-gray-100"
                onClick={() => navigate(-1)}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2 bg-[#040941] text-white rounded hover:bg-[#030735]"
              >
                Submit
              </button>
            </div>

            {/* Submission Summary */}
            {submitted && (
              <div className="mt-12 bg-white p-6 rounded-2xl shadow-md border-t-[6px] border-[#040941]">
                <h2 className="text-2xl font-bold text-[#040941] mb-6 text-center">
                  Application Submitted!
                </h2>
                
                  {/* Prefs / Hours / Remote / Transcript */}
                <div className="grid sm:grid-cols-3 gap-6 text-sm text-gray-800 mb-6">
                  {/* 1st */}
                  <div className="…">
                    <span className="text-xl font-bold text-[#040941]">
                      {formData.firstPreference}
                    </span>
                    <p className="text-gray-500">1st Preference</p>
                  </div>
                  {/* 2nd */}
                  <div className="…">
                    <span className="text-xl font-bold text-[#040941]">
                      {formData.secondPreference}
                    </span>
                    <p className="text-gray-500">2nd Preference</p>
                  </div>
                  {/* 3rd */}
                  <div className="…">
                    <span className="text-xl font-bold text-[#040941]">
                      {formData.thirdPreference}
                    </span>
                    <p className="text-gray-500">3rd Preference</p>
                  </div>
                  {/* Hours */}
                  <div className="…">
                    <span className="text-xl font-bold text-[#040941]">
                      {formData.wantWorkingHours} hrs
                    </span>
                    <p className="text-gray-500">Requested Hours</p>
                  </div>
                  {/* Remote */}
                  <div className="…">
                    <span className="text-xl font-bold text-[#040941] capitalize">
                      {formData.wantRemote}
                    </span>
                    <p className="text-gray-500">Remote Work</p>
                  </div>
                  {/* Transcript */}
                  <div className="…">
                    <span className="text-sm font-medium text-[#040941]">
                      {formData.transcriptFile?.name ?? 'No file'}
                    </span>
                    <p className="text-gray-500">Transcript</p>
                  </div>
                </div>
                {/* Availability Summary */}
                <div className="mb-6">
                  <h3 className="font-semibold mb-2">Your Availability:</h3>
                  <div className="flex flex-wrap gap-4">
                    {availability.map(av => (
                      <div
                        key={av.id}
                        className="flex flex-col items-center text-center bg-[#f4f6fc] rounded-xl p-4"
                      >
                        <span className="text-[#040941] text-lg font-bold">
                          {av.day}
                        </span>
                        <span className="text-gray-500">
                          {av.startTime} – {av.endTime}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </form>

          {/* Sidebar Progress Tracker */}
          <aside className="hidden sm:block w-[320px] self-start bg-white border border-blue-200 shadow-md p-6 rounded-xl">
            <h3 className="text-lg font-semibold text-[#040941] mb-4">
              Application Steps
            </h3>
            <ul className="space-y-6 text-sm text-gray-700">
              {[
                {
                  label: 'Select Preferences',
                  description: 'Choose your top 3 course preferences.',
                  done:
                    !!formData.firstPreference &&
                    !!formData.secondPreference &&
                    !!formData.thirdPreference,
                },
                {
                  label: 'Add Working Hours',
                  description: 'Indicate how many hours you wish to work.',
                  done: !!formData.wantWorkingHours,
                },
                {
                  label: 'Upload Transcript',
                  description: 'Attach a valid transcript file.',
                  done: !!formData.transcriptFile,
                },
                {
                  label: 'Select Availability',
                  description: 'Pick at least one available time slot.',
                  done: availability.length > 0,
                },
                {
                  label: 'Confirm Profile Update',
                  description: 'Acknowledge your profile is up-to-date.',
                  done: formData.confirmProfileUpdated,
                },
                {
                  label: 'Submit Application',
                  description: 'Click submit once all sections are complete.',
                  done: submitted,
                },
              ].map((step, idx) => (
                <li key={idx} className="flex items-start gap-3">
                  <div
                    className={`h-6 w-6 flex items-center justify-center rounded-full border-2 ${
                      step.done
                        ? 'bg-green-500 border-green-500'
                        : 'border-gray-300'
                    }`}
                  >
                    {step.done ? (
                      <svg
                        className="h-4 w-4 text-white"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={3}
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    ) : (
                      <div className="h-2 w-2 bg-gray-300 rounded-full" />
                    )}
                  </div>
                  <span>
                    <strong>{step.label}</strong>
                    <br />
                    {step.description}
                  </span>
                </li>
              ))}
            </ul>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default ApplicationPage;
