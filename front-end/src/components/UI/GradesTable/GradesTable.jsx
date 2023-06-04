import React from 'react';
import GradeLine from '../GradeLine/GradeLine';
import './GradesTable.css';

const GradesTable = ({ data }) => {
    return (
        <div className="grades-table">
            <div className="grade-line header">
                <h2>Предмет</h2>
                <h2>Оценки</h2>
            </div>
            {data.map((subjectGrades, index) => (
                <div key={index}>
                    <GradeLine subjectGrades={subjectGrades} />
                    <div className="divider" />
                </div>
            ))}
        </div>
    );
};

export default GradesTable;
