import About from "../pages/About";
import StudentGrades from "../pages/StudentGrades";
import GroupList from "../components/UI/GroupList/GroupList";
import SubjectList from "../components/UI/SubjectList/SubjectList";
import TeachersGrade from "../pages/TeachersGrade";
import HomePage from "../pages/Home";
import CreateHM from "../pages/CreateHM";
import Login from "../pages/Login";
import StudentHomeworks from "../pages/StudentHomeworks";
import HomeworkDetailPage from "../pages/HomeworkDetailPage";


export const studentRoutes = [
    {path: '/home', component: HomePage, exact: true},
    {path: '/grades', component: StudentGrades, exact: true, name: "Оценки"},
    {path: '/homeworks', component: StudentHomeworks, exact: true, name: "Домашние задания"},
    {path: '/homeworks/:id', component: HomeworkDetailPage, exact: true}

]

export const teacherRoutes = [
    {path: '/home', component: HomePage, exact: true, name: "Домашняя страницы"},
    {path: '/grades', component: GroupList, exact: true, name: "Оценки"},
    {path: '/create_hm', component: CreateHM, exact: true, name:"Создать ДЗ"},
    {path: '/grades/:group', component: SubjectList, exact: true },
    {path: '/grades/:group/:subject', component: TeachersGrade, exact: true }
]
export const publicRoutes = [
    {path: '/login', component: Login, exact: true, name: "Авторизация"},
]
export const parentRoutes = [
    {path: '/home', component: HomePage, exact: true, name: "Домашняя страницы"},
    {path: '/document_request', component: About, exact: true, name: "Запрос документов"},
    {path: '/grades', component: StudentGrades, exact: true, name: "Оценки"}
]

export const getRoutesByRole = (role) => {
    switch(role) {
        case "student":
            return studentRoutes;
        case "teacher":
            return teacherRoutes;
        case "parent":
            return parentRoutes;
        default:
            return publicRoutes
    }
}