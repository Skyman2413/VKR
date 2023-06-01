import React, {useContext} from 'react';
import {AuthContext} from "../context";
import APIService from "../API/APIService";

const Grades = () => {
    const grades = async event => {
      event.preventDefault();

      const response = await APIService.getStudentGrades();
      console.log(response.data())
    }

    return (
        <div>

        </div>
    );
};

export default Grades;