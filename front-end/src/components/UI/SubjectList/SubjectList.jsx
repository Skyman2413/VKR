import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {useFetching} from "../../../hook/useFetching";
import APIService from "../../../API/APIService";


const SubjectList = () => {
    const params = useParams();
    const [subjects, setSubjects] = useState([]);
    const [fetchSubjects, isLoading, error] = useFetching(async () => {
        const response = await APIService.getSubjectsByGroup(params.group);
        setSubjects(response.data.subjects);
    });

    useEffect(() => {
        console.log(params)
        fetchSubjects();
    }, [params.group]);

    return (
        <div>
            <h2>Subject List</h2>
            {isLoading ? (
                <p>Loading...</p>
            ) : (
                <ul>
                    {subjects.map((subject) => (
                        <li key={subject.id}>
                            <Link to={`/grades/${params.group}/${subject.name}`}>{subject.name}</Link>
                        </li>
                    ))}
                </ul>
            )}
            {error && <p>Error: {error}</p>}
        </div>
    );
};

export default SubjectList;
