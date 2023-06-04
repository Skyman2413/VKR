import About from "../pages/About";
import Login from "../pages/Login";
import StudentGrades from "../pages/StudentGrades";


export const studentRoutes = [
    {path: '/get_grades', component: StudentGrades, exact: true}
]
export const publicRoutes = [
        {path: '/login', component: Login, exact: true}
]

export const teacherRoutes = [
    {path: '/set_grades', component: About, exact: true},
]

export const parentRoutes = [
    {path: '/document_request', component: About, exact: true},
    {path: '/get_grades', component: StudentGrades, exact: true}
]