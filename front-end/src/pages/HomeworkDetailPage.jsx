import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import {useFetching} from "../hook/useFetching";
import APIService from "../API/APIService";
import Loader from "../components/UI/Loader/Loader";

const HomeworkDetailPage = () => {
    const location = useLocation();
    const { homework } = location.state;
    const [file, setFile] = useState();

    const [fetchFile, isLoading, error] = useFetching(async () => {
        const response = await APIService.getHomeworkFile(homework.id);
        console.log("Response:", response.data); // Добавлено для дебага
        // здесь можно реализовать обработку полученного файла
    });

    const [submitHomework, isSubmitting, submitError] = useFetching(async () => {
        await APIService.submitHomework(homework.id, file);
        homework.is_submitted = true
    });

    useEffect(() => {
        if (homework.teacher_file_exists) {
            fetchFile();
        }
    }, []);

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        await submitHomework();
    }

    if (isLoading || isSubmitting) {
        return <Loader />
    }

    return (
        <div>
            <h1>{homework.subject}</h1>
            <p>{homework.description}</p>
            <p>Due date: {homework.due_date}</p>
            <p>Is submitted: {homework.is_submitted? "yes" : "no"}</p>

            <form onSubmit={handleSubmit}>
                <label>
                    Upload your homework:
                    <input type="file" name="homework" onChange={handleFileChange} />
                </label>
                <button type="submit">Submit</button>
            </form>
        </div>
    );
};

export default HomeworkDetailPage;
