
// export async function fetchSectionDetailsSchedulesInstructor(sectionId: number):Promise<Section | null>{
//   const BASE = `http://localhost:8080/sections/getIncludeInstructorId/${sectionId}`;
//   const token = localStorage.getItem("token");

//   try{
//     const res = await fetch(BASE, {
//       method: "GET",
//       headers: { "Content-Type": "application/json",
//         ...(token ? { Authorization: `Bearer ${token}` } : {}),
//        },      
//     });
//     if (!res.ok) {
//       console.error("Request failed with status:", res.status);
//     return null;
//     }
//       return res.json();
//   }catch{
//     console.log("something went wrong");
//     //TODO: remove the mock after development is finished.

// return null;
//   }
// }