import React from 'react';
import ApplicationDetails from '../../../components/features/application/applicationsubmission/ApplicationDetails';
import { toast } from 'react-toastify';
import type { ApplicationDto } from '../../../interfaces/application/Application';

interface ApplicationListProps {
  existingApplications: ApplicationDto[];
  expandedAppId: number | null;
  setExpandedAppId: (id: number | null) => void;
  setSavedApp: (app: ApplicationDto | null) => void;
  userId: string | number | null;
  token: string | null;
  userRoles: string[];
  fetchApplicationsByStudent: (userId: number, token: string) => Promise<ApplicationDto[]>;
  setExistingApplications: (apps: ApplicationDto[]) => void;
  setExistingTerms: (terms: Set<string>) => void;
  setSubmitted: (val: boolean) => void;
  clearForm: () => void;
}

const ApplicationList: React.FC<ApplicationListProps> = ({
  existingApplications,
  expandedAppId,
  setExpandedAppId,
  setSavedApp,
  userId,
  token,
  userRoles,
  fetchApplicationsByStudent,
  setExistingApplications,
  setExistingTerms,
  setSubmitted,
  clearForm,
}) => {
  return (
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
                                // Fetch existing applications after deletion
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
  );
};

export default ApplicationList;
