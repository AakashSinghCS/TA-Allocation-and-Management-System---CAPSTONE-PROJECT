import { Link } from 'react-router-dom';
import type Section from '../../../../interfaces/section/Section';
import type { FilterSectionsProps } from '../../../../api/sectionfilter/fetchFilteredSections';

interface Props {
  sections: FilterSectionsProps[] | null;
}

export default function SectionList({ sections }: Props) {
  if (!sections || sections.length === 0) {
    return <p className="p-4 text-center text-gray-500">No section found.</p>;
  }

  const abbreviateDay = (day: string | null | undefined) => {
    if(!day) return;
    const abbr = day.length > 3 ? day.slice(0, 3) : day;
    return abbr.charAt(0).toUpperCase() + abbr.slice(1).toLowerCase();
  };

  return (
    <table className="min-w-full table-auto border-collapse">
      <thead>
        <tr>
          <th className="border px-3 py-2 text-left">Section</th>
          <th className="border px-3 py-2 text-left">Year</th>
          <th className="border px-3 py-2 text-left">Semester</th>
          <th className="border px-3 py-2 text-left">Type</th>
          <th className="border px-3 py-2 text-left">Times</th>
        </tr>
      </thead>
      <tbody>
        {sections.map((c) => {

          // const sched = c.sectionSchedule || [];
          const sectionId = c?.id;
          const label = `${c?.deptCode} ${c?.courseNum} ${c?.section} - ${c?.name}`;
          // const truncated = label.length > 40 ? label.slice(0, 37) + '...' : label;
          // const times = sched
          //   .map((s) => {
          //     if(s.day) return `${abbreviateDay(s.day)}-${s.startTime}-${s.endTime}`
          //   })
          //   .join(', ');
          const times = `${abbreviateDay(c.day)}-${c.startTime}-${c.endTime}`;
          return (
            <tr key={sectionId}>
              <td className="border px-3 py-2 max-w-xs">
                {sectionId ? (
                  <Link
                    to={`/sections/${sectionId}`}
                    className="text-blue-600 hover:underline block truncate"
                  >
                    {label}
                  </Link>
                ) : (
                  <span className="block truncate">{label}</span>
                )}
              </td>
              <td className="border px-3 py-2">{c?.year}</td>
              <td className="border px-3 py-2">{c?.semester}</td>
              <td className="border px-3 py-2 max-w-xs truncate">{c?.type}</td>
              <td className="border px-3 py-2">{times}</td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
