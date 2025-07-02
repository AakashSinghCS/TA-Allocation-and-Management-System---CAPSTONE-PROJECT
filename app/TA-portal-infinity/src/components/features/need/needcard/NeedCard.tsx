import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Edit2, Trash2, Check, X, BookOpen } from "lucide-react";
import type { Need } from "../../../../interfaces/need/Need";

interface NeedCardProps {
  need?: Need;
  className?: string;
  onUpdate?: (updated: Need) => void;
  onDelete?: (deleted: Need) => void;
}

export default function NeedCard({ need, className = "", onUpdate, onDelete }: NeedCardProps) {

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

  if (!need && !editMode) {
    return (
      <div className="p-2 italic text-slate-400 border border-dashed border-slate-200 rounded-lg">
        No data
      </div>
    );
  }

  return (
    <div className={`${className} w-full overflow-hidden rounded-lg text-sm border border-amber-300 bg-amber-50 p-2 relative`} data-testid="need-card">
      <div className="absolute top-2 right-2 flex space-x-2">
        {editMode ? (
          <>
            <Check className="cursor-pointer" size={16} onClick={handleSave} />
            <X className="cursor-pointer" size={16} onClick={handleCancel} />
            <span title="Update course prerequisites">
              <BookOpen
                className="cursor-pointer"
                size={16}
                onClick={handlePrereqNavigation}
              />
            </span>
          </>
        ) : (
          need && (
            <>
              <Edit2 className="cursor-pointer" size={16} onClick={() => setEditMode(true)} />
              <span title="Update course prerequisites">
                <BookOpen
                  className="cursor-pointer"
                  size={16}
                  onClick={handlePrereqNavigation}
                />
              </span>
              <Trash2
                className="cursor-pointer hover:text-red-600"
                size={16}
                onClick={() => onDelete?.(need)}
              />
            </>
          )
        )}
      </div>

      {/* Content or Edit Form */}
      {editMode ? (
        <div className="space-y-2">
          <div>
            <Link to={`/user/instructorprofile/${need?.courseId}/${need?.year}/${need?.semester}`}>
              Update Course Prerequisites
            </Link>
          </div>
          <div>
            <label className="block text-slate-600">Additional Comments:</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full border border-gray-300 rounded p-1"
            />
          </div>
          <div className="flex space-x-2">
            <div>
              <label className="block text-slate-600">Allocated hours:</label>
              <input
                type="number"
                value={form.numHoursCurrentlyAllocated}
                onChange={(e) => setForm({ ...form, numHoursCurrentlyAllocated: Number(e.target.value) })}
                className="w-24 border border-gray-300 rounded p-1"
              />
            </div>
            <div>
              <label className="block text-slate-600">Required hours:</label>
              <input
                type="number"
                value={form.requiredGradingHours}
                onChange={(e) => setForm({ ...form, requiredGradingHours: Number(e.target.value) })}
                className="w-24 border border-gray-300 rounded p-1"
              />
            </div>
          </div>

        </div>
      ) : (
        <>
          <p className="mb-1">
            <span className="text-slate-600">Additional Comments: </span>
            <span className="font-medium">{need?.description}</span>
          </p>
          <div className="flex mb-1">
            <span className="text-slate-600">Allocated hours: </span>
            <span className="font-medium">{need?.numHoursCurrentlyAllocated ?? "-"}</span>
            <span>&nbsp;/&nbsp;</span>
            <span className="text-slate-600">Required hours: </span>
            <span className="font-medium">{need?.requiredGradingHours ?? "-"}</span>
            {need?.numHoursCurrentlyAllocated && need.requiredGradingHours &&
              need.numHoursCurrentlyAllocated / need.requiredGradingHours > 1 && (
                <span className="text-red-600 ml-2">This section is overbooked!</span>
              )}
          </div>
          <div className="flex">
            <span className="text-slate-600">Course Prerequisites: </span>
            {need?.courseNeeds?.length ? (
              <div className="flex flex-wrap text-slate-800">
                {need.courseNeeds.map((course, idx) => (
                  <span key={course.id}>
                    <Link to={`/course/${course.id}`} className="hover:text-blue-600">
                      {course.deptCode} {course.courseNum}
                    </Link>
                    {need.courseNeeds && idx < need.courseNeeds.length - 1 && <span>,&nbsp;</span>}
                  </span>
                ))}
              </div>
            ) : (
              <span className="text-slate-400">None</span>
            )}
          </div>
        </>
      )}
    </div>
  );
}
