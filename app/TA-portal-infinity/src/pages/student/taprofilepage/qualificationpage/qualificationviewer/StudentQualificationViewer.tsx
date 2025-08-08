import { useState } from "react";
import { GenericAPIContainer } from "../../../../../utility/genericapicontainer/GenericAPIContainer";
import  DeptCodeDropdown  from "./deptcodedropdown/DeptCodeDropdown";
import  StudentQualificationTable  from "./qualificationtable/StudentQualificationTable";
import { fetchAllExistingDeptCodes } from "../../../../../api/course/sectionfilter/fetchAllExistingDeptCodes";
import { fetchAllDeptCodeQualifications, type DeptCodeQualificationResponse } from "../../../../../api/qualification/fetchAllDeptCodeQualifications";
interface ViewerProps {
  studentId: number;
}

export default function StudentQualificationViewer({ studentId }: ViewerProps) {
  const [selectedDeptCode, setSelectedDeptCode] = useState<string>("");

  return (
    <div className="flex flex-col space-y-6">
      <GenericAPIContainer<string[] | null>
        fetchFunction={fetchAllExistingDeptCodes}
        render={(deptCodeList) => (
          <DeptCodeDropdown
            deptCodeList={deptCodeList || []}
            selected={selectedDeptCode}
            onChange={setSelectedDeptCode}
          />
        )}
      />

      {/* 2) Once a dept is chosen, load its qualifications */}
      {selectedDeptCode && (
        <GenericAPIContainer<DeptCodeQualificationResponse[] | null>
          fetchFunction={() => fetchAllDeptCodeQualifications(selectedDeptCode)}
          render={(qualificationList) => (
            <StudentQualificationTable
              qualificationList={qualificationList || []}
              studentId={studentId}
            />
          )}
        />
      )}
    </div>
  );
}