import {getRoutesByRole} from "../routes";
import {Link} from "react-router-dom";

const HomePage = () => {
    const role = localStorage.getItem('userType')
    const routes = getRoutesByRole(role);
    const filteredRoutes = routes.filter(route => !route.path.includes(':') && route.path !== '/home');

    return (
        <div>
            <h1>Добро пожаловать, {role}!</h1>
            <ul>
                {filteredRoutes.map((route, index) => (
                    <li key={index}>
                        <Link to={route.path}>{route.name}</Link>
                    </li>
                ))}
            </ul>
        </div>
    );
};


export default HomePage;