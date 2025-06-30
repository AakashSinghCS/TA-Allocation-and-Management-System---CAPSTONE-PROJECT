// const BASE = "http://localhost:8080/profiles";

// export async function fetchSubmitFreeText(studentId : number, questionId: number, answerText : string): Promise<boolean> {
//   const url = `${BASE}/${studentId}/questions/${questionId}/answer/text`;
//   const token = localStorage.getItem("token");

//   try {
//     const res = await fetch(url, {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//         ...(token ? { Authorization: `Bearer ${token}` } : {}),
//       },
//       body: JSON.stringify({ description: answerText }),
//     });
//     return res.ok;
//   } catch (err) {
//     console.error("Something went wrong:", err);
//     return false;
//   }
// }

