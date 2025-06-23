import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import FullCalendar from '@fullcalendar/react';
import type { DateSelectArg, EventClickArg } from '@fullcalendar/core';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import mockSubjectList from '../../mocked-objects/mockSubjects';
import { useAuth } from '../../context/AuthContext';
import type { ApplicationRequest, ApplicationDto} from '../../interfaces/application/Application';
import { fetchExistingApplication } from '../../api/application/FetchExistingApplication';

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

const colorByDay: Record<Day, string> = {
  SUNDAY:    '#FCD34D',
  MONDAY:    '#F87171',
  TUESDAY:   '#FB923C',
  WEDNESDAY: '#34D399',
  THURSDAY:  '#A78BFA',
  FRIDAY:    '#F472B6',
  SATURDAY:  '#4ADE80',
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
  const [savedApp, setSavedApp] = useState<ApplicationDto | null>(null);
  const [visibleEndHour, setVisibleEndHour] = useState(18);
  const navigate = useNavigate();
const calendarRef = useRef<FullCalendar>(null);
const { token, userId, userRoles } = useAuth();
const [isModalOpen, setIsModalOpen] = useState(false);

useEffect(() => {
  async function loadExisting() {
    const year = new Date().getFullYear();
    if (userId !== null && token) {
      const result = await fetchExistingApplication(Number(userId), year, token, userRoles);
      if (result) setSavedApp(result);
    }
  }
  if (userId !== null && token) loadExisting();
}, [userId, token, userRoles]);


  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type, checked, files } = e.target as HTMLInputElement;
    if (type === 'checkbox' && name === 'confirmProfileUpdated') {
      setFormData(prev => ({ ...prev, confirmProfileUpdated: checked }));
    } else if (type === 'file') {
      setFormData(prev => ({
        ...prev,
        transcriptFile: files?.[0] ?? null,
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
    setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleDateSelect = (info: DateSelectArg) => {
    const day = dayMap[info.start.getDay()];
    const startTime = info.start.toLocaleTimeString('en-GB', {
      hour12: false, hour: '2-digit', minute: '2-digit'
    });
    const endTime = info.end.toLocaleTimeString('en-GB', {
      hour12: false, hour: '2-digit', minute: '2-digit'
    });
    const id = `${day}-${startTime}-${endTime}`;
    setAvailability(prev => [...prev, { id, day, startTime, endTime }]);
    info.view.calendar.unselect();
  };

  const handleEventClick = (info: EventClickArg) => {
    const id = info.event.id;
    info.event.remove();
    setAvailability(prev => prev.filter(av => av.id !== id));
  };

 const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  // client-side validation ---
  const newErrors: { [k: string]: string } = {};
  if (!formData.firstPreference)   newErrors.firstPreference   = '1st preference is required.';
  if (!availability.length)        newErrors.availability      = 'Pick at least one availability slot.';
  if (!formData.wantWorkingHours)  newErrors.wantWorkingHours  = 'Hours requested is required.';
  if (!formData.wantRemote)        newErrors.wantRemote        = 'Select a remote work preference.';
  if (!formData.transcriptFile)    newErrors.transcriptFile    = 'Upload your transcript.';
  if (!formData.confirmProfileUpdated)
                                   newErrors.confirmProfileUpdated = 'Please confirm profile update.';

  if (Object.keys(newErrors).length) {
    setErrors(newErrors);
    return;
  }

  setErrors({});
  setSubmitted(true);

  //assemble our payload
  const payload: ApplicationRequest = {
    preferences: [
      formData.firstPreference,
      formData.secondPreference,
      formData.thirdPreference
    ].filter(p => p),
    wantRemote: formData.wantRemote === 'yes',
    wantWorkingHours: Number(formData.wantWorkingHours),
    availabilities: availability.map(av => ({
      day: av.day,
      startTime: av.startTime,
      endTime: av.endTime
    })),
  };

  // preparing URLs & headers
  const addUrl    = 'http://localhost:8080/applications/add';
  const updateUrl = `http://localhost:8080/applications/update/${userId}`;
  const rolesHeader = userRoles
    .map(r => r.startsWith('ROLE_') ? r : `ROLE_${r}`)
    .join(',');

  const commonHeaders = {
    'Content-Type':  'application/json',
    'Authorization': `Bearer ${token}`,
    'X-User-Id':     userId.toString(),
    'X-User-Roles':  rolesHeader
  };

  try {
    let resp = await fetch(addUrl, {
      method: 'POST',
      headers: commonHeaders,
      body: JSON.stringify(payload),
    });

    // if duplicate‐year error, fall back to PUT update
    if (resp.status === 400) {
      const errTxt = await resp.text();
      console.warn('Add failed:', errTxt);
      if (errTxt.includes('already submitted')) {
        resp = await fetch(updateUrl, {
          method: 'PUT',
          headers: commonHeaders,
          body: JSON.stringify(payload),
        });
      } else {
        console.error('Server validation failed:', errTxt);
        throw new Error(errTxt);
      }
    }
    if (!resp.ok) {
      const errTxt = await resp.text();
      console.error('Final server error:', errTxt);
      throw new Error(`HTTP ${resp.status}: ${errTxt}`);
    }

    // success! parse & store DTO
    const dto: ApplicationDto = await resp.json();
    setSavedApp(dto);

  } catch (err) {
    console.error(err);
    setErrors(prev => ({
      ...prev,
      form: 'Failed to submit application. Please try again later.'
    }));
  }
};

  return (
    <div className="min-h-screen px-2 sm:px-6 py-12 bg-[#f4f6fc]">
      <div className="max-w-[1100px] mx-auto">
        {/* Modal for previous application */}
        {isModalOpen && savedApp && (
         <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-white/20">
            <div className="bg-white rounded-lg w-full max-w-lg p-6 shadow-xl pointer-events-auto">
              <h2 className="text-2xl font-bold mb-4">Previous Application Details</h2>
              <div className="space-y-3 text-gray-800 text-sm">
                <p><strong>Student ID:</strong> {savedApp.studentId}</p>
                <p><strong>Submitted at:</strong> {new Date(savedApp.timeSubmitted).toLocaleString()}</p>
                <p><strong>Preferences:</strong> {savedApp.preferences.join(', ')}</p>
                <p><strong>Remote:</strong> {savedApp.wantRemote ? 'Yes' : 'No'}</p>
                <p><strong>Requested Hours:</strong> {savedApp.wantWorkingHours}</p>
                <div>
                  <strong>Availability:</strong>
                  <ul className="list-disc list-inside ml-4">
                    {savedApp.availabilities.map((a, i) => (
                      <li key={i}>{a.day} {a.startTime}–{a.endTime}</li>
                    ))}
                  </ul>
                </div>
              </div>
              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* only when previous application exists */}
            {savedApp && (
          <div className="mb-6 rounded-lg border-l-4 border-yellow-500 bg-yellow-100 p-3 text-yellow-800 flex items-center justify-between">
            <span>
              You’ve already submitted an application this year — editing will update your existing one.
            </span>
            <button
              onClick={() => setIsModalOpen(true)}
              className="ml-4 px-4 py-2 bg-[#040941] text-white rounded hover:bg-[#040941]/90 transition-colors"
            >
              View Details
            </button>
          </div>
        )}

      {/* heading change if exists */}
      <h1 className="text-4xl font-bold text-[#040941] mb-10">
        {savedApp ? 'Update Your TA Application' : 'TA Application Submission'}
      </h1>

        <div className="grid grid-cols-1 sm:grid-cols-[1fr_320px] gap-14">
          <div>
          <form onSubmit={handleSubmit} className="space-y-12">
            {/* Subject Preferences */}
            <section>
              <h2 className="text-xl font-semibold mb-4">Subject Preferences</h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
               {(['firstPreference','secondPreference','thirdPreference'] as const).map(pref => (
                <div key={pref}>
                  <label className="block mb-1 font-medium" htmlFor={pref}>
                    {pref === 'firstPreference' ? '1st Preference*'
                      : pref === 'secondPreference' ? '2nd Preference*'
                      : '3rd Preference*'}
                  </label>
                  <select
                    id={pref}
                    name={pref}
                    value={(formData as any)[pref]}
                    onChange={handleChange}
                    className="w-full border rounded px-3 py-2"
                  >
                    <option value="">Select</option>
                    {mockSubjectList.map(subject => (
                      <option key={subject} value={subject}>{subject}</option>
                    ))}
                  </select>
                  {errors[pref] && <p className="text-sm text-red-600 mt-1">{errors[pref]}</p>}
                </div>
              ))}
 
              </div>
            </section>

            {/* Hours Requested */}
            <section>
              <label className="block mb-2 font-medium">Hours Requested*</label>
              <input
                type="number"
                name="wantWorkingHours"
                value={formData.wantWorkingHours}
                onChange={handleChange}
                className="w-full border rounded px-3 py-2"
                placeholder="Enter hours"
              />
              {errors.wantWorkingHours && <p className="text-sm text-red-600 mt-1">{errors.wantWorkingHours}</p>}
            </section>

            {/* Transcript Upload */}
            <section>
              <label className="block mb-2 font-medium">Upload Transcript*</label>
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
                  className="flex-1 px-3 py-2 text-[#040941] bg-white"
                />
              </div>
              {errors.transcriptFile && <p className="text-sm text-red-600 mt-1">{errors.transcriptFile}</p>}
            </section>

            {/* Remote Preference */}
              <section>
                <label className="block mb-2 font-medium">Remote Work Preference*</label>
                <div className="flex gap-6">
                  {(['yes', 'no'] as const).map(option => (
                    <label key={option} className="inline-flex items-center space-x-2">
                      <input
                        type="radio"
                        name="wantRemote"
                        value={option}
                        checked={formData.wantRemote === option}
                        onChange={handleChange}
                        className="form-radio text-indigo-600"
                      />
                      <span className="capitalize">{option}</span>
                    </label>
                  ))}
                </div>
                {errors.wantRemote && (
                  <p className="text-sm text-red-600 mt-1">{errors.wantRemote}</p>
                )}
              </section>


            {/* Availability */}
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
                    end:   getDateForDay(av.day, av.endTime),
                    backgroundColor: colorByDay[av.day],
                    borderColor:     colorByDay[av.day],
                  }))}
                  dayHeaderFormat={{ weekday: 'long' }}
                />
              </div>
              {errors.availability && <p className="text-sm text-red-600 mt-1">{errors.availability}</p>}
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
                I confirm that I have updated my profile, as it will be used in the TA allocation decision process.*
              </span>
            </section>
            {errors.confirmProfileUpdated && <p className="text-sm text-red-600 mt-1">{errors.confirmProfileUpdated}</p>}

            {/* Buttons */}
            <div className="flex justify-end gap-4 pt-4">
              <button
                type="button"
                className="px-5 py-2 border border-gray-400 text-gray-700 rounded hover:bg-gray-100"
                onClick={() => navigate(-1)}
              >
                Cancel
              </button>
              {/* Change button if prev exists */}
          <button
            type="submit"
            className="px-6 py-2 bg-[#040941] text-white rounded hover:bg-[#030735]"
          >
            {savedApp ? 'Update Application' : 'Submit Application'}
          </button>
            </div>
          </form>

          {submitted && savedApp && (
            <div className="mt-12 bg-white p-6 rounded-2xl shadow-md border-t-[6px] border-[#040941]">
              <h2 className="text-2xl font-bold text-[#040941] mb-6 text-center">Your TA application has been successfully submitted and is now under review by the coordinator</h2>
              <p><strong>Student ID:</strong> {savedApp.studentId}</p>
              <p><strong>Submitted at:</strong> {new Date(savedApp.timeSubmitted).toLocaleString()}</p>

              <h3 className="mt-4 font-semibold">Subject Preferences</h3>
              <ul className="list-disc list-inside">
                {savedApp.preferences.map((c, i) => (
                  <li key={i}>{i + 1}. {c}</li>
                ))}
              </ul>

              <p className="mt-2"><strong>Remote?</strong> {savedApp.wantRemote ? 'Yes' : 'No'}</p>
              <p><strong>Hours:</strong> {savedApp.wantWorkingHours}</p>

              <h3 className="mt-4 font-semibold">Availability</h3>
              <ul className="list-disc list-inside">
                {savedApp.availabilities.map((a, i) => (
                  <li key={i}>{a.day} {a.startTime}–{a.endTime}</li>
                ))}
              </ul>
            </div>
          )}
          </div>
          {/* Sidebar Progress Tracker */}
          <aside className="hidden sm:block w-[320px] self-start bg-white border border-blue-200 shadow-md p-6 rounded-xl">
            <h3 className="text-lg font-semibold text-[#040941] mb-4">Application Steps</h3>
            <ul className="space-y-6 text-sm text-gray-700">
              {[
                {
                  label: 'Select Preferences',
                  description: 'Choose your top 3 subject preferences.',
                  done: !!formData.firstPreference && !!formData.secondPreference && !!formData.thirdPreference
                },
                {
                  label: 'Add Working Hours',
                  description: 'Indicate how many hours you wish to work.',
                  done: !!formData.wantWorkingHours
                },
                {
                  label: 'Upload Transcript',
                  description: 'Attach a valid transcript file.',
                  done: !!formData.transcriptFile
                },
                {
                  label: 'Remote Preference',
                  description: 'Select if you want to work remotely.',
                  done: !!formData.wantRemote
                },
                {
                  label: 'Select Availability',
                  description: 'Pick at least one available time slot.',
                  done: availability.length > 0
                },
                {
                  label: 'Confirm Profile Update',
                  description: 'Acknowledge your profile is up-to-date.',
                  done: formData.confirmProfileUpdated
                },
                {
                  label: 'Submit Application',
                  description: 'Click submit once all sections are complete.',
                  done: submitted
                }
              ].map((step, idx) => (
                <li key={idx} className="flex items-start gap-3">
                  <div className={`h-6 w-6 flex items-center justify-center rounded-full border-2 ${step.done ? 'bg-green-500 border-green-500' : 'border-gray-300'}`}>
                    {step.done ? (
                      <svg className="h-4 w-4 text-white" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      <div className="h-2 w-2 bg-gray-300 rounded-full" />
                    )}
                  </div>
                  <span>
                    <strong>{step.label}</strong><br/>
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
