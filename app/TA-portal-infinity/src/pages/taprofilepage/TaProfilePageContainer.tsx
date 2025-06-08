// import { useParams,useNavigate } from 'react-router-dom';
// import { useEffect, useState } from 'react';
// import { fetchTaProfilePageData } from '../../api/taprofile/fetchTaProfilePageData';
// import TaProfilePage from './TaProfilePage';

// import type TaProfilePageData from '../../interfaces/taprofile/TaProfilePageData';

// export default function TaProfilePageContainer() {
//     const { studentId } = useParams();
//     const sId = Number(studentId);
//     const navigate = useNavigate();

//     const [data, setData] = useState<TaProfilePageData>();

//     useEffect(() => {
//         if (Number.isNaN(sId)) {
//             navigate("/error", { replace: true, state: { message: "Invalid student ID" } });
//             return;
//         }

//         fetchTaProfilePageData(sId)
//             .then((resp: TaProfilePageData) => {
//                 setData(resp);
//             })
//             .catch((e: Error) => {
//                 navigate("/error", { replace: true, state: { message: e.message } });
//             });
//         /* To test if the Navigate component leading you to error works, uncomment the comment below.*/
//         // navigate("/error", { replace: true, state: { message: "Test error redirection" } });
//     }, [sId,navigate]);

//     if (!data) return <p>Loading…</p>;

//     return <TaProfilePage data = {data} />;
// }