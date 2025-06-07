import { useParams,Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { fetchTaProfilePageData } from '../../api/fetchStudentDetails/fetchTaProfilePageData';
import TaProfilePage from './TaProfilePage';

import type TaProfilePageData from './TaProfilePageData';

export default function TaProfilePageContainer() {
    const { studentId } = useParams();
    const id = Number(studentId);

    const [data, setData] = useState<TaProfilePageData>();
    const [errorMessage, setErrorMessage] = useState<string>();

    useEffect(() => {
        if (Number.isNaN(id)) {
            setErrorMessage('Invalid student ID');
            return;
        }

        fetchTaProfilePageData(id)
            .then((resp: TaProfilePageData) => {
                setData(resp);
            })
            .catch((e: Error) => {
                setErrorMessage(e.message);
            });
    }, [id]);

    if (errorMessage) return (<Navigate to="/error" replace={true} state={{ message: errorMessage }}/>);
    if (!data) return <p>Loading…</p>;

    return <TaProfilePage data = {data} />;
}