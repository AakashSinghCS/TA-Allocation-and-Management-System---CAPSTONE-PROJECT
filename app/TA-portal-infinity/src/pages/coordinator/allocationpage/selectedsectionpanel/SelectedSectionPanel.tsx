import type Section from "../../../../interfaces/section/Section";

interface Instructor {
  firstName: string;
  lastName: string;
}

interface SectionDetailsPanelProps {
  section: Section;
  instructor: Instructor | null;
}

export default function SelectedSectionPanel({ section, instructor }: SectionDetailsPanelProps) {
  return (
    <div className="mt-6 border-t pt-6 space-y-6">
      {/* Section Details */}
      <section>
        <h2 className="font-bold text-lg">Section Details</h2>
        <div className="space-y-1 pl-2 text-sm">
          <p>
            <strong>Year &amp; Semester:</strong> {section.semester ?? 'N/A'} {section.year ?? 'N/A'}
          </p>
          <p>
            <strong>Section:</strong> {section.section ?? 'N/A'}
          </p>
          <p>
            <strong>Type:</strong> {section.type ?? 'N/A'}
          </p>
          <p>
            <strong>Instructor:</strong>
            {instructor && instructor.firstName && instructor.lastName
              ? ` ${instructor.firstName} ${instructor.lastName}`
              : ' N/A'}
          </p>
        </div>
      </section>

      {/* Course Need */}
      <section>
        <h2 className="font-bold text-lg">Course Need</h2>
        <div className="space-y-1 pl-2 text-sm">
          <p>
            <strong>Description:</strong> {section.need?.description ?? 'N/A'}
          </p>
          <p>
            <strong>Allocated Hours:</strong> {section.need?.numHoursCurrentlyAllocated ?? 'N/A'}
          </p>
          <p>
            <strong>Required Hours:</strong> {section.need?.requiredGradingHours ?? 'N/A'}
          </p>
        </div>
      </section>

      {/* Prerequisites */}
      <section>
        <h2 className="font-bold text-lg">Prerequisites</h2>
        <div className="pl-2 text-sm">
          {section.need?.prerequisites && section.need.prerequisites.length > 0 ? (
            <ul className="list-disc pl-4 space-y-1">
              {section.need.prerequisites.map((c, i) => (
                <li key={i}>
                  {c.deptCode} {c.courseNum}
                </li>
              ))}
            </ul>
          ) : (
            <p>None</p>
          )}
        </div>
      </section>
    </div>
  );
}
