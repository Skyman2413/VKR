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
}