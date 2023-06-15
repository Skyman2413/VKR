import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import {useFetching} from "../hook/useFetching";
import APIService from "../API/APIService";
import Loader from "../components/UI/Loader/Loader";

const StudentHomeworks = () => {
    const [homeworkList, setHomeworkList] = useState([]);

    const [getHomeworks, isLoading, dataError] = useFetching(async () => {
        const response = await APIService.getHomeworks();
        console.log("Response:", response.data); // Добавлено для дебага
        setHomeworkList(response.data.homeworks);
    });

    useEffect(() => {
        getHomeworks();
    }, []);

    console.log("Homework list:", homeworkList); // Добавлено для дебага

    if (isLoading) {
        return <Loader/>
    }

    return (
        <div>
            <h1>Homeworks</h1>
            <ul>
                {homeworkList.map(homework => (
                    <li key={homework.id}>
                        <Link to={{
                            pathname: `/homeworks/${homework.id}`,
                            state: { homework }
                        }}>
                            {homework.subject} - {homework.description}
                        </Link>
                        {homework.is_submitted && <span> (Submitted)</span>}
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default StudentHomeworks;