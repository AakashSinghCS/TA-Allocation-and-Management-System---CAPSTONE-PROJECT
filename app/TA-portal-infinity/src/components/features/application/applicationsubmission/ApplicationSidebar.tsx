import React from 'react';

interface ApplicationSidebarProps {
  formData: any;
  availability: any[];
  submitted: boolean;
  errors: { [key: string]: string };
  existingTerms?: Set<string>;
}

const steps = [
  {
    label: 'Select Terms',
    description: 'Choose one or more terms to apply for.',
    key: 'selectedTerms',
    done: (formData: any) => formData.selectedTerms && formData.selectedTerms.length > 0,
  },
  {
    label: 'Select Preferences',
    description: 'Choose your top 3 subject preferences.',
    key: 'preferences',
    done: (formData: any) => !!formData.firstPreference && !!formData.secondPreference && !!formData.thirdPreference,
  },
  {
    label: 'Add Working Hours',
    description: 'Indicate how many hours you wish to work.',
    key: 'wantWorkingHours',
    done: (formData: any) => !!formData.wantWorkingHours,
  },
  {
    label: 'Upload Transcript',
    description: 'Attach a valid transcript file.',
    key: 'transcriptFile',
    done: (formData: any) => !!formData.transcriptFile,
  },
  {
    label: 'Application Type',
    description: 'Select the type of application you are submitting.',
    key: 'applicationType',
    done: (formData: any) => !!formData.applicationType,
  },
  {
    label: 'Remote Preference',
    description: 'Select if you want to work remotely.',
    key: 'wantRemote',
    done: (formData: any) => !!formData.wantRemote,
  },
  {
    label: 'Select Availability',
    description: 'Pick at least one available time slot.',
    key: 'availability',
    done: (_: any, availability: any[]) => availability.length > 0,
  },
  {
    label: 'Confirm Profile Update',
    description: 'Acknowledge your profile is up-to-date.',
    key: 'confirmProfileUpdated',
    done: (formData: any) => formData.confirmProfileUpdated,
  },
  {
    label: 'Submit Application',
    description: 'Click submit once all sections are complete.',
    key: 'submitted',
    done: (_: any, __: any[], submitted: boolean) => submitted,
  },
];

const ApplicationSidebar: React.FC<ApplicationSidebarProps> = ({ formData, availability, submitted, existingTerms = new Set() }) => (
  <aside className="w-full sm:w-[320px] self-start bg-white border border-blue-200 shadow-md p-4 md:p-6 rounded-xl mb-8 sm:mb-0 mx-auto sm:mx-0" style={{ maxWidth: 400 }}>
    <h3 className="text-lg font-semibold text-[#040941] mb-4">Application Steps</h3>
    
    {/* Show which terms are being updated */}
    {formData.selectedTerms && formData.selectedTerms.length > 0 && (
      <div className="mb-4 p-3 rounded-lg bg-blue-50 border border-blue-200">
        <h4 className="font-semibold text-blue-800 mb-2">Selected Terms:</h4>
        <div className="space-y-1">
          {formData.selectedTerms.map((term: string) => {
            const [year, semester] = term.split('-');
            const isExisting = existingTerms.has(term);
            return (
              <div key={term} className={`text-xs px-2 py-1 rounded ${isExisting ? 'bg-orange-100 text-orange-800' : 'bg-green-100 text-green-800'}`}>
                {year} {semester} {isExisting ? '(Updating)' : '(New)'}
              </div>
            );
          })}
        </div>
      </div>
    )}
    
    <ul className="space-y-6 text-sm text-gray-700">
      {steps.map((step, idx) => {
        let isDone;
        if (step.key === 'availability') {
          isDone = step.done(formData, availability, submitted);
        } else if (step.key === 'submitted') {
          isDone = step.done(formData, availability, submitted);
        } else {
          isDone = step.done(formData, availability, submitted);
        }
        return (
          <li key={idx} className="flex items-start gap-3">
            <div className={`h-6 w-6 flex items-center justify-center rounded-full border-2 ${isDone ? 'bg-green-500 border-green-500' : 'border-gray-300'}`}>
              {isDone ? (
                <svg className="h-4 w-4 text-white" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <div className="h-2 w-2 bg-gray-300 rounded-full" />
              )}
            </div>
            <span>
              <strong>{step.label}</strong><br />
              {step.description}
            </span>
          </li>
        );
      })}
    </ul>
  </aside>
);

export default ApplicationSidebar;
