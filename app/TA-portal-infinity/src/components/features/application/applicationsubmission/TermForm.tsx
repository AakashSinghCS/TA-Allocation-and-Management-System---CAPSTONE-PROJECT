import React, { useEffect, useState } from 'react';
import { getAllDeptCodes } from '../../../../api/course/getAllDeptCodes';
import { useAuth } from '../../../../context/AuthContext';

interface TermFormProps {
  termKey: string;
  formData: any;
  errors: { [key: string]: string };
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  isUpdate?: boolean;
}

const TermForm: React.FC<TermFormProps> = ({ 
  termKey, 
  formData, 
  errors, 
  handleChange, 
  isUpdate = false 
}) => {
  const [deptCodes, setDeptCodes] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const { token, userId, userRoles } = useAuth();

  const [year, semester] = termKey.split('-');

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    
    const fetchData = async () => {
      try {
        const codes = await getAllDeptCodes(token ?? undefined, userId, userRoles);
        if (isMounted) {
          setDeptCodes(Array.isArray(codes) ? codes : []);
        }
      } catch (error) {
        if (isMounted) {
          setDeptCodes([]);
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

  const getFieldError = (fieldName: string) => {
    return errors[`${termKey}-${fieldName}`] || errors[fieldName] || '';
  };

  return (
    <div className="space-y-6">
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
        <h3 className="text-xl font-bold text-blue-900 mb-2">
          Application for {year} {semester}
          {isUpdate && <span className="ml-2 text-sm font-normal text-orange-600">(Updating Existing)</span>}
        </h3>
        <p className="text-blue-900">
          Complete the form below for your {year} {semester} TA application.
        </p>
        {/* Show per-term availability slot count */}
        {formData.availability && Array.isArray(formData.availability) ? (
          <div className="mt-2 text-sm text-gray-800">
            <span className="font-semibold">Availability:</span>
            <span className="ml-2">
              {formData.availability.length > 0 ? `${formData.availability.length} slot${formData.availability.length > 1 ? 's' : ''}` : 'None'}
            </span>
          </div>
        ) : null}
      </div>

      {/* Course Preferences */}
      <section>
        <label className="block mb-2 font-semibold text-base md:text-lg">Course Preferences*</label>
        {loading ? (
          <div className="text-gray-600">Loading department codes...</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {(['firstPreference','secondPreference','thirdPreference'] as const).map(pref => (
              <div key={pref}>
                <label className="block mb-1 font-semibold text-lg md:text-lg" htmlFor={`${termKey}-${pref}`}>
                  {pref === 'firstPreference' ? '1st Preference*'
                    : pref === 'secondPreference' ? '2nd Preference*'
                    : '3rd Preference*'}
                </label>
                <select
                  id={`${termKey}-${pref}`}
                  name={pref}
                  value={formData[pref] || ''}
                  onChange={handleChange}
        className="w-full border rounded-md px-2 py-1.5 text-base sm:text-sm min-h-[32px]"
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
                {getFieldError(pref) && <p className="text-sm text-red-600 mt-1">{getFieldError(pref)}</p>}
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Hours Requested */}
      <section>
        <label className="block mb-2 font-semibold text-base md:text-lg" htmlFor={`${termKey}-wantWorkingHours`}>Hours Requested*</label>
        <input
          id={`${termKey}-wantWorkingHours`}
          type="number"
          name="wantWorkingHours"
          value={formData.wantWorkingHours || ''}
          onChange={handleChange}
        className="w-full border rounded-md px-2 py-1.5 text-base sm:text-sm min-h-[32px]"
          placeholder="Enter hours"
          min={2}
          max={30}
          required
        />
        {getFieldError('wantWorkingHours') && <p className="text-sm text-red-600 mt-1">{getFieldError('wantWorkingHours')}</p>}
        {formData.wantWorkingHours && Number(formData.wantWorkingHours) > 12 && (
          <p className="text-sm text-red-600 mt-1">The value must be less than or equal to 12</p>
        )}
        {formData.wantWorkingHours && Number(formData.wantWorkingHours) < 2 && (
          <p className="text-sm text-red-600 mt-1">The value must be greater than or equal to 2</p>
        )}
      </section>

      {/* Application Type */}
      <section>
        <label className="block mb-2 font-semibold text-base md:text-lg" id={`${termKey}-applicationTypeLabel`}>Application Type*</label>
        <div className="flex gap-6">
          {(['UNDERGRADUATE', 'GRADUATE'] as const).map(type => (
            <label key={type} className="inline-flex items-center space-x-2 text-base md:text-base min-h-[36px] md:min-h-[40px]" htmlFor={`${termKey}-applicationType-${type}`}>
              <input
                id={`${termKey}-applicationType-${type}`}
                type="radio"
                name="applicationType"
                value={type}
                checked={formData.applicationType === type}
                onChange={handleChange}
                className="form-radio text-indigo-600 min-h-[32px]"
                aria-labelledby={`${termKey}-applicationTypeLabel`}
              />
              <span className="capitalize">{type.toLowerCase()}</span>
            </label>
          ))}
        </div>
        {getFieldError('applicationType') && (
          <p className="text-sm text-red-600 mt-1">{getFieldError('applicationType')}</p>
        )}
      </section>

      {/* Remote Preference */}
      <section>
        <label className="block mb-2 font-semibold text-base md:text-lg" id={`${termKey}-remoteWorkPreferenceLabel`}>Remote Work Preference*</label>
        <div className="flex gap-6">
          {(['yes', 'no'] as const).map(option => (
            <label key={option} className="inline-flex items-center space-x-2 text-base md:text-base min-h-[36px] md:min-h-[40px]" htmlFor={`${termKey}-wantRemote-${option}`}>
              <input
                id={`${termKey}-wantRemote-${option}`}
                type="radio"
                name="wantRemote"
                value={option}
                checked={formData.wantRemote === option}
                onChange={handleChange}
                className="form-radio text-indigo-600 min-h-[32px]"
                aria-labelledby={`${termKey}-remoteWorkPreferenceLabel`}
              />
              <span className="capitalize">{option}</span>
            </label>
          ))}
        </div>
        {getFieldError('wantRemote') && (
          <p className="text-sm text-red-600 mt-1">{getFieldError('wantRemote')}</p>
        )}
      </section>

      {/* Profile Confirmation */}
      <section>
        <label className="block mb-2 font-semibold text-base md:text-lg" htmlFor={`${termKey}-confirmProfileUpdated`}>Profile Confirmation*</label>
        <div className="flex items-center gap-3">
          <input
            id={`${termKey}-confirmProfileUpdated`}
            type="checkbox"
            name="confirmProfileUpdated"
            checked={formData.confirmProfileUpdated || false}
            onChange={handleChange}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label htmlFor={`${termKey}-confirmProfileUpdated`} className="text-sm font-base text-gray-900">
            I confirm that my profile information is up-to-date and accurate.*
          </label>
        </div>
        {getFieldError('confirmProfileUpdated') && (
          <p className="text-sm text-red-600 mt-1">{getFieldError('confirmProfileUpdated')}</p>
        )}
      </section>
    </div>
  );
};

export default TermForm;
