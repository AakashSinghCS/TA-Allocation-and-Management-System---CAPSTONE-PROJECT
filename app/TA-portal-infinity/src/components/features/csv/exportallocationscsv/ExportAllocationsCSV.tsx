// import  { useState, useRef } from 'react'
// import { CSVLink } from 'react-csv'
// import { fetchGetCourseNeedAndAllocations } from '../../../api/csv/fetchGetCourseNeedAndAllocations'

// interface ExportAllocationsCSVProps {
//   /** the ID of the course to export */
//   courseId: number
//   /** the year (e.g. 2025) */
//   year: number
//   /** the semester code (e.g. 'W1') */
//   semester: string
//   /** optional CSS classes for the button */
//   className?: string
//   /** label for the button */
//   buttonLabel?: string
// }

// export default function ExportAllocationsCSV({
//   courseId,
//   year,
//   semester,
//   className = 'text-red-600 hover:underline text-sm',
//   buttonLabel = 'Export to CSV',
// }: ExportAllocationsCSVProps) {
//   const [csvData, setCsvData] = useState<Record<string, any>[]>([])
//   const [csvHeaders] = useState(
//     [
//       { label: 'Section ID', key: 'sectionId' },
//       { label: 'Year', key: 'year' },
//       { label: 'Semester', key: 'semester' },
//       { label: 'Section Code', key: 'sectionCode' },
//       { label: 'Type', key: 'type' },
//       { label: 'Course ID', key: 'courseId' },
//       { label: 'Dept Code', key: 'deptCode' },
//       { label: 'Course Number', key: 'courseNum' },
//       { label: 'Course Name', key: 'courseName' },
//       { label: 'Need ID', key: 'needId' },
//       { label: 'Need Description', key: 'needDescription' },
//       { label: 'Required Grading Hours', key: 'requiredGradingHours' },
//       { label: 'Currently Allocated Hours', key: 'numHoursCurrentlyAllocated' },
//       { label: 'Allocation ID', key: 'allocationId' },
//       { label: 'Student ID', key: 'studentId' },
//       { label: 'Student First Name', key: 'studentFirstName' },
//       { label: 'Student Last Name', key: 'studentLastName' },
//       { label: 'Is Confirmed', key: 'isConfirmed' },
//       { label: 'Number Of Hours', key: 'numberOfHours' },
//     ]
//   )
//   const csvLinkRef = useRef<CSVLink & { link: HTMLAnchorElement }>(null)

//   const handleClick = async () => {
//     try {
//       const payload = await fetchGetCourseNeedAndAllocations(
//         courseId,
//         year,
//         semester
//       )
//       if (!payload) return

//       const { section, need, allocations } = payload

//       const rows =
//         allocations && allocations.length > 0
//           ? allocations.map((alloc: any) => ({
//               sectionId: section.id,
//               year: section.year,
//               semester: section.semester,
//               sectionCode: section.section,
//               type: section.type,
//               courseId: section.course.id,
//               deptCode: section.course.deptCode,
//               courseNum: section.course.courseNum,
//               courseName: section.course.name,
//               needId: need.id,
//               needDescription: need.description,
//               requiredGradingHours: need.requiredGradingHours,
//               numHoursCurrentlyAllocated: need.numHoursCurrentlyAllocated,
//               allocationId: alloc.id,
//               studentId: alloc.student.id,
//               studentFirstName: alloc.student.firstName,
//               studentLastName: alloc.student.lastName,
//               isConfirmed: alloc.isConfirmed,
//               numberOfHours: alloc.numberOfHours,
//             }))
//           : [
//               {
//                 sectionId: section.id,
//                 year: section.year,
//                 semester: section.semester,
//                 sectionCode: section.section,
//                 type: section.type,
//                 courseId: section.course.id,
//                 deptCode: section.course.deptCode,
//                 courseNum: section.course.courseNum,
//                 courseName: section.course.name,
//                 needId: need.id,
//                 needDescription: need.description,
//                 requiredGradingHours: need.requiredGradingHours,
//                 numHoursCurrentlyAllocated: need.numHoursCurrentlyAllocated,
//                 allocationId: '',
//                 studentId: '',
//                 studentFirstName: '',
//                 studentLastName: '',
//                 isConfirmed: '',
//                 numberOfHours: '',
//               },
//             ]

