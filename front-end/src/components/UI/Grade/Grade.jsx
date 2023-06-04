import React from 'react';
import './Grade.css';

const Grade = ({ grade }) => {
    const { grade_type, date, grade: gradeValue } = grade;
    let gradeClass = '';

    if (gradeValue < 3) {
        gradeClass = 'grade-text--low';
    } else if (gradeValue === 3) {
        gradeClass = 'grade-text--medium';
    } else {
        gradeClass = 'grade-text--high';
    }

    return (
        <div className="grade">
      <span className={gradeClass}>
        {gradeValue}
      </span>
            <div className="tooltip">
                <div className="tooltip-content">
                    <p>Тип оценки: {grade_type}</p>
                    <p>Дата: {date}</p>
                </div>
            </div>
        </div>
    );
};

export default Grade;
