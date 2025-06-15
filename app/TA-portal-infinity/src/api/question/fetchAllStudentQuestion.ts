import { mockTaProfileQuestions } from '../../mocked-objects/mockTaProfileQuestions';
import type { ProfileQuestion } from '../../interfaces/question/ProfileQuestion';

export async function fetchAllStudentQuestions(studentId: number): Promise<ProfileQuestion[]> {

//    const baseUrl = 'mock';
       
//     const res = await fetch(`${baseUrl}/mock/mock/mock/${studentId}`,{
//         headers: {
//             Accept: 'application/json'
//         }
//     })
    
//     if (!res.ok) {
//         throw new Error(`Failed to fetch student details (HTTP ${res.status})`);
    // }

    // return res.json() as Promise<Section>;
    return [mockTaProfileQuestions,mockTaProfileQuestions]; //delete when backend is implemented
}