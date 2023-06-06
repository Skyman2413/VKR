import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import {useFetching} from "../../../hook/useFetching";
import APIService from "../../../API/APIService";

const GroupList = () => {
    const [groups, setGroups] = useState([]);
    const [fetchGroups, isLoading, error] = useFetching(async () => {
        const response = await APIService.getGroups();
        setGroups(response.data.groups);
    });

    useEffect(() => {
        fetchGroups();
    }, []);

    return (
        <div>
            <h2>Group List</h2>
            {isLoading ? (
                <p>Loading...</p>
            ) : (
                <ul>
                    {groups.map((group) => (
                        <li key={group.id}>
                            <Link to={`/grades/${group.name}`}>{group.name}</Link>
                        </li>
                    ))}
                </ul>
            )}
            {error && <p>Error: {error}</p>}
        </div>
    );
};

export default GroupList;
