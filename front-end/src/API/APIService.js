import axios from "axios";

export default class APIService {
    static async auth(username, password) {
        return await axios.post('http://127.0.0.2:8888/auth', {username, password})
    }

    static async getStudentGrades() {
        return await axios.get("http://127.0.0.2:8888/student_grades", {headers: {
                'Authorization': `Bearer ${localStorage.getItem('authToken')}`
            } })
    }

    static async getSubjectsByGroup(groupname) {
        return await axios.post("http://127.0.0.2:8888/get_subjects", {
            group: groupname
        }, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('authToken')}`
            }
        });
    }

    static async getGroups(){
        return await axios.get("http://127.0.0.2:8888/get_groups", {headers: {
                'Authorization': `Bearer ${localStorage.getItem('authToken')}`
            } })
    }

    static async updateGrades (modalInfo, grade, comment, subject_name, grade_type ) {
        console.log('updating grades')
        await axios.post("http://127.0.0.2:8888/update_grades", {
            studentId: modalInfo.studentId,
            date: modalInfo.date,
            grade: grade,
            comment: comment,
            subject_name: subject_name,
            grade_type: grade_type
        },
            {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                }
            });
    }

    static async getGradesForTeacher(group_name, subject_name){
        console.log('getting grades')
        return await axios.post("http://127.0.0.2:8888/group_grades",
            {group_name, subject_name},
            {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                }
            })

    }
}