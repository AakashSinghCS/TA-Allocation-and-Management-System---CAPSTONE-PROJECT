import ProfileSection from '../profilesection/ProfileSection';
import { studentFieldLabels, studentProfileFields, type Student } from '../../../../interfaces/user/Student';

export default function StudentCard({
  user,
  className = "",
}: {
  user?: Student;
  className?: string;
}) {
  if (!user) return(
      <div className="p-2 italic text-slate-400 border border-dashed border-slate-200 rounded-lg">
        No result
      </div>
  );
const filteredFields = studentProfileFields.filter(
    (key) => key !== "id" && key !== "firstName" && key !== "lastName"
  );

  return (
    <div className={className + " px-2 py-1 rounded-lg bg-slate-50 border border-slate-200"} >
      <ProfileSection
        user={user}
        profileFields={filteredFields}
        fieldLabels={studentFieldLabels}
        className="flex flex-row"
        big ={false}
      />
    </div>
  );
}
