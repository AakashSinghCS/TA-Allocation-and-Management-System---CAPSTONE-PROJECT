import React, { useState, useRef, useEffect } from 'react';
import { ToastContainer, toast, Slide } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import FullCalendar from '@fullcalendar/react';
import type { DateSelectArg, EventClickArg } from '@fullcalendar/core';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { useAuth } from '../../../context/AuthContext';
import type { ApplicationRequest, ApplicationDto, Day } from '../../../interfaces/application/Application';
import { fetchApplicationsByStudent } from '../../../api/application/FetchApplicationsByStudent';

import TermSelector from '../../../components/features/application/applicationsubmission/TermSelector';
import TermForm from '../../../components/features/application/applicationsubmission/TermForm';
import ApplicationDetails from '../../../components/features/application/applicationsubmission/ApplicationDetails';
import ApplicationSidebar from '../../../components/features/application/applicationsubmission/ApplicationSidebar';
import { dayMap, getDateForDay, colorByDay } from '../../../components/features/application/applicationsubmission/availabilityUtils';
import { validateTermForm, buildTermPayload } from '../../../components/features/application/applicationsubmission/formValidation';
import { getApplicationUrls, getCommonHeaders } from '../../../components/features/application/applicationsubmission/apiHelpers';
import { updateApplication } from '../../../api/application/UpdateApplication';
import type { DeadlineDto } from '../../../interfaces/admin/Deadline';
import { fetchDeadlines } from '../../../api/admin/FetchDeadline';

interface Availability {
  id: string;
  day: Day;
  startTime: string;
  endTime: string;
}

