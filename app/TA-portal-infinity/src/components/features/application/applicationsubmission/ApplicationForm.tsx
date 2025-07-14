import React, { useEffect, useState } from 'react';
import { getAllDeptCodes } from '../../../../api/course/getAllDeptCodes';
import { useAuth } from '../../../../context/AuthContext';
import type { DeadlineDto } from '../../../../interfaces/admin/Deadline';
import { fetchDeadlines } from '../../../../api/admin/FetchDeadline';
import { toast } from "react-toastify";


interface ApplicationFormProps {
  formData: any;
  errors: { [key: string]: string };
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  handleSubmit: (e: React.FormEvent) => void;
  children?: React.ReactNode;
  isUpdate?: boolean;
}

const ApplicationForm: React.FC<ApplicationFormProps> = ({ formData, errors, handleChange, handleSubmit, children, isUpdate }) => {
  const [deptCodes, setDeptCodes] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const { token, userId, userRoles } = useAuth();

  const [applicationDeadline, setApplicationDeadline] = useState<DeadlineDto | null>(null);
  const [deadlineError, setDeadlineError] = useState("");

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    getAllDeptCodes(token ?? undefined, userId, userRoles)
      .then((codes) => {
        if (isMounted) {
          setDeptCodes(Array.isArray(codes) ? codes : []);
          setLoading(false);
        }
      })
      .catch(() => {
        if (isMounted) {
          setDeptCodes([]); // fallback to empty array
          setLoading(false);
        }
      });
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
    <form onSubmit={handleSubmit} className="space-y-8 md:space-y-10 lg:space-y-12" role="form">
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

    {/* Transcript Upload */}
    <section>
      <label className="block mb-2 font-semibold text-base md:text-lg" htmlFor="transcriptFile">Upload Transcript*</label>
      <div className="flex items-center gap-3">
        <label className="bg-[#040941] text-white px-6 py-2 rounded cursor-pointer hover:bg-[#030735] text-base md:text-base min-h-[36px] md:min-h-[40px] flex items-center" htmlFor="transcriptFile">
          Choose File
          <input
            id="transcriptFile"
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
          aria-label="Transcript File Name"
        />
      </div>
      {errors.transcriptFile && <p className="text-sm text-red-600 mt-1">{errors.transcriptFile}</p>}
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

    {/* Profile Confirmation */}
    <section className="flex items-start">
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
  </form>
  );
};

export default ApplicationForm;
