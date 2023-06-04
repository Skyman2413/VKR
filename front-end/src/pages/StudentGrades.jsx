import React, { useState, useEffect } from 'react';
import APIService from '../API/APIService';
import GradesTable from "../components/UI/GradesTable/GradesTable";
import './StudentGrades.css';

const StudentGrades = () => {
    const [data, setData] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            const response = await APIService.getStudentGrades();
            console.log(response.data.grades);
            setData(response.data.grades);
        };

        fetchData();
    }, []);

    return (
        <div className="student-grades">
            <h1>Student Grades</h1>
            <GradesTable data={data} />
        </div>
    );
};

export default StudentGrades;
