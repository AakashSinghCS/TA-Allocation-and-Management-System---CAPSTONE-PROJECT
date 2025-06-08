import type Student from "../../interfaces/student/Student";
import {mockStudentJohnDoe} from '../../mocked-objects/mockStudents';

export async function fetchStudentDetails(studentId: number):Promise<Student>{
    //IMPORTANT: Don't delete this! will be used when backend works
    // const baseUrl = import.meta.env.VITE_API_BASE_URL ?? '';
    // const baseUrl = 'mock';

    // const res = await fetch(`${baseUrl}/mock/mock/mock/${studentId}`,{
    //     headers: {
    //         Accept: 'application/json'
    //     }
    // })
    
    // if (!res.ok) {
    //     throw new Error(`Failed to fetch student details (HTTP ${res.status})`);
        
    // }

    // return res.json() as Promise<Student>;
    return mockStudentJohnDoe //delete this when backend works.
}