import React, {useEffect} from 'react';
import Grade from '../Grade/Grade';
import './GradeLine.css';

const GradeLine = ({ subjectGrades }) => {
    const { subject, grades } = subjectGrades;
    console.log(subject)
    console.log(grades)
    useEffect(() => {

    }, [])
    return (
        <div className="grade-line">
            <h2>{subject}</h2>
            <div className="grades">
                {grades.map((grade, index) => (
                    <Grade key={index} grade={grade} />
                ))}
            </div>
        </div>
    );
};

export default GradeLine;
