import React, { useState, useRef, useEffect } from 'react';
import { ToastContainer, toast, Slide } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from 'react-router-dom';
import FullCalendar from '@fullcalendar/react';
import type { DateSelectArg, EventClickArg } from '@fullcalendar/core';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import mockSubjectList from '../../../mocked-objects/mockSubjects';
import { useAuth } from '../../../context/AuthContext';
import type { ApplicationRequest, ApplicationDto} from '../../../interfaces/application/Application';
import { fetchExistingApplication } from '../../../api/application/FetchExistingApplication';

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
    applicationType: '' as '' | 'UNDERGRADUATE' | 'GRADUATE',
  });
  const [availability, setAvailability] = useState<Availability[]>([]);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [submitted, setSubmitted] = useState(false);
  const [savedApp, setSavedApp] = useState<ApplicationDto | null>(null);
  const [visibleEndHour, setVisibleEndHour] = useState(18);
  const navigate = useNavigate();
const calendarRef = useRef<FullCalendar>(null);
const { token, userId, userRoles } = useAuth();
// Inline details toggle for confirmation row
const [showDetails, setShowDetails] = useState(false);

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
  if (!formData.applicationType)   newErrors.applicationType   = 'Select application type.';

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
    applicationType: formData.applicationType as 'UNDERGRADUATE' | 'GRADUATE',
  };
            {/* Application Type */}
            <section>
              <label className="block mb-2 font-medium">Application Type*</label>
              <div className="flex gap-6">
                {(['UNDERGRADUATE', 'GRADUATE'] as const).map(type => {
                  const id = `applicationType-${type.toLowerCase()}`;
                  return (
                    <label key={type} htmlFor={id} className="inline-flex items-center space-x-2">
                      <input
                        id={id}
                        type="radio"
                        name="applicationType"
                        value={type}
                        checked={formData.applicationType === type}
                        onChange={handleChange}
                        className="form-radio text-indigo-600"
                      />
                      <span className="capitalize">{type.toLowerCase()}</span>
                    </label>
                  );
                })}
              </div>
              {errors.applicationType && (
                <p className="text-sm text-red-600 mt-1">{errors.applicationType}</p>
              )}
            </section>

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
    <div className="min-h-screen px-2 sm:px-4 md:px-6 py-6 md:py-12">
      <div className="max-w-[1100px] mx-auto w-full">

        {/* always show submission confirmation if savedApp exists */}
        {savedApp && (
          <div className="mb-6 rounded-lg border-l-4 border-yellow-500 bg-yellow-100 p-3 text-yellow-800 flex items-center justify-between">
            <span>
              An application for this year has already been submitted. You can view it below — any changes you make will update it.
            </span>
          </div>
        )}

      {/* heading change if exists */}
      <h1 className="text-4xl font-bold text-[#040941] mb-10">
        {savedApp ? 'Update Your TA Application' : 'TA Application Submission'}
      </h1>

        <div className="flex flex-col-reverse lg:grid lg:grid-cols-[1fr_320px] gap-8 md:gap-12 lg:gap-14">
          <div className="w-full">
          <form onSubmit={handleSubmit} className="space-y-8 md:space-y-10 lg:space-y-12">
            
            {/* Subject Preferences */}
            <section>
              <h2 className="text-xl font-semibold mb-4">Subject Preferences</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
               {(['firstPreference','secondPreference','thirdPreference'] as const).map(pref => (
                <div key={pref}>
                  <label className="block mb-1 font-medium text-base md:text-lg" htmlFor={pref}>
                    {pref === 'firstPreference' ? '1st Preference*'
                      : pref === 'secondPreference' ? '2nd Preference*'
                      : '3rd Preference*'}
                  </label>
                  <select
                    id={pref}
                    name={pref}
                    value={(formData as any)[pref]}
                    onChange={handleChange}
                    className="w-full border rounded px-3 py-2 text-base md:text-base min-h-[36px] md:min-h-[40px]"
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
              <label className="block mb-2 font-medium text-base md:text-lg">Hours Requested*</label>
              <input
                type="number"
                name="wantWorkingHours"
                value={formData.wantWorkingHours}
                onChange={handleChange}
                className="w-full border rounded px-3 py-2 text-base md:text-base min-h-[36px] md:min-h-[40px]"
                placeholder="Enter hours"
              />
              {errors.wantWorkingHours && <p className="text-sm text-red-600 mt-1">{errors.wantWorkingHours}</p>}
            </section>

            {/* Transcript Upload */}
            <section>
              <label className="block mb-2 font-medium text-base md:text-lg">Upload Transcript*</label>
              <div className="flex items-center gap-3">
                <label className="bg-[#040941] text-white px-6 py-2 rounded cursor-pointer hover:bg-[#030735] text-base md:text-base min-h-[36px] md:min-h-[40px] flex items-center">
                  Choose File
                  <input
                    type="file"
                    name="transcriptFile"
                    accept=".pdf,.doc,.docx"
                    onChange={handleChange}
                    className="hidden"
                    aria-label="Choose File"
                  />
                </label>
                <input
                  type="text"
                  readOnly
                  value={formData.transcriptFile?.name || ''}
                  placeholder="No file chosen"
                  className="flex-1 px-3 py-2 text-[#040941] bg-white text-base md:text-base min-h-[36px] md:min-h-[40px]"
                />
              </div>
              {errors.transcriptFile && <p className="text-sm text-red-600 mt-1">{errors.transcriptFile}</p>}
            </section>
            {/* Application Type */}
            <section>
              <label className="block mb-2 font-medium text-base md:text-lg">Application Type*</label>
              <div className="flex gap-6">
                {(['UNDERGRADUATE', 'GRADUATE'] as const).map(type => (
                  <label key={type} className="inline-flex items-center space-x-2 text-base md:text-base min-h-[36px] md:min-h-[40px]">
                    <input
                      type="radio"
                      name="applicationType"
                      value={type}
                      checked={formData.applicationType === type}
                      onChange={handleChange}
                      className="form-radio text-indigo-600"
                    />
                    <span className="capitalize">{type.toLowerCase()}</span>
                  </label>
                ))}
              </div>
              {errors.applicationType && (
                <p className="text-sm text-red-600 mt-1">{errors.applicationType}</p>
              )}
            </section>
            {/* Remote Preference */}
              <section>
                <label className="block mb-2 font-medium text-base md:text-lg">Remote Work Preference*</label>
                <div className="flex gap-6">
                  {(['yes', 'no'] as const).map(option => (
                    <label key={option} className="inline-flex items-center space-x-2 text-base md:text-base min-h-[36px] md:min-h-[40px]">
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
              <div className="bg-white rounded shadow p-2">
              <FullCalendar
                ref={calendarRef as any}
                plugins={[timeGridPlugin, interactionPlugin]}
                initialView="timeGridWeek"
                allDaySlot={false}
                headerToolbar={false}
                slotMinTime="06:00:00"
                slotMaxTime={`${visibleEndHour}:00:00`}
                height="auto"
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
                slotEventOverlap={false}
                expandRows={true}
                contentHeight="auto"
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
                className="mt-1 mr-2 min-h-[16px] min-w-[16px] md:min-h-[20px] md:min-w-[20px]"
              />
              <span className="text-base md:text-base text-gray-700">
                I confirm that I have updated my profile, as it will be used in the TA allocation decision process.*
              </span>
            </section>
            {errors.confirmProfileUpdated && <p className="text-sm text-red-600 mt-1">{errors.confirmProfileUpdated}</p>}

            {/* Buttons */}
            <div className="flex flex-col sm:flex-row justify-end gap-3 sm:gap-4 pt-4">
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
          </div>

         
          {/* Sidebar Progress Tracker */}
          <aside className="w-full sm:w-[320px] self-start bg-white border border-blue-200 shadow-md p-4 md:p-6 rounded-xl mb-8 sm:mb-0 mx-auto sm:mx-0"
            style={{ maxWidth: 400 }}
          >
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
                  label: 'Application Type',
                  description: 'Select the type of application you are submitting.',
                  done: !!formData.applicationType
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
        {/* Submission confirmation always visible if savedApp exists */}
        {savedApp && (
          <div className="mt-6 w-full mb-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white border-t-4 border-[#040941] px-3 md:px-4 py-3 rounded-b-xl shadow">
              <div className="flex flex-wrap items-center gap-x-4 md:gap-x-6 gap-y-2 min-w-0 flex-1 text-sm md:text-base">
                <span className="font-semibold text-[#040941]">Application ID:</span>
                <span className="text-gray-700 truncate max-w-[120px]">{savedApp.id || savedApp.applicationId || 'N/A'}</span>
                <span className="font-semibold text-[#040941] ml-4">Submitted at:</span>
                <span className="text-gray-700">{new Date(savedApp.timeSubmitted).toLocaleString()}</span>
                <span className="ml-4 text-green-700 font-semibold">Submitted & Under Review</span>
              </div>
              <div className="flex gap-2 flex-wrap mt-2 md:mt-0">
                <button
                  className="px-4 py-2 bg-[#040941] text-white rounded hover:bg-[#030735] transition-colors"
                  onClick={() => setShowDetails((prev) => !prev)}
                  aria-expanded={showDetails}
                  aria-controls="application-details-row"
                >
                  {showDetails ? 'Hide Details' : 'View Application'}
                </button>
                <button
                  className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                  onClick={async () => {
                    if (!savedApp) return;
                    const toastId = toast(
                      <div>
                        <div className="font-semibold mb-2">Delete Application?</div>
                        <div className="mb-3 text-sm text-gray-700">Are you sure you want to delete this application? This action cannot be undone.</div>
                        <div className="flex gap-2 justify-end">
                          <button
                            className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 text-gray-800"
                            onClick={() => toast.dismiss(toastId)}
                          >
                            Cancel
                          </button>
                          <button
                            className="px-3 py-1 rounded bg-red-600 hover:bg-red-700 text-white"
                            onClick={async () => {
                              toast.dismiss(toastId);
                              try {
                                const { deleteApplication } = await import('../../../api/application/DeleteApplication');
                                if (typeof userId !== 'number' && typeof userId !== 'string') throw new Error('No valid user ID found.');
                                if (!token) throw new Error('No valid authentication token found.');
                                await deleteApplication(Number(userId), token, userId, userRoles);
                                setSavedApp(null);
                                setSubmitted(false);
                                setShowDetails(false);
                                setFormData({
                                  firstPreference: '',
                                  secondPreference: '',
                                  thirdPreference: '',
                                  wantWorkingHours: '',
                                  wantRemote: '',
                                  transcriptFile: null,
                                  confirmProfileUpdated: false,
                                  applicationType: '',
                                });
                                setAvailability([]);
                                toast.success('Application deleted successfully.', { autoClose: 2500 });
                                setTimeout(() => window.location.reload(), 2600);
                              } catch (err: any) {
                                if (err.message && err.message.includes('403')) {
                                  toast.error('You do not have permission to delete this application.', { autoClose: 3500 });
                                } else {
                                  toast.error('Failed to delete application. Please try again.', { autoClose: 3500 });
                                }
                                console.error(err);
                              }
                            }}
                          >
                            Delete
                          </button>
                        </div>
                      </div>,
                      {
                        autoClose: false,
                        closeOnClick: false,
                        draggable: false,
                        closeButton: false,
                        position: "top-right",
                        style: { marginTop: 80 },
                      }
                    );
                  }}
                >
                  Delete Application
                </button>
              </div>
            </div>
            {showDetails && (
              <div
                id="application-details-row"
                className="w-full border-x border-b border-[#040941] rounded-b-xl px-3 md:px-6 py-4 text-sm animate-slide-down relative overflow-hidden"
                role="region"
                aria-live="polite"
              >
                {/* View Application Details */}
                <div className="absolute left-1/2 top-0 -translate-x-1/2 w-16 h-2 bg-gray-300 rounded-b-xl shadow-md z-10 animate-fold-bar" aria-hidden="true"></div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mt-4">
                  <div><span className="font-semibold">Student ID:</span> {savedApp.student?.studentNum || 'N/A'}</div>
                  <div><span className="font-semibold">Preferences:</span> {savedApp.preferences?.join(', ') || 'N/A'}</div>
                  <div><span className="font-semibold">Remote:</span> {savedApp.wantRemote ? 'Yes' : 'No'}</div>
                  <div><span className="font-semibold">Requested Hours:</span> {savedApp.wantWorkingHours}</div>
                  <div className="sm:col-span-2 md:col-span-3">
                    <span className="font-semibold">Availability:</span>
                    <ul className="list-disc list-inside ml-4 inline">
                      {savedApp.availabilities?.length ? (
                        savedApp.availabilities.map((a, i) => (
                          <li key={i} className="inline-block mr-4">{a.day} {a.startTime}–{a.endTime}</li>
                        ))
                      ) : (
                        <li>N/A</li>
                      )}
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Toast container for notifications */}
      <ToastContainer limit={2} />
    </div>
  );
};

export default ApplicationPage;
