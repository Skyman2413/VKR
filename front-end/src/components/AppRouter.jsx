import React, {useContext} from 'react';
import {Redirect, Route, Switch} from "react-router-dom"
import {parentRoutes, teacherRoutes, studentRoutes, publicRoutes} from "../routes";
import {AuthContext} from "../context";
import Loader from "./UI/Loader/Loader";
const AppRouter = () => {
    const {isAuth, isLoading} = useContext(AuthContext)
    if (isLoading) {
        return <Loader/>

    }
    return (
        isAuth
            ?
            localStorage.getItem("userType") === "parent"
                ?
                <Switch>
                    {parentRoutes.map(routes =>
                        <Route component={routes.component}
                               path={routes.path}
                               exact={routes.exact}
                               key={routes.path}
                        />
                    )}
                    <Redirect to='/home'/>
                </Switch>
                :
            localStorage.getItem("userType") === "teacher"
                ?

                <Switch>
                    {teacherRoutes.map((route) => (
                        <Route
                            component={route.component}
                            path={route.path}
                            exact={route.exact}
                            key={route.path}
                        />
                    ))}
                    <Redirect to="/home" />
                </Switch>
                :
            localStorage.getItem("userType") === "student"
                ?
                <Switch>
                    {studentRoutes.map(routes =>
                        <Route component={routes.component}
                               path={routes.path}
                               exact={routes.exact}
                               key={routes.path}
                        />
                    )}
                    <Redirect to='/home'/>
                </Switch>
            :
                <div>
                    Unexcepted user type
                </div>
            :

            <Switch>
                {publicRoutes.map(routes =>
                    <Route component={routes.component}
                           path={routes.path}
                           exact={routes.exact}
                           key={routes.path}
                    />
                )}
                <Redirect to='/login'/>
            </Switch>

    );
};

export default AppRouter;