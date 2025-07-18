import React from 'react';
import { Link } from 'react-router-dom';

interface TasksOverviewProps {
  totalDeadlines: number;
  activeDeadlines: number;
  deadlines: any[];
  daysUntilList: number[];
  formatDeadlineName: (name: string) => string;
  progressColor: string;
  tasksDash1: number;
  tasksDash2: number;
  sectionsNeedingTAs: number;
  profileDash1: number;
  profileDash2: number;
  profileColor: string;
  questionsCount: number;
}

const TasksOverview: React.FC<TasksOverviewProps> = ({
  totalDeadlines,
  activeDeadlines,
  deadlines,
  daysUntilList,
  formatDeadlineName,
  progressColor,
  tasksDash1,
  tasksDash2,
  sectionsNeedingTAs,
  profileDash1,
  profileDash2,
  profileColor,
  questionsCount,
}) => (
  <div className="bg-white rounded-lg shadow p-4 flex flex-col items-center w-full max-w-xs sm:max-w-sm">
    <h2 className="font-semibold text-gray-700 mt-1">Tasks Overview</h2>
    <div className="flex flex-col items-center space-y-6">
      <hr className="my-6 w-full border-gray-300" />
      {/* Deadline(s) Tasks */}
      <div className="flex flex-col items-center">
        <p className="text-sm font-medium text-gray-700 mb-2">Deadline(s)</p>
        <div className="relative w-32 h-32">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
            <circle className="text-gray-200" strokeWidth="6" stroke="currentColor" fill="none" cx="18" cy="18" r="15" />
            <circle
              className={progressColor}
              strokeWidth="6"
              strokeDasharray={`${tasksDash1},${tasksDash2}`}
              stroke="currentColor"
              fill="none"
              cx="18"
              cy="18"
              r="15"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center text-lg font-semibold">
            {activeDeadlines}/{totalDeadlines}
          </div>
        </div>
        <ul className="mt-2 space-y-4 w-full">
          {deadlines.map((d, idx) => {
            const days = daysUntilList[idx];
            const due = new Date(d.endTime).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
            const textColor = days <= 7 ? 'text-red-700' : days <= 14 ? 'text-yellow-700' : 'text-green-700';
            const formatted = formatDeadlineName(d.name);
            const displayName = d.name === 'instructor_need_update_deadline'
              ? 'Instructor Need Deadline'
              : formatted;
            return (
              <li key={d.name}>
                <Link
                  to="/user/coordinator/deadlines"
                  className={`text-sm font-medium ${textColor} hover:underline`}
                >
                  {displayName} - {due}
                </Link>
                <p className="text-xs text-gray-500">{days} days left</p>
              </li>
            );
          })}
        </ul>
        {deadlines.length < totalDeadlines && (
          <Link to="/user/coordinator/deadlines" className="mt-2 text-sm text-blue-600 hover:underline">
            {totalDeadlines - deadlines.length} deadline(s) missing
          </Link>
        )}
      </div>
      <hr className="my-6 -mt-2 w-full border-gray-300" />
      {/* Courses Requiring TAs Circle */}
      <div className="flex flex-col items-center">
        <p className="text-sm font-medium text-gray-700 mb-2">Courses Requiring TAs</p>
        <div className="relative w-32 h-32">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
            <circle className="text-gray-200" strokeWidth="6" stroke="currentColor" fill="none" cx="18" cy="18" r="15" />
            <circle
              className={sectionsNeedingTAs === 0 ? 'text-green-700' : sectionsNeedingTAs < 10 ? 'text-yellow-500' : 'text-red-700'}
              strokeWidth="6"
              strokeDasharray={`${sectionsNeedingTAs === 0 ? 100 : Math.min(100, Math.round((sectionsNeedingTAs / 10) * 100))},${sectionsNeedingTAs === 0 ? 0 : 100 - Math.min(100, Math.round((sectionsNeedingTAs / 10) * 100))}`}
              stroke="currentColor"
              fill="none"
              cx="18"
              cy="18"
              r="15"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center text-lg font-semibold">
            {sectionsNeedingTAs}
          </div>
        </div>
        <Link to="/user/coordinator/allocation" className="mt-4 text-sm text-blue-800 font-medium hover:underline">
          View Sections Needing TAs
        </Link>
      </div>
      <hr className="my-6 -mt-2 w-full border-gray-300" />
      {/* Profile Questions Section */}
      <div className="flex flex-col items-center">
        <p className="text-sm font-medium text-gray-700 mb-2">Profile Question(s)</p>
        <div className="relative w-32 h-32">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
            <circle className="text-gray-200" strokeWidth="6" stroke="currentColor" fill="none" cx="18" cy="18" r="15" />
            <circle
              className={profileColor}
              strokeWidth="6"
              strokeDasharray={`${profileDash1},${profileDash2}`}
              stroke="currentColor"
              fill="none"
              cx="18"
              cy="18"
              r="15"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center text-lg font-semibold">
            {questionsCount}
          </div>
        </div>
        <Link to="/user/coordinator/questions" className="mt-2 mb-2 text-sm text-blue-800 font-medium hover:underline">
          Manage Profile Questions
        </Link>
      </div>
    </div>
  </div>
);

export default TasksOverview;
