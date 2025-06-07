import type Student from "../../interfaces/Student";
import type {SectionDetails} from "../../interfaces/SectionDetails";
import type SectionSchedule from "../../interfaces/SectionSchedule";
import type Section from "../../interfaces/Section";

export async function fetchStudentSectionDetails(studentId: number):Promise<SectionDetails>{
    // const baseUrl = import.meta.env.VITE_API_BASE_URL ?? '';
    const baseUrl = 'mock';

    const res = await fetch(`${baseUrl}/mock/mock/mock/${studentId}`,{
        headers: {
            Accept: 'application/json'
        }
    })
    
    if (!res.ok) {
        throw new Error(`Failed to fetch student details (HTTP ${res.status})`);
    }

    return res.json() as Promise<SectionDetails>;
}