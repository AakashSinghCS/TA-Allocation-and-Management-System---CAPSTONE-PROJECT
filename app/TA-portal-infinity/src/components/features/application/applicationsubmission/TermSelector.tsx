import React, { useEffect, useState } from 'react';
import { useAuth } from '../../../../context/AuthContext';
import { getActiveSemesters } from '../../../../api/semester/getActiveSemesters';
import type { Semester } from '../../../../interfaces/semester/Semester';

interface TermSelectorProps {
  selectedTerms: string[];
  existingTerms: Set<string>;
  onTermToggle: (termKey: string, isSelected: boolean) => void;
}

const TermSelector: React.FC<TermSelectorProps> = ({ 
  selectedTerms, 
  existingTerms, 
  onTermToggle 
}) => {
  const [activeSemesters, setActiveSemesters] = useState<Semester[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const { token } = useAuth();

  useEffect(() => {
    let isMounted = true;
    
    const fetchSemesters = async () => {
      try {
        const semesters = await getActiveSemesters(token ?? '');
        if (isMounted) {
          setActiveSemesters(semesters);
        }
      } catch (error) {
        if (isMounted) {
          setActiveSemesters([]);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchSemesters();
    
    return () => {
      isMounted = false;
    };
  }, [token]);

  if (loading) {
    return <div className="text-gray-600">Loading available terms...</div>;
  }

  if (activeSemesters.length === 0) {
    return (
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-6 text-center">
        <div className="flex justify-center mb-4">
          <svg className="w-12 h-12 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-amber-800 mb-2">
          Applications Currently Unavailable
        </h3>
        <p className="text-amber-700 mb-4">
          There are no active application periods at this time. TA applications are only available during designated enrollment periods.
        </p>
        <div className="bg-amber-100 border border-amber-300 rounded-md p-3 text-sm text-amber-800">
          <p className="font-medium mb-1">What you can do:</p>
          <ul className="text-left space-y-1">
            <li>• Check back during the next application period</li>
            <li>• Contact the department for application timeline information</li>
            <li>• Ensure your profile is up-to-date for when applications open</li>
          </ul>
        </div>
      </div>
    );
  }

  return (
    <section>
      <label className="block mb-2 font-semibold text-base md:text-lg">
        Select Terms to Apply For*
      </label>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {activeSemesters.map(sem => {
          const termValue = `${sem.year}-${sem.semester}`;
          const isSelected = selectedTerms.includes(termValue);
          const hasExistingApplication = existingTerms.has(termValue);
          
          return (
            <label 
              key={termValue} 
              className={`
                flex items-center p-2 border rounded-md cursor-pointer transition-all relative min-w-0
                text-base sm:text-sm
                ${isSelected 
                  ? (hasExistingApplication 
                      ? 'border-gray-500 bg-gray-50 text-gray-700' 
                      : 'border-gray-500 bg-gray-50 text-gray-700')
                  : (hasExistingApplication 
                      ? 'border-gray-500 bg-orange-25 hover:border-orange-400 hover:bg-orange-50' 
                      : 'border-gray-300 bg-white hover:border-gray-400 hover:bg-gray-50')
                }
              `}
            >
              <input
                type="checkbox"
                className="mr-2 h-3.5 w-3.5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                checked={isSelected}
                onChange={(e) => onTermToggle(termValue, e.target.checked)}
              />
              <span className="font-medium text-base sm:text-sm">
                {sem.year} {sem.semester}
              </span>
              {hasExistingApplication && (
                <span className="ml-auto text-xs font-semibold text-amber-600 bg-amber-100 px-1.5 py-0.5 rounded-full">
                  Already Applied
                </span>
              )}
            </label>
          );
        })}
      </div>
      
      {selectedTerms.length > 0 && (
        <div className="mt-3 p-3 bg-gray-50 border border-gray-200 rounded-lg">
          <h4 className="font-semibold text-black mb-2">Selected Terms:</h4>
          <div className="flex flex-wrap gap-2">
            {selectedTerms.map(termKey => {
              const [year, semester] = termKey.split('-');
              const hasExisting = existingTerms.has(termKey);
              return (
                <span 
                  key={termKey}
                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                    hasExisting 
                      ? 'bg-amber-100 text-amber-800 border border-amber-300'
                      : 'bg-blue-100 text-blue-800 border border-blue-300'
                  }`}
                >
                  {year} {semester}
                  {hasExisting && ' (Update)'}
                  <button
                    type="button"
                    onClick={() => onTermToggle(termKey, false)}
                    className="ml-2 text-current hover:text-red-600"
                  >
                    ×
                  </button>
                </span>
              );
            })}
          </div>
        </div>
      )}
    </section>
  );
};

export default TermSelector;
