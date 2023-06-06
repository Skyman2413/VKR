import {Table } from "react-bootstrap";
import './TeachersGradeTable.css'
const TeachersGradeTable = ({data, handleShow}) => {
    const students = Object.entries(data).map(([id, info]) => ({id, ...info}));

    const getGradeStyle = (grade) => {
        if (!grade) return 'table-light'; // Class for empty cells
        if (grade < 3) return 'table-danger';
        if (grade === '3') return 'table-warning';
        return 'table-success';
    }

    return (
        students.length !== 0 ?
            <Table striped bordered hover className="table-bordered">
                <thead>
                <tr>
                    <th>Студент</th>
                    {Object.keys(students[0]).filter(key => key !== "name" && key !== "id").map(date => (
                        <th key={date}>{date}</th>
                    ))}
                </tr>
                </thead>
                <tbody>
                {students.map((student) => (
                    <tr key={student.id}>
                        <td>{student.name}</td>
                        {Object.keys(student).filter(key => key !== "name" && key !== "id").map((date) => (
                            <td
                                key={date}
                                onClick={() => handleShow(student.id, date)}
                                className={`grade-cell ${getGradeStyle(student[date])}`}
                            >
                                {student[date]}
                            </td>
                        ))}
                    </tr>
                ))}
                </tbody>
            </Table>
            :
            <div>Loading...</div>
    );
}

export default TeachersGradeTable;
