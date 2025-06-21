import { useState } from 'react';
import { useParams } from 'react-router-dom';
import ProfileSection from '../../components/features/user/profilesection/ProfileSection';
import { GenericAPIContainer } from '../../utility/genericapicontainer/GenericAPIContainer';
import NeedViewer from './needpage/needviewer/NeedViewer';
import Comparer from './comparerpage/comparer/Comparer';
import {
  fetchAllInstructorTeachesSection,
} from '../../api/instructor/fetchAllInstructorTeachesSection';
import {fetchInstructorDetails} from '../../api/instructor/fetchInstructorDetails'
import  {
  type Instructor,
  instructorProfileFields,
  instructorFieldLabels,
} from '../../interfaces/user/Instructor';
import type Section from '../../interfaces/section/Section';
import InstructorTabNav from '../../components/layout/tabnav/instructortabnav/InstructorTabNav';

// // Simple accordion wrapper
// function Accordion({
//   title,
//   children,
// }: {
//   title: string;
//   children: React.ReactNode;
// }) {
//   const [open, setOpen] = useState(false);
//   return (
//     <div className="border border-slate-200 rounded-2xl shadow-sm">
//       <button
//         onClick={() => setOpen(o => !o)}
//         className="w-full px-4 py-3 bg-slate-50 hover:bg-slate-100 flex justify-between items-center transition"
//       >
//         <span className="font-semibold">{title}</span>
//         <svg
//           className={`w-5 h-5 transform transition-transform ${
//             open ? 'rotate-180' : ''
//           }`}
//           fill="none"
//           stroke="currentColor"
//           viewBox="0 0 24 24"
//           xmlns="http://www.w3.org/2000/svg"
//         >
//           <path
//             strokeLinecap="round"
//             strokeLinejoin="round"
//             strokeWidth={2}
//             d="M19 9l-7 7-7-7"
//           />
//         </svg>
//       </button>
//       {open && <div className="px-4 py-3">{children}</div>}
//     </div>
//   );
// }

export default function InstructorProfilePage() {
  const { instructorId } = useParams();
  const iId = Number(instructorId);
  const filteredFields = instructorProfileFields.filter(
    key => key !== 'id' && key !== 'firstName' && key !== 'lastName'
  );

  return (
    <div className=" mx-auto space-y-6 p-4">
      <InstructorTabNav/>
      <GenericAPIContainer<Instructor>
        fetchFunction={() => fetchInstructorDetails(iId)}
        render={inst => (
          <ProfileSection
            user={inst}
            profileFields={filteredFields}
            fieldLabels={instructorFieldLabels}
          />
        )}
      />

      {/* <Accordion title="Sections Teaching & Needs">
        <NeedViewer instructorId={iId} />
      </Accordion> */}

    </div>
  );
}