//       setCsvData(rows)

//       // trigger the download after state updates
//       setTimeout(() => {
//         csvLinkRef.current?.link.click()
//       })
//     } catch (err) {
//       console.error('CSV export failed', err)
//     }
//   }

//   return (
//     <>
//       {/* hidden link for CSV download */}
//       <CSVLink
//         data={csvData}
//         headers={csvHeaders}
//         filename={`course_${courseId}_${year}_${semester}_allocations.csv`}
//         className="hidden"
//         ref={csvLinkRef}
//       />
//       <button type="button" onClick={handleClick} className={className}>
//         {buttonLabel}
//       </button>
//     </>
//   )
// }
// ExportAllocationsCSV.tsx
import React from 'react'
import { fetchGetCourseNeedAndAllocations } from '../../../../api/csv/fetchGetCourseNeedAndAllocations'

interface ExportAllocationsCSVProps {
  courseId: number
  year: number
  semester: string
  className?: string
  buttonLabel?: string
}

export default function ExportAllocationsCSV({
  courseId,
  year,
  semester,
  className = 'text-red-600 hover:underline text-sm',
  buttonLabel = 'Export to CSV',
}: ExportAllocationsCSVProps) {
  const handleClick = async () => {
    const payload = await fetchGetCourseNeedAndAllocations(courseId, year, semester)
    if (!payload) return

    const { section, need, allocations } = payload

    // Flatten rows
    const rows =
      allocations.length > 0
        ? allocations.map((alloc: any) => ({
            sectionId: section.id,
            year: section.year,
            semester: section.semester,
            sectionCode: section.section,
            type: section.type,
            courseId: section.course.id,
            deptCode: section.course.deptCode,
            courseNum: section.course.courseNum,
            courseName: section.course.name,
            needId: need.id,
            needDescription: need.description,
            requiredGradingHours: need.requiredGradingHours,
            numHoursCurrentlyAllocated: need.numHoursCurrentlyAllocated,
            allocationId: alloc.id,
            studentId: alloc.student.id,
            studentFirstName: alloc.student.firstName,
            studentLastName: alloc.student.lastName,
            isConfirmed: alloc.isConfirmed,
            numberOfHours: alloc.numberOfHours,
          }))
        : [
            {
              sectionId: section.id,
              year: section.year,
              semester: section.semester,
              sectionCode: section.section,
              type: section.type,
              courseId: section.course.id,
              deptCode: section.course.deptCode,
              courseNum: section.course.courseNum,
              courseName: section.course.name,
              needId: need.id,
              needDescription: need.description,
              requiredGradingHours: need.requiredGradingHours,
              numHoursCurrentlyAllocated: need.numHoursCurrentlyAllocated,
              allocationId: '',
              studentId: '',
              studentFirstName: '',
              studentLastName: '',
              isConfirmed: '',
              numberOfHours: '',
            },
          ]

    // Build CSV string
    const headerKeys = Object.keys(rows[0])
    const headerLine = headerKeys.join(',')
    const bodyLines = rows.map((r) =>
      headerKeys
        .map((k) => {
          const cell = String((r as any)[k]).replace(/"/g, '""')
          return `"${cell}"`
        })
        .join(',')
    )
    const csvContent = [headerLine, ...bodyLines].join('\r\n')

    // Trigger download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `course_${courseId}_${year}_${semester}_allocations.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <button type="button" onClick={handleClick} className={className}>
      {buttonLabel}
    </button>
  )
}
