import React from 'react';
import StudentGrades from "./StudentGrades";
import TeachersGradeTable from "../components/UI/TeachersGradeTable/TeachersGradeTable";

const Grades = () => {
    return (
        localStorage.getItem("userType") === "teacher"?
            <TeachersGradeTable/>
        :
            <StudentGrades/>
    );
};

export default Grades;