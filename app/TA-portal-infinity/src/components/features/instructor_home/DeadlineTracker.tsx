import React from "react";
import type { Deadline } from "../../../interfaces/config/Deadline";

interface DeadlineTrackerProps {
  deadlines: Deadline[];
  totalDeadlines: number;
}

function daysUntil(dateStr: string) {
  const now = new Date();
  const date = new Date(dateStr);
  return Math.ceil((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

function getCircleColor(days: number) {
  if (days <= 7) return "text-red-700";
  if (days <= 14) return "text-yellow-700";
  return "text-green-700";
}

export const DeadlineTracker: React.FC<DeadlineTrackerProps> = ({ deadlines, totalDeadlines }) => {
  const now = new Date();
  const activeDeadlines = deadlines.filter(d => new Date(d.endTime) > now);
  const tasksProgress = Math.floor((activeDeadlines.length / totalDeadlines) * 100);
  const tasksDash1 = tasksProgress > 0 ? tasksProgress : 100;
  const tasksDash2 = tasksProgress > 0 ? 100 - tasksProgress : 0;

  // Compute days left for the main deadline (first in list)
  let daysNum = '';
  let daysLabel = '';
  if (deadlines.length > 0) {
    const now = new Date();
    const end = new Date(deadlines[0].endTime);
    const diffDays = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays > 1) {
      daysNum = diffDays.toString();
      daysLabel = 'days left';
    } else if (diffDays === 1) {
      daysNum = '1';
      daysLabel = 'day left';
    } else if (diffDays === 0) {
      daysNum = '';
      daysLabel = 'Due Today';
    } else {
      daysNum = '';
      daysLabel = 'Overdue';
    }
  } else {
    daysNum = '';
    daysLabel = 'No Deadline';
  }

  let urgentColorHex = "#15803D"; // green
  if (deadlines.length > 0) {
    const now = new Date();
    const end = new Date(deadlines[0].endTime);
    const diffDays = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays <= 7) {
      urgentColorHex = "#B91C1C"; // red
    } else if (diffDays <= 14) {
      urgentColorHex = "#F59E42"; // yellow
    }
  }

  return (
    <div className="bg-white rounded-lg shadow p-4 flex flex-col items-center w-full max-w-xs">
      <h2 className="font-semibold text-gray-700 mt-1 mb-4">Deadline(s)</h2>
      <hr className="w-full border-gray-300 mb-4" />
      <div className="flex flex-col items-center">
        <div className="relative w-32 h-32">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
            <circle className="text-gray-200" strokeWidth="6" stroke="currentColor" fill="none" cx="18" cy="18" r="15" />
            <circle
              strokeWidth="6"
              strokeDasharray={`${tasksDash1},${tasksDash2}`}
              stroke={urgentColorHex}
              fill="none"
              cx="18"
              cy="18"
              r="15"
            />
          </svg>
          <div
            className="absolute inset-0 flex flex-col items-center justify-center"
            style={{textAlign: 'center', width: '100%'}}>
            {daysNum && (
              <span
                className="font-bold text-2xl sm:text-3xl"
                style={{color: urgentColorHex}}>
                {daysNum}
              </span>
            )}
            <span
              className="font-semibold text-xs sm:text-sm mt-0.5"
              style={{color: urgentColorHex, maxWidth: '80px', display: 'block', whiteSpace: 'normal'}}>
              {daysLabel}
            </span>
          </div>
        </div>
        <ul className="mt-4 mb-4 space-y-4 w-full">
          {deadlines.map((d) => {
            const days = daysUntil(d.endTime);
            const due = new Date(d.endTime).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
            const textColor = getCircleColor(days);
            let displayName = d.name;
            if (d.name === 'instructor_need_update_deadline') {
              displayName = 'Instructor Need Update Deadline';
            } else {
              displayName = d.name.replace(/_/g, ' ');
            }
            return (
              <li key={d.name} className="flex items-center justify-between">
                <span className={`text-sm font-medium ${textColor}`}>{displayName} - {due}</span>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
};
