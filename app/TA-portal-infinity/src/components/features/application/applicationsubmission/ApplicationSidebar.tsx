import { Info } from 'lucide-react';
import React from 'react';


interface SidebarProps {
  selectedTerms: string[];
  getTermFormData: (termKey: string) => any;
}


const statusIcon = (complete: boolean) => (
  <span className={`w-7 h-7 flex items-center justify-center rounded-full shadow ${complete ? 'bg-green-500' : 'bg-gray-300'}`}>
    {complete ? (
      <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
    ) : (
      <svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><circle cx="12" cy="12" r="10" strokeWidth={2} /></svg>
    )}
  </span>
);

const progressBar = (percent: number) => (
  <div className="w-full h-2 bg-gray-200 rounded-full mt-2">
    <div className="h-2 rounded-full" style={{ width: `${percent}%`, background: percent === 100 ? '#22c55e' : '#3b82f6', transition: 'width 0.3s' }}></div>
  </div>
);

const ApplicationSidebar: React.FC<SidebarProps> = ({ selectedTerms, getTermFormData }) => {
  return (
    <div className="p-0 h-fit relative">
      <h3 className="font-bold text-xl mb-5 text-[#040941] flex items-center gap-2">
        Application Progress
      </h3>
      <div className="mb-4 flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <span className="font-medium text-gray-700">Terms Selected:</span>
          <span className={`font-semibold ${selectedTerms.length > 0 ? 'text-green-600' : 'text-gray-400'}`}>{selectedTerms.length > 0 ? `${selectedTerms.length}` : 'None'}</span>
        </div>
      </div>
      <div className="space-y-4">
        {selectedTerms.length === 0 && (
          <div className="text-sm text-gray-500">No terms selected. Please select a term to begin your application.</div>
        )}
        {selectedTerms
          .map(termKey => {
            const [year, semester] = termKey.split('-');
            const formData = getTermFormData(termKey);
            const missingFields = [];
            if (!formData.firstPreference) missingFields.push('Preference');
            if (!formData.wantWorkingHours) missingFields.push('Working Hours');
            if (!formData.applicationType) missingFields.push('Type');
            if (!formData.confirmProfileUpdated) missingFields.push('Profile');
            const isComplete = missingFields.length === 0;
            // Progress calculation (out of 4 main fields)
            const filled = [formData.firstPreference, formData.wantWorkingHours, formData.applicationType, formData.confirmProfileUpdated].filter(Boolean).length;
            const percent = Math.round((filled / 4) * 100);
            if (isComplete) return null; 
            return (
              <div key={termKey} className="rounded-lg shadow flex flex-col px-4 py-3 gap-2">
                <div className="flex items-center gap-4">
                  {statusIcon(false)}
                  <div className="flex-1">
                    <div className="font-semibold text-[#040941] text-base">{year} {semester}</div>
                    <div className="mt-1 text-xs text-red-500">Missing: {missingFields.join(', ')}</div>
                  </div>
                </div>
                {progressBar(percent)}
                <div className="grid grid-cols-2 gap-2 mt-2 text-xs">
                  <div className="bg-white rounded p-2 shadow-sm flex flex-col">
                    <span className="font-semibold text-gray-700">Type</span>
                    <span className="text-gray-600">{formData.applicationType || <span className="text-gray-400">Not selected</span>}</span>
                  </div>
                  <div className="bg-white rounded p-2 shadow-sm flex flex-col">
                    <span className="font-semibold text-gray-700">Remote</span>
                    <span className="text-gray-600">{formData.wantRemote === 'yes' ? 'Yes' : formData.wantRemote === 'no' ? 'No' : <span className="text-gray-400">Not set</span>}</span>
                  </div>
                  <div className="bg-white rounded p-2 shadow-sm flex flex-col">
                    <span className="font-semibold text-gray-700">Working Hours</span>
                    <span className="text-gray-600">{formData.wantWorkingHours || <span className="text-gray-400">Not set</span>}</span>
                  </div>
                  <div className="bg-white rounded p-2 shadow-sm flex flex-col">
                    <span className="font-semibold text-gray-700">Preferences</span>
                    <span className="text-gray-600">{formData.firstPreference || <span className="text-gray-400">Not set</span>}</span>
                  </div>
                </div>
              </div>
            );
          })}
        {/* If all terms are complete, show a message */}
        {selectedTerms.length > 0 && selectedTerms.every(termKey => {
          const formData = getTermFormData(termKey);
          const missingFields = [];
          if (!formData.firstPreference) missingFields.push('Preference');
          if (!formData.wantWorkingHours) missingFields.push('Working Hours');
          if (!formData.applicationType) missingFields.push('Type');
          if (!formData.confirmProfileUpdated) missingFields.push('Profile');
          return missingFields.length === 0;
        }) && (
          <div className="text-sm text-green-600">All selected term applications are complete!</div>
        )}
        {/* Info banner to view submitted applications */}
        <div className="w-full mt-6">
          <div className="bg-blue-100 border border-blue-300 rounded-lg px-4 py-3 flex items-center gap-3">
            <Info className="w-5 h-5 text-blue-600 flex-shrink-0" />
            <span className="text-sm text-[#040941] flex-1">
              You can <a href="/user/student/view-applications" rel="noopener noreferrer" className="underline text-blue-700 hover:text-blue-900 font-medium">view your submitted TA applications</a> and check their status anytime.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApplicationSidebar;
