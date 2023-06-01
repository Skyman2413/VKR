import About from "../pages/About";
import Login from "../pages/Login";


export const privateRoutes = [
    {path: '/grades', component: About, exact: true}
]
export const publicRoutes = [
        {path: '/login', component: Login, exact: true}
]