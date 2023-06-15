import axios from "axios";
import home from "../pages/Home";

export default class APIService {
    static async auth(username, password) {
        return await axios.post('http://127.0.0.2:8888/auth', {username, password})
    }

    static async getStudentGrades() {
        return await axios.get("http://127.0.0.2:8888/student_grades", {headers: {
                'Authorization': localStorage.getItem('authToken')
        }
            } )}

    static async getHomeworks(){
        return await axios.get("http://127.0.0.2:8888/get_homeworks", {headers: {
                'Authorization': localStorage.getItem('authToken')
            }})
    }

    static async getHomeworkFile(id){
        return await axios.post("http://127.0.0.2:8888/download_teacher_file", {id:id}, {headers: await this.create_headers()})
    }


    static async submitHomework(homeworkId, file) {
        const url = `http://127.0.0.2:8888/send_homework`;

        // Создаем FormData
        let formData = new FormData();
        formData.append("data", JSON.stringify({"hm_id": homeworkId}))
        // Прикрепляем файл
        formData.append("file", file);

        // Устанавливаем заголовки
        const config = {
            headers: {
                'Content-Type': 'multipart/form-data',
                'Authorization': localStorage.getItem('authToken')
            }
        };

        // Отправляем PUT запрос
        return await axios.put(url, formData, config);
    }


    static async getSubjectsByGroup(groupname) {
        const headers = await this.create_headers()
        return await axios.post("http://127.0.0.2:8888/get_subjects", {
            group: groupname
        }, {
            headers: headers
        })
    }

    static async getGroups(){
        console.log(localStorage.getItem('authToken'))
        return await axios.get("http://127.0.0.2:8888/get_groups", {headers: {'Authorization': localStorage.getItem('authToken')}})
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
                headers: await this.create_headers()
            });
    }

    static async getGradesForTeacher(group_name, subject_name){
        console.log('getting grades')
        return await axios.post("http://127.0.0.2:8888/group_grades",
            {group_name, subject_name},
            {
                headers: await this.create_headers()
            })

    }

    static async create_headers(){
        return {
            'Content-Type': 'application/json',
            'Authorization': localStorage.getItem('authToken')
        }
    }
}