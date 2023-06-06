import React, { useState, useEffect } from 'react';
import {useFetching} from "../hook/useFetching";
import APIService from "../API/APIService";
import TeachersGradeTable from "../components/UI/TeachersGradeTable/TeachersGradeTable";
import ModalForNewGrade from "../components/UI/ModalForNewGrade/ModalForNewGrade";
import {useParams} from "react-router-dom";

const TeachersGrade = () => {
    console.log("start rendering")
    const [data, setData] = useState();
    const [modalInfo, setModalInfo] = useState({show: false, studentId: null, date: null});
    const [grade, setGrade] = useState("");
    const [comment, setComment] = useState("");
    const [grade_type, setType] = useState("")
    const params = useParams()

    const [fetchData, isDataLoading, dataError] = useFetching(async () => {
        const response = await APIService.getGradesForTeacher(params.group, params.subject)
        setData(response.data);
    });

    const [updateData, isUpdateLoading, updateError] = useFetching(async () => {
        await APIService.updateGrades(modalInfo, grade, comment, params.subject, grade_type)
        handleClose();
        fetchData(); // reload the data after update
    });

    useEffect(() => {
        console.log('hi')
        fetchData();
        console.log(data)
    }, []);

    const handleClose = () => setModalInfo({show: false, studentId: null, date: null});
    const handleShow = (studentId, date) => {
        console.log(data)
        const [realDate, gradeType] = date.split(" ");
        const currentStudent = data[studentId]
        const currentGrade = currentStudent ? currentStudent[date] : "";
        setModalInfo({show: true, studentId, date: realDate});
        setGrade(currentGrade);
        setType(gradeType);
    };

    const handleSubmit = (event) => {
        event.preventDefault();
        updateData();
    };

    return (
        <div>
            {isDataLoading || !data ? (
                <div>Loading...</div>
            ) : dataError ? (
                <div>Error: {dataError}</div>
            ) : (
                <>
                    <TeachersGradeTable data={data} handleShow={handleShow} />
                    <ModalForNewGrade
                        show={modalInfo.show}
                        handleClose={handleClose}
                        handleSubmit={handleSubmit}
                        grade={grade}
                        setGrade={setGrade}
                        comment={comment}
                        setComment={setComment}
                        grade_type={grade_type}
                        setType={setType}
                    />
                </>
            )}
        </div>
    );
};

export default TeachersGrade;
