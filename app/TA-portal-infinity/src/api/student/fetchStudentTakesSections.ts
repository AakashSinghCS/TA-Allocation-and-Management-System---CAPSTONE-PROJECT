import type StudentTakesSection from "../../interfaces/student/StudentTakesSection";

export async function fetchStudentTakesSections(studentId: number):Promise<StudentTakesSection>{
    // const baseUrl = import.meta.env.VITE_API_BASE_URL ?? '';
    const baseUrl = 'mock';

    const res = await fetch(`${baseUrl}/mock/mock/mock/${studentId}`,{
        headers: {
            Accept: 'application/json'
        }
    })
    
    if (!res.ok) {
        throw new Error(`Failed to fetch details (HTTP ${res.status})`);
    }

    return res.json() as Promise<StudentTakesSection>;
}