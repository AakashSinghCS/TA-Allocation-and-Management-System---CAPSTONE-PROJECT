import { BookOpen, Check, Edit2, Trash2, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import type { Need } from "../../../../interfaces/need/Need";

interface NeedCardProps {
  need?: Need;
  className?: string;
  onUpdate?: (updated: Need) => void;
  onDelete?: (deleted: Need) => void;
  authenticated?: boolean;
  sectionId?: number;
  isMainSection?: boolean;
}

export default function NeedCard({ 
  need, 
  className = "", 
  onUpdate, 
  onDelete, 
  authenticated = false, 
  sectionId, 
  isMainSection = true 
}: NeedCardProps) {

  const navigate = useNavigate();
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState<{ description: string; requiredGradingHours: number; numHoursCurrentlyAllocated: number }>({
    description: "",
    requiredGradingHours: 0,
    numHoursCurrentlyAllocated: 0,
  });

  // Initialize form when entering edit mode or when need changes
  useEffect(() => {
    if (need && editMode) {
      setForm({
        description: need.description || "",
        requiredGradingHours: need.requiredGradingHours ?? 0,
        numHoursCurrentlyAllocated: need.numHoursCurrentlyAllocated ?? 0,
      });
    }
  }, [need, editMode]);

  const handleSave = () => {
    if (need) {
      const updated: Need = {
        ...need,
        description: form.description,
        requiredGradingHours: form.requiredGradingHours,
        numHoursCurrentlyAllocated: form.numHoursCurrentlyAllocated,
      };
      onUpdate?.(updated);
      setEditMode(false);
    }
  };

  const handlePrereqNavigation = () => {
    if (!need) return;
    const confirm = window.confirm(
      "Navigating away will discard any unsaved changes. Continue to update prerequisites?"
    );
    if (confirm) {
      navigate(
        `/user/instructor/updateprereqcourses/${need.courseId}/${need.year}/${need.semester}`
      );
    }
  };

  const handleCancel = () => {
    setEditMode(false);
  };

  if (!isMainSection) {
    // Non-lecture sections don't require TAs
    return (
      <div className="w-full overflow-hidden rounded-lg border border-gray-200 
        bg-white shadow-sm hover:shadow-md transition-all duration-200 hover:border-[#0089b2] 
        flex items-center justify-center p-4 text-center min-h-[120px]">
        <div className="space-y-2">
          <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
            <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
          </div>
          <p className="text-sm text-gray-700 font-medium">
            Non-lecture sections
          </p>
          <p className="text-xs text-gray-600">
            don't require TAs
          </p>
        </div>
      </div>
    );
  }

  if (!need && !editMode) {
    // Main sections without TA requirements
    return (
      <div className="w-full overflow-hidden rounded-lg border border-gray-200 
        bg-white shadow-sm hover:shadow-md transition-all duration-200 hover:border-[#0089b2] 
        flex items-center justify-center p-4 text-center min-h-[120px]">
        {authenticated && sectionId ? (
          <Link to={`/user/instructor/addneed/${sectionId}`} 
            className="flex flex-col items-center space-y-2 px-4 py-3 border-2 border-dashed border-[#040941] 
              rounded-lg hover:border-[#030735] hover:bg-blue-50 transition-all group w-full">
            <div className="w-8 h-8 bg-[#040941] rounded-full flex items-center justify-center group-hover:bg-[#030735] transition-colors">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path>
              </svg>
            </div>
            <span className="text-sm font-medium text-[#040941] group-hover:text-[#030735]">
              Add TA Requirement
            </span>
          </Link>
        ) : (
          <div className="space-y-2">
            <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center mx-auto">
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
              </svg>
            </div>
            <p className="text-xs font-semibold text-gray-600">No Requirements Set</p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={`${className} w-full overflow-hidden rounded-lg text-sm border border-gray-200 
      bg-white p-3 relative shadow-sm hover:shadow-md transition-all duration-200 hover:border-[#0089b2]`} 
      data-testid="need-card">
      <div className="absolute top-2 right-2 flex space-x-1">
        {editMode ? (
          <>
            <button className="w-6 h-6 bg-[#0089b2] hover:bg-[#040941] rounded-md flex items-center justify-center transition-colors">
              <Check className="text-white" size={12} onClick={handleSave} />
            </button>
            <button className="w-6 h-6 bg-gray-500 hover:bg-gray-600 rounded-md flex items-center justify-center transition-colors">
              <X className="text-white" size={12} onClick={handleCancel} />
            </button>
            <button className="w-6 h-6 bg-[#040941] hover:bg-[#0089b2] rounded-md flex items-center justify-center transition-colors" 
              title="Update course prerequisites">
              <BookOpen className="text-white" size={12} onClick={handlePrereqNavigation} />
            </button>
          </>
        ) : (
          need && (
            <>{authenticated && <> 
            <button className="w-6 h-6 bg-[#0089b2] hover:bg-[#040941] rounded-md flex items-center justify-center transition-colors">
              <Edit2 className="text-white" size={12} onClick={() => setEditMode(true)} />
            </button>
            <button className="w-6 h-6 bg-[#040941] hover:bg-[#0089b2] rounded-md flex items-center justify-center transition-colors" 
              title="Update course prerequisites">
              <BookOpen className="text-white" size={12} onClick={handlePrereqNavigation} />
            </button>
            <button className="w-6 h-6 bg-red-500 hover:bg-red-600 rounded-md flex items-center justify-center transition-colors">
              <Trash2 className="text-white" size={12} onClick={() => onDelete?.(need)} />
            </button></>}
            </>
          )
        )}
      </div>

      {/* Content or Edit Form */}
      {editMode ? (
        <div className="space-y-2 pr-20">
          <div className="bg-gray-50 rounded-md p-2 border border-gray-200">
            <Link to={`/user/instructorprofile/${need?.courseId}/${need?.year}/${need?.semester}`}
              className="text-[#040941] hover:text-[#0089b2] font-medium text-xs">
              Update Course Prerequisites
            </Link>
          </div>
          <div className="bg-gray-50 rounded-md p-2 border border-gray-200">
            <label className="block text-[#040941] font-medium text-xs mb-1">Additional Comments:</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full border border-gray-300 rounded-md p-1.5 text-xs focus:ring-1 focus:ring-[#0089b2] focus:border-[#0089b2]"
              rows={2}
            />
          </div>
          <div className="bg-gray-50 rounded-md p-2 border border-gray-200">
            <label className="block text-[#040941] font-medium text-xs mb-1">Required hours:</label>
            <input
              type="number"
              value={form.requiredGradingHours}
              onChange={(e) => setForm({ ...form, requiredGradingHours: Number(e.target.value) })}
              className="w-24 border border-gray-300 rounded-md p-1.5 text-xs focus:ring-1 focus:ring-[#0089b2] focus:border-[#0089b2]"
            />
          </div>
        </div>
      ) : (
        <div className="pr-20 space-y-1.5">
          {/* Line 1: Additional Comments */}
          <div className="flex items-start space-x-2">
            <span className="text-[#040941] font-medium text-xs min-w-fit">Comments:</span>
            <span className="text-gray-700 text-xs line-clamp-1 flex-1">
              {need?.description || 'No additional comments'}
            </span>
          </div>
          
          {/* Line 2: Hours Allocation */}
          <div className="flex items-center space-x-2">
            <span className="text-[#040941] font-medium text-xs">Hours:</span>
            <div className="flex items-center space-x-1">
              <span className="bg-gray-100 px-1.5 py-0.5 rounded text-xs font-medium text-gray-800">
                {need?.numHoursCurrentlyAllocated ?? "-"}
              </span>
              <span className="text-gray-400 text-xs">/</span>
              <span className="bg-gray-100 px-1.5 py-0.5 rounded text-xs font-medium text-gray-800">
                {need?.requiredGradingHours ?? "-"}
              </span>
              {(() => {
                const allocated = need?.numHoursCurrentlyAllocated;
                const required = need?.requiredGradingHours;
                const isOverbooked =
                  typeof allocated === "number" &&
                  typeof required === "number" &&
                  required > 0 &&
                  allocated / required > 1;
                return isOverbooked ? (
                  <span className="bg-red-100 text-red-700 px-1.5 py-0.5 rounded-full text-xs font-medium ml-1">
                    Overbooked!
                  </span>
                ) : null;
              })()}
            </div>
          </div>
          
          {/* Line 3: Prerequisites */}
          <div className="flex items-center space-x-2">
            <span className="text-[#040941] font-medium text-xs min-w-fit">Prerequisites:</span>
            {need?.prerequisites?.length ? (
              <div className="flex flex-wrap gap-1">
                {need.prerequisites.map((course) => (
                  <Link
                    key={course.id}
                    to={`/user/courseprofile/${course.id}`}
                    className="bg-[#0089b2] text-white px-1.5 py-0.5 rounded text-xs font-medium 
                      hover:bg-[#040941] transition-colors"
                  >
                    {course.deptCode} {course.courseNum}
                  </Link>
                ))}
              </div>
            ) : (
              <span className="text-gray-500 text-xs">None</span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}