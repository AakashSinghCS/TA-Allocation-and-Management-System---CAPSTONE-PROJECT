import React, { useEffect, useState } from 'react';
import { getAllDeptCodes } from '../../../../api/course/getAllDeptCodes';
import { useAuth } from '../../../../context/AuthContext';
import type { DeadlineDto } from '../../../../interfaces/admin/Deadline';
import { fetchDeadlines } from '../../../../api/admin/FetchDeadline';
import { getActiveSemesters } from '../../../../api/semester/getActiveSemesters';
import type { Semester } from '../../../../interfaces/semester/Semester';
import { toast } from "react-toastify";


interface ApplicationFormProps {
  formData: any;
  errors: { [key: string]: string };
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  handleSubmit: (e: React.FormEvent) => void;
  children?: React.ReactNode;
  isUpdate?: boolean;
  existingTerms?: Set<string>;
}

const ApplicationForm: React.FC<ApplicationFormProps> = ({ formData, errors, handleChange, handleSubmit, children, isUpdate, existingTerms = new Set() }) => {
  const [deptCodes, setDeptCodes] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeSemesters, setActiveSemesters] = useState<Semester[]>([]);
  const { token, userId, userRoles } = useAuth();

  const [applicationDeadline, setApplicationDeadline] = useState<DeadlineDto | null>(null);
  const [deadlineError, setDeadlineError] = useState("");

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    
    const fetchData = async () => {
      try {
        // Fetch department codes
        const codes = await getAllDeptCodes(token ?? undefined, userId, userRoles);
        if (isMounted) {
          setDeptCodes(Array.isArray(codes) ? codes : []);
        }
        
        // Fetch active semesters
        const semesters = await getActiveSemesters(token ?? '');
        if (isMounted) {
          setActiveSemesters(semesters);
        }
      } catch (error) {
        if (isMounted) {
          setDeptCodes([]);
          setActiveSemesters([]);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };
    
    fetchData();
    
    return () => {
      isMounted = false;
    };
  }, [token, userId, userRoles]);

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

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-xl p-6 space-y-8 md:space-y-10 lg:space-y-12" role="form">
      {/* Term Selection */}
      <section>
        <h2 className="text-lg font-semibold mb-4">Term Selection</h2>
        <div className="space-y-4">
          <div>
            <label className="block mb-3 font-semibold text-lg md:text-lg" id="selectTermsLabel">
              Select Terms* (Choose one or more terms to apply for)
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {Array.isArray(activeSemesters) && activeSemesters.map(sem => {
                const termValue = `${sem.year}-${sem.semester}`;
                const isSelected = formData.selectedTerms.includes(termValue);
                const hasExistingApplication = existingTerms.has(termValue);
                return (
                  <label 
                    key={termValue} 
                    className={`
                      flex items-center p-3 border rounded-lg cursor-pointer transition-all relative
                      ${isSelected 
                        ? (hasExistingApplication 
                            ? 'border-orange-500 bg-orange-50 text-orange-700' 
                            : 'border-blue-500 bg-blue-50 text-blue-700')
                        : (hasExistingApplication 
                            ? 'border-orange-300 bg-orange-25 hover:border-orange-400 hover:bg-orange-50' 
                            : 'border-gray-300 bg-white hover:border-gray-400 hover:bg-gray-50')
                      }
                    `}
                  >
                    <input
                      type="checkbox"
                      aria-label={`${sem.year} ${sem.semester}`}
                      className="mr-3 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      checked={isSelected}
                      onChange={(e) => {
                        const currentTerms = [...formData.selectedTerms];
                        if (e.target.checked) {
                          if (!currentTerms.includes(termValue)) {
                            currentTerms.push(termValue);
                          }
                        } else {
                          const index = currentTerms.indexOf(termValue);
                          if (index > -1) {
                            currentTerms.splice(index, 1);
                          }
                        }
                        const event = {
                          target: {
                            name: 'selectedTerms',
                            value: currentTerms
                          }
                        } as any;
                        handleChange(event);
                      }}
                    />
                    <span className="font-medium">
                      {sem.year} {sem.semester}
                    </span>
                    {hasExistingApplication && (
                      <span className="ml-auto text-xs font-semibold text-orange-600 bg-orange-100 px-2 py-1 rounded-full">
                        Already Applied
                      </span>
                    )}
                  </label>
                );
              })}
            </div>
            {formData.selectedTerms.length > 0 && (
              <div className="mt-4 p-3 bg-gray-50 border border-gray-200 rounded-lg">
                <p className="text-sm text-black-700 font-medium mb-2">
                  Selected Terms ({formData.selectedTerms.length}):
                </p>
                <div className="flex flex-wrap gap-2">
                  {formData.selectedTerms.map((term: string) => {
                    const [year, semester] = term.split('-');
                    return (
                      <span 
                        key={term}
                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                      >
                        {year} {semester}
                        <button
                          type="button"
                          className="ml-1 inline-flex items-center justify-center w-4 h-4 rounded-full hover:bg-blue-200"
                          onClick={() => {
                            const currentTerms = formData.selectedTerms.filter((t: string) => t !== term);
                            const event = {
                              target: {
                                name: 'selectedTerms',
                                value: currentTerms
                              }
                            } as any;
                            handleChange(event);
                          }}
                        >
                          ×
                        </button>
                      </span>
                    );
                  })}
                </div>
              </div>
            )}
            {errors.selectedTerms && <p className="text-sm text-red-600 mt-1">{errors.selectedTerms}</p>}
          </div>
        </div>
      </section>
      
      {/* Subject Preferences */}
      <section>
        <h2 className="text-lg font-semibold mb-4">Subject Preferences</h2>
        {loading ? (
          <div className="text-gray-600">Loading department codes...</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {(['firstPreference','secondPreference','thirdPreference'] as const).map(pref => (
              <div key={pref}>
                <label className="block mb-1 font-semibold text-lg md:text-lg" htmlFor={pref}>
                  {pref === 'firstPreference' ? '1st Preference*'
                    : pref === 'secondPreference' ? '2nd Preference*'
                    : '3rd Preference*'}
                </label>
                <select
                  id={pref}
                  name={pref}
                  aria-label={
                    pref === 'firstPreference' ? '1st Preference*' :
                    pref === 'secondPreference' ? '2nd Preference*' :
                    '3rd Preference*'
                  }
                  value={formData[pref]}
                  onChange={handleChange}
                  className="w-full border rounded px-3 py-2 text-base md:text-base min-h-[36px] md:min-h-[40px]"
                  disabled={loading}
                >
                  <option value="">Select</option>
                  {!loading && deptCodes.length === 0 && (
                    <option value="" disabled>
                      No Course Data
                    </option>
                  )}
                  {deptCodes.map(code => (
                    <option key={code} value={code}>{code}</option>
                  ))}
                </select>
                {errors[pref] && <p className="text-sm text-red-600 mt-1">{errors[pref]}</p>}
              </div>
            ))}
          </div>
        )}
      </section>

    {/* Calendar Error Handling */}
    {(errors.availability || errors.calendar || errors.startTime || errors.endTime) && (
      <div className="text-sm text-red-600 mt-2">
        {errors.availability && <div>{errors.availability}</div>}
        {errors.calendar && <div>{errors.calendar}</div>}
        {errors.startTime && <div>{errors.startTime}</div>}
        {errors.endTime && <div>{errors.endTime}</div>}
        {errors.invalidTime && <div>{errors.invalidTime}</div>}
        {errors.timeOrder && <div>{errors.timeOrder}</div>}
      </div>
    )}

    {/* Hours Requested */}
    <section>
      <label className="block mb-2 font-semibold text-base md:text-lg" htmlFor="wantWorkingHours">Hours Requested*</label>
      <input
        id="wantWorkingHours"
        type="number"
        name="wantWorkingHours"
        value={formData.wantWorkingHours}
        onChange={handleChange}
        className="w-full border rounded px-3 py-2 text-base md:text-base min-h-[36px] md:min-h-[40px]"
        placeholder="Enter hours"
        min={2}
        max={30}
        required
      />
      {errors.wantWorkingHours && <p className="text-sm text-red-600 mt-1">{errors.wantWorkingHours}</p>}
      {formData.wantWorkingHours && Number(formData.wantWorkingHours) > 12 && (
        <p className="text-sm text-red-600 mt-1">The value must be less than or equal to 12</p>
      )}
      {formData.wantWorkingHours && Number(formData.wantWorkingHours) < 2 && (
        <p className="text-sm text-red-600 mt-1">The value must be greater than or equal to 2</p>
      )}
    </section>

    {/* Application Type */}
    <section>
      <label className="block mb-2 font-semibold text-base md:text-lg" id="applicationTypeLabel">Application Type*</label>
      <div className="flex gap-6">
        {(['UNDERGRADUATE', 'GRADUATE'] as const).map(type => (
          <label key={type} className="inline-flex items-center space-x-2 text-base md:text-base min-h-[36px] md:min-h-[40px]" htmlFor={`applicationType-${type}`}>
            <input
              id={`applicationType-${type}`}
              type="radio"
              name="applicationType"
              value={type}
              checked={formData.applicationType === type}
              onChange={handleChange}
              className="form-radio text-indigo-600"
              aria-labelledby="applicationTypeLabel"
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
      <label className="block mb-2 font-semibold text-base md:text-lg" id="remoteWorkPreferenceLabel">Remote Work Preference*</label>
      <div className="flex gap-6">
        {(['yes', 'no'] as const).map(option => (
          <label key={option} className="inline-flex items-center space-x-2 text-base md:text-base min-h-[36px] md:min-h-[40px]" htmlFor={`wantRemote-${option}`}> 
            <input
              id={`wantRemote-${option}`}
              type="radio"
              name="wantRemote"
              value={option}
              checked={formData.wantRemote === option}
              onChange={handleChange}
              className="form-radio text-indigo-600"
              aria-labelledby="remoteWorkPreferenceLabel"
            />
            <span className="capitalize">{option}</span>
          </label>
        ))}
      </div>
      {errors.wantRemote && (
        <p className="text-sm text-red-600 mt-1">{errors.wantRemote}</p>
      )}
    </section>

    {children}

    {/* Buttons */}
    <div className="flex flex-col sm:flex-row justify-end gap-3 sm:gap-4 pt-4">
      <button
        type="button"
        className="px-5 py-2 border border-gray-400 text-gray-700 rounded hover:bg-gray-100"
        onClick={() => window.history.back()}
      >
        Cancel
      </button>
      <button
        type="submit"
        onClick={(e) => {
          if (deadlinePassed) {
            e.preventDefault(); // prevent form submission
            toast.error("The application deadline has passed. You can no longer submit.");
          }
        }}
        className={`px-6 py-2 rounded ${
          deadlinePassed
            ? "bg-gray-400 cursor-not-allowed"
            : "px-6 py-2 bg-[#040941] text-white rounded hover:bg-[#030735]"
        }`}
        disabled={loading}
      >
        {isUpdate ? 'Update Application' : 'Submit Application'}
      </button>
    </div>

    {/* Profile Confirmation (last field) */}
    <section className="flex items-start mt-8">
      <input
        id="confirmProfileUpdated"
        type="checkbox"
        name="confirmProfileUpdated"
        checked={formData.confirmProfileUpdated}
        onChange={handleChange}
        className="mt-1 mr-2 min-h-[14px] min-w-[14px] md:min-h-[18px] md:min-w-[18px]"
      />
      <label htmlFor="confirmProfileUpdated" className="text-base md:text-base text-gray-700">
        I confirm that I have updated my profile, as it will be used in the TA allocation decision process.*
      </label>
    </section>
    {errors.confirmProfileUpdated && <p className="text-sm text-red-600 mt-1">{errors.confirmProfileUpdated}</p>}
  </form>
  );
};

export default ApplicationForm;
