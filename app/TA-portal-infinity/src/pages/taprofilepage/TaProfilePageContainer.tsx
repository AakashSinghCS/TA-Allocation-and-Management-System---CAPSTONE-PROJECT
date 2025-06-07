import { useParams,Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { fetchTaProfilePageData } from '../../api/taprofile/fetchTaProfilePageData';
import TaProfilePage from './TaProfilePage';

import type TaProfilePageData from '../../interfaces/taprofile/TaProfilePageData';

export default function TaProfilePageContainer() {
    const { studentId } = useParams();
    const sId = Number(studentId);

    const [data, setData] = useState<TaProfilePageData>();
    const [errorMessage, setErrorMessage] = useState<string>();

    useEffect(() => {
        if (Number.isNaN(sId)) {
            setErrorMessage('Invalid student ID');
            return;
        }

        fetchTaProfilePageData(sId)
            .then((resp: TaProfilePageData) => {
                setData(resp);
            })
            .catch((e: Error) => {
                setErrorMessage(e.message);
            });
        /* To test if the Navigate component leading you to error works, uncomment the comment below.*/
        // setErrorMessage("SOME ERROR MESSAGE");
    }, [sId]);

    if (errorMessage) return (<Navigate to="/error" replace={true} state={{ message: errorMessage }}/>);
    if (!data) return <p>Loading…</p>;

    return <TaProfilePage data = {data} />;
}