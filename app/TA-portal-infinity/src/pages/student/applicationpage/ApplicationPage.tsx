
import React, { useState, useRef, useEffect } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useAuth } from '../../../context/AuthContext';
import type { ApplicationDto, Day } from '../../../interfaces/application/Application';
import { fetchApplicationsByStudent } from '../../../api/application/FetchActiveApplicationsByStudent';
import ApplicationSidebar from '../../../components/features/application/applicationsubmission/ApplicationSidebar';
import { validateTermForm, buildTermPayload } from '../../../components/features/application/applicationsubmission/formValidation';
import { getApplicationUrls, getCommonHeaders } from '../../../components/features/application/applicationsubmission/apiHelpers';
import { updateApplication } from '../../../api/application/UpdateApplication';
import type { DeadlineDto } from '../../../interfaces/admin/Deadline';
import { fetchDeadlines } from '../../../api/admin/FetchDeadline';
import ApplicationForm from './ApplicationForm';
import ApplicationList from './ApplicationList';
import type { DateSelectArg, EventClickArg } from '@fullcalendar/core';
import { dayMap } from '../../../components/features/application/applicationsubmission/availabilityUtils';

interface Unavailability {
  id: string;
  day: Day;
  startTime: string;
  endTime: string;
}

const ApplicationPage: React.FC = () => {
  const [selectedTerms, setSelectedTerms] = useState<string[]>([]);
  const [termFormsData, setTermFormsData] = useState<{[termKey: string]: any}>({});
  const [unavailability, setUnavailability] = useState<Unavailability[]>([]);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [submitted, setSubmitted] = useState(false);
  const [savedApp, setSavedApp] = useState<ApplicationDto | null>(null);
  const [existingApplications, setExistingApplications] = useState<ApplicationDto[]>([]);
  const [existingTerms, setExistingTerms] = useState<Set<string>>(new Set());
  const [activeFormTab, setActiveFormTab] = useState<string>('');
  const calendarRef = useRef<any>(null);
  const { token, userId, userRoles } = useAuth();
  const [expandedAppId, setExpandedAppId] = useState<number | null>(null);
  const [applicationDeadline, setApplicationDeadline] = useState<DeadlineDto | null>(null);
  const [deadlineError, setDeadlineError] = useState("");

useEffect(() => {
  async function loadExistingApplications() {
    if (userId !== null && token) {
      try {
        const applications = await fetchApplicationsByStudent(Number(userId));
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
          
          // Load ALL existing applications into forms
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
        
          setActiveFormTab(`${mostRecent.year}-${mostRecent.semester}`);
          
          // Load availability from the most recent application 
          const existingUnavailability = mostRecent.unavailabilities.map((uv, index) => ({
            id: `${uv.day}-${uv.startTime}-${uv.endTime}-${index}`,
            day: uv.day,
            startTime: uv.startTime,
            endTime: uv.endTime
          }));
          setUnavailability(existingUnavailability);
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

  // function to get form data for a specific term
  const getTermFormData = (termKey: string) => {
    return termFormsData[termKey] || initializeTermForm(termKey);
  };

  // function to update form data for a specific term
  const updateTermFormData = (termKey: string, updates: any) => {
    setTermFormsData(prev => ({
      ...prev,
      [termKey]: { ...getTermFormData(termKey), ...updates }
    }));
  };

  //  function to clear all forms
  const clearForm = () => {
    setSelectedTerms([]);
    setTermFormsData({});
    setUnavailability([]);
    setActiveFormTab('');
  };

  // function to load application data into the form
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
    const existingUnavailability = application.unavailabilities.map((uv, index) => ({
      id: `${uv.day}-${uv.startTime}-${uv.endTime}-${index}`,
      day: uv.day,
      startTime: uv.startTime,
      endTime: uv.endTime
    }));
    setUnavailability(existingUnavailability);
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
          const existingUnavailability = existingApp.unavailabilities.map((uv, index) => ({
            id: `${uv.day}-${uv.startTime}-${uv.endTime}-${index}`,
            day: uv.day,
            startTime: uv.startTime,
            endTime: uv.endTime
          }));
          setUnavailability(existingUnavailability);
        } else {
          // Initialize with default values
          setTermFormsData(prev => ({
            ...prev,
            [termKey]: initializeTermForm(termKey)
          }));
          setUnavailability([]);
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
    setUnavailability(prev => [...prev, { id, day, startTime, endTime }]);
    info.view.calendar.unselect();
  };

  const handleEventClick = (info: EventClickArg) => {
    const id = info.event.id;
    info.event.remove();
    setUnavailability(prev => prev.filter(av => av.id !== id));
  };

 const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  if (selectedTerms.length === 0) {
    setErrors({ general: 'Please select at least one term to apply for.' });
    return;
  }
  // Validate all selected term forms
  const allErrors: { [key: string]: string } = {};
  const validTerms: string[] = [];

  for (const termKey of selectedTerms) {
    const termData = getTermFormData(termKey);
    const termErrors = validateTermForm(termData, unavailability);
    
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
      const payload = buildTermPayload(termData, parseInt(year), semester, unavailability);

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
      try {
  
        const updatedApplications = await fetchApplicationsByStudent(Number(userId));
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
  return (
    <div className="min-h-screen px-2 sm:px-4 md:px-6 py-6 md:py-12">
      <div className="max-w-[1100px] mx-auto w-full">
        {/* Existing applications message */}
        {existingApplications.length > 0 && (
          <div className="mb-6 rounded-lg border-l-4 border-amber-600 bg-amber-50 p-3 text-red-800 flex items-center justify-between">
            <span>
              {(() => {
                const termsList = existingApplications.map(app => `${app.year} ${app.semester}`).join(', ');
                return `You have already submitted applications for ${termsList}. Any changes you make will update those applications.`;
              })()}
            </span>
          </div>
        )}
        <h1 className="text-3xl font-bold text-[#040941] mb-10">
          {selectedTerms.some((term: string) => existingTerms.has(term))
            ? 'Update Your TA Application(s)'
            : 'TA Application Submission'}
        </h1>
        {applicationDeadline && (
          <p className="text-md text-gray-700 mb-6">
            Deadline:{' '}
            <span className="font-medium">
              {new Date(applicationDeadline.endTime).toLocaleString()}
            </span>
          </p>
        )}
        {!applicationDeadline && !deadlineError && (
          <p className="text-md text-gray-500 mb-6">No application deadline found.</p>
        )}
        {deadlineError && (
          <p className="text-md text-red-500 mb-6">{deadlineError}</p>
        )}
        <div className="flex flex-col-reverse lg:grid lg:grid-cols-[1fr_320px] gap-8 md:gap-12 lg:gap-14">
          <div className="w-full">
            <ApplicationForm
              selectedTerms={selectedTerms}
              existingTerms={existingTerms}
              termFormsData={termFormsData}
              errors={errors}
              activeFormTab={activeFormTab}
              unavailability={unavailability}
              calendarRef={calendarRef}
              handleTermSelection={handleTermSelection}
              handleChange={handleChange}
              handleDateSelect={handleDateSelect}
              handleEventClick={handleEventClick}
              handleSubmit={handleSubmit}
              getTermFormData={getTermFormData}
              setActiveFormTab={setActiveFormTab}
            />
          </div>
          <ApplicationSidebar
            selectedTerms={selectedTerms}
            getTermFormData={getTermFormData}
          />
        </div>
        {/* Existing applications list */}
        {existingApplications.length > 0 && (
          <ApplicationList
            existingApplications={existingApplications}
            expandedAppId={expandedAppId}
            setExpandedAppId={setExpandedAppId}
            setSavedApp={setSavedApp}
            userId={userId}
            token={token}
            userRoles={userRoles}
            fetchApplicationsByStudent={fetchApplicationsByStudent}
            setExistingApplications={setExistingApplications}
            setExistingTerms={setExistingTerms}
            setSubmitted={setSubmitted}
            clearForm={clearForm}
          />
        )}
      </div>
      <ToastContainer limit={2} />
    </div>
  );
};

export default ApplicationPage;