const ApplicationPage: React.FC = () => {
  const [selectedTerms, setSelectedTerms] = useState<string[]>([]);
  const [termFormsData, setTermFormsData] = useState<{[termKey: string]: any}>({});
  const [availability, setAvailability] = useState<Availability[]>([]);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [submitted, setSubmitted] = useState(false);
  const [savedApp, setSavedApp] = useState<ApplicationDto | null>(null);
  const [existingApplications, setExistingApplications] = useState<ApplicationDto[]>([]);
  const [existingTerms, setExistingTerms] = useState<Set<string>>(new Set());
  const [activeFormTab, setActiveFormTab] = useState<string>('');
const calendarRef = useRef<FullCalendar>(null);
const { token, userId, userRoles } = useAuth();
const [expandedAppId, setExpandedAppId] = useState<number | null>(null);
const [applicationDeadline, setApplicationDeadline] = useState<DeadlineDto | null>(null);
const [deadlineError, setDeadlineError] = useState("");

useEffect(() => {
  async function loadExistingApplications() {
    if (userId !== null && token) {
      try {
        const applications = await fetchApplicationsByStudent(Number(userId), token);
        setExistingApplications(applications);
        
        // Create a set of existing terms for quick lookup
        const termSet = new Set<string>();
        applications.forEach(app => {
          const termKey = `${app.year}-${app.semester}`;
          termSet.add(termKey);
        });
        setExistingTerms(termSet);
        
        // Set the most recent application as savedApp for display
        if (applications.length > 0) {
          const mostRecent = applications.sort((a, b) => 
            new Date(b.timeSubmitted).getTime() - new Date(a.timeSubmitted).getTime()
          )[0];
          setSavedApp(mostRecent);
          
          // Load ALL existing applications into forms, not just the most recent
          applications.forEach(app => {
            const termKey = `${app.year}-${app.semester}`;
            updateTermFormData(termKey, {
              firstPreference: app.preferences[0] || '',
              secondPreference: app.preferences[1] || '',
              thirdPreference: app.preferences[2] || '',
              wantWorkingHours: app.wantWorkingHours.toString(),
              wantRemote: app.wantRemote ? 'yes' : 'no',
              applicationType: app.applicationType,
              confirmProfileUpdated: true
            });
          });
          
          // Set selected terms to all existing applications
          const allTermKeys = applications.map(app => `${app.year}-${app.semester}`);
          setSelectedTerms(allTermKeys);
          
          // Set active tab to the most recent
          setActiveFormTab(`${mostRecent.year}-${mostRecent.semester}`);
          
          // Load availability from the most recent application 
          const existingAvailability = mostRecent.availabilities.map((av, index) => ({
            id: `${av.day}-${av.startTime}-${av.endTime}-${index}`,
            day: av.day,
            startTime: av.startTime,
            endTime: av.endTime
          }));
          setAvailability(existingAvailability);
        }
      } catch (error) {
        console.error('Failed to load existing applications:', error);
      }
    }
  }
  if (userId !== null && token) loadExistingApplications();
}, [userId, token]);

useEffect(() => {
  async function loadDeadline() {
    setDeadlineError("");
    try {
      const allDeadlines = await fetchDeadlines(token || "");
      const studentDeadline = allDeadlines.find(
        (d) => d.name === "student_application_deadline"
      );
      setApplicationDeadline(studentDeadline || null);
    } catch (err) {
      console.error("Failed to load deadline:", err);
      setDeadlineError("Could not load application deadline.");
    }
  }

  if (token) loadDeadline();
}, [token]);

const deadlinePassed =
    !! applicationDeadline &&
    new Date(applicationDeadline.endTime) < new Date();

  // Helper function to initialize form data for a term
  const initializeTermForm = (termKey: string) => ({
    firstPreference: '',
    secondPreference: '',
    thirdPreference: '',
    wantWorkingHours: '',
    wantRemote: '',
    confirmProfileUpdated: false,
    applicationType: '' as '' | 'UNDERGRADUATE' | 'GRADUATE',
  });

  // Helper function to get form data for a specific term
  const getTermFormData = (termKey: string) => {
    return termFormsData[termKey] || initializeTermForm(termKey);
  };

  // Helper function to update form data for a specific term
  const updateTermFormData = (termKey: string, updates: any) => {
    setTermFormsData(prev => ({
      ...prev,
      [termKey]: { ...getTermFormData(termKey), ...updates }
    }));
  };

  // Helper function to clear all forms
  const clearForm = () => {
    setSelectedTerms([]);
    setTermFormsData({});
    setAvailability([]);
    setActiveFormTab('');
  };

  // Helper function to load application data into the form
  const loadApplicationIntoForm = (application: ApplicationDto) => {
    const termKey = `${application.year}-${application.semester}`;
    setSelectedTerms([termKey]);
    setActiveFormTab(termKey);
    
    updateTermFormData(termKey, {
      firstPreference: application.preferences[0] || '',
      secondPreference: application.preferences[1] || '',
      thirdPreference: application.preferences[2] || '',
      wantWorkingHours: application.wantWorkingHours.toString(),
      wantRemote: application.wantRemote ? 'yes' : 'no',
      applicationType: application.applicationType,
      confirmProfileUpdated: true
    });
    
    // Load availability
    const existingAvailability = application.availabilities.map((av, index) => ({
      id: `${av.day}-${av.startTime}-${av.endTime}-${index}`,
      day: av.day,
      startTime: av.startTime,
      endTime: av.endTime
    }));
    setAvailability(existingAvailability);
  };

  const handleTermSelection = (termKey: string, isSelected: boolean) => {
    if (isSelected) {
      setSelectedTerms(prev => [...prev, termKey]);
      // Initialize form data for new term
      if (!termFormsData[termKey]) {
        const existingApp = existingApplications.find(app => 
          `${app.year}-${app.semester}` === termKey
        );
        if (existingApp) {
          // Pre-populate with existing application data
          updateTermFormData(termKey, {
            firstPreference: existingApp.preferences[0] || '',
            secondPreference: existingApp.preferences[1] || '',
            thirdPreference: existingApp.preferences[2] || '',
            wantWorkingHours: existingApp.wantWorkingHours.toString(),
            wantRemote: existingApp.wantRemote ? 'yes' : 'no',
            applicationType: existingApp.applicationType,
            confirmProfileUpdated: true
          });
          // Only set availability if this is an existing application
          const existingAvailability = existingApp.availabilities.map((av, index) => ({
            id: `${av.day}-${av.startTime}-${av.endTime}-${index}`,
            day: av.day,
            startTime: av.startTime,
            endTime: av.endTime
          }));
          setAvailability(existingAvailability);
        } else {
          // Initialize with default values
          setTermFormsData(prev => ({
            ...prev,
            [termKey]: initializeTermForm(termKey)
          }));
          // Clear calendar for new application
          setAvailability([]);
        }
      }
      // Set as active tab if it's the first selection or no active tab
      if (selectedTerms.length === 0 || !activeFormTab) {
        setActiveFormTab(termKey);
      }
    } else {
      setSelectedTerms(prev => prev.filter(term => term !== termKey));
      // Remove form data for deselected term
      setTermFormsData(prev => {
        const updated = { ...prev };
        delete updated[termKey];
        return updated;
      });
      // Switch to first available term if removing active tab
      if (activeFormTab === termKey) {
        const remainingTerms = selectedTerms.filter(term => term !== termKey);
        setActiveFormTab(remainingTerms.length > 0 ? remainingTerms[0] : '');
      }
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    if (!activeFormTab) return;
    
    const { name, value, type, checked } = e.target as HTMLInputElement;
    
    if (type === 'checkbox' && name === 'confirmProfileUpdated') {
      updateTermFormData(activeFormTab, { confirmProfileUpdated: checked });
    } else {
      updateTermFormData(activeFormTab, { [name]: value });
    }
    
    // Clear errors for this field
    setErrors(prev => ({ ...prev, [`${activeFormTab}-${name}`]: '' }));
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

  if (selectedTerms.length === 0) {
    setErrors({ general: 'Please select at least one term to apply for.' });
    return;
  }

  // Client-side validation for calendar slots
  if (availability.length === 0) {
    setErrors(prev => ({ ...prev, availability: 'Please select at least one available time slot on the calendar.' }));
    return;
  }

  // Validate all selected term forms
  const allErrors: { [key: string]: string } = {};
  const validTerms: string[] = [];

  for (const termKey of selectedTerms) {
    const termData = getTermFormData(termKey);
    const termErrors = validateTermForm(termData, availability);
    
    if (Object.keys(termErrors).length > 0) {
      // Prefix errors with term key for identification
      Object.keys(termErrors).forEach(field => {
        allErrors[`${termKey}-${field}`] = termErrors[field];
      });
    } else {
      validTerms.push(termKey);
    }
  }

  if (Object.keys(allErrors).length > 0) {
    setErrors(allErrors);
    return;
  }

  setErrors({});
  setSubmitted(true);

  // preparing URLs & headers
  const { addUrl } = getApplicationUrls(userId ?? '');
  const commonHeaders = getCommonHeaders(token ?? '', userId ?? '', userRoles);

  try {
    const results = [];
    let hasErrors = false;
    
    // Submit each term application
    for (const termKey of validTerms) {
      const [year, semester] = termKey.split('-');
      const termData = getTermFormData(termKey);
      const payload = buildTermPayload(termData, parseInt(year), semester, availability);

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
              results.push(dto);
              continue;
            } catch (updateErr) {
              console.error('Update failed:', updateErr);
              hasErrors = true;
              continue;
            }
          } else {
            console.error('Server validation failed:', errTxt);
            hasErrors = true;
            continue;
          }
        }
        
        if (!resp.ok) {
          const errTxt = await resp.text();
          console.error('Final server error:', errTxt);
          hasErrors = true;
          continue;
        }

        // success! parse & store DTO
        const dto: ApplicationDto = await resp.json();
        results.push(dto);
        
      } catch (err) {
        console.error('Error submitting application for', payload.year, payload.semester, ':', err);
        hasErrors = true;
      }
    }
    
    if (results.length > 0) {
      // Refresh existing applications after successful submission
      try {
        const updatedApplications = await fetchApplicationsByStudent(Number(userId), token || '');
        setExistingApplications(updatedApplications);
        
        // Update existing terms set
        const termSet = new Set<string>();
        updatedApplications.forEach(app => {
          const termKey = `${app.year}-${app.semester}`;
          termSet.add(termKey);
        });
        setExistingTerms(termSet);
        
        // Set the most recent application as savedApp for display
        const mostRecent = updatedApplications.sort((a, b) => 
          new Date(b.timeSubmitted).getTime() - new Date(a.timeSubmitted).getTime()
        )[0];
        setSavedApp(mostRecent);
      } catch (refreshError) {
        console.error('Failed to refresh applications after submission:', refreshError);
        // Still use the first result if refresh fails
        setSavedApp(results[0]);
      }
      
      if (hasErrors) {
        toast.success(`${results.length} application(s) submitted successfully, but some failed. Please check and resubmit if needed.`, { autoClose: 4000 });
      } else {
        toast.success(`All ${results.length} application(s) submitted successfully!`, { autoClose: 3000 });
      }
    } else {
      throw new Error('All applications failed to submit');
    }

  } catch (err) {
    console.error(err);
    setErrors(prev => ({
      ...prev,
      form: 'Failed to submit applications. Please try again later.'
    }));
    toast.error('Failed to submit applications. Please try again.', { autoClose: 3500 });
  }
};

  // Controls whether the details view for an application is shown (used for sidebar/details expansion)
  function setShowDetails(show: boolean) {
    if (!show) {
      setExpandedAppId(null);
      setSavedApp(null);
    }
    // If you want to show details for a specific app, you should setExpandedAppId and setSavedApp accordingly elsewhere.
    // This function is mainly used to hide details.
  }

  return (
    <div className="min-h-screen px-2 sm:px-4 md:px-6 py-6 md:py-12">
      <div className="max-w-[1100px] mx-auto w-full">

        {/* Always show message if there are any existing applications */}
        {existingApplications.length > 0 && (
          <div className="mb-6 rounded-lg border-l-4 border-amber-600 bg-amber-50 p-3 text-red-800 flex items-center justify-between">
            <span>
              {(() => {
                // List all terms for which applications exist
                const termsList = existingApplications
                  .map(app => `${app.year} ${app.semester}`)
                  .join(', ');
                return `You have already submitted applications for ${termsList}. Any changes you make will update those applications.`;
              })()}
            </span>
          </div>
        )}

      {/* heading change based on whether any selected terms have existing applications */}
      <h1 className="text-3xl font-bold text-[#040941] mb-10">
        {selectedTerms.some((term: string) => existingTerms.has(term)) 
          ? 'Update Your TA Application(s)' 
          : 'TA Application Submission'}
      </h1>
      {applicationDeadline && (
      <p className="text-md text-gray-700 mb-6">
        Deadline:{" "}
        <span className="font-medium">
          {new Date(applicationDeadline.endTime).toLocaleString()}
        </span>
      </p>
      )}
      {!applicationDeadline && !deadlineError && (
        <p className="text-md text-gray-500 mb-6">
          No application deadline found.
        </p>
      )}
      {deadlineError && (
        <p className="text-md text-red-500 mb-6">
          {deadlineError}
        </p>
      )}


        <div className="flex flex-col-reverse lg:grid lg:grid-cols-[1fr_320px] gap-8 md:gap-12 lg:gap-14">
          <div className="w-full">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Term Selection */}
              <TermSelector
                selectedTerms={selectedTerms}
                existingTerms={existingTerms}
                onTermToggle={handleTermSelection}
              />

              {/* Show error for general validation */}
              {errors.general && (
                <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded p-3">
                  {errors.general}
                </div>
              )}

              {/* Term Forms Tabs */}
              {selectedTerms.length > 0 && (
                <div>
                  {/* Tab Headers */}
                  {selectedTerms.length > 1 && (
                    <div className="border-b border-gray-200">
                      <nav className="flex space-x-8 px-6" aria-label="Terms">
                        {selectedTerms.map(termKey => {
                          const [year, semester] = termKey.split('-');
                          const isActive = activeFormTab === termKey;
                          const hasExisting = existingTerms.has(termKey);
                          return (
                            <button
                              key={termKey}
                              type="button"
                              onClick={() => setActiveFormTab(termKey)}
                              className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                                isActive
                                  ? 'border-blue-500 text-blue-600'
                                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                              }`}
                            >
                              {year} {semester}
                              {hasExisting && (
                                <span className="ml-2 text-xs text-orange-600">(Update)</span>
                              )}
                            </button>
                          );
                        })}
                      </nav>
                    </div>
                  )}

                  {/* Active Form Content */}
                  <div>
                    {(selectedTerms.length === 1 ? selectedTerms : [activeFormTab]).filter(Boolean).map(termKey => (
                      <div key={termKey} className={selectedTerms.length > 1 && termKey !== activeFormTab ? 'hidden' : ''}>
                        <TermForm
                          termKey={termKey}
                          formData={getTermFormData(termKey)}
                          errors={errors}
                          handleChange={handleChange}
                          isUpdate={existingTerms.has(termKey)}
                        />
                      </div>
                    ))}

                    {/* Availability Calendar */}
                    <section className="mt-6">
                      <h2 className="text-lg font-semibold mb-2">Availability*</h2>
                      <p className="text-sm text-gray-600 mb-4">
                        Select your available time slots by dragging on the calendar. This applies to all selected terms.
                      </p>
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
                          hiddenDays={[0, 6]}
                        />
                      </div>
                      {errors.availability && <p className="text-sm text-red-600 mt-1">{errors.availability}</p>}
                    </section>

                    {/* Submit Button */}
                    <div className="mt-8 flex justify-end">
                      <button
                        type="submit"
                        disabled={selectedTerms.length === 0}
                        className={`px-6 py-2 rounded-lg font-medium ${
                          selectedTerms.length === 0
                            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            : 'bg-[#040941] text-white hover:bg-[#030735] focus:ring-2 focus:ring-blue-500'
                        }`}
                      >
                        {selectedTerms.some(term => existingTerms.has(term)) 
                          ? `Update Application${selectedTerms.length > 1 ? 's' : ''}` 
                          : `Submit Application${selectedTerms.length > 1 ? 's' : ''}`
                        }
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </form>
          </div>

          {/* Sidebar Progress Tracker (Stepper) */}
          <ApplicationSidebar
            selectedTerms={selectedTerms}
            getTermFormData={getTermFormData}
          />
        </div>
        {/* Submission confirmation for all existing applications */}
        {existingApplications.length > 0 && (
          <div className="mt-6 w-full mb-6 space-y-4">
            {existingApplications
              .sort((a, b) => new Date(b.timeSubmitted).getTime() - new Date(a.timeSubmitted).getTime())
              .map((app) => (
              <div key={`${app.year}-${app.semester}-${app.id}`} className="relative px-6 py-5 bg-gray-50 border-l-4 border-blue-900">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div className="flex flex-wrap items-center gap-x-4 md:gap-x-6 gap-y-2 min-w-0 flex-1 text-sm md:text-base">
                    <span className="font-semibold text-[#040941]">Application ID:</span>
                    <span className="text-gray-700 truncate max-w-[120px]">{app.id || app.applicationId || 'N/A'}</span>
                    <span className="font-semibold text-[#040941] ml-4">Term:</span>
                    <span className="text-gray-700">{app.year} {app.semester}</span>
                    <span className="font-semibold text-[#040941] ml-4">Submitted at:</span>
                    <span className="text-gray-700">{new Date(app.timeSubmitted).toLocaleString()}</span>
                    <span className="ml-4 text-green-700 font-semibold">Submitted</span>
                  </div>
                  <div className="flex gap-2 flex-wrap mt-2 md:mt-0">
                    <button
                      className="px-4 py-2 bg-[#040941] text-white rounded hover:bg-[#030735] transition-colors"
                      onClick={() => {
                        const appUniqueId = typeof app.id === 'number' ? app.id : (typeof app.applicationId === 'number' ? app.applicationId : null);
                        if (expandedAppId === appUniqueId) {
                          setExpandedAppId(null);
                          setSavedApp(null);
                        } else {
                          setExpandedAppId(appUniqueId);
                          setSavedApp(app);
                        }
                      }}
                      aria-expanded={expandedAppId === (typeof app.id === 'number' ? app.id : app.applicationId)}
                      aria-controls="application-details-row"
                    >
                      {(expandedAppId === (typeof app.id === 'number' ? app.id : app.applicationId)) ? 'Hide Details' : 'View Application'}
                    </button>
                    <button
                      className="px-4 py-2 bg-red-700 text-white rounded hover:bg-red-700 transition-colors"
                      onClick={async () => {
                        if (!app) return;
                        const toastId = toast(
                          <div>
                            <div className="font-semibold mb-2">Delete Application?</div>
                            <div className="mb-3 text-sm text-gray-700">Are you sure you want to delete this application for {app.year} {app.semester}? This action cannot be undone.</div>
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
                                    await deleteApplication(
                                      Number(userId),
                                      app.year!,
                                      app.semester!,
                                      token,
                                      userId,
                                      userRoles
                                    );
                                    
                                    // Refresh existing applications after deletion
                                    try {
                                      const updatedApplications = await fetchApplicationsByStudent(Number(userId), token);
                                      setExistingApplications(updatedApplications);
                                      
                                      // Update existing terms set
                                      const termSet = new Set<string>();
                                      updatedApplications.forEach(application => {
                                        const termKey = `${application.year}-${application.semester}`;
                                        termSet.add(termKey);
                                      });
                                      setExistingTerms(termSet);
                                      
                                      // Set the most recent application as savedApp for display, or null if none
                                      if (updatedApplications.length > 0) {
                                        const mostRecent = updatedApplications.sort((a, b) => 
                                          new Date(b.timeSubmitted).getTime() - new Date(a.timeSubmitted).getTime()
                                        )[0];
                                        setSavedApp(mostRecent);
                                      } else {
                                        setSavedApp(null);
                                      }
                                    } catch (refreshError) {
                                      console.error('Failed to refresh applications after deletion:', refreshError);
                                      setSavedApp(null);
                                    }
                                    
                                    setSubmitted(false);
                                    setExpandedAppId(null);
                                    clearForm();
                                    toast.success('Application deleted successfully.', { autoClose: 2500 });
                                  } catch (err: any) {
                                    if (err.message && err.message.includes('403')) {
                                      toast.error('You do not have permission to delete this application.', { autoClose: 3500 });
                                    } else if (err.message.includes('Failed to delete application')) {
                                      toast.error('This application has allocations and cannot be deleted.', { autoClose: 3500 });
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
                {(() => {
                  const appUniqueId = typeof app.id === 'number' ? app.id : (typeof app.applicationId === 'number' ? app.applicationId : null);
                  return expandedAppId === appUniqueId ? <ApplicationDetails savedApp={app} /> : null;
                })()}
              </div>
            ))}
          </div>
        )}
      </div>
      <ToastContainer limit={2} />
    </div>
  );
};

export default ApplicationPage;
