import type Section from "../../../interfaces/section/Section";

export const exportToCSV = (sectionsWithConfirmedTAs: Section[]) => {
  const csvData = sectionsWithConfirmedTAs.flatMap(section => 
    section.allocations?.map(allocation => ({
      'Course Code': `${section.course?.deptCode} ${section.course?.courseNum}`,
      'Course Name': section.course?.name || '',
      'Section': section.section || '',
      'Section Type': section.type || '',
      'Year': section.year || '',
      'Semester': section.semester || '',
      'Student First Name': allocation.student?.firstName || '',
      'Student Last Name': allocation.student?.lastName || '',
      'Student Email': allocation.student?.email || '',
      'Hours Allocated': allocation.numberOfHours || 0,
      'Instructor': section.instructor ? `${section.instructor.firstName} ${section.instructor.lastName}` : ''
    })) || []
  );

  const csvContent = [
    Object.keys(csvData[0] || {}).join(','),
    ...csvData.map(row => Object.values(row).map(val => `"${val}"`).join(','))
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', `student-allocations-${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const exportToPDF = (sectionsWithConfirmedTAs: Section[]) => {
  // Simple PDF export using browser print via hidden iframe
  const iframe = document.createElement('iframe');
  iframe.style.visibility = 'hidden';
  iframe.style.position = 'fixed';
  iframe.style.right = '0';
  iframe.style.bottom = '0';
  document.body.appendChild(iframe);
  const printWindow = iframe.contentWindow;
  if (!printWindow) return;
  
  const content = `
    <html>
      <head>
        <title>Student Allocations Report</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          h1 { color: #040941; margin-bottom: 20px; }
          .section { margin-bottom: 30px; border: 1px solid #ddd; padding: 15px; }
          .section-header { background: #f8f9fa; padding: 10px; margin: -15px -15px 15px -15px; }
          .student { margin: 10px 0; padding: 8px; background: #f8f9fa; }
          .no-students { color: #666; font-style: italic; }
          @media print { .no-print { display: none; } }
        </style>
      </head>
      <body>
        <h1>Confirmed Student Allocations Report</h1>
        <p>Generated on: ${new Date().toLocaleDateString()}</p>
        ${sectionsWithConfirmedTAs.map(section => `
          <div class="section">
            <div class="section-header">
              <h3>${section.course?.deptCode} ${section.course?.courseNum} ${section.section} - ${section.course?.name}</h3>
              <p><strong>Type:</strong> ${section.type} | <strong>Year:</strong> ${section.year} | <strong>Semester:</strong> ${section.semester}</p>
              ${section.instructor ? `<p><strong>Instructor:</strong> ${section.instructor.firstName} ${section.instructor.lastName}</p>` : ''}
            </div>
            <h4>Confirmed TAs (${section.allocations?.length || 0})</h4>
            ${section.allocations?.map(allocation => `
              <div class="student">
                <strong>${allocation.student?.firstName} ${allocation.student?.lastName}</strong>
                ${allocation.student?.email ? ` (${allocation.student.email})` : ''}
                - ${allocation.numberOfHours || 0} hours
              </div>
            `).join('') || '<div class="no-students">No students allocated</div>'}
          </div>
        `).join('')}
      </body>
    </html>
  `;
  
  // Write and print via iframe
  printWindow.document.open();
  printWindow.document.write(content);
  printWindow.document.close();
  printWindow.focus();
  printWindow.print();
  // Clean up
  document.body.removeChild(iframe);
};
