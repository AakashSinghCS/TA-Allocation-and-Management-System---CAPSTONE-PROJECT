
import React, { useState, useRef, useEffect } from 'react';
import { ToastContainer, toast, Slide } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from 'react-router-dom';
import FullCalendar from '@fullcalendar/react';
import type { DateSelectArg, EventClickArg } from '@fullcalendar/core';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { useAuth } from '../../../context/AuthContext';
import type { ApplicationRequest, ApplicationDto, Day } from '../../../interfaces/application/Application';
import { fetchExistingApplication } from '../../../api/application/FetchExistingApplication';

import ApplicationForm from '../../../components/features/application/applicationsubmission/ApplicationForm';
import ApplicationSidebar from '../../../components/features/application/applicationsubmission/ApplicationSidebar';
import ApplicationDetails from '../../../components/features/application/applicationsubmission/ApplicationDetails';
import { dayMap, getDateForDay, colorByDay } from '../../../components/features/application/applicationsubmission/availabilityUtils';
import { validateForm, buildPayload } from '../../../components/features/application/applicationsubmission/formValidation';
import { getApplicationUrls, getCommonHeaders } from '../../../components/features/application/applicationsubmission/apiHelpers';
import { updateApplication } from '../../../api/application/UpdateApplication';

interface Availability {
  id: string;
  day: Day;
  startTime: string;
  endTime: string;
}

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
  const navigate = useNavigate();
const calendarRef = useRef<FullCalendar>(null);
const { token, userId, userRoles } = useAuth();
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
  const newErrors = validateForm(formData, availability);
  if (Object.keys(newErrors).length) {
    setErrors(newErrors);
    return;
  }

  setErrors({});
  setSubmitted(true);

  //assemble our payload
  const payload = buildPayload(formData, availability);
            {/* Application Type */}
            <section>
              <label className="block mb-2 font-semibold">Application Type*</label>
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
  const { addUrl, updateUrl } = getApplicationUrls(userId ?? '');
  const commonHeaders = getCommonHeaders(token ?? '', userId ?? '', userRoles);

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
        // Use the new updateApplication helper
        try {
          const dto = await updateApplication(userId ?? '', payload, token ?? '', userRoles);
          setSavedApp(dto);
          toast.success('Application updated successfully!', { autoClose: 2500 });
          return;
        } catch (updateErr) {
          console.error('Update failed:', updateErr);
          setErrors(prev => ({ ...prev, form: 'Failed to update application. Please try again later.' }));
          toast.error('Failed to update application. Please try again.', { autoClose: 3500 });
          return;
        }
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
      <h1 className="text-3xl font-bold text-[#040941] mb-10">
        {savedApp ? 'Update Your TA Application' : 'TA Application Submission'}
      </h1>

        <div className="flex flex-col-reverse lg:grid lg:grid-cols-[1fr_320px] gap-8 md:gap-12 lg:gap-14">
          <div className="w-full">
          <ApplicationForm
            formData={formData}
            errors={errors}
            handleChange={handleChange}
            handleSubmit={handleSubmit}
            isUpdate={!!savedApp}
          >
            {/* Availability Calendar */}
            <section>
              <h2 className="text-lg font-semibold mb-2">Availability*</h2>
              <div className="bg-white rounded shadow p-2">
                <FullCalendar
                  ref={calendarRef as any}
                  plugins={[timeGridPlugin, interactionPlugin]}
                  initialView="timeGridWeek"
                  allDaySlot={false}
                  headerToolbar={false}
                  slotMinTime="06:00:00"
                  slotMaxTime={`18:00:00`}
                  height="auto"
                  selectable
                  selectMirror
                  select={handleDateSelect}
                  eventClick={handleEventClick}
                  events={availability.map(av => ({
                    id: av.id,
                    start: getDateForDay(av.day, av.startTime),
                    end: getDateForDay(av.day, av.endTime),
                    backgroundColor: colorByDay[av.day],
                    borderColor: colorByDay[av.day],
                  }))}
                  dayHeaderFormat={{ weekday: 'long' }}
                  slotEventOverlap={false}
                  expandRows={true}
                  contentHeight="auto"
                />
              </div>
              {errors.availability && <p className="text-sm text-red-600 mt-1">{errors.availability}</p>}
            </section>
          </ApplicationForm>
          </div>

         
          {/* Sidebar Progress Tracker */}
          <ApplicationSidebar
            formData={formData}
            availability={availability}
            submitted={submitted}
            errors={errors}
          />
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
                <span className="ml-4 text-green-700 font-semibold">Submitted </span>
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
                  className="px-4 py-2 bg-red-700 text-white rounded hover:bg-red-700 transition-colors"
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
            {showDetails && savedApp && (
              <ApplicationDetails savedApp={savedApp} />
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
