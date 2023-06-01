import axios from "axios";

export default class APIService {
    static async auth(username, password) {
        return await axios.post('127.0.0.2/auth', {username, password})
    }

    static async getStudentGrades() {
        return await axios.get("127.0.0.2/student_grades", {headers: {
                'Authorization': `Bearer ${localStorage.getItem('authToken')}`
            } })
    }
}